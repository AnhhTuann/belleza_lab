import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

export const pool = new Pool({
  connectionString,
  max: Number(process.env.DB_POOL_SIZE) || (process.env.VERCEL === "1" ? 2 : 5),
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
});

export async function initializeUsageSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_usage_daily (
      user_id text NOT NULL,
      usage_date date NOT NULL DEFAULT CURRENT_DATE,
      analyses integer NOT NULL DEFAULT 0 CHECK (analyses >= 0),
      chats integer NOT NULL DEFAULT 0 CHECK (chats >= 0),
      PRIMARY KEY (user_id, usage_date)
    );

    CREATE TABLE IF NOT EXISTS ai_usage_monthly (
      month_start date PRIMARY KEY,
      estimated_spend_usd numeric(12, 8) NOT NULL DEFAULT 0 CHECK (estimated_spend_usd >= 0),
      reserved_usd numeric(12, 8) NOT NULL DEFAULT 0 CHECK (reserved_usd >= 0)
    );
  `);
}
