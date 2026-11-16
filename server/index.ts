import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeArt, chatWithBelle } from "./gemini.js";
import type {
  ArtAnalysisResult,
  ChatMessage,
} from "../src/services/geminiService";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "15mb" }));

app.post("/api/analyze", async (req, res) => {
  try {
    const { base64Image, mimeType, isSketch, selectedStyle, paintType } =
      req.body ?? {};
    if (!base64Image || !mimeType) {
      res.status(400).json({ error: "Missing image data." });
      return;
    }
    const result = await analyzeArt(
      base64Image,
      mimeType,
      Boolean(isSketch),
      selectedStyle ?? "Gentle",
      paintType ?? "Poster Color",
    );
    res.json(result);
  } catch (err: any) {
    console.error("[api/analyze]", err);
    res.status(500).json({ error: err?.message || "Analysis failed." });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, base64Image, mimeType, analysisResult } =
      req.body ?? {};
    if (!message || !base64Image || !mimeType || !analysisResult) {
      res.status(400).json({ error: "Missing chat payload." });
      return;
    }
    const text = await chatWithBelle(
      message,
      (history ?? []) as ChatMessage[],
      base64Image,
      mimeType,
      analysisResult as ArtAnalysisResult,
    );
    res.json({ text });
  } catch (err: any) {
    console.error("[api/chat]", err);
    res.status(500).json({ error: err?.message || "Chat failed." });
  }
});

// Serve the production build (after `npm run build`)
const distDir = path.resolve(__dirname, "..", "dist");
app.use(express.static(distDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Belleza Lab server running at http://localhost:${PORT}`);
});
