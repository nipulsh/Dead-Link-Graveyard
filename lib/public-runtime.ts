/**
 * Browser-accessible config for split deployments (e.g. UI on Vercel, crawl + Socket.IO on Railway).
 * Set in Vercel **Environment Variables** (must be prefixed with NEXT_PUBLIC_ to reach the client).
 */

/** Origin of the Node process running `server.ts` — no trailing slash (e.g. https://api.example.com). */
export function getPublicCrawlApiBase(): string {
  return (process.env.NEXT_PUBLIC_CRAWL_API_BASE ?? "").trim().replace(/\/+$/, "");
}

/** Same as crawl API base unless you override only the socket host (rare). */
export function getPublicSocketUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_SOCKET_URL ?? "").trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  const fallbackBase = getPublicCrawlApiBase();
  if (fallbackBase) return fallbackBase;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export function getCrawlPostUrl(): string {
  const base = getPublicCrawlApiBase();
  return base ? `${base}/api/crawl` : "/api/crawl";
}
