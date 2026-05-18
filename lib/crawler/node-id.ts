import { createHash } from "crypto";

export function urlToNodeId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 40);
}
