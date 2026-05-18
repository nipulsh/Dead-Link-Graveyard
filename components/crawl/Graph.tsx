"use client";

import Canvas from "@/components/crawl/Canvas";
import CrawlInformation from "@/components/crawl/crawlInformation";

export default function Graph({ crawlId }: { crawlId: string }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-12">
      <div className="min-h-0 lg:col-span-9">
        <div className="h-full min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:min-h-0">
          <Canvas crawlId={crawlId} />
        </div>
      </div>
      <div className="flex min-h-0 flex-col lg:col-span-3">
        <CrawlInformation />
      </div>
    </div>
  );
}
