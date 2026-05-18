import type { CrawlCompletePayload, CrawlStatsSnapshot } from "@/types/socket-events";
import { connectMongo } from "@/lib/db/connect";
import { CrawlRecordModel } from "@/lib/db/models/crawl-record";

export async function persistCrawlResult(args: {
  crawlId: string;
  seedUrl: string;
  stats: CrawlStatsSnapshot;
  reason: CrawlCompletePayload["reason"];
}): Promise<void> {
  try {
    const conn = await connectMongo();
    if (!conn) return;

    await CrawlRecordModel.findOneAndUpdate(
      { crawlId: args.crawlId },
      {
        $set: {
          crawlId: args.crawlId,
          seedUrl: args.seedUrl,
          stats: args.stats,
          reason: args.reason,
          finishedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
  } catch (e) {
    console.warn("[persistCrawlResult]", e);
  }
}
