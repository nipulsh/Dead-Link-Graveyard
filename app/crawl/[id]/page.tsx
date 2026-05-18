"use client";

import Graph from "@/components/crawl/Graph";
import Header from "@/components/crawl/Header";
import Navbar from "@/components/crawl/Navbar";
import {
  clearPendingCrawl,
  isPendingCrawl,
} from "@/lib/crawl-session-flag";
import { VERCEL_MISSING_BACKEND_MESSAGE } from "@/lib/deploy-help";
import { missingRealtimeBackendOnVercel } from "@/lib/public-runtime";
import { getSocket } from "@/lib/socket-client";
import { SOCKET_EVENTS } from "@/types/socket-events";
import type {
  CrawlCompletePayload,
  CrawlErrorPayload,
  CrawlPageCrawledPayload,
  CrawlPageFoundPayload,
  CrawlStartPayload,
} from "@/types/socket-events";
import { useCrawlStore } from "@/store/useCrawlStore";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function CrawlDashboardPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    if (!id) return;

    if (missingRealtimeBackendOnVercel()) {
      clearPendingCrawl();
      useCrawlStore.getState().applyError(VERCEL_MISSING_BACKEND_MESSAGE);
      return;
    }

    if (isPendingCrawl(id)) {
      useCrawlStore.setState({ crawlId: id, phase: "running" });
    }

    const socket = getSocket();

    const onStart = (p: CrawlStartPayload) => {
      if (p.crawlId !== id) return;
      clearPendingCrawl();
      useCrawlStore.getState().resetForCrawl(p);
    };
    const onFound = (p: CrawlPageFoundPayload) => {
      if (p.crawlId !== id) return;
      useCrawlStore.getState().applyPageFound(p);
    };
    const onCrawled = (p: CrawlPageCrawledPayload) => {
      if (p.crawlId !== id) return;
      useCrawlStore.getState().applyPageCrawled(p);
    };
    const onErr = (p: CrawlErrorPayload) => {
      if (p.crawlId !== id) return;
      clearPendingCrawl();
      useCrawlStore.getState().applyError(p.message);
    };
    const onDone = (p: CrawlCompletePayload) => {
      if (p.crawlId !== id) return;
      clearPendingCrawl();
      useCrawlStore.getState().applyComplete(p);
    };

    let connectErrorReported = false;
    const onConnectError = (err: Error) => {
      if (connectErrorReported) return;
      connectErrorReported = true;
      clearPendingCrawl();
      socket.io.reconnection(false);
      socket.disconnect();
      useCrawlStore
        .getState()
        .applyError(
          err?.message
            ? `Socket: ${err.message}`
            : "Could not connect to live crawl server. Use npm run dev (tsx server.ts) or set NEXT_PUBLIC_CRAWL_API_BASE.",
        );
    };

    socket.on(SOCKET_EVENTS.CRAWL_START, onStart);
    socket.on(SOCKET_EVENTS.PAGE_FOUND, onFound);
    socket.on(SOCKET_EVENTS.PAGE_CRAWLED, onCrawled);
    socket.on(SOCKET_EVENTS.ERROR, onErr);
    socket.on(SOCKET_EVENTS.COMPLETE, onDone);
    socket.on("connect_error", onConnectError);

    const joinRoom = () => {
      socket.emit("join-crawl-room", id);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
      socket.connect();
    }

    return () => {
      socket.emit("leave-crawl-room", id);
      socket.off("connect", joinRoom);
      socket.off(SOCKET_EVENTS.CRAWL_START, onStart);
      socket.off(SOCKET_EVENTS.PAGE_FOUND, onFound);
      socket.off(SOCKET_EVENTS.PAGE_CRAWLED, onCrawled);
      socket.off(SOCKET_EVENTS.ERROR, onErr);
      socket.off(SOCKET_EVENTS.COMPLETE, onDone);
      socket.off("connect_error", onConnectError);
    };
  }, [id]);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-[#fafafa]">
      <Navbar />
      <Header />
      <Graph crawlId={id} />
    </div>
  );
}
