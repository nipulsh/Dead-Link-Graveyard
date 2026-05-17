import Graph from "@/components/crawl/Graph";
import Header from "@/components/crawl/Header";
import Navbar from "@/components/crawl/Navbar";
import React from "react";

const page = () => {
  return (
    <div className="bg-[#FEFEFE] h-screen">
      <div className="flex flex-col">
        <div className="flex-1">
          <Navbar />
        </div>
        <div className="flex-2">
          <Header />
        </div>
        <div className="flex-5">
          <Graph />
        </div>
      </div>
    </div>
  );
};

export default page;
