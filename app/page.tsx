"use client";

import AuroraBackground from "@/components/Background";
import Inputbar from "@/components/Inputbar";
import router from "next/router";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const handleCrawl = async (url: string) => {
    const response = await fetch("/api/crawl", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    if (data.success) {
      router.push(`/crawl/${data.crawlId}`);
    }
  };
  return (
    <div className="h-screen w-screen">
      <div className="absolute h-screen w-screen top-0 left-0 z-[-1]">
        <AuroraBackground />
      </div>
      <div className="h-full w-full flex justify-center items-center">
        <Inputbar />
      </div>
    </div>
  );
}
