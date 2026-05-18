"use client";

import { cn } from "@/lib/utils";
import { useShallow } from "zustand/shallow";
import { useCrawlStore } from "@/store/useCrawlStore";

export default function CrawlInformation() {
  const { stats, activity } = useCrawlStore(
    useShallow((s) => ({
      stats: s.stats,
      activity: s.activity,
    })),
  );

  const rows = [
    { label: "Total found", value: stats.totalFound },
    { label: "Pages crawled", value: stats.totalPagesCrawled },
    { label: "2xx", value: stats.ok2xx, className: "text-emerald-600" },
    { label: "404", value: stats.notFound404, className: "text-red-600" },
    { label: "5xx", value: stats.serverError5xx, className: "text-orange-600" },
    { label: "Redirects", value: stats.redirects3xx, className: "text-amber-600" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Snapshot
        </h2>
        <ul className="space-y-1.5 text-sm">
          {rows.map((r) => (
            <li key={r.label} className="flex justify-between gap-2">
              <span className="text-slate-600">{r.label}</span>
              <span
                className={cn("font-mono tabular-nums text-slate-900", r.className)}
              >
                {r.value}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="shrink-0 border-b border-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Live activity
        </h2>
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2 text-xs">
          {activity.length === 0 ? (
            <li className="text-slate-400">Waiting for events…</li>
          ) : (
            activity.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "rounded-md px-2 py-1 font-mono leading-snug text-slate-700",
                  item.tone === "error" && "bg-red-50 text-red-800",
                  item.tone === "success" && "bg-emerald-50 text-emerald-900",
                  item.tone === "warn" && "bg-amber-50 text-amber-900",
                  item.tone === "info" && "bg-slate-50",
                )}
              >
                {item.message}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
