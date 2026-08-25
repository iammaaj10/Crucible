import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  name: string | null;
  email: string | null;
  skillProfile: {
    designScore: number;
    reviewScore: number;
  } | null;
}

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch all users with skill profiles, sorted by total score
  const users = (await prisma.user.findMany({
    include: { skillProfile: true },
    orderBy: { createdAt: "asc" },
  })) as unknown as LeaderboardEntry[];

  // Calculate total scores and sort
  const ranked = users
    .map((u) => ({
      id: u.id,
      name: u.name || "Anonymous",
      email: u.email || "",
      designScore: u.skillProfile?.designScore ?? 0,
      reviewScore: u.skillProfile?.reviewScore ?? 0,
      totalScore: (u.skillProfile?.designScore ?? 0) + (u.skillProfile?.reviewScore ?? 0),
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 50);

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader userName={session.user.name} userEmail={session.user.email} />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-500">
            <Trophy className="h-4 w-4 text-white" />
            Leaderboard
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            🏆 Top Engineers
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
            See how you compare against other students. Your rank is based on your combined
            System Design + Code Review scores.
          </p>
        </div>

        {/* Leaderboard Table */}
        {ranked.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            No users yet. Be the first to complete an exercise!
          </div>
        ) : (
          <div className="border border-white/10 bg-neutral-950">
            {/* Header Row */}
            <div className="flex items-center gap-4 border-b border-white/10 bg-black px-6 py-3 text-[10px] uppercase tracking-widest text-neutral-500">
              <span className="w-12">Rank</span>
              <span className="flex-1">Student</span>
              <span className="w-20 text-right">Design</span>
              <span className="w-20 text-right">Review</span>
              <span className="w-24 text-right">Total Score</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
              {ranked.map((user, idx) => {
                const rank = idx + 1;
                const isCurrentUser = user.email === session.user?.email;
                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                      isCurrentUser ? "bg-white/[0.03]" : "hover:bg-neutral-900"
                    }`}
                  >
                    {/* Rank */}
                    <span className="w-12 text-center text-sm font-bold">
                      {getRankEmoji(rank)}
                    </span>

                    {/* Name */}
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-neutral-900 text-xs font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {user.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-[10px] text-neutral-400">(You)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Scores */}
                    <span className="w-20 text-right font-mono text-xs text-neutral-400">
                      {user.designScore.toFixed(0)}
                    </span>
                    <span className="w-20 text-right font-mono text-xs text-neutral-400">
                      {user.reviewScore.toFixed(0)}
                    </span>
                    <span className="w-24 text-right font-mono text-sm font-bold text-white">
                      {user.totalScore.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 rounded border border-white/10 bg-neutral-950 p-5 text-xs text-neutral-400">
          <p className="mb-1 font-bold text-white">💡 How ranking works</p>
          <p className="leading-relaxed">
            Your total score = Design Score + Code Review Score. Complete exercises to improve
            your scores. The leaderboard updates automatically after every exercise you finish.
          </p>
        </div>
      </main>
    </div>
  );
}
