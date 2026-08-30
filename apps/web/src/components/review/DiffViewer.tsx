"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles, PlayCircle, Users } from "lucide-react";

interface DiffViewerProps {
  prId: string;
  diff: string;
  hasBug: boolean;
  bugType?: string | null;
  existingReview?: {
    decision: string;
    caughtBug: boolean;
    llmFeedback?: string | null;
  } | null;
}

export function DiffViewer({ prId, diff, existingReview }: DiffViewerProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [reviewResult, setReviewResult] = useState<{
    caughtBug: boolean;
    llmFeedback: string;
    newScore: number;
  } | null>(
    existingReview
      ? {
          caughtBug: existingReview.caughtBug,
          llmFeedback: existingReview.llmFeedback || "",
          newScore: 0,
        }
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lines = diff.split("\n");

  const handleUnderstand = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/review/${prId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "changes_requested", comments: [] }),
      });
      const data = await res.json();
      setReviewResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Results Banner */}
      {reviewResult && (
        <div className="border border-white/20 bg-neutral-950 p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            <Sparkles className="h-4 w-4 text-white" />
            🎉 Lesson Complete
          </div>
          <div className="mt-3 flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
            <div>
              <p className="text-sm leading-relaxed text-white">
                Great job! You just learned how to identify a Race Condition. In real-world systems, these bugs cause huge issues, like overselling tickets or giving away free money.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Code Diff View */}
      <div className="overflow-x-auto border border-white/10 bg-black font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950 px-4 py-2.5 text-[11px] text-neutral-400">
          <span>Code Changes</span>
          {!showExplanation && (
            <button
              onClick={() => setShowExplanation(true)}
              className="flex items-center gap-1.5 rounded bg-white/10 px-3 py-1 text-white hover:bg-white/20 transition-colors"
            >
              <PlayCircle className="h-3 w-3" /> Explain this to me
            </button>
          )}
        </div>

        {showExplanation && (
          <div className="border-b border-white/10 bg-neutral-900 p-6">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" /> Understanding the Bug: Race Condition
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Look at the green lines below. The code reads the current tokens, and then updates it in two separate steps.
              If two users hit this code at the exact same millisecond:
            </p>
            <div className="flex gap-4 text-[10px]">
              <div className="flex-1 bg-black p-3 rounded border border-white/10">
                <p className="font-bold text-white mb-1">User A</p>
                <p className="text-neutral-400">Reads: 1 token left</p>
                <p className="text-neutral-400">Thinks: "Great, I'll take it!"</p>
              </div>
              <div className="flex-1 bg-black p-3 rounded border border-white/10">
                <p className="font-bold text-white mb-1">User B</p>
                <p className="text-neutral-400">Reads: 1 token left (before A writes)</p>
                <p className="text-neutral-400">Thinks: "Great, I'll take it too!"</p>
              </div>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mt-4">
              <strong className="text-white">Result:</strong> Both users get the token, even though there was only 1 left!
              This is called a <em>Race Condition</em>.
            </p>
          </div>
        )}

        <div className="divide-y divide-white/5">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isAdded = line.startsWith("+") && !line.startsWith("+++");
            const isRemoved = line.startsWith("-") && !line.startsWith("---");
            const isHeader = line.startsWith("@@");

            return (
              <div key={idx} className="group flex items-stretch transition-colors hover:bg-neutral-900">
                <div
                  className={`flex flex-1 items-stretch ${
                    isAdded
                      ? "bg-green-950/30 text-green-200"
                      : isRemoved
                        ? "bg-red-950/30 text-red-200"
                        : isHeader
                          ? "bg-neutral-950 font-bold text-neutral-500"
                          : "text-neutral-300"
                  }`}
                >
                  {/* Line Number */}
                  <div className="w-12 select-none border-r border-white/10 px-2 py-1 text-right font-mono text-[11px] text-neutral-600">
                    {lineNum}
                  </div>

                  {/* +/- Sign */}
                  <span className="w-6 select-none py-1 text-center font-bold opacity-50">
                    {isAdded ? "+" : isRemoved ? "-" : " "}
                  </span>

                  {/* Code Content */}
                  <span className="flex-1 whitespace-pre py-1 pr-4 font-mono text-[12px]">
                    {line.replace(/^[+-]/, "")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Footer */}
      {!reviewResult && (
        <div className="flex items-center justify-between border-t border-white/10 bg-neutral-950 p-6">
          <div>
            <p className="text-sm font-bold text-white">Lesson complete?</p>
            <p className="text-[11px] text-neutral-500">
              Click below when you understand how this bug works.
            </p>
          </div>

          <button
            onClick={handleUnderstand}
            disabled={isSubmitting}
            className="rounded bg-white px-5 py-2.5 text-xs font-bold uppercase text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
          >
            ✅ I Understand
          </button>
        </div>
      )}
    </div>
  );
}
