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

  // Determine if student accurately caught the bug
  let caughtBug = false;
  const bugLocation = pr.bugLocation as { lineStart?: number; lineEnd?: number } | null;

  if (pr.hasBug) {
    if (decision === "changes_requested") {
      if (bugLocation?.lineStart && Array.isArray(comments)) {
        // Check if any comment is placed near the bug line
        caughtBug = comments.some(
          (c: { line?: number }) =>
            c.line &&
            Math.abs(c.line - (bugLocation.lineStart || 0)) <= 3
        );
      }
    }
  } else {
    // PR was clean, student approved
    if (decision === "approved") {
      caughtBug = true;
    }
  }

  let llmFeedback = "";
  if (pr.hasBug) {
    if (caughtBug) {
      llmFeedback = `EXCELLENT AUDIT: You correctly detected the ${pr.bugType || "concurrency"} defect in this pull request. Your inline comment directly addressed the race condition before it reached production.`;
    } else if (decision === "approved") {
      llmFeedback = `CRITICAL ESCAPED DEFECT: You approved a pull request containing a severe ${pr.bugType || "concurrency"} bug. Under production concurrency, this would cause data inconsistency or service degradation.`;
    } else {
      llmFeedback = `PARTIAL REVIEW: You requested changes, but did not pinpoint the exact line containing the ${pr.bugType} defect.`;
    }
  } else {
    llmFeedback = decision === "approved"
      ? "ACCURATE AUDIT: This pull request adheres to architectural standards and was safely approved."
      : "FALSE POSITIVE: This pull request was clean, but changes were unnecessarily requested.";
  }

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

  // Update user Skill Profile score
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
