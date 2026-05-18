"use client";

import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import type { CrawlNodeData } from "@/store/useCrawlStore";
import { categoryToHex } from "@/store/useCrawlStore";

export default function CrawlGraphNode({
  data,
}: NodeProps<Node<CrawlNodeData>>) {
  const border = categoryToHex(data.category);
  return (
    <div
      className="max-w-[220px] rounded-lg border-2 bg-white px-2 py-1.5 text-xs shadow-sm"
      style={{ borderColor: border }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <div className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
        {data.resourceType}
      </div>
      <div className="truncate text-[11px] text-slate-900" title={data.fullUrl}>
        {data.label}
      </div>
      <div className="font-mono text-[10px] text-slate-500">
        {data.status > 0 ? data.status : "…"}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400"
      />
    </div>
  );
}
