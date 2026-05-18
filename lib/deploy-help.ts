/** Shown when the UI is on Vercel prod/preview but no Node backend URL is baked into the client. */
export const VERCEL_MISSING_BACKEND_MESSAGE =
  "This Vercel build cannot run crawls by itself (no Socket.IO or Puppeteer here). " +
  "In Vercel → Settings → Environment Variables add NEXT_PUBLIC_CRAWL_API_BASE with your full app URL from Railway (or similar), where you run npm start / server.ts. " +
  "Important: after saving env vars, trigger a new deployment — NEXT_PUBLIC_* values are baked in at build time. " +
  "On that Node host set SOCKET_CORS_ORIGIN and CRAWL_CORS_ORIGIN to this site’s URL (see .env.example). " +
  "Details: project.md.";
