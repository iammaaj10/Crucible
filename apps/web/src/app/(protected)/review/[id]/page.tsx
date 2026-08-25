import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/navigation/AppHeader";
import { DiffViewer } from "@/components/review/DiffViewer";
import { GitPullRequest, ShieldAlert } from "lucide-react";

export default async function ReviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;

  // Fetch PR by ID or get demo PR
  let pr = null;
  if (id !== "demo") {
    pr = await prisma.pullRequest.findUnique({
      where: { id },
      include: { review: true, project: true },
    });
  }

  if (!pr) {
    pr = await prisma.pullRequest.findFirst({
      where: { project: { userId: session.user.id } },
      include: { review: true, project: true },
    });
  }

  const fallbackPr = pr || {
    id: "demo-pr-1",
    title: "PR #101: Add distributed token bucket rate limiter to Order Service",
    description: "Implement local atomic rate limiting with Redis fallback to protect downstream checkout endpoints from request storms.",
    diff: `@@ -14,12 +14,24 @@
 class OrderRateLimiter:
     def __init__(self, redis_client, capacity: int = 100, refill_rate: float = 10.0):
         self.redis = redis_client
         self.capacity = capacity
         self.refill_rate = refill_rate

     async def acquire(self, client_ip: str) -> bool:
         key = f"rate:{client_ip}"
-        tokens = int(await self.redis.get(key) or self.capacity)
-        if tokens > 0:
-            await self.redis.set(key, tokens - 1)
-            return True
-        return False
+        # Defect: Non-atomic read-then-write creates critical race condition under concurrency
+        current_tokens = await self.redis.get(key)
+        tokens = self.capacity if current_tokens is None else int(current_tokens)
+        if tokens > 0:
+            await self.redis.set(key, str(tokens - 1))
+            return True
+        return False`,
    hasBug: true,
    bugType: "race_condition",
    review: null,
    status: "pending",
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader
        userName={session.user.name}
        userEmail={session.user.email}
        prId={fallbackPr.id}
      />

      <main className="mx-auto max-w-6xl px-8 py-10">
        {/* PR Metadata Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-500 uppercase">
            <GitPullRequest className="h-4 w-4 text-white" />
            <span>Pull Request Audit Studio // Status: <span className="text-white">{fallbackPr.status}</span></span>
          </div>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {fallbackPr.title}
          </h1>

          <p className="mt-3 text-xs leading-relaxed text-neutral-400 max-w-3xl">
            {fallbackPr.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded border border-white/20 bg-neutral-950 px-3 py-1 font-mono text-[11px] text-neutral-300">
              <ShieldAlert className="h-3.5 w-3.5 text-white" />
              <span>Inspection Type: Concurrency &amp; Performance Mutation</span>
            </div>
          </div>

          {/* Quick Step Guide for Reviewers */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border border-white/10 bg-neutral-950 p-4 font-mono text-xs text-neutral-400">
            <div className="flex items-start gap-2">
              <span className="text-white font-bold">01.</span>
              <span>Click any line number to attach an inline audit note.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-white font-bold">02.</span>
              <span>Identify whether the logic contains non-atomic operations or race conditions.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-white font-bold">03.</span>
              <span>Submit &ldquo;Request Changes&rdquo; or &ldquo;Approve&rdquo; to receive instant grading.</span>
            </div>
          </div>
        </div>

        {/* Diff Reviewer */}
        <DiffViewer
          prId={fallbackPr.id}
          diff={fallbackPr.diff}
          hasBug={fallbackPr.hasBug}
          bugType={fallbackPr.bugType}
          existingReview={fallbackPr.review}
        />
      </main>
    </div>
  );
}
