"use client";

import { useShallow } from "zustand/shallow";
import { useCrawlStore } from "@/store/useCrawlStore";

const statItems = [
  { key: "totalFound" as const, label: "Total found" },
  { key: "totalPagesCrawled" as const, label: "Pages crawled" },
  { key: "ok2xx" as const, label: "2xx" },
  { key: "notFound404" as const, label: "404" },
  { key: "serverError5xx" as const, label: "5xx" },
  { key: "redirects3xx" as const, label: "Redirects" },
];

export default function Header() {
  const { stats, phase, seedUrl, completeReason } = useCrawlStore(
    useShallow((s) => ({
      stats: s.stats,
      phase: s.phase,
      seedUrl: s.seedUrl,
      completeReason: s.completeReason,
    })),
  );

  const statusLabel =
    phase === "running"
      ? "Crawling…"
      : phase === "complete"
        ? `Done${completeReason ? ` (${completeReason})` : ""}`
        : phase === "error"
          ? "Error"
          : "Idle";

  return (
    <header className="border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Status</span>
            <span
              className={`h-2 w-2 rounded-full ${
                phase === "running"
                  ? "animate-pulse bg-blue-500"
                  : phase === "complete"
                    ? "bg-emerald-500"
                    : phase === "error"
                      ? "bg-red-500"
                      : "bg-slate-300"
              }`}
            />
            <span className="font-medium text-slate-900">{statusLabel}</span>
          </div>
          {seedUrl ? (
            <p className="truncate font-mono text-xs text-slate-500" title={seedUrl}>
              {seedUrl}
            </p>
          ) : null}
        </div>
        <dl className="flex flex-wrap gap-4 sm:gap-6">
          {statItems.map(({ key, label }) => (
            <div key={key} className="min-w-[4.5rem]">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {label}
              </dt>
              <dd className="font-mono text-lg tabular-nums text-slate-900">
                {stats[key]}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
