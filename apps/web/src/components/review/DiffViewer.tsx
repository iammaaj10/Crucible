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
      {/* Review Results Banner */}
      {reviewResult && (
        <div className="border border-white/20 bg-neutral-950 p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            <Sparkles className="h-4 w-4 text-white" />
            📊 Your Review Results
          </div>
          <div className="mt-3 flex items-start gap-3">
            {reviewResult.caughtBug ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400" />
            )}
            <div>
              <p className="text-sm leading-relaxed text-white">{reviewResult.llmFeedback}</p>
              {reviewResult.newScore > 0 && (
                <p className="mt-2 text-[11px] text-neutral-400">
                  Your Code Review score is now: <span className="font-bold text-white">{reviewResult.newScore}/100</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Code Diff View */}
      <div className="overflow-x-auto border border-white/10 bg-black font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950 px-4 py-2.5 text-[11px] text-neutral-400">
          <span>Code Changes · Click a line number to leave a comment</span>
          <span>{comments.length} comment{comments.length !== 1 ? "s" : ""} added</span>
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
                  className={`flex items-stretch transition-colors hover:bg-neutral-900 ${
                    isAdded
                      ? "bg-white/[0.04]"
                      : isRemoved
                        ? "bg-white/[0.02] text-neutral-500"
                        : isHeader
                          ? "bg-neutral-950 font-bold text-neutral-500"
                          : ""
                  }`}
                >
                  {/* Line Number */}
                  <button
                    onClick={() => setSelectedLine(selectedLine === lineNum ? null : lineNum)}
                    className="w-12 select-none border-r border-white/10 px-2 py-1 text-right font-mono text-[11px] text-neutral-600 group-hover:bg-neutral-800 group-hover:text-white"
                  >
                    {lineNum}
                  </button>

                  {/* +/- Sign */}
                  <span className="w-6 select-none py-1 text-center font-bold text-neutral-500">
                    {isAdded ? "+" : isRemoved ? "-" : " "}
                  </span>

                  {/* Code Content */}
                  <span className="flex-1 whitespace-pre py-1 pr-4 font-mono text-[12px] text-white">
                    {line}
                  </span>

                  {/* Comment icon on hover */}
                  <button
                    onClick={() => setSelectedLine(selectedLine === lineNum ? null : lineNum)}
                    className="px-3 py-1 text-neutral-500 opacity-0 transition-all hover:text-white group-hover:opacity-100"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Comment Input */}
                {selectedLine === lineNum && (
                  <div className="space-y-3 border-y border-white/20 bg-neutral-950 p-4">
                    <p className="text-[11px] font-bold uppercase text-neutral-400">
                      Your comment on line {lineNum}:
                    </p>
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="What's wrong with this line? (e.g. 'Two users could read the same value at the same time')"
                      rows={2}
                      className="w-full rounded border border-white/20 bg-black p-2.5 text-xs text-white placeholder-neutral-600 outline-none focus:border-white"
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
                        className="flex items-center gap-1.5 rounded bg-white px-3 py-1 text-xs font-bold text-black hover:bg-neutral-200"
                      >
                        <Send className="h-3 w-3" />
                        Add Comment
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Comments */}
                {lineComments.map((c, cIdx) => (
                  <div key={cIdx} className="border-y border-white/10 bg-neutral-950/80 px-8 py-3 text-xs">
                    <div className="flex items-center gap-2 text-[10px] uppercase text-neutral-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      <span>Your comment (line {c.line})</span>
                    </div>
                    <p className="mt-1 text-[12px] text-white">{c.text}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Footer */}
      <div className="flex items-center justify-between border-t border-white/10 bg-neutral-950 p-6">
        <div>
          <p className="text-sm font-bold text-white">Ready to submit?</p>
          <p className="text-[11px] text-neutral-500">
            Pick your decision — did you find a bug, or is this code safe to ship?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDecision("changes_requested")}
            disabled={isSubmitting}
            className="rounded border border-white/30 bg-black px-5 py-2.5 text-xs font-bold uppercase text-white transition-all hover:border-white hover:bg-neutral-900 disabled:opacity-50"
          >
            🐛 I found a bug!
          </button>
          <button
            onClick={() => handleDecision("approved")}
            disabled={isSubmitting}
            className="rounded bg-white px-5 py-2.5 text-xs font-bold uppercase text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
          >
            ✅ Approve — looks good
          </button>
        </div>
      </div>
    </div>
  );
}
