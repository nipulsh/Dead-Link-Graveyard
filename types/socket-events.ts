export const SOCKET_EVENTS = {
  CRAWL_START: "crawl:start",
  PAGE_FOUND: "crawl:page-found",
  PAGE_CRAWLED: "crawl:page-crawled",
  ERROR: "crawl:error",
  COMPLETE: "crawl:complete",
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export type CrawlResourceType =
  | "document"
  | "stylesheet"
  | "script"
  | "image"
  | "anchor"
  | "other";

export type NodeStatusCategory =
  | "crawling"
  | "success"
  | "redirect"
  | "not_found"
  | "server_error"
  | "client_error"
  | "unknown";

export type CrawlStartPayload = {
  crawlId: string;
  seedUrl: string;
  maxDepth: number;
  maxPages: number;
};

export type CrawlPageFoundPayload = {
  crawlId: string;
  parentUrl: string | null;
  url: string;
  nodeId: string;
  parentNodeId: string | null;
  resourceType: CrawlResourceType;
  depth: number;
  edgeId: string;
  /** False when the URL was already on the graph; still emit so clients can add another incoming edge. */
  isNewNode: boolean;
};

export type CrawlPageCrawledPayload = {
  crawlId: string;
  url: string;
  nodeId: string;
  status: number;
  category: NodeStatusCategory;
  finalUrl?: string;
  discoveredOn: string;
  resourceType: CrawlResourceType;
};

export type CrawlErrorPayload = {
  crawlId: string;
  message: string;
  url?: string;
};

export type CrawlCompletePayload = {
  crawlId: string;
  reason: "finished" | "aborted" | "limit_pages" | "limit_discovered";
  stats: CrawlStatsSnapshot;
};

export type CrawlStatsSnapshot = {
  totalFound: number;
  totalPagesCrawled: number;
  ok2xx: number;
  notFound404: number;
  serverError5xx: number;
  redirects3xx: number;
};
