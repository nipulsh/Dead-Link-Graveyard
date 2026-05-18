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

/**
 * True when the client should call a separate Node host for crawl + Socket.IO (split deploy).
 */
export function hasRemoteRealtimeBackend(): boolean {
  return Boolean(
    getPublicCrawlApiBase() || (process.env.NEXT_PUBLIC_SOCKET_URL ?? "").trim(),
  );
}

/**
 * Vercel production/preview cannot attach Socket.IO to this app URL. Without a configured
 * Node backend URL, do not open WebSocket to *.vercel.app (it fails and spams the console).
 */
export function missingRealtimeBackendOnVercel(): boolean {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (env !== "production" && env !== "preview") return false;
  return !hasRemoteRealtimeBackend();
}
