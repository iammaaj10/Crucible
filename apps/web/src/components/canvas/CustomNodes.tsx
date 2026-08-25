"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Globe, Server, Database, Zap, Layers } from "lucide-react";

export const GatewayNode = memo(({ data }: { data: { label: string; rps?: number } }) => {
  return (
    <div className="min-w-[170px] rounded border border-white bg-black p-3 text-white shadow-xl">
      <Handle type="target" position={Position.Left} className="!bg-white" />
      <div className="flex items-center gap-2 border-b border-white/20 pb-2">
        <Globe className="h-4 w-4 text-white" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">Gateway</span>
      </div>
      <div className="mt-2">
        <p className="text-xs font-semibold text-white">{data.label}</p>
        <p className="font-mono text-[10px] text-neutral-400">Cap: {data.rps || 5000} req/s</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-white" />
    </div>
  );
});
GatewayNode.displayName = "GatewayNode";

export const ServiceNode = memo(({ data }: { data: { label: string; instances?: number } }) => {
  return (
    <div className="min-w-[170px] rounded border border-white/40 bg-neutral-950 p-3 text-white shadow-xl">
      <Handle type="target" position={Position.Left} className="!bg-white" />
      <div className="flex items-center gap-2 border-b border-white/20 pb-2">
        <Server className="h-4 w-4 text-white" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">Service</span>
      </div>
      <div className="mt-2">
        <p className="text-xs font-semibold text-white">{data.label}</p>
        <p className="font-mono text-[10px] text-neutral-400">Replicas: {data.instances || 2} nodes</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-white" />
    </div>
  );
});
ServiceNode.displayName = "ServiceNode";

export const DbNode = memo(({ data }: { data: { label: string; replica?: boolean } }) => {
  return (
    <div className="min-w-[170px] rounded border border-white/30 bg-neutral-950 p-3 text-white shadow-xl">
      <Handle type="target" position={Position.Left} className="!bg-white" />
      <div className="flex items-center gap-2 border-b border-white/20 pb-2">
        <Database className="h-4 w-4 text-white" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">Storage</span>
      </div>
      <div className="mt-2">
        <p className="text-xs font-semibold text-white">{data.label}</p>
        <p className="font-mono text-[10px] text-neutral-400">PostgreSQL {data.replica ? "(Read/Write Pool)" : ""}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-white" />
    </div>
  );
});
DbNode.displayName = "DbNode";

export const CacheNode = memo(({ data }: { data: { label: string; memory?: string } }) => {
  return (
    <div className="min-w-[170px] rounded border border-white/30 bg-black p-3 text-white shadow-xl">
      <Handle type="target" position={Position.Left} className="!bg-white" />
      <div className="flex items-center gap-2 border-b border-white/20 pb-2">
        <Zap className="h-4 w-4 text-white" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">In-Memory Cache</span>
      </div>
      <div className="mt-2">
        <p className="text-xs font-semibold text-white">{data.label}</p>
        <p className="font-mono text-[10px] text-neutral-400">Alloc: {data.memory || "8GB"} LRU</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-white" />
    </div>
  );
});
CacheNode.displayName = "CacheNode";

export const QueueNode = memo(({ data }: { data: { label: string } }) => {
  return (
    <div className="min-w-[170px] rounded border border-white/30 bg-neutral-950 p-3 text-white shadow-xl">
      <Handle type="target" position={Position.Left} className="!bg-white" />
      <div className="flex items-center gap-2 border-b border-white/20 pb-2">
        <Layers className="h-4 w-4 text-white" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">Message Queue</span>
      </div>
      <div className="mt-2">
        <p className="text-xs font-semibold text-white">{data.label}</p>
        <p className="font-mono text-[10px] text-neutral-400">Kafka Stream Broker</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-white" />
    </div>
  );
});
QueueNode.displayName = "QueueNode";
