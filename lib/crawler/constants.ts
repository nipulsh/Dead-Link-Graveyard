/** Maximum HTML pages to visit with Puppeteer per crawl. */
export const DEFAULT_MAX_PAGES = 40;

/** Maximum link depth from the seed URL (seed = 0). */
export const DEFAULT_MAX_DEPTH = 4;

/** Hard cap on unique URLs tracked (graph + memory safety). */
export const MAX_DISCOVERED_URLS = 2000;

export const PAGE_NAVIGATION_TIMEOUT_MS = 45_000;

export const RESOURCE_FETCH_TIMEOUT_MS = 12_000;

export const RESOURCE_FETCH_CONCURRENCY = 12;
