# Belleza Lab — Vercel + Neon Free (preview, no VPS)

## Architecture

- Vite/React SPA with same-origin Express API on Vercel Functions (`api/index.ts`).
- Better Auth email/password and sessions use a dedicated Neon PostgreSQL project `belleza-lab`, database `belleza`.
- The API never exposes `DATABASE_URL`, `BETTER_AUTH_SECRET`, or `GEMINI_API_KEY` to client-side Vite variables.
- Image analysis and chat use the Gemini API server-side. It will not work without the user's Google AI Studio API key and provider quota.
- Per-user limits are 3 image analyses/day and 10 chats/day. The internal monthly budget is an estimate only, **not** a Google billing cap.

## Completed staging steps

- Prepared Vercel project `belleza-lab` and preview branch `deploy/vercel-fullstack-free-20261123`.
- Database and Better Auth secrets configured privately in Vercel Preview environment using an existing connected Neon project; not committed to Git.
- Original database was empty. Official Better Auth programmatic migration created `user`, `session`, `account`, `verification` tables, plus `ai_usage_daily`, `ai_usage_monthly` tables.
- `GET /api/health` returned `200 { "ok": true, "database": "connected" }` from the protected preview URL.
- `GET /api/auth/get-session` returned `200 null` when unauthenticated.
- `BELLEZA_SCHEMA_BOOTSTRAP` was switched off after schema creation. It must remain off for normal operation.

## Environment variables — set in the correct Vercel target

Required:
- `DATABASE_URL` — Neon pooled PostgreSQL connection string
- `BETTER_AUTH_SECRET` — unpredictable >=32 characters, stable after deployment
- `APP_URL` — exact canonical HTTPS origin without a trailing slash
- `BETTER_AUTH_URL` — same canonical HTTPS origin
- `BETTER_AUTH_TRUSTED_ORIGINS` — list of any additional approved HTTPS origins

Recommended:
- `DB_POOL_SIZE=2`
- `AI_MONTHLY_BUDGET_USD` — small positive amount (staging configured at 0.10)
- `GEMINI_API_KEY` — secret, only if the owner opts into Google AI's pricing and quotas

The repository's Vite build tool lives in `devDependencies`, so the Vercel project must use `npm ci --include=dev` during builds when `NODE_ENV=production`.

## Validation before production switch

1. API health status 200; database connected.
2. Sign up with a test email, then log in/log out and verify session cookie. Test on the actual configured `APP_URL` origin.
3. Check /api/analyze and /api/chat with a valid Gemini key, quotas and budget; do not assume cost is always zero.
4. Verify same-origin authentication (cookies, CORS, trustedOrigins) and mobile UI.
5. Configure the **production** environment separately before deploying the protected feature branch to production. Existing production `main` remains unchanged.
6. After production functions are validated, attach `bellezalab.duckdns.org` as a custom domain. Update only the `bellezalab` DuckDNS record to Vercel's domain-specific DNS instructions and verify HTTPS. Do not touch `anhhtuann.duckdns.org` or `vietlabel.duckdns.org`.

## Free plan caveats

- Vercel Hobby is for personal, non-commercial use. Commercial Belleza Lab activity requires eligible paid hosting or another compliant host.
- Vercel Functions have invocation, compute, runtime and bandwidth quotas. Persistent Node processes and on-server file storage are unsupported.
- Neon Free is limited by project storage and compute hours.
- Gemini API has separate quotas and potential costs; the internal budget estimator cannot stop charges outside this app.
- This preview is **not** production until registration, login, analysis, chat and domain checks have passed.
