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
      {/* Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-neutral-950 px-6 py-3">
        {/* Node Palette — what can you add? */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase text-neutral-500 mr-1">Add a component:</span>
          <button
            title="API Gateway — the front door of your app; handles all incoming requests"
            onClick={() => handleAddNode("gatewayNode", "API Gateway (Entry Point)")}
            className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-xs text-white transition-colors hover:border-white hover:bg-neutral-900"
          >
            <Plus className="h-3 w-3" /> 🌐 Gateway
          </button>
          <button
            title="Microservice — a backend server that handles a specific task (e.g. orders, payments)"
            onClick={() => handleAddNode("serviceNode", "Microservice (Backend Worker)")}
            className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-xs text-white transition-colors hover:border-white hover:bg-neutral-900"
          >
            <Plus className="h-3 w-3" /> 🖥️ Service
          </button>
          <button
            title="Database — stores all your app data permanently (e.g. users, orders)"
            onClick={() => handleAddNode("dbNode", "Database (PostgreSQL)")}
            className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-xs text-white transition-colors hover:border-white hover:bg-neutral-900"
          >
            <Plus className="h-3 w-3" /> 🗄️ Database
          </button>
          <button
            title="Cache — ultra-fast memory storage; stops the database from being overloaded"
            onClick={() => handleAddNode("cacheNode", "Cache (Redis Speed Layer)")}
            className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-xs text-white transition-colors hover:border-white hover:bg-neutral-900"
          >
            <Plus className="h-3 w-3" /> ⚡ Cache
          </button>
          <button
            title="Message Queue — a background task lane; lets services send each other work without waiting"
            onClick={() => handleAddNode("queueNode", "Message Queue (Kafka)")}
            className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-xs text-white transition-colors hover:border-white hover:bg-neutral-900"
          >
            <Plus className="h-3 w-3" /> 📦 Queue
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-xs text-neutral-400">{saveStatus === "SAVED" ? "✓ Saved" : "Save failed"}</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            title="Save your current design so you don't lose your work"
            className="flex items-center gap-2 rounded border border-white/20 bg-black px-4 py-1.5 text-xs font-medium text-white transition-all hover:border-white hover:bg-neutral-900 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save Design"}
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            title="Test your design: simulates thousands of users hitting your system at once"
            className="flex items-center gap-2 rounded bg-white px-4 py-1.5 text-xs font-bold uppercase text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
          >
            {isSimulating ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-black" />
            )}
            {isSimulating ? "Running Simulation..." : "▶ Run Simulation"}
          </button>
        </div>
      </div>

      {/* Main Canvas & Metrics Split */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1 bg-black">
          {/* Quick tip for new users */}
          <div className="absolute top-4 left-4 z-10 rounded border border-white/15 bg-black/80 px-4 py-2.5 text-[11px] text-neutral-300 backdrop-blur pointer-events-none shadow-lg">
            <span className="font-bold text-white">💡 Quick Tip:</span> Drag the <span className="text-white">small dots</span> on the edge of any node to connect it to another → then click <span className="text-white">▶ Run Simulation</span> to see how it performs.
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

        {/* Simulation Results Panel */}
        <div className="w-80 overflow-y-auto border-l border-white/10 bg-neutral-950 p-6 text-xs">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Activity className="h-4 w-4 text-white" />
            <h3 className="font-bold uppercase tracking-wider text-white">Simulation Results</h3>
          </div>

          {simResults ? (
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-[10px] uppercase text-neutral-500">Response Time (Slowest 1% of users)</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {simResults.p99Latency} <span className="text-xs font-normal text-neutral-400">ms</span>
                </p>
                <p className="mt-1 text-[11px] text-neutral-500">
                  {simResults.p99Latency < 100 ? "✅ Great — users won't notice any delay" : simResults.p99Latency < 500 ? "⚠️ Acceptable, but could be faster" : "❌ Too slow — users will get frustrated"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase text-neutral-500">Requests Handled Per Second</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {simResults.throughputAchieved.toLocaleString()} <span className="text-xs font-normal text-neutral-400">req/s</span>
                </p>
                <p className="mt-1 text-[11px] text-neutral-500">How many users your system can handle simultaneously</p>
              </div>

              <div>
                <p className="text-[10px] uppercase text-neutral-500">Error Rate (Requests that failed)</p>
                <p className="mt-1 text-2xl font-bold text-white">{simResults.errorRate}</p>
                <p className="mt-1 text-[11px] text-neutral-500">Anything below 0.1% is generally acceptable</p>
              </div>

              <div>
                <p className="text-[10px] uppercase text-neutral-500">Estimated Monthly Cloud Cost</p>
                <p className="mt-1 text-xl font-bold text-white">{simResults.estimatedCost}</p>
                <p className="mt-1 text-[11px] text-neutral-500">AWS / GCP pricing for this architecture</p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="mb-2 text-[10px] uppercase text-neutral-500">⚠️ Problems Found</p>
                {simResults.bottlenecks && simResults.bottlenecks.length > 0 ? (
                  <div className="space-y-2">
                    {simResults.bottlenecks.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2 rounded border border-white/15 bg-black p-2.5 text-[11px] text-neutral-300">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400">✅ No problems detected — your architecture looks solid!</p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-12 space-y-3 text-center">
              <p className="text-4xl">🎯</p>
              <p className="font-bold text-white">Ready to test your design?</p>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                Add some components to the canvas, connect them together, then click <strong className="text-neutral-300">▶ Run Simulation</strong> to see how your system performs under load.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
