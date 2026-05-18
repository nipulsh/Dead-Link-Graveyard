import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { startCrawler } from "@/lib/crawler/start-crawler";
import {
  DEFAULT_MAX_DEPTH,
  DEFAULT_MAX_PAGES,
} from "@/lib/crawler/constants";

type CrawlBody = {
  url?: unknown;
  maxDepth?: unknown;
  maxPages?: unknown;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as CrawlBody | null;
    const { url } = body ?? {};

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "Only http(s) URLs are supported" },
        { status: 400 },
      );
    }

    const maxDepth =
      typeof body?.maxDepth === "number" && Number.isFinite(body.maxDepth)
        ? body.maxDepth
        : DEFAULT_MAX_DEPTH;
    const maxPages =
      typeof body?.maxPages === "number" && Number.isFinite(body.maxPages)
        ? body.maxPages
        : DEFAULT_MAX_PAGES;

    const crawlId = randomUUID();

    void startCrawler({
      crawlId,
      url: parsedUrl.href,
      maxDepth,
      maxPages,
    });

    return NextResponse.json(
      {
        success: true,
        crawlId,
        url: parsedUrl.href,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
