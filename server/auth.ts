import "dotenv/config";
import { betterAuth } from "better-auth";
import { pool } from "./db.js";

const secret = process.env.BETTER_AUTH_SECRET;

if (!secret || secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters.");
}

const appUrl = process.env.APP_URL ?? "http://localhost:3000";
const additionalTrustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const localDevelopmentOrigins =
  process.env.NODE_ENV === "production"
    ? []
    : [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
      ];

export const auth = betterAuth({
  appName: "Belleza Lab",
  baseURL: process.env.BETTER_AUTH_URL ?? appUrl,
  secret,
  database: pool,
  trustedOrigins: [...new Set([appUrl, ...additionalTrustedOrigins, ...localDevelopmentOrigins])],
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    window: 60,
    max: 10,
  },
});
