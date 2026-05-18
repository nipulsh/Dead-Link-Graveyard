"use client";

import { create } from "zustand";
import type { Edge, Node } from "@xyflow/react";
import type {
  CrawlCompletePayload,
  CrawlPageCrawledPayload,
  CrawlPageFoundPayload,
  CrawlStartPayload,
  CrawlStatsSnapshot,
  NodeStatusCategory,
} from "@/types/socket-events";
import { getSocket } from "@/lib/socket-client";

export type CrawlPhase = "idle" | "running" | "complete" | "error";

export type ActivityItem = {
  id: string;
  at: number;
  message: string;
  tone: "info" | "success" | "warn" | "error";
};

export type CrawlNodeData = {
  label: string;
  fullUrl: string;
  category: NodeStatusCategory;
  status: number;
  resourceType: string;
  parentNodeId: string | null;
};

function shortUrl(url: string, max = 42): string {
  try {
    const u = new URL(url);
    const tail = `${u.pathname}${u.search}`;
    const s = tail.length > 1 ? tail : u.href;
    return s.length > max ? `${s.slice(0, max)}…` : s;
  } catch {
    return url.length > max ? `${url.slice(0, max)}…` : url;
  }
}

function layoutPosition(
  parentNodeId: string | null,
  depth: number,
  nodes: Node<CrawlNodeData>[],
): { x: number; y: number } {
  if (!parentNodeId) {
    return { x: 0, y: 0 };
  }
  const parent = nodes.find((n) => n.id === parentNodeId);
  const peerCount = nodes.filter(
    (n) => n.data.parentNodeId === parentNodeId,
  ).length;
  if (!parent) {
    return { x: (peerCount % 5) * 60, y: depth * 120 };
  }
  return {
    x: parent.position.x + (peerCount % 4) * 220 - 330,
    y: parent.position.y + 140 + Math.floor(peerCount / 4) * 40,
  };
}

function bumpLiveStats(
  stats: CrawlStatsSnapshot,
  status: number,
): CrawlStatsSnapshot {
  const next = { ...stats };
  if (status >= 200 && status < 300) next.ok2xx += 1;
  else if (status === 404) next.notFound404 += 1;
  else if (status >= 500) next.serverError5xx += 1;
  else if (status >= 300 && status < 400) next.redirects3xx += 1;
  return next;
}

type CrawlState = {
  crawlId: string | null;
  phase: CrawlPhase;
  seedUrl: string | null;
  maxDepth: number;
  maxPages: number;
  stats: CrawlStatsSnapshot;
  nodes: Node<CrawlNodeData>[];
  edges: Edge[];
  activity: ActivityItem[];
  edgeKeys: Set<string>;
  completeReason: CrawlCompletePayload["reason"] | null;
  resetForCrawl: (payload: CrawlStartPayload) => void;
  applyPageFound: (payload: CrawlPageFoundPayload) => void;
  applyPageCrawled: (payload: CrawlPageCrawledPayload) => void;
  applyComplete: (payload: CrawlCompletePayload) => void;
  applyError: (message: string) => void;
  registerExportFn: (fn: (() => Promise<void>) | null) => void;
  exportFn: (() => Promise<void>) | null;
  requestStop: () => void;
};

let activityCounter = 0;

function pushActivity(
  set: (partial: Partial<CrawlState> | ((s: CrawlState) => Partial<CrawlState>)) => void,
  message: string,
  tone: ActivityItem["tone"],
) {
  const id = `${Date.now()}-${activityCounter++}`;
  const next: ActivityItem = { id, at: Date.now(), message, tone };
  set((state) => ({
    activity: [next, ...state.activity].slice(0, 120),
  }));
}

export const useCrawlStore = create<CrawlState>((set, get) => ({
  crawlId: null,
  phase: "idle",
  seedUrl: null,
  maxDepth: 0,
  maxPages: 0,
  stats: {
    totalFound: 0,
    totalPagesCrawled: 0,
    ok2xx: 0,
    notFound404: 0,
    serverError5xx: 0,
    redirects3xx: 0,
  },
  nodes: [],
  edges: [],
  activity: [],
  edgeKeys: new Set(),
  completeReason: null,
  exportFn: null,

  registerExportFn: (fn) => set({ exportFn: fn }),

  requestStop: () => {
    const { crawlId } = get();
    if (!crawlId) return;
    getSocket().emit("crawl:stop", crawlId);
    pushActivity(set, "Stop requested", "warn");
  },

  resetForCrawl: (payload) => {
    set({
      crawlId: payload.crawlId,
      phase: "running",
      seedUrl: payload.seedUrl,
      maxDepth: payload.maxDepth,
      maxPages: payload.maxPages,
      stats: {
        totalFound: 0,
        totalPagesCrawled: 0,
        ok2xx: 0,
        notFound404: 0,
        serverError5xx: 0,
        redirects3xx: 0,
      },
      nodes: [],
      edges: [],
      activity: [],
      edgeKeys: new Set(),
      completeReason: null,
    });
    pushActivity(
      set,
      `Crawl started — depth ≤ ${payload.maxDepth}, pages ≤ ${payload.maxPages}`,
      "info",
    );
  },

  applyPageFound: (payload) => {
    if (payload.crawlId !== get().crawlId) return;

    set((state) => {
      const edgeKeys = new Set(state.edgeKeys);
      const hasEdge = edgeKeys.has(payload.edgeId);
      if (!hasEdge && payload.parentNodeId) {
        edgeKeys.add(payload.edgeId);
      }

      let nodes = state.nodes;
      if (payload.isNewNode) {
        const pos = layoutPosition(
          payload.parentNodeId,
          payload.depth,
          state.nodes,
        );
        const node: Node<CrawlNodeData> = {
          id: payload.nodeId,
          type: "crawlNode",
          position: pos,
          data: {
            label: shortUrl(payload.url),
            fullUrl: payload.url,
            category: "crawling",
            status: 0,
            resourceType: payload.resourceType,
            parentNodeId: payload.parentNodeId,
          },
        };
        nodes = [...state.nodes, node];
      }

      let edges = state.edges;
      if (!hasEdge && payload.parentNodeId) {
        edges = [
          ...state.edges,
          {
            id: payload.edgeId,
            source: payload.parentNodeId,
            target: payload.nodeId,
            animated: true,
          },
        ];
      }

      const stats = { ...state.stats };
      if (payload.isNewNode) {
        stats.totalFound += 1;
      }

      return { nodes, edges, edgeKeys, stats };
    });
  },

  applyPageCrawled: (payload) => {
    if (payload.crawlId !== get().crawlId) return;

    set((state) => {
      let stats = bumpLiveStats(state.stats, payload.status);
      if (payload.resourceType === "document") {
        stats = {
          ...stats,
          totalPagesCrawled: stats.totalPagesCrawled + 1,
        };
      }
      return {
        stats,
        nodes: state.nodes.map((n) =>
          n.id === payload.nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  category: payload.category,
                  status: payload.status,
                  resourceType: payload.resourceType,
                },
              }
            : n,
        ),
      };
    });

    const line =
      payload.status > 0
        ? `${payload.status} ${shortUrl(payload.url, 48)}`
        : `? ${shortUrl(payload.url, 48)}`;
    pushActivity(
      set,
      line,
      payload.category === "not_found" ? "error" : "success",
    );
  },

  applyComplete: (payload) => {
    if (payload.crawlId !== get().crawlId) return;
    set({
      phase: "complete",
      stats: payload.stats,
      completeReason: payload.reason,
    });
    pushActivity(
      set,
      `Complete (${payload.reason}) — ${payload.stats.totalFound} URLs, ${payload.stats.totalPagesCrawled} pages`,
      "success",
    );
  },

  applyError: (message) => {
    set({ phase: "error" });
    pushActivity(set, message, "error");
  },
}));

export function categoryToHex(category: NodeStatusCategory): string {
  switch (category) {
    case "success":
      return "#22c55e";
    case "not_found":
      return "#ef4444";
    case "redirect":
      return "#eab308";
    case "server_error":
    case "client_error":
      return "#f97316";
    case "crawling":
      return "#3b82f6";
    default:
      return "#94a3b8";
  }
}
