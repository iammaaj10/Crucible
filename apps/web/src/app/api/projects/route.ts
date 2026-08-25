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

  const { name, constraints, designGraph } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const defaultConstraints = constraints || {
    throughput: "5000 req/sec",
    targetLatency: "< 50ms",
    regions: ["us-east-1", "eu-west-1"],
    monthlyBudget: "$1,200",
  };

  const defaultGraph = designGraph || {
    nodes: [
      { id: "gateway-1", type: "gatewayNode", position: { x: 100, y: 200 }, data: { label: "API Gateway", rps: 5000 } },
      { id: "service-1", type: "serviceNode", position: { x: 380, y: 200 }, data: { label: "Auth & Order Service", instances: 4 } },
      { id: "db-1", type: "dbNode", position: { x: 680, y: 150 }, data: { label: "Primary PostgreSQL", replica: true } },
      { id: "cache-1", type: "cacheNode", position: { x: 680, y: 280 }, data: { label: "Redis Cluster", memory: "16GB" } },
    ],
    edges: [
      { id: "e1-2", source: "gateway-1", target: "service-1", animated: true, style: { stroke: "#ffffff" } },
      { id: "e2-3", source: "service-1", target: "db-1", animated: false, style: { stroke: "#71717a" } },
      { id: "e2-4", source: "service-1", target: "cache-1", animated: true, style: { stroke: "#ffffff" } },
    ],
  };

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      name,
      constraints: defaultConstraints,
      designGraph: defaultGraph,
      status: "designing",
      simResults: {
        p99Latency: 42,
        throughputAchieved: 4950,
        errorRate: "0.02%",
        estimatedCost: "$840/mo",
        bottlenecks: [],
      },
    },
  });

  // Seed an initial demo pull request with an authentic subtle bug for practice
  await prisma.pullRequest.create({
    data: {
      projectId: project.id,
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
