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

/** When the UI is on another origin (e.g. Vercel) but this route runs on Railway, set to that UI origin. */
function crawlCorsHeaders(): Record<string, string> | undefined {
  const o = process.env.CRAWL_CORS_ORIGIN?.trim();
  if (!o) return undefined;
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  const h = crawlCorsHeaders();
  if (!h) return new NextResponse(null, { status: 204 });
  return new NextResponse(null, { status: 204, headers: h });
}

export async function POST(req: Request) {
  const cors = crawlCorsHeaders();

  try {
    const body = (await req.json().catch(() => null)) as CrawlBody | null;
    const { url } = body ?? {};

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400, headers: cors },
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400, headers: cors },
      );
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "Only http(s) URLs are supported" },
        { status: 400, headers: cors },
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
      { status: 200, headers: cors },
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: cors },
    );
  }
}
