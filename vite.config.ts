import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { analyzeArt, chatWithBelle } from './server/gemini';

function readJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function apiPlugin(): Plugin {
  return {
    name: 'belleza-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/analyze', async (req, res) => {
        try {
          const body = await readJsonBody(req);
          if (!body.base64Image || !body.mimeType) {
            sendJson(res, 400, { error: 'Missing image data.' });
            return;
          }
          const result = await analyzeArt(
            body.base64Image,
            body.mimeType,
            Boolean(body.isSketch),
            body.selectedStyle ?? 'Gentle',
            body.paintType ?? 'Poster Color',
          );
          sendJson(res, 200, result);
        } catch (err: any) {
          console.error('[api/analyze]', err);
          sendJson(res, 500, { error: err?.message || 'Analysis failed.' });
        }
      });

      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          const body = await readJsonBody(req);
          if (!body.message || !body.base64Image || !body.mimeType || !body.analysisResult) {
            sendJson(res, 400, { error: 'Missing chat payload.' });
            return;
          }
          const text = await chatWithBelle(
            body.message,
            body.history ?? [],
            body.base64Image,
            body.mimeType,
            body.analysisResult,
          );
          sendJson(res, 200, { text });
        } catch (err: any) {
          console.error('[api/chat]', err);
          sendJson(res, 500, { error: err?.message || 'Chat failed.' });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Expose secrets to the dev-server API middleware only (never to the client bundle).
  if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }
  return {
    base: './',
    plugins: [react(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
