"use client";

import { useState } from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { AlertOctagon, Terminal, CheckCircle2, RotateCcw, Cpu, Zap } from "lucide-react";

export default function IncidentWarRoomPage() {
  const [mitigationApplied, setMitigationApplied] = useState<string | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<"active" | "mitigated">("active");

  // Error logs — these are what engineers see when something breaks in production.
  // Each line tells you WHEN, HOW SEVERE, and WHAT went wrong.
  const incidentLogs = [
    "[12:44:01] ⚠️  WARN   Rate limiter is at 98.4% capacity — almost overloaded",
    "[12:44:03] ❌  ERROR  Cannot give out tokens — lock timeout for user 198.51.100.4",
    "[12:44:04] 🔴  CRIT   API Gateway: 412 requests per second are failing with timeout (504)",
    "[12:44:06] ❌  ERROR  Response time jumped from 38ms → 4,200ms in US servers (108× slower!)",
    "[12:44:08] ⚠️  WARN   Database is out of connections — 99/100 slots used, rejecting new requests",
  ];

  const handleMitigate = (action: string) => {
    setMitigationApplied(action);
    setResolutionStatus("mitigated");
  };

  const actions = [
    {
      id: "rollback",
      icon: RotateCcw,
      label: "🔄 Undo the last code change (Rollback)",
      sublabel: "Go back to the version that was working before PR #101",
      badge: "✅ Recommended",
      badgeClass: "text-white",
      action: "Rolled back to the previous stable release (v1.8.4) — checkout is working again!",
    },
    {
      id: "scale",
      icon: Cpu,
      label: "📈 Add more servers (Auto-Scale)",
      sublabel: "Spin up 3× more backend workers to handle the load surge",
      badge: "⏱ Buys time",
      badgeClass: "text-neutral-400",
      action: "Scaled up from 4 → 12 workers — load is distributed, errors reduced",
    },
    {
      id: "bypass",
      icon: Zap,
      label: "⚡ Turn off the Rate Limiter temporarily",
      sublabel: "Removes the buggy code completely until it can be fixed properly",
      badge: "⚠️ Use with caution",
      badgeClass: "text-neutral-400",
      action: "Rate limiter bypassed — requests are flowing freely again",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-8">

        {/* Exercise Header */}
        <div className="mb-2 text-[11px] uppercase tracking-widest text-neutral-500">
          Exercise 03 — Incident Response
        </div>

        {/* What is this scenario? */}
        <div className="mb-6 rounded border border-white/10 bg-neutral-950 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">📖 Your Scenario</p>
          <p className="text-sm leading-relaxed text-neutral-300">
            The bug from <strong className="text-white">Exercise 02 (Code Review)</strong> was accidentally shipped to production.
            Now your checkout service is crashing for real users. 
            Customers can&apos;t complete purchases — your company is losing money every second.
            <br /><br />
            Your job: <strong className="text-white">read the logs, understand what went wrong, and pick the right fix.</strong>
          </p>
        </div>

        {/* Incident Banner */}
        <div className="mb-6 border border-white/20 bg-neutral-950 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <AlertOctagon className="mt-0.5 h-6 w-6 shrink-0 text-white" />
              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Incident #INC-8921</span>
                  <span>·</span>
                  <span className={`font-bold ${resolutionStatus === "active" ? "text-white" : "text-neutral-300"}`}>
                    {resolutionStatus === "active" ? "🔴 LIVE OUTAGE" : "✅ RESOLVED"}
                  </span>
                </div>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-white">
                  Checkout is down — users getting &quot;504 Timeout&quot; errors
                </h1>
                <p className="mt-1 text-xs text-neutral-400">
                  Caused by the rate limiter code change in PR #101. Happened 4 minutes ago.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] uppercase text-neutral-500">Time Since Incident</p>
              <p className="font-mono text-2xl font-bold text-white">04:18</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Error Log Stream */}
          <div className="flex flex-col border border-white/10 bg-black">
            <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950 px-4 py-2.5">
              <span className="flex items-center gap-2 text-sm font-bold text-white">
                <Terminal className="h-4 w-4" />
                Live Error Logs
              </span>
              <span className="text-[10px] text-neutral-500">What the server is saying right now</span>
            </div>
            <div className="flex-1 space-y-2 p-4 text-[12px] leading-relaxed font-mono">
              {incidentLogs.map((log, i) => (
                <div key={i} className="text-neutral-300">
                  {log}
                </div>
              ))}
              {resolutionStatus === "mitigated" && (
                <div className="mt-4 border-t border-white/10 pt-4 font-bold text-white">
                  ✅ [RECOVERY] {mitigationApplied}. Error rate dropped to 0.00%.
                </div>
              )}
            </div>
          </div>

          {/* Diagnosis & Actions */}
          <div className="flex flex-col gap-5 border border-white/10 bg-neutral-950 p-6">
            {/* Plain English Diagnosis */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-neutral-500">What went wrong?</p>
              <h2 className="mt-1 text-base font-bold text-white">Root Cause (Plain English)</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                The new rate limiter code <strong className="text-white">reads and updates a counter in two separate steps</strong>. 
                When 1,000 users hit the API at the same moment, they all read the counter at the same time, 
                see that it&apos;s not full, and all get through — completely breaking the limit.
                This caused a <strong className="text-white">traffic flood</strong> that overwhelmed both the cache and the database.
              </p>
            </div>

            {/* Fix Options */}
            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white">
                Choose your fix — what would you do?
              </p>
              <div className="space-y-3">
                {actions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMitigate(item.action)}
                      disabled={resolutionStatus === "mitigated"}
                      className="flex w-full items-start justify-between gap-3 rounded border border-white/20 bg-black p-3 text-left text-xs transition-all hover:border-white hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex items-start gap-2.5">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                        <span>
                          <span className="block font-bold text-white">{item.label}</span>
                          <span className="mt-0.5 block text-neutral-400">{item.sublabel}</span>
                        </span>
                      </span>
                      <span className={`shrink-0 text-[10px] ${item.badgeClass}`}>{item.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution Feedback */}
            {resolutionStatus === "mitigated" && (
              <div className="flex items-start gap-3 rounded border border-white/20 bg-black p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                <div>
                  <p className="font-bold uppercase text-white">Outage Resolved! 🎉</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
                    {mitigationApplied}. Your response time has been added to your Skill Matrix score.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What a real incident response looks like */}
        <div className="mt-6 rounded border border-white/10 bg-neutral-950 p-5 text-xs text-neutral-400">
          <p className="font-bold text-white mb-1">💡 Real-world context</p>
          <p className="leading-relaxed">
            At companies like Google, Amazon, and Netflix, engineers are <strong className="text-white">on-call</strong> — meaning they must respond to 
            exactly these kinds of problems at any hour. The faster you diagnose and fix it, the better your 
            &quot;MTTR&quot; (Mean Time To Resolve) score. Practising this builds real job-ready skills.
          </p>
        </div>
      </main>
    </div>
  );
}
