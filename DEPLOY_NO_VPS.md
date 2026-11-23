# Belleza Lab — Deploy không cần VPS (Render + external PostgreSQL)

> This is a **deployment proposal**, not an active service. Do not migrate a production database without a backup.

## Why one service

The project serves both React/Vite static output and an Express API with Better Auth on the same origin. Keeping them in one Render Docker web service avoids cross-site cookie/CORS issues and preserves `/api/auth/*`, `/api/analyze`, `/api/chat`.

## Setup

1. Create a new managed PostgreSQL database (e.g. Neon). Keep a private backup of the old data, if any, and **do not point at GenshinHub or Vietlabel database**.
2. In Render, import this repository as a **Blueprint**, using `render.yaml` on `main` after review. Choose Free only if the account supports this plan.
3. Supply `DATABASE_URL` (SSL connection), `GEMINI_API_KEY`, `BETTER_AUTH_URL`, and `APP_URL` privately. The two URL variables must match the **actual public HTTPS URL** of this deployment. If Render assigns a different hostname, update before using auth.
4. The Blueprint generates a random `BETTER_AUTH_SECRET`. Retain it across redeploys; rotating it signs users out.
5. First startup runs `npm run db:migrate:auth` in the existing project start script. **Review and back up** the target DB before starting.
6. Verify `GET /healthz`, signup/login, auth cookies, AI budget, analyze and chat. Configure the custom domain `belleza.anhhtuann.eu.org` inside Render before setting the provider-specified DNS record.

## Operational caveats

- Render Free sleeps after inactivity and can restart; first request may be slow. Not ideal for production UX.
- Filesystem is ephemeral. User data and authentication should be in external DB, not local uploads.
- Gemini API may incur separate usage charges; a Render Free plan does not cover Gemini costs.
- The site is not live just because this file exists; import and secrets require the account owner.
