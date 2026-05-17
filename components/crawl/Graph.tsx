import React from "react";
import Canvas from "./Canvas";
import CrawlInformation from "./crawlInformation";

const Graph = () => {
  return (
    <div className="h-full min-h-0">
      <div className="grid h-full min-h-0 grid-cols-12 gap-4 p-4">
        <div className="col-span-9 h-full min-h-0 overflow-hidden rounded-2xl border bg-white">
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
