import type { Pool } from "pg";

export type UsageKind = "analysis" | "chat";

const DAILY_LIMITS = {
  analysis: 3,
  chat: 10,
} as const;

const MAX_INPUT_TOKENS = 12_000;
const DEFAULT_BUDGET_USD = 5;
const INPUT_PRICE_PER_MILLION_USD = Number(
  process.env.GEMINI_INPUT_BUDGET_RATE_PER_MILLION_USD ?? 0.5,
);
const OUTPUT_PRICE_PER_MILLION_USD = Number(
  process.env.GEMINI_OUTPUT_BUDGET_RATE_PER_MILLION_USD ?? 3,
);
const MONTHLY_BUDGET_USD = Number(
  process.env.AI_MONTHLY_BUDGET_USD ?? DEFAULT_BUDGET_USD,
);

if (
  !Number.isFinite(INPUT_PRICE_PER_MILLION_USD) ||
  INPUT_PRICE_PER_MILLION_USD < 0 ||
  !Number.isFinite(OUTPUT_PRICE_PER_MILLION_USD) ||
  OUTPUT_PRICE_PER_MILLION_USD < 0 ||
  !Number.isFinite(MONTHLY_BUDGET_USD) ||
  MONTHLY_BUDGET_USD <= 0
) {
  throw new Error("AI budget and token rate settings must be valid positive numbers.");
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface UsageReservation {
  userId: string;
  kind: UsageKind;
  amountUsd: number;
}

export class UsageLimitError extends Error {
  constructor(
    readonly kind: UsageKind,
    readonly remaining: number,
  ) {
    super("A daily AI usage limit was reached.");
    this.name = "UsageLimitError";
  }
}

export class MonthlyBudgetError extends Error {
  constructor() {
    super("The estimated monthly AI budget has been reached.");
    this.name = "MonthlyBudgetError";
  }
}

function estimateCost(inputTokens: number, outputTokens: number) {
  return (
    (inputTokens * INPUT_PRICE_PER_MILLION_USD +
      outputTokens * OUTPUT_PRICE_PER_MILLION_USD) /
    1_000_000
  );
}

export async function reserveUsage(
  pool: Pool,
  userId: string,
  kind: UsageKind,
  maxOutputTokens: number,
): Promise<UsageReservation> {
  const reservedUsd = estimateCost(MAX_INPUT_TOKENS, maxOutputTokens);
  const client = await pool.connect();
  let transactionOpen = false;

  try {
    await client.query("BEGIN");
    transactionOpen = true;

    const daily = await client.query<{
      analyses: number;
      chats: number;
    }>(
      `INSERT INTO ai_usage_daily (user_id, usage_date, analyses, chats)
       VALUES ($1, CURRENT_DATE, $2, $3)
       ON CONFLICT (user_id, usage_date)
       DO UPDATE SET
         analyses = ai_usage_daily.analyses + EXCLUDED.analyses,
         chats = ai_usage_daily.chats + EXCLUDED.chats
       WHERE ai_usage_daily.analyses + EXCLUDED.analyses <= $4
         AND ai_usage_daily.chats + EXCLUDED.chats <= $5
       RETURNING analyses, chats`,
      [
        userId,
        kind === "analysis" ? 1 : 0,
        kind === "chat" ? 1 : 0,
        DAILY_LIMITS.analysis,
        DAILY_LIMITS.chat,
      ],
    );

    if (daily.rowCount === 0) {
      const current = await client.query<{
        analyses: number;
        chats: number;
      }>(
        `SELECT analyses, chats
         FROM ai_usage_daily
         WHERE user_id = $1 AND usage_date = CURRENT_DATE`,
        [userId],
      );
      const used = current.rows[0];
      await client.query("ROLLBACK");
      transactionOpen = false;
      const remaining =
        kind === "analysis"
          ? Math.max(0, DAILY_LIMITS.analysis - (used?.analyses ?? 0))
          : Math.max(0, DAILY_LIMITS.chat - (used?.chats ?? 0));
      throw new UsageLimitError(kind, remaining);
    }

    await client.query(
      `INSERT INTO ai_usage_monthly (month_start)
       VALUES (date_trunc('month', CURRENT_DATE)::date)
       ON CONFLICT (month_start) DO NOTHING`,
    );

    const monthly = await client.query<{
      estimated_spend_usd: string;
      reserved_usd: string;
    }>(
      `SELECT estimated_spend_usd, reserved_usd
       FROM ai_usage_monthly
       WHERE month_start = date_trunc('month', CURRENT_DATE)::date
       FOR UPDATE`,
    );
    const { estimated_spend_usd, reserved_usd } = monthly.rows[0];
    if (
      Number(estimated_spend_usd) +
        Number(reserved_usd) +
        reservedUsd >
      MONTHLY_BUDGET_USD
    ) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      throw new MonthlyBudgetError();
    }

    await client.query(
      `UPDATE ai_usage_monthly
       SET reserved_usd = reserved_usd + $1
       WHERE month_start = date_trunc('month', CURRENT_DATE)::date`,
      [reservedUsd],
    );
    await client.query("COMMIT");
    transactionOpen = false;

    return { userId, kind, amountUsd: reservedUsd };
  } catch (error) {
    if (transactionOpen) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function settleUsage(
  pool: Pool,
  reservation: UsageReservation,
  tokenUsage?: TokenUsage,
) {
  const actualEstimate = tokenUsage
    ? estimateCost(tokenUsage.inputTokens, tokenUsage.outputTokens)
    : reservation.amountUsd;
  const settledUsd = Math.max(0, actualEstimate);

  await pool.query(
    `UPDATE ai_usage_monthly
     SET reserved_usd = GREATEST(0, reserved_usd - $1),
         estimated_spend_usd = estimated_spend_usd + $2
     WHERE month_start = date_trunc('month', CURRENT_DATE)::date`,
    [reservation.amountUsd, settledUsd],
  );
}
