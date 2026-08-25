"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, MessageSquarePlus, Send, Sparkles } from "lucide-react";

interface Comment {
  line: number;
  text: string;
}

interface DiffViewerProps {
  prId: string;
  diff: string;
  hasBug: boolean;
  bugType?: string | null;
  existingReview?: {
    decision: string;
    caughtBug: boolean;
    llmFeedback?: string | null;
    comments?: unknown;
  } | null;
}

export function DiffViewer({ prId, diff, existingReview }: DiffViewerProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<Comment[]>(
    Array.isArray(existingReview?.comments) ? (existingReview.comments as Comment[]) : []
  );
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

  const handleAddComment = () => {
    if (!selectedLine || !commentInput.trim()) return;
    setComments((prev) => [...prev, { line: selectedLine, text: commentInput.trim() }]);
    setCommentInput("");
    setSelectedLine(null);
  };

  const handleDecision = async (decision: "approved" | "changes_requested") => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/review/${prId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comments }),
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
      {/* Review Feedback Result Banner */}
      {reviewResult && (
        <div className="border border-white/20 bg-neutral-950 p-6 shadow-2xl">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-white">
            <Sparkles className="h-4 w-4 text-white" />
            Automated Audit Evaluation Report
          </div>
          <div className="mt-3 flex items-start gap-3">
            {reviewResult.caughtBug ? (
              <CheckCircle2 className="h-5 w-5 text-white shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-mono text-xs leading-relaxed text-white">{reviewResult.llmFeedback}</p>
              {reviewResult.newScore > 0 && (
                <p className="mt-2 font-mono text-[11px] text-neutral-400">
                  Updated Review Skill Score: <span className="font-bold text-white">{reviewResult.newScore}/100</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unified Diff View with Inline Annotations */}
      <div className="border border-white/10 bg-black font-mono text-xs shadow-2xl overflow-x-auto">
        <div className="border-b border-white/10 bg-neutral-950 px-4 py-2.5 flex items-center justify-between text-neutral-400 text-[11px]">
          <span>Unified Code Diff &bull; Click any line number to attach an audit annotation</span>
          <span>{comments.length} Comments Drafted</span>
        </div>

        <div className="divide-y divide-white/5">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isAdded = line.startsWith("+") && !line.startsWith("+++");
            const isRemoved = line.startsWith("-") && !line.startsWith("---");
            const isHeader = line.startsWith("@@");
            const lineComments = comments.filter((c) => c.line === lineNum);

            return (
              <div key={idx} className="group">
                <div
                  className={`flex items-stretch hover:bg-neutral-900 transition-colors ${
                    isAdded ? "bg-white/[0.04]" : isRemoved ? "bg-white/[0.02] text-neutral-500" : isHeader ? "bg-neutral-950 text-neutral-500 font-bold" : ""
                  }`}
                >
                  {/* Line Number Button */}
                  <button
                    onClick={() => setSelectedLine(selectedLine === lineNum ? null : lineNum)}
                    className="w-12 py-1 px-2 text-right text-[11px] font-mono text-neutral-600 border-r border-white/10 select-none group-hover:text-white group-hover:bg-neutral-800"
                  >
                    {lineNum}
                  </button>

                  {/* Prefix Sign */}
                  <span className="w-6 py-1 text-center select-none text-neutral-500 font-bold">
                    {isAdded ? "+" : isRemoved ? "-" : " "}
                  </span>

                  {/* Code Line Content */}
                  <span className="flex-1 py-1 pr-4 whitespace-pre font-mono text-[12px] text-white">
                    {line}
                  </span>

                  {/* Annotation Trigger */}
                  <button
                    onClick={() => setSelectedLine(selectedLine === lineNum ? null : lineNum)}
                    className="opacity-0 group-hover:opacity-100 px-3 py-1 text-neutral-500 hover:text-white transition-all"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Inline Comment Input Box */}
                {selectedLine === lineNum && (
                  <div className="border-y border-white/20 bg-neutral-950 p-4 space-y-3">
                    <p className="text-[11px] uppercase font-bold text-neutral-400">
                      Attach Audit Comment at Line {lineNum}:
                    </p>
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Explain defect (e.g. Non-atomic read/write race condition under concurrent traffic)..."
                      rows={2}
                      className="w-full rounded border border-white/20 bg-black p-2.5 text-xs font-mono text-white placeholder-neutral-600 outline-none focus:border-white"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedLine(null)}
                        className="px-3 py-1 text-xs text-neutral-500 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddComment}
                        className="flex items-center gap-1.5 rounded bg-white px-3 py-1 text-xs font-mono font-bold text-black hover:bg-neutral-200"
                      >
                        <Send className="h-3 w-3" /> Save Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Rendered Existing Comments for this line */}
                {lineComments.map((c, cIdx) => (
                  <div key={cIdx} className="border-y border-white/10 bg-neutral-950/80 px-8 py-3 font-mono text-xs">
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      <span>Audit Note by Operator (Line {c.line})</span>
                    </div>
                    <p className="mt-1 text-white text-[12px]">{c.text}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Action Decision Footer */}
      <div className="flex items-center justify-between border-t border-white/10 bg-neutral-950 p-6">
        <div>
          <p className="font-mono text-xs font-bold uppercase text-white">Review Final Decision</p>
          <p className="font-mono text-[11px] text-neutral-500">
            Submit your evaluation. Detected defects will be scored against real simulation accuracy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDecision("changes_requested")}
            disabled={isSubmitting}
            className="rounded border border-white/30 bg-black px-5 py-2.5 font-mono text-xs font-bold uppercase text-white transition-all hover:border-white hover:bg-neutral-900 disabled:opacity-50"
          >
            Request Changes
          </button>
          <button
            onClick={() => handleDecision("approved")}
            disabled={isSubmitting}
            className="rounded bg-white px-5 py-2.5 font-mono text-xs font-bold uppercase text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
          >
            Approve &amp; Merge
          </button>
        </div>
      </div>
    </div>
  );
}
