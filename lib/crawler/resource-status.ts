import { RESOURCE_FETCH_TIMEOUT_MS } from "@/lib/crawler/constants";
import type { NodeStatusCategory } from "@/types/socket-events";

export type StatusCheckResult = {
  status: number;
  category: NodeStatusCategory;
  finalUrl?: string;
};

export function categorizeStatus(status: number): NodeStatusCategory {
  if (status === 0) return "unknown";
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "redirect";
  if (status === 404) return "not_found";
  if (status >= 500) return "server_error";
  if (status >= 400) return "client_error";
  return "unknown";
}

export async function checkResourceStatus(
  url: string,
  signal?: AbortSignal,
): Promise<StatusCheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RESOURCE_FETCH_TIMEOUT_MS);
  const combined = mergeAbortSignals(signal, controller.signal);

  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: combined,
    });

    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: combined,
        headers: { Range: "bytes=0-0" },
      });
    }

    const status = response.status;
    const finalUrl = response.url;

    return {
      status,
      category: categorizeStatus(status),
      finalUrl: finalUrl !== url ? finalUrl : undefined,
    };
  } catch {
    return { status: 0, category: "unknown" };
  } finally {
    clearTimeout(timer);
  }
}

function mergeAbortSignals(
  a: AbortSignal | undefined,
  b: AbortSignal,
): AbortSignal {
  if (!a) return b;
  if (a.aborted) return a;
  const out = new AbortController();
  const onAbort = () => out.abort();
  a.addEventListener("abort", onAbort);
  b.addEventListener("abort", onAbort);
  return out.signal;
}

export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
  signal?: AbortSignal,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      if (signal?.aborted) return;
      const i = nextIndex++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]!, i);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}
