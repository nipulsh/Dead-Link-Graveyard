import React from "react";
import Canvas from "./Canvas";
import CrawlInformation from "./crawlInformation";

const Graph = () => {
  return (
    <div className="">
      <div className="grid grid-cols-12 gap-4 h-screen p-4">
        <div className="col-span-9 rounded-2xl border bg-white">
          <Canvas />
        </div>
        <div className="col-span-3 flex flex-col gap-4">
          <CrawlInformation />
        </div>
      </div>
    </div>
  );
};

export default Graph;
