const SKIP_PROTOCOLS = new Set([
  "mailto:",
  "tel:",
  "javascript:",
  "data:",
  "blob:",
  "file:",
]);

export function normalizeUrl(raw: string, base?: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  for (const p of SKIP_PROTOCOLS) {
    if (lower.startsWith(p)) return null;
  }

  try {
    const u = new URL(trimmed, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;

    u.hash = "";
    u.hostname = u.hostname.toLowerCase();

    if (u.pathname === "") u.pathname = "/";

    if (
      (u.protocol === "http:" && u.port === "80") ||
      (u.protocol === "https:" && u.port === "443")
    ) {
      u.port = "";
    }

    return u.href;
  } catch {
    return null;
  }
}

export function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

export function getOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}
