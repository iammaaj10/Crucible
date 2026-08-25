"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/navigation/AppHeader";
import { ArrowRight, Layers, DollarSign, Activity, Globe } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [throughput, setThroughput] = useState("5000 req/sec");
  const [targetLatency, setTargetLatency] = useState("< 50ms");
  const [monthlyBudget, setMonthlyBudget] = useState("$1,500");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          constraints: {
            throughput,
            targetLatency,
            regions: ["us-east-1", "eu-central-1"],
            monthlyBudget,
          },
        }),
      });
      const data = await res.json();
      router.push(`/design/${data.id}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-8 py-16">
        <div className="border-b border-white/10 pb-6 mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">INITIATE_SIMULATION</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Configure Architecture Constraints
          </h1>
          <p className="mt-2 text-xs text-neutral-400">
            Define load demands and regional requirements before launching the discrete-event topology canvas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="border border-white/10 bg-neutral-950 p-8 shadow-2xl space-y-6">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                System Topology Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Real-Time Payment Settlement Engine"
                className="w-full rounded border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-2">
                  <Activity className="h-3.5 w-3.5 text-white" /> Target Throughput
                </label>
                <select
                  value={throughput}
                  onChange={(e) => setThroughput(e.target.value)}
                  className="w-full rounded border border-white/15 bg-black px-3 py-2 text-xs font-mono text-white outline-none focus:border-white"
                >
                  <option value="1000 req/sec">1,000 req/sec (Tier 1)</option>
                  <option value="5000 req/sec">5,000 req/sec (Standard)</option>
                  <option value="25000 req/sec">25,000 req/sec (High Concurrency)</option>
                  <option value="100000 req/sec">100,000 req/sec (Hyper-scale)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-2">
                  <Layers className="h-3.5 w-3.5 text-white" /> SLA Target Latency
                </label>
                <select
                  value={targetLatency}
                  onChange={(e) => setTargetLatency(e.target.value)}
                  className="w-full rounded border border-white/15 bg-black px-3 py-2 text-xs font-mono text-white outline-none focus:border-white"
                >
                  <option value="< 20ms">&lt; 20ms (Ultra-Low)</option>
                  <option value="< 50ms">&lt; 50ms (Standard P99)</option>
                  <option value="< 150ms">&lt; 150ms (Relaxed)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-2">
                  <DollarSign className="h-3.5 w-3.5 text-white" /> Monthly Budget
                </label>
                <select
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full rounded border border-white/15 bg-black px-3 py-2 text-xs font-mono text-white outline-none focus:border-white"
                >
                  <option value="$500">$500 / month</option>
                  <option value="$1,500">$1,500 / month</option>
                  <option value="$5,000">$5,000 / month</option>
                  <option value="$20,000">$20,000 / month</option>
                </select>
              </div>
            </div>

            <div className="rounded border border-white/10 bg-black p-4 font-mono text-xs text-neutral-400">
              <div className="flex items-center gap-2 text-white mb-1">
                <Globe className="h-3.5 w-3.5" /> Regional Deployment Plan:
              </div>
              <p className="text-[11px] text-neutral-500">
                Primary: us-east-1 (N. Virginia) &bull; Secondary Failover: eu-central-1 (Frankfurt)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="font-mono text-xs text-neutral-500 hover:text-white"
            >
              [CANCEL]
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-2 rounded bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
            >
              {loading ? "INITIALIZING TOPOLOGY..." : "Launch Architecture Canvas"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
