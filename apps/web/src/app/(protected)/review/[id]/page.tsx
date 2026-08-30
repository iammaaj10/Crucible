import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/navigation/AppHeader";
import { DiffViewer } from "@/components/review/DiffViewer";
import { GitPullRequest, Bug } from "lucide-react";

export default async function ReviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;

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
    title: "Lesson 2: The Race Condition Bug",
    description:
      "You don't need to write any code here! Below is an example of code written by another engineer. It has a sneaky bug. Read the green lines and click 'Explain this to me' to see how it breaks.",
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
+        # Bug: Reads and writes happen in two separate steps.
+        # If 100 users hit this at the same moment, they ALL read the same count,
+        # ALL think there's a slot available, and ALL get through — the limit is broken.
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
        {/* Page Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase">
            <GitPullRequest className="h-4 w-4 text-white" />
            <span>Lesson 02 — Code Review &nbsp;·&nbsp; Status: <span className="text-white">{fallbackPr.status}</span></span>
          </div>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {fallbackPr.title}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-400">
            {fallbackPr.description}
          </p>

          {/* What is a "diff"? */}
          <div className="mt-4 rounded border border-white/10 bg-neutral-950 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              What am I looking at?
            </p>
            <p className="text-xs leading-relaxed text-neutral-400">
              The panel below shows a <strong className="text-white">code diff</strong> — a before/after view of the code change.
              Lines in <span className="bg-red-950/30 text-red-300 px-1 rounded">red</span> were <strong>deleted</strong> from the old code.
              Lines in <span className="bg-green-950/30 text-green-300 px-1 rounded">green</span> are <strong>new</strong> additions.
              Click <strong className="text-white">"Explain this to me"</strong> below to see how this bug works.
            </p>
          </div>



          {/* Hint */}
          <div className="mt-3 flex items-start gap-2 rounded border border-white/10 bg-neutral-950 px-4 py-2.5 text-xs text-neutral-400">
            <Bug className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />
            <span>
              <strong className="text-white">Hint:</strong> Think about what happens when 1,000 users click &quot;Buy Now&quot; at the exact same moment. 
              Does this code handle that safely?
            </span>
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
