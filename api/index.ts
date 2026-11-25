// Single-origin Express + Better Auth Vercel Function.
// A guarded one-time schema bootstrap is supported for the empty Neon
// preview database only. Switch BELLEZA_SCHEMA_BOOTSTRAP off after rollout.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { app } from '../server/index.js';
import { auth } from '../server/auth.js';
import { initializeUsageSchema, pool } from '../server/db.js';

let initialization: Promise<void> | undefined;

function ensureInitialized(): Promise<void> {
  if (!initialization) {
    initialization = (async () => {
      if (process.env.BELLEZA_SCHEMA_BOOTSTRAP !== '1') return;
      const client = await pool.connect();
      try {
        // Serialize cold starts across replicas so Better Auth migrations
        // never race to create the same empty-table schema.
        await client.query('SELECT pg_advisory_lock(2026112301)');
        const { getMigrations } = await import('better-auth/db/migration');
        const { runMigrations } = await getMigrations(auth.options);
        await runMigrations();
        await initializeUsageSchema();
      } finally {
        try {
          await client.query('SELECT pg_advisory_unlock(2026112301)');
        } finally {
          client.release();
        }
      }
    })().catch((error) => {
      initialization = undefined;
      throw error;
    });
  }
  return initialization;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureInitialized();
    return app(req as any, res as any);
  } catch (error) {
    console.error('[Belleza startup]', error instanceof Error ? error.message : 'Unknown bootstrap error');
    if (!res.headersSent) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Service initialization failed' }));
    }
  }
}
