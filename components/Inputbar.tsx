"use client";

import { Search } from "lucide-react";
import React from "react";

const Inputbar = () => {
  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      console.log("pressed enter");
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
          type="text"
          className="h-full w-full rounded-2xl outline-none focus:outline-none ring-0 focus:ring-0 border-none focus:border-none"
          placeholder="enter website link"
        />
      </div>
    </div>
  );
};

export default Inputbar;
