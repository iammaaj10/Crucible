"use client";

import { useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { GatewayNode, ServiceNode, DbNode, CacheNode, QueueNode } from "./CustomNodes";
import { Play, Save, AlertTriangle, Plus, Activity, RefreshCw } from "lucide-react";

interface SimulationResults {
  p99Latency: number;
  throughputAchieved: number;
  errorRate: string;
  estimatedCost: string;
  bottlenecks: string[];
}

interface ArchitectureCanvasProps {
  projectId: string;
  initialGraph: { nodes: Node[]; edges: Edge[] };
  initialSimResults?: SimulationResults;
}

export function ArchitectureCanvas({
  projectId,
  initialGraph,
  initialSimResults,
}: ArchitectureCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph?.edges || []);
  const [simResults, setSimResults] = useState<SimulationResults | null>(initialSimResults || null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const nodeTypes = useMemo(
    () => ({
      gatewayNode: GatewayNode,
      serviceNode: ServiceNode,
      dbNode: DbNode,
      cacheNode: CacheNode,
      queueNode: QueueNode,
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#ffffff", strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleAddNode = (type: string, label: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 250 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: { label },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });
      const data = await res.json();
      setSimResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designGraph: { nodes, edges }, simResults }),
      });
      setSaveStatus("SAVED");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus("SAVE_FAILED");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col bg-black text-white selection:bg-white selection:text-black">
      {/* Canvas Action Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950 px-6 py-3">
        {/* Node Adders */}
        <div className="flex items-center gap-2">
          <span className="mr-2 font-mono text-[10px] uppercase text-neutral-500">Insert Node:</span>
          <button
            onClick={() => handleAddNode("gatewayNode", "API Gateway Ingress")}
            className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-xs font-mono text-white transition-colors hover:border-white hover:bg-neutral-900"
          >
            <Plus className="h-3 w-3" /> +Gateway
          </button>
          <button
            onClick={() => handleAddNode("serviceNode", "Microservice Worker")}
            className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-xs font-mono text-white transition-colors hover:border-white hover:bg-neutral-900"
          >
            <Plus className="h-3 w-3" /> +Service
          </button>
          <button
            onClick={() => handleAddNode("dbNode", "PostgreSQL Database")}
            className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-xs font-mono text-white transition-colors hover:border-white hover:bg-neutral-900"
          >
            <Plus className="h-3 w-3" /> +Database
          </button>
          <button
            onClick={() => handleAddNode("cacheNode", "Redis Cache Cluster")}
            className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-xs font-mono text-white transition-colors hover:border-white hover:bg-neutral-900"
          >
            <Plus className="h-3 w-3" /> +Redis
          </button>
          <button
            onClick={() => handleAddNode("queueNode", "Kafka Message Queue")}
            className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-xs font-mono text-white transition-colors hover:border-white hover:bg-neutral-900"
          >
            <Plus className="h-3 w-3" /> +Queue
          </button>
        </div>

        {/* Execution Actions */}
        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="font-mono text-xs text-neutral-400">[{saveStatus}]</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded border border-white/20 bg-black px-4 py-1.5 text-xs font-mono font-medium text-white transition-all hover:border-white hover:bg-neutral-900 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save Topology"}
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center gap-2 rounded bg-white px-4 py-1.5 text-xs font-mono font-bold uppercase text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
          >
            {isSimulating ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-black" />
            )}
            {isSimulating ? "Simulating..." : "Run Load Benchmark"}
          </button>
        </div>
      </div>

      {/* Main Canvas & Metrics Split */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1 bg-black">
          {/* Quick Helper Tip for New Users */}
          <div className="absolute top-4 left-4 z-10 rounded border border-white/15 bg-black/80 px-3.5 py-2 font-mono text-[11px] text-neutral-300 backdrop-blur pointer-events-none shadow-lg">
            <span className="text-white font-bold">[CANVAS_CONTROLS]</span> Drag connection dots between nodes to wire services &bull; Click &ldquo;Run Load Benchmark&rdquo; to simulate load.
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls className="!border-white/20 !bg-neutral-950 !fill-white" />
            <MiniMap
              nodeColor="#ffffff"
              maskColor="rgba(0, 0, 0, 0.85)"
              className="!border-white/20 !bg-black"
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="#ffffff22"
            />
          </ReactFlow>
        </div>

        {/* Real-time Telemetry Metrics Drawer */}
        <div className="w-80 border-l border-white/10 bg-neutral-950 p-6 font-mono text-xs overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Activity className="h-4 w-4 text-white" />
            <h3 className="font-bold uppercase tracking-wider text-white">Telemetry &amp; SLO</h3>
          </div>

          {simResults ? (
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase">p99 Latency</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {simResults.p99Latency} <span className="text-xs font-normal text-neutral-400">ms</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] text-neutral-500 uppercase">Throughput Achieved</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {simResults.throughputAchieved.toLocaleString()} <span className="text-xs font-normal text-neutral-400">req/s</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] text-neutral-500 uppercase">Synthetic Error Rate</p>
                <p className="mt-1 text-2xl font-bold text-white">{simResults.errorRate}</p>
              </div>

              <div>
                <p className="text-[10px] text-neutral-500 uppercase">Estimated Run Cost</p>
                <p className="mt-1 text-xl font-bold text-white">{simResults.estimatedCost}</p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] text-neutral-500 uppercase mb-2">Topology Bottlenecks</p>
                {simResults.bottlenecks && simResults.bottlenecks.length > 0 ? (
                  <div className="space-y-2">
                    {simResults.bottlenecks.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2 rounded border border-white/15 bg-black p-2 text-[11px] text-neutral-300">
                        <AlertTriangle className="h-3.5 w-3.5 text-white shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400">[NO_ARCHITECTURAL_ANOMALIES_DETECTED]</p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-12 text-center text-neutral-500">
              <p>[SYSTEM_IDLE]</p>
              <p className="mt-2 text-[11px] text-neutral-600">
                Click &quot;Run Load Benchmark&quot; to execute simulation dynamics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
