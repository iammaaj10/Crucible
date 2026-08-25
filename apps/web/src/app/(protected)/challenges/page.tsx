"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { challengeData } from "@/lib/constants/challenges";
import type { Challenge } from "@/lib/types";
import { CheckCircle2, XCircle, Zap, Code2, Server, AlertTriangle } from "lucide-react";

type AnswerState = Record<string, number>; // challengeId -> selectedIndex

const categoryLabels: Record<Challenge["category"], { label: string; emoji: string; icon: typeof Code2 }> = {
  find_bug: { label: "Find the Bug", emoji: "🐛", icon: Code2 },
  system_design: { label: "System Design", emoji: "🏗️", icon: Server },
  incident_triage: { label: "Incident Triage", emoji: "🚨", icon: AlertTriangle },
};

const difficultyColors: Record<Challenge["difficulty"], string> = {
  easy: "text-neutral-300 border-neutral-700",
  medium: "text-neutral-200 border-neutral-500",
  hard: "text-white border-white/40",
};

export default function ChallengesPage() {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [filter, setFilter] = useState<Challenge["category"] | "all">("all");

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("crucible-challenge-answers");
      if (saved) setAnswers(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("crucible-challenge-answers", JSON.stringify(answers));
    }
  }, [answers]);

  const handleAnswer = (challengeId: string, optionIndex: number) => {
    if (answers[challengeId] !== undefined) return; // already answered
    setAnswers((prev) => ({ ...prev, [challengeId]: optionIndex }));
  };

  const filtered = filter === "all"
    ? challengeData
    : challengeData.filter((c) => c.category === filter);

  const totalAnswered = Object.keys(answers).length;
  const totalCorrect = Object.entries(answers).filter(
    ([id, idx]) => challengeData.find((c) => c.id === id)?.correctIndex === idx
  ).length;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-500">
            <Zap className="h-4 w-4 text-white" />
            Challenge Bank
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            ✅ Quick Challenges
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
            Bite-sized questions to test your knowledge. Each challenge has 4 options — pick the
            right one and read the explanation. Your progress is saved automatically.
          </p>
        </div>

        {/* Stats + Filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6 text-xs">
            <span className="text-neutral-400">
              Answered: <strong className="text-white">{totalAnswered}/{challengeData.length}</strong>
            </span>
            <span className="text-neutral-400">
              Correct: <strong className="text-white">{totalCorrect}/{totalAnswered || 0}</strong>
            </span>
          </div>
          <div className="flex gap-2">
            {(["all", "find_bug", "system_design", "incident_triage"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded border px-3 py-1.5 text-[11px] transition-colors ${
                  filter === cat
                    ? "border-white bg-white text-black font-bold"
                    : "border-white/15 text-neutral-400 hover:border-white/30 hover:text-white"
                }`}
              >
                {cat === "all" ? "All" : categoryLabels[cat].emoji + " " + categoryLabels[cat].label}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Cards */}
        <div className="space-y-6">
          {filtered.map((challenge) => {
            const answered = answers[challenge.id] !== undefined;
            const selectedIndex = answers[challenge.id];
            const isCorrect = selectedIndex === challenge.correctIndex;
            const catInfo = categoryLabels[challenge.category];

            return (
              <div key={challenge.id} className="border border-white/10 bg-neutral-950">
                {/* Challenge Header */}
                <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                        {catInfo.emoji} {catInfo.label}
                      </span>
                      <span className={`rounded border px-2 py-0.5 text-[9px] uppercase ${difficultyColors[challenge.difficulty]}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{challenge.title}</h3>
                  </div>
                  {answered && (
                    <div className="shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : (
                        <XCircle className="h-5 w-5 text-neutral-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Question */}
                <div className="px-6 py-4">
                  <p className="text-sm leading-relaxed text-neutral-300">{challenge.description}</p>

                  {challenge.codeSnippet && (
                    <pre className="mt-3 overflow-x-auto rounded border border-white/10 bg-black p-4 font-mono text-[12px] leading-relaxed text-neutral-300">
                      {challenge.codeSnippet}
                    </pre>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2 px-6 pb-4">
                  {challenge.options.map((option, idx) => {
                    let optionStyle = "border-white/10 hover:border-white/30 hover:bg-neutral-900";
                    if (answered) {
                      if (idx === challenge.correctIndex) {
                        optionStyle = "border-white bg-white/[0.06]";
                      } else if (idx === selectedIndex && !isCorrect) {
                        optionStyle = "border-neutral-700 bg-neutral-900 opacity-60";
                      } else {
                        optionStyle = "border-white/5 opacity-40";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(challenge.id, idx)}
                        disabled={answered}
                        className={`flex w-full items-start gap-3 rounded border px-4 py-3 text-left text-xs transition-all disabled:cursor-default ${optionStyle}`}
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/30 text-[10px] font-bold text-neutral-400">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-neutral-300">{option}</span>
                        {answered && idx === challenge.correctIndex && (
                          <span className="ml-auto shrink-0 text-[10px] font-bold text-white">✓ Correct</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation (shown after answering) */}
                {answered && (
                  <div className="border-t border-white/10 bg-black px-6 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      💡 Explanation
                    </p>
                    <p className="text-sm leading-relaxed text-neutral-300">
                      {challenge.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
