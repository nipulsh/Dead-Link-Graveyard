import type { Page } from "puppeteer";
import { normalizeUrl } from "@/lib/crawler/url-utils";

export type ExtractedFromPage = {
  anchors: string[];
  images: string[];
  scripts: string[];
  stylesheets: string[];
};

export async function extractResourcesFromPage(
  page: Page,
  pageUrl: string,
): Promise<ExtractedFromPage> {
  const raw = await page.evaluate(() => {
    const abs = (attr: string | null, base: string): string | null => {
      if (!attr) return null;
      try {
        return new URL(attr.trim(), base).href;
      } catch {
        return null;
      }
    };

    const base = location.href;

    const anchors = [...document.querySelectorAll("a[href]")]
      .map((a) => abs((a as HTMLAnchorElement).getAttribute("href"), base))
      .filter((x): x is string => Boolean(x));

    const images = [...document.querySelectorAll("img[src]")]
      .map((img) => abs((img as HTMLImageElement).getAttribute("src"), base))
      .filter((x): x is string => Boolean(x));

    const scripts = [...document.querySelectorAll("script[src]")]
      .map((s) => abs((s as HTMLScriptElement).getAttribute("src"), base))
      .filter((x): x is string => Boolean(x));

    const stylesheets = [
      ...document.querySelectorAll('link[rel="stylesheet"][href]'),
    ]
      .map((l) => abs((l as HTMLLinkElement).getAttribute("href"), base))
      .filter((x): x is string => Boolean(x));

    return { anchors, images, scripts, stylesheets };
  });

  const normList = (list: readonly string[]) =>
    list
      .map((u) => normalizeUrl(u, pageUrl))
      .filter((u): u is string => Boolean(u));

  return {
    anchors: normList(raw.anchors),
    images: normList(raw.images),
    scripts: normList(raw.scripts),
    stylesheets: normList(raw.stylesheets),
  };
}
