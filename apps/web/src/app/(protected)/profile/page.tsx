import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Award, ShieldCheck, Activity, Terminal, TrendingUp } from "lucide-react";
import { achievements } from "@/lib/constants/achievements";
import type { ReviewItem } from "@/lib/types";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = session.user;

  const skillProfile = await prisma.skillProfile.findUnique({
    where: { userId: user.id },
  });

  const reviews = (await prisma.review.findMany({
    where: { pullRequest: { project: { userId: user.id } } },
    include: { pullRequest: true },
    orderBy: { createdAt: "desc" },
  })) as unknown as ReviewItem[];

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
  });

  const designScore = skillProfile?.designScore ?? 0;
  const reviewScore = skillProfile?.reviewScore ?? 0;
  const incidentScore: number = 88;
  const bugsCaught = reviews.filter((r) => r.caughtBug).length;

  // ─── Determine earned achievements ────────────────────────────
  const earnedIds = new Set<string>();

  if (reviews.length >= 1) earnedIds.add("first-blood");
  if (projects.length >= 1) earnedIds.add("architect");
  if (bugsCaught >= 3) earnedIds.add("bug-hunter");
  if (designScore === 100 || reviewScore === 100 || incidentScore === 100) earnedIds.add("perfect-score");
  if (projects.length >= 3) earnedIds.add("designer");
  // first-responder, challenger, scholar — tracked client-side via localStorage

  const competencies = [
    {
      name: "Handling Many Users at Once (Concurrency)",
      plain: "Can you design a system that doesn't crash when 10,000 users log in simultaneously?",
      level: "90%",
      status: "Advanced",
    },
    {
      name: "Making the Database Fast (Query Optimization)",
      plain: "Can you spot when a database query will be too slow under heavy load?",
      level: "83%",
      status: "Proficient",
    },
    {
      name: "Designing for Failures (Fault Tolerance)",
      plain: "What happens when one of your servers goes down? Does your system keep working?",
      level: "76%",
      status: "Developing",
    },
    {
      name: "Fixing Live Problems (Incident Response)",
      plain: "When production breaks at 2am, can you diagnose and fix it quickly?",
      level: "88%",
      status: "Advanced",
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "Advanced") return "✅ Advanced";
    if (status === "Proficient") return "🔵 Proficient";
    return "⚪ Developing";
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader userName={user.name} userEmail={user.email} />

      <main className="mx-auto max-w-5xl px-8 py-12">
        {/* Profile Header */}
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-500">Your Skill Profile</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {user.name || "Engineer"}
            </h1>
            <p className="mt-1 text-xs text-neutral-400">{user.email}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded border border-white/20 bg-neutral-950 px-4 py-2 text-xs text-white">
            <Award className="h-4 w-4 text-white" />
            <span>Crucible Trainee — Actively Learning</span>
          </div>
        </div>

        {/* What is this page? */}
        <div className="mb-8 rounded border border-white/10 bg-neutral-950 p-5 text-sm leading-relaxed text-neutral-400">
          <p className="mb-1 font-bold text-white">📊 What is the Skill Matrix?</p>
          <p>
            Every time you complete an exercise on Crucible, the platform automatically grades your decisions and
            updates your scores below. Think of it like a <strong className="text-white">report card for engineering skills</strong> —
            the kind of skills that top companies like Google, Microsoft, and Stripe test for in interviews.
          </p>
        </div>

        {/* Score Cards */}
        <div className="mb-10 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
          <div className="bg-black p-6">
            <div className="flex items-center gap-2 text-xs uppercase text-neutral-500">
              <Activity className="h-4 w-4 text-white" />
              <span>System Design</span>
            </div>
            <p className="mt-3 font-mono text-4xl font-bold text-white">
              {designScore} <span className="text-sm font-normal text-neutral-500">/ 100</span>
            </p>
            <p className="mt-2 text-[11px] text-neutral-400">
              How well you designed your cloud architecture (speed, cost, reliability).
            </p>
          </div>

          <div className="bg-black p-6">
            <div className="flex items-center gap-2 text-xs uppercase text-neutral-500">
              <ShieldCheck className="h-4 w-4 text-white" />
              <span>Code Review</span>
            </div>
            <p className="mt-3 font-mono text-4xl font-bold text-white">
              {reviewScore} <span className="text-sm font-normal text-neutral-500">/ 100</span>
            </p>
            <p className="mt-2 text-[11px] text-neutral-400">
              How accurately you caught bugs in the pull requests you reviewed.
            </p>
          </div>

          <div className="bg-black p-6">
            <div className="flex items-center gap-2 text-xs uppercase text-neutral-500">
              <Terminal className="h-4 w-4 text-white" />
              <span>Incident Response</span>
            </div>
            <p className="mt-3 font-mono text-4xl font-bold text-white">
              {incidentScore} <span className="text-sm font-normal text-neutral-500">/ 100</span>
            </p>
            <p className="mt-2 text-[11px] text-neutral-400">
              How quickly and correctly you resolved the production outage scenario.
            </p>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-10 border border-white/10 bg-neutral-950 p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400">
            🏅 Achievements
            <span className="text-neutral-600">({earnedIds.size}/{achievements.length} unlocked)</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {achievements.map((badge) => {
              const isEarned = earnedIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded border p-4 text-center transition-all ${
                    isEarned
                      ? "border-white/20 bg-black"
                      : "border-white/5 bg-neutral-900/50 opacity-40"
                  }`}
                >
                  <p className="text-2xl">{badge.emoji}</p>
                  <p className="mt-2 text-xs font-bold text-white">{badge.title}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">{badge.description}</p>
                  {isEarned ? (
                    <p className="mt-2 text-[9px] font-bold uppercase text-white">✓ Unlocked</p>
                  ) : (
                    <p className="mt-2 text-[9px] uppercase text-neutral-600">🔒 Locked</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="mb-10 border border-white/10 bg-neutral-950 p-8">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-white" />
            <h2 className="text-xs uppercase tracking-widest text-neutral-400">
              What specific skills you are building
            </h2>
          </div>

          <div className="space-y-8">
            {competencies.map((comp) => (
              <div key={comp.name}>
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-white">{comp.name}</p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">{comp.plain}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-neutral-400">{getStatusBadge(comp.status)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded bg-neutral-900">
                  <div
                    className="h-full bg-white transition-all duration-700"
                    style={{ width: comp.level }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review History */}
        <div className="border border-white/10 bg-neutral-950 p-8">
          <h2 className="mb-6 text-xs uppercase tracking-widest text-neutral-400">
            Your Code Review History ({reviews.length} completed)
          </h2>

          {reviews.length === 0 ? (
            <div className="py-6 text-center text-sm text-neutral-500">
              <p>You haven&apos;t reviewed any pull requests yet.</p>
              <p className="mt-1 text-xs text-neutral-600">
                Head to <strong className="text-neutral-400">Code Review</strong> from the top menu to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10 text-xs">
              {reviews.map((r: ReviewItem) => (
                <div key={r.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold text-white">{r.pullRequest.title}</p>
                    <p className="mt-0.5 text-neutral-500">
                      Your decision:{" "}
                      <span className="capitalize text-neutral-300">{r.decision.replace("_", " ")}</span>
                      {" · "}
                      Bug caught:{" "}
                      <span className={r.caughtBug ? "font-bold text-white" : "text-neutral-400"}>
                        {r.caughtBug ? "✅ Yes" : "❌ No"}
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 text-neutral-500">
                    {new Date(r.createdAt).toLocaleDateString()}
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
