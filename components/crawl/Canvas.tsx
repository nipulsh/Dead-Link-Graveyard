"use client";

import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type NodeTypes,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/shallow";
import CrawlGraphNode from "@/components/crawl/nodes/CrawlGraphNode";
import { useCrawlStore, type CrawlNodeData } from "@/store/useCrawlStore";

const nodeTypes: NodeTypes = {
  crawlNode: CrawlGraphNode,
};

export default function Canvas({ crawlId }: { crawlId: string }) {
  const flowRef = useRef<HTMLDivElement>(null);
  const { nodes, edges, registerExportFn } = useCrawlStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      registerExportFn: s.registerExportFn,
    })),
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    useCrawlStore.setState((s) => ({
      nodes: applyNodeChanges(changes, s.nodes) as Node<CrawlNodeData>[],
    }));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    useCrawlStore.setState((s) => ({
      edges: applyEdgeChanges(changes, s.edges),
    }));
  }, []);

  useEffect(() => {
    registerExportFn(async () => {
      const el = flowRef.current;
      if (!el) return;
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `dead-link-graveyard-${crawlId}.png`;
      a.click();
    });
    return () => registerExportFn(null);
  }, [crawlId, registerExportFn]);

  const defaultEdgeOptions = useMemo(
    () => ({ style: { stroke: "#94a3b8", strokeWidth: 1.2 } }),
    [],
  );

  return (
    <div ref={flowRef} className="h-full w-full min-h-0 bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.05}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background gap={16} size={1} color="#e2e8f0" />
        <Controls position="bottom-left" className="canvas-flow-controls" />
      </ReactFlow>
    </div>
  );
}
