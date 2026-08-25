import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Award, ShieldCheck, Activity, Terminal } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = session.user;

  const skillProfile = await prisma.skillProfile.findUnique({
    where: { userId: user.id },
  });

  const reviews = await prisma.review.findMany({
    where: { pullRequest: { project: { userId: user.id } } },
    include: { pullRequest: true },
    orderBy: { createdAt: "desc" },
  });

  const designScore = skillProfile?.designScore ?? 78;
  const reviewScore = skillProfile?.reviewScore ?? 84;
  const incidentScore = 92;

  const competencies = [
    { name: "Distributed Concurrency & Locks", level: "92%", status: "ADVANCED" },
    { name: "Query Performance & Indexing", level: "85%", status: "PROFICIENT" },
    { name: "Failover Topologies & Latency", level: "78%", status: "COMPETENT" },
    { name: "Incident Triage & Root Cause", level: "90%", status: "ADVANCED" },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader userName={user.name} userEmail={user.email} />

      <main className="mx-auto max-w-6xl px-8 py-12">
        {/* Operator Profile Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">OPERATOR_IDENTITY</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {user.name || "Staff Engineer"}
            </h1>
            <p className="mt-1 font-mono text-xs text-neutral-400">{user.email}</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded border border-white/20 bg-neutral-950 px-4 py-2 font-mono text-xs text-white">
            <Award className="h-4 w-4 text-white" />
            <span>CRUCIBLE CERTIFIED L4 ARCHITECT</span>
          </div>
        </div>

        {/* Core Index Metrics Grid */}
        <div className="mb-12 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
          <div className="bg-black p-6">
            <div className="flex items-center gap-2 text-neutral-500 font-mono text-xs uppercase">
              <Activity className="h-4 w-4 text-white" /> System Design Index
            </div>
            <p className="mt-3 font-mono text-4xl font-bold text-white">
              {designScore.toFixed(0)} <span className="text-sm font-normal text-neutral-500">/ 100</span>
            </p>
            <p className="mt-2 text-[11px] font-mono text-neutral-400">
              Evaluated on capacity modeling, latency &amp; cost efficiency.
            </p>
          </div>

          <div className="bg-black p-6">
            <div className="flex items-center gap-2 text-neutral-500 font-mono text-xs uppercase">
              <ShieldCheck className="h-4 w-4 text-white" /> Code Audit Accuracy
            </div>
            <p className="mt-3 font-mono text-4xl font-bold text-white">
              {reviewScore.toFixed(0)} <span className="text-sm font-normal text-neutral-500">/ 100</span>
            </p>
            <p className="mt-2 text-[11px] font-mono text-neutral-400">
              Evaluated on finding subtle race conditions and defect injection tests.
            </p>
          </div>

          <div className="bg-black p-6">
            <div className="flex items-center gap-2 text-neutral-500 font-mono text-xs uppercase">
              <Terminal className="h-4 w-4 text-white" /> Incident MTTR Rating
            </div>
            <p className="mt-3 font-mono text-4xl font-bold text-white">
              {incidentScore} <span className="text-sm font-normal text-neutral-500">/ 100</span>
            </p>
            <p className="mt-2 text-[11px] font-mono text-neutral-400">
              Evaluated on war room triage speed and zero-downtime mitigation.
            </p>
          </div>
        </div>

        {/* Engineering Competency Breakdown */}
        <div className="mb-12 border border-white/10 bg-neutral-950 p-8 shadow-2xl">
          <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-6">
            Architectural Competency Matrix
          </h2>

          <div className="space-y-6">
            {competencies.map((comp) => (
              <div key={comp.name}>
                <div className="flex items-center justify-between font-mono text-xs mb-2">
                  <span className="text-white font-semibold">{comp.name}</span>
                  <span className="text-neutral-400">
                    {comp.status} ({comp.level})
                  </span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 overflow-hidden rounded">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: comp.level }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit History Log */}
        <div className="border border-white/10 bg-neutral-950 p-8 shadow-2xl">
          <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-6">
            Historical Audit Log ({reviews.length} Completed)
          </h2>

          {reviews.length === 0 ? (
            <p className="font-mono text-xs text-neutral-500">
              [NO_HISTORICAL_AUDIT_DATA_YET] Complete code audits in the Code Review Studio to populate your telemetry log.
            </p>
          ) : (
            <div className="divide-y divide-white/10 font-mono text-xs">
              {reviews.map((r) => (
                <div key={r.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{r.pullRequest.title}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Decision: <span className="uppercase text-neutral-300">{r.decision}</span> &bull; Bug Caught:{" "}
                      <span className="text-white font-bold">{r.caughtBug ? "YES" : "NO"}</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    {new Date(r.createdAt).toISOString().split("T")[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
