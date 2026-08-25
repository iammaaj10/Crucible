import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ prId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prId } = await context.params;
  const { decision, comments } = await req.json();

  const pr = await prisma.pullRequest.findUnique({
    where: { id: prId },
    include: { project: true },
  });

  if (!pr) {
    return NextResponse.json({ error: "Pull Request not found" }, { status: 404 });
  }

  // ─── Determine if student accurately caught the bug ───────────
  let caughtBug = false;
  const bugLocation = pr.bugLocation as { lineStart?: number; lineEnd?: number } | null;

  if (pr.hasBug) {
    if (decision === "changes_requested") {
      if (bugLocation?.lineStart && Array.isArray(comments)) {
        caughtBug = comments.some(
          (c: { line?: number }) =>
            c.line &&
            Math.abs(c.line - (bugLocation.lineStart || 0)) <= 3
        );
      }
    }
  } else {
    // PR was clean — approving it is the correct decision
    if (decision === "approved") {
      caughtBug = true;
    }
  }

  // ─── Generate friendly, educational feedback ──────────────────
  let llmFeedback = "";
  const bugName = pr.bugType === "race_condition"
    ? "race condition"
    : pr.bugType || "concurrency bug";

  if (pr.hasBug) {
    if (caughtBug) {
      llmFeedback = `🎉 Amazing work! You found the bug! The problem was a "${bugName}" — the code reads and writes a value in two separate steps. When many users hit the API at the same moment, they all read the same value before any of them updates it, so the limit gets bypassed. In real life, this is one of the most common and dangerous bugs in high-traffic systems. Great catch!`;
    } else if (decision === "approved") {
      llmFeedback = `😬 Oops — this code actually had a hidden bug called a "${bugName}". The read and write operations happen in two separate steps, so under heavy traffic, multiple users can read the same counter value before anyone updates it. Don't worry though — this is genuinely one of the trickiest bugs to spot, and even experienced engineers miss it sometimes. Try again and look at how the counter is read vs updated!`;
    } else {
      llmFeedback = `🔍 Good instinct! You correctly sensed something was wrong and requested changes — that's the right call. However, your comment didn't pinpoint the exact line with the "${bugName}" bug. Look more carefully at the lines where the counter is first read (get) and then separately updated (set) — that two-step process is where the bug lives.`;
    }
  } else {
    if (decision === "approved") {
      llmFeedback = `✅ Correct! This code was clean — no bugs found. You made the right call approving it. Good eye for knowing when code is safe to ship!`;
    } else {
      llmFeedback = `🤔 Actually, this code was fine — there were no bugs in it. Be careful about requesting changes when the code is correct. In a real team, unnecessary change requests slow everyone down. Look more carefully before flagging issues.`;
    }
  }

  // ─── Save or update the review ────────────────────────────────
  const review = await prisma.review.upsert({
    where: { pullRequestId: prId },
    create: {
      pullRequestId: prId,
      decision,
      comments: comments || [],
      caughtBug,
      llmFeedback,
    },
    update: {
      decision,
      comments: comments || [],
      caughtBug,
      llmFeedback,
    },
  });

  await prisma.pullRequest.update({
    where: { id: prId },
    data: { status: decision === "approved" ? "approved" : "rejected" },
  });

  // ─── Update user Skill Profile score ──────────────────────────
  const currentProfile = await prisma.skillProfile.findUnique({
    where: { userId: session.user.id },
  });

  const delta = caughtBug ? 15 : -10;
  const newReviewScore = Math.max(0, Math.min(100, (currentProfile?.reviewScore || 50) + delta));

  await prisma.skillProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      reviewScore: newReviewScore,
      historyPoints: [{ date: new Date().toISOString(), reviewScore: newReviewScore }],
    },
    update: {
      reviewScore: newReviewScore,
      historyPoints: {
        push: { date: new Date().toISOString(), reviewScore: newReviewScore },
      },
    },
  });

  return NextResponse.json({ review, caughtBug, llmFeedback, newScore: newReviewScore });
}
