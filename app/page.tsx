"use client";

import AuroraBackground from "@/components/Background";
import Inputbar from "@/components/Inputbar";

export default function Home() {
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
