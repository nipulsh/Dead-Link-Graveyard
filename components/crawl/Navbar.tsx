"use client";

import { Download, StopCircle } from "lucide-react";
import Image from "next/image";
import { useCrawlStore } from "@/store/useCrawlStore";

export default function Navbar() {
  const exportFn = useCrawlStore((s) => s.exportFn);
  const phase = useCrawlStore((s) => s.phase);

  return (
    <nav className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <Image src="/favicon.png" alt="" width={36} height={36} />
        <div className="flex items-baseline gap-1 font-heading text-xl tracking-tight">
          <span className="text-slate-800">Dead link</span>
          <span className="text-emerald-600">graveyard</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void exportFn?.()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!exportFn}
        >
          <Download className="h-4 w-4" aria-hidden />
          Download PNG
        </button>
        <button
          type="button"
          onClick={() => useCrawlStore.getState().requestStop()}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={phase !== "running"}
        >
          <StopCircle className="h-4 w-4" aria-hidden />
          Stop crawl
        </button>
      </div>
    </nav>
  );
}
