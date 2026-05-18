"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Inputbar = () => {
  const router = useRouter();
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
