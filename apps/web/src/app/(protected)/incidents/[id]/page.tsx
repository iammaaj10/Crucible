"use client";

import { useState } from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { AlertOctagon, Terminal, Cpu, CheckCircle2, RotateCcw, Zap } from "lucide-react";

export default function IncidentWarRoomPage() {
  const [mitigationApplied, setMitigationApplied] = useState<string | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<"active" | "mitigated">("active");

  const incidentLogs = [
    "[12:44:01.021 UTC] [WARN]  orders-service.worker-3: Redis connection pool utilization reached 98.4%",
    "[12:44:03.112 UTC] [ERROR] orders-service.worker-1: Lock timeout acquiring rate token for client 198.51.100.4",
    "[12:44:04.992 UTC] [CRIT]  gateway-ingress: HTTP 504 Gateway Timeout burst rate: 412 req/sec",
    "[12:44:06.331 UTC] [ERROR] p99_latency_slo_breach: Latency climbed from 38ms -> 4200ms in region us-east-1",
    "[12:44:08.802 UTC] [WARN]  db-primary: Active Postgres connections saturated: 99/100 connections held",
  ];

  const handleMitigate = (action: string) => {
    setMitigationApplied(action);
    setResolutionStatus("mitigated");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-8 py-10">
        {/* Incident Alert Banner */}
        <div className="border border-white/20 bg-neutral-950 p-6 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertOctagon className="h-6 w-6 text-white shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 uppercase">
                  <span>INCIDENT #INC-8921 // PRIORITY: SEV-1</span>
                  <span>&bull;</span>
                  <span className="text-white font-bold">
                    {resolutionStatus === "active" ? "ACTIVE_OUTAGE" : "MITIGATED"}
                  </span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white mt-1">
                  Global Checkout Latency Spike &amp; Ingress 504 Timeouts
                </h1>
                <p className="mt-1 text-xs text-neutral-400">
                  Triggered after deployment of PR #101 (Rate Limiter Refactor). Order processing queue backing up.
                </p>
              </div>
            </div>

            <div className="font-mono text-right shrink-0">
              <span className="text-[10px] uppercase text-neutral-500 block">SLA BREACH TIMER</span>
              <span className="text-2xl font-bold text-white">04:18.92</span>
            </div>
          </div>
        </div>

        {/* 2-Column Live Triage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Telemetry Stream Log */}
          <div className="border border-white/10 bg-black font-mono text-xs shadow-2xl flex flex-col">
            <div className="border-b border-white/10 bg-neutral-950 px-4 py-2.5 flex items-center justify-between text-neutral-400 text-[11px]">
              <span className="flex items-center gap-2 text-white">
                <Terminal className="h-3.5 w-3.5" /> Real-Time Telemetry Log Stream
              </span>
              <span className="text-[10px]">TAIL -F /VAR/LOG/CONTAINERS</span>
            </div>

            <div className="p-4 space-y-2 flex-1 bg-black text-[11px] leading-relaxed">
              {incidentLogs.map((log, i) => (
                <div key={i} className="text-neutral-300 font-mono">
                  {log}
                </div>
              ))}
              {resolutionStatus === "mitigated" && (
                <div className="text-white font-mono font-bold mt-4 pt-2 border-t border-white/10">
                  [SYSTEM_RECOVERY] Mitigation applied: {mitigationApplied}. HTTP 504 errors dropped to 0.00%.
                </div>
              )}
            </div>
          </div>

          {/* Root-Cause Hypothesis & Mitigations */}
          <div className="border border-white/10 bg-neutral-950 p-6 space-y-6 shadow-2xl">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">TRIAGE_ANALYSIS</p>
              <h2 className="text-base font-bold text-white mt-1">Diagnosed Root Cause</h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Non-atomic token fetch/decrement in recent rate-limiting pull request caused severe lock contention on Redis keys, cascading to primary database connection pool starvation.
              </p>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <p className="font-mono text-xs uppercase tracking-wider text-white">Execute Operational Remediation</p>

              <button
                onClick={() => handleMitigate("Instant Rollback to Previous Stable Release (v1.8.4)")}
                disabled={resolutionStatus === "mitigated"}
                className="w-full flex items-center justify-between rounded border border-white/20 bg-black p-3 text-xs font-mono text-white transition-all hover:border-white hover:bg-neutral-900 disabled:opacity-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-white" />
                  <span>Rollback to Stable Release (v1.8.4)</span>
                </span>
                <span className="text-[10px] text-neutral-500 uppercase">[RECOMMENDED]</span>
              </button>

              <button
                onClick={() => handleMitigate("Autoscale Worker Pods 4 -> 12 Replicas")}
                disabled={resolutionStatus === "mitigated"}
                className="w-full flex items-center justify-between rounded border border-white/20 bg-black p-3 text-xs font-mono text-white transition-all hover:border-white hover:bg-neutral-900 disabled:opacity-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-white" />
                  <span>Autoscale Worker Pods (x3 Replicas)</span>
                </span>
                <span className="text-[10px] text-neutral-500 uppercase">[TEMPORARY BUFFER]</span>
              </button>

              <button
                onClick={() => handleMitigate("Bypass Redis Rate Limiter Fallback Gate")}
                disabled={resolutionStatus === "mitigated"}
                className="w-full flex items-center justify-between rounded border border-white/20 bg-black p-3 text-xs font-mono text-white transition-all hover:border-white hover:bg-neutral-900 disabled:opacity-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-white" />
                  <span>Bypass Rate Limiter Gate</span>
                </span>
                <span className="text-[10px] text-neutral-500 uppercase">[CIRCUIT BREAKER]</span>
              </button>
            </div>

            {resolutionStatus === "mitigated" && (
              <div className="rounded border border-white/20 bg-black p-4 font-mono text-xs text-white flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
                <div>
                  <p className="font-bold uppercase">OUTAGE_CONTAINED</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Service SLO recovered. MTTR score logged to your engineering profile.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
