"use client";

import { getCrawlPostUrl } from "@/lib/public-runtime";
import { Search } from "lucide-react";
import { markPendingCrawl } from "@/lib/crawl-session-flag";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Inputbar = () => {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const handleCrawl = async (url: string) => {
    const response = await fetch(getCrawlPostUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = (await response.json()) as {
      success?: boolean;
      crawlId?: string;
      error?: string;
    };
    if (!response.ok) {
      console.error(data.error ?? "Crawl request failed");
      return;
    }
    if (data.success && data.crawlId) {
      markPendingCrawl(data.crawlId);
      router.push(`/crawl/${data.crawlId}`);
    }
  };
  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCrawl(url);
    }
    return;
  };
  return (
    <div className="relative bottom-20">
      <div className="mb-20 text-center text-4xl">Enter the website link</div>
      <div className="bg-[#FFFEFE] h-content shadow-2xs gap-5 p-4 flex justify-between items-center w-[30vw] rounded-2xl overflow-hidden">
        <div className="text-[#848497]">
          <Search />
        </div>
        <input
          onKeyDown={(e: React.KeyboardEvent) => {
            handleSubmit(e);
          }}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
          type="text"
          className="h-full w-full rounded-2xl outline-none focus:outline-none ring-0 focus:ring-0 border-none focus:border-none"
          placeholder="enter website link"
        />
      </div>
    </div>
  );
};

export default Inputbar;
