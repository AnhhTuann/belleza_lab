// Same-origin Vercel Function: API routes and Better Auth stay on one domain.
// Database and auth secrets are supplied by the hosting environment, not GitHub.
import { app } from '../server/index.js';
export default app;
