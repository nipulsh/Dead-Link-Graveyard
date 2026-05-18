import mongoose, { Schema } from "mongoose";

const CrawlRecordSchema = new Schema(
  {
    crawlId: { type: String, required: true, unique: true, index: true },
    seedUrl: { type: String, required: true },
    stats: { type: Schema.Types.Mixed, required: true },
    reason: { type: String, required: true },
    finishedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const CrawlRecordModel =
  mongoose.models.CrawlRecord ??
  mongoose.model("CrawlRecord", CrawlRecordSchema);
