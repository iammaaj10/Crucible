import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { pullRequests: true },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, constraints, designGraph, lessonId } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const defaultConstraints = constraints || {
    throughput: "5000 req/sec",
    targetLatency: "< 50ms",
    regions: ["us-east-1", "eu-west-1"],
    monthlyBudget: "$1,200",
    lessonId: lessonId || "basics"
  };
  
  if (lessonId && !defaultConstraints.lessonId) {
    defaultConstraints.lessonId = lessonId;
  }

  const defaultGraph = designGraph || {
    nodes: [],
    edges: [],
  };

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      name,
      constraints: defaultConstraints,
      designGraph: defaultGraph,
      status: "designing",
    },
  });

  // Seed an initial demo pull request with an authentic subtle bug for practice
  await prisma.pullRequest.create({
    data: {
      projectId: project.id,
      title: "Lesson 2: The Race Condition Bug",
      description: "You don't need to write any code here! Below is an example of code written by another engineer. It has a sneaky bug. Read the green lines and click 'Explain this to me' to see how it breaks.",
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
      bugLocation: {
        file: "services/order_service/limiter.py",
        lineStart: 18,
        lineEnd: 24,
      },
      status: "pending",
    },
  });

  return NextResponse.json(project, { status: 201 });
}
