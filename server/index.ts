import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { analyzeArt, chatWithBelle } from "./gemini.js";
import { auth } from "./auth.js";
import { initializeUsageSchema, pool } from "./db.js";
import {
  MonthlyBudgetError,
  reserveUsage,
  settleUsage,
  UsageLimitError,
  type UsageKind,
} from "./usage.js";
import type {
  ArtAnalysisResult,
  ChatMessage,
} from "../src/services/geminiService";
import type { Language } from "../src/i18n";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const app = express();
const PORT = Number(process.env.PORT) || 3001;
const MAX_IMAGE_BASE64_LENGTH = 1_500_000;
const MAX_ANALYSIS_JSON_LENGTH = 12_000;

class ApiError extends Error {
  constructor(
    readonly key: keyof typeof errorMessages.en,
    readonly statusCode: number,
  ) {
    super(key);
    this.name = "ApiError";
  }
}

const errorMessages = {
  vi: {
    invalidLanguage: "Ngôn ngữ không hợp lệ.",
    unauthorized: "Vui lòng đăng nhập để sử dụng Belleza Lab.",
    invalidImage: "Ảnh không hợp lệ hoặc có dung lượng quá lớn. Vui lòng chọn ảnh nhỏ hơn.",
    unsupportedImage: "Định dạng ảnh chưa được hỗ trợ.",
    invalidOptions: "Tùy chọn phân tích không hợp lệ.",
    invalidMessage: "Tin nhắn cần có nội dung và tối đa 600 ký tự.",
    invalidHistory: "Lịch sử chat không hợp lệ.",
    invalidAnalysis: "Kết quả phân tích không hợp lệ.",
    providerUnavailable: "Gemini đang quá tải hoặc đã chạm hạn mức. Vui lòng thử lại sau.",
    serviceUnavailable: "Dịch vụ AI đang gặp sự cố. Vui lòng thử lại sau.",
    notFound: "Không tìm thấy API.",
    dailyAnalysisLimit: "Bạn đã dùng hết lượt phân tích hôm nay. Hạn mức là {limit} lượt/ngày; còn {remaining} lượt.",
    dailyChatLimit: "Bạn đã dùng hết lượt chat hôm nay. Hạn mức là {limit} lượt/ngày; còn {remaining} lượt.",
    monthlyBudget: "Belleza Lab đã chạm ngân sách AI ước tính trong tháng này. Hạn mức sẽ mở lại vào tháng sau.",
  },
  en: {
    invalidLanguage: "Unsupported language.",
    unauthorized: "Please sign in to use Belleza Lab.",
    invalidImage: "The image is invalid or too large. Please choose a smaller image.",
    unsupportedImage: "This image format is not supported.",
    invalidOptions: "The analysis options are invalid.",
    invalidMessage: "Message must contain text and be no longer than 600 characters.",
    invalidHistory: "Chat history is invalid.",
    invalidAnalysis: "The analysis result is invalid.",
    providerUnavailable: "Gemini is busy or has reached its quota. Please try again later.",
    serviceUnavailable: "The AI service is temporarily unavailable. Please try again later.",
    notFound: "API endpoint not found.",
    dailyAnalysisLimit: "You've reached today's image-analysis limit ({limit}/day); {remaining} remaining.",
    dailyChatLimit: "You've reached today's chat limit ({limit}/day); {remaining} remaining.",
    monthlyBudget: "Belleza Lab has reached its estimated AI budget for this month. The limit resets next month.",
  },
} as const;

function requestLanguage(value: unknown): Language {
  return value === "en" ? "en" : "vi";
}

function validateLanguage(value: unknown): Language {
  if (value === undefined) return "vi";
  if (value === "vi" || value === "en") return value;
  throw new ApiError("invalidLanguage", 400);
}

app.all(
  "/api/auth/*",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 40,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  toNodeHandler(auth),
);

app.use(express.json({ limit: "2mb" }));

app.get("/healthz", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch {
    res.status(503).json({ ok: false, database: "unavailable" });
  }
});

app.use("/api", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      res.status(401).json({
        error: errorMessages[requestLanguage(req.body?.language)].unauthorized,
      });
      return;
    }
    res.locals.userId = session.user.id;
    next();
  } catch (error) {
    next(error);
  }
});

function validateImage(base64Image: unknown, mimeType: unknown) {
  if (
    typeof base64Image !== "string" ||
    base64Image.length === 0 ||
    base64Image.length > MAX_IMAGE_BASE64_LENGTH ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64Image)
  ) {
    throw new ApiError("invalidImage", 400);
  }

  if (
    typeof mimeType !== "string" ||
    !["image/jpeg", "image/png", "image/webp"].includes(mimeType)
  ) {
    throw new ApiError("unsupportedImage", 400);
  }
}

function errorResponse(error: unknown, language: Language = "vi") {
  if (error instanceof UsageLimitError || error instanceof MonthlyBudgetError) {
    if (error instanceof MonthlyBudgetError) {
      return { statusCode: 429, message: errorMessages[language].monthlyBudget };
    }

    const key = error.kind === "analysis" ? "dailyAnalysisLimit" : "dailyChatLimit";
    const limit = error.kind === "analysis" ? 3 : 10;
    return {
      statusCode: 429,
      message: errorMessages[language][key]
        .replace("{limit}", String(limit))
        .replace("{remaining}", String(error.remaining)),
    };
  }
  if (error instanceof ApiError) {
    return { statusCode: error.statusCode, message: errorMessages[language][error.key] };
  }

  const providerError = error as { status?: number; message?: string } | null;
  if (
    providerError?.status === 429 ||
    providerError?.message?.includes("RESOURCE_EXHAUSTED")
  ) {
    return {
      statusCode: 503,
      message: errorMessages[language].providerUnavailable,
    };
  }

  console.error("[api]", error);
  return {
    statusCode: 500,
    message: errorMessages[language].serviceUnavailable,
  };
}

async function runWithBudget<T>(
  userId: string,
  kind: UsageKind,
  maxOutputTokens: number,
  generate: () => Promise<{ result: T; usage: { inputTokens: number; outputTokens: number } }>,
) {
  const reservation = await reserveUsage(pool, userId, kind, maxOutputTokens);
  try {
    const response = await generate();
    await settleUsage(pool, reservation, response.usage);
    return response.result;
  } catch (error) {
    await settleUsage(pool, reservation, { inputTokens: 0, outputTokens: 0 });
    throw error;
  }
}

app.post("/api/analyze", async (req, res) => {
  try {
    const {
      base64Image,
      mimeType,
      isSketch,
      selectedStyle = "Nhẹ nhàng (Pastel)",
      paintType = "Poster Color",
      language: requestedLanguage,
    } = req.body ?? {};
    const language = validateLanguage(requestedLanguage);
    validateImage(base64Image, mimeType);

    const allowedStyles = ["Nhẹ nhàng (Pastel)", "Vui tươi", "U buồn", "Cổ điển", "Hiện đại"];
    const allowedPaintTypes = ["Poster Color", "Watercolor", "Acrylic", "Oil Paint", "Digital Art"];
    if (
      typeof isSketch !== "boolean" ||
      !allowedStyles.includes(selectedStyle) ||
      !allowedPaintTypes.includes(paintType)
    ) {
      throw new ApiError("invalidOptions", 400);
    }

    const result = await runWithBudget(
      res.locals.userId,
      "analysis",
      1800,
      () => analyzeArt(base64Image, mimeType, isSketch, selectedStyle, paintType, language),
    );
    res.json(result);
  } catch (error) {
    const response = errorResponse(error, requestLanguage(req.body?.language));
    res.status(response.statusCode).json({ error: response.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      base64Image,
      mimeType,
      analysisResult,
      language: requestedLanguage,
    } = req.body ?? {};
    const language = validateLanguage(requestedLanguage);
    validateImage(base64Image, mimeType);

    if (typeof message !== "string" || message.trim().length === 0 || message.length > 600) {
      throw new ApiError("invalidMessage", 400);
    }
    if (!Array.isArray(history)) {
      throw new ApiError("invalidHistory", 400);
    }
    if (
      !analysisResult ||
      typeof analysisResult !== "object" ||
      JSON.stringify(analysisResult).length > MAX_ANALYSIS_JSON_LENGTH
    ) {
      throw new ApiError("invalidAnalysis", 400);
    }

    const shortHistory = (history as ChatMessage[])
      .filter(
        (entry) =>
          entry &&
          (entry.role === "user" || entry.role === "model") &&
          typeof entry.text === "string",
      )
      .slice(-6)
      .map((entry) => ({ role: entry.role, text: entry.text.slice(0, 800) }));

    const text = await runWithBudget(
      res.locals.userId,
      "chat",
      350,
      () => chatWithBelle(
        message.trim(),
        shortHistory,
        base64Image,
        mimeType,
        analysisResult as ArtAnalysisResult,
        language,
      ),
    );
    res.json({ text });
  } catch (error) {
    const response = errorResponse(error, requestLanguage(req.body?.language));
    res.status(response.statusCode).json({ error: response.message });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({
    error: errorMessages[requestLanguage(req.body?.language)].notFound,
  });
});

const distDir = path.resolve(__dirname, "..", "dist");
app.use(express.static(distDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const response = errorResponse(error, requestLanguage(req.body?.language));
  res.status(response.statusCode).json({ error: response.message });
});

async function start() {
  await initializeUsageSchema();
  app.listen(PORT, () => {
    console.log(`Belleza Lab server listening on port ${PORT}`);
  });
}

// Do not open a TCP port when imported by Vercel Functions.
// The usage tables are provisioned separately with a reviewed migration.
if (process.env.VERCEL !== "1") {
  start().catch((error) => {
    console.error("Could not start Belleza Lab server.", error);
    process.exitCode = 1;
  });
}
