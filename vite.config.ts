import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  // Rewrite Origin on proxied API calls so better-auth accepts requests coming
  // from any dev origin (localhost, 127.0.0.1, IDE preview proxies, etc.).
  const trustedOrigin =
    env.APP_URL || env.BETTER_AUTH_URL || "http://localhost:3000";

  return {
    base: "./",
    plugins: [react()],
    resolve: {
      alias: {
        "@": rootDir,
      },
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3001",
          changeOrigin: false,
          headers: {
            origin: trustedOrigin,
          },
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
    },
  };
});
