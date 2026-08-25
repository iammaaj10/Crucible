import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Layers, ShieldAlert, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  status: string;
  updatedAt: Date;
  pullRequests: Array<{ id: string }>;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user;

  // Fetch user's projects
  let projects = (await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { pullRequests: true },
  })) as unknown as ProjectItem[];

  // Auto-seed starter project for brand new users so they can immediately learn and explore
  if (projects.length === 0 && user.id) {
    const starter = await prisma.project.create({
      data: {
        userId: user.id,
        name: "E-Commerce Checkout & Payment Engine (Starter)",
        constraints: {
          throughput: "5000 req/sec",
          targetLatency: "< 50ms",
          regions: ["us-east-1", "eu-central-1"],
          monthlyBudget: "$1,200",
        },
        designGraph: {
          nodes: [
            { id: "gateway-1", type: "gatewayNode", position: { x: 80, y: 180 }, data: { label: "API Gateway (Rate Limiter)", rps: 5000 } },
            { id: "service-1", type: "serviceNode", position: { x: 350, y: 180 }, data: { label: "Order & Checkout Service", instances: 4 } },
            { id: "db-1", type: "dbNode", position: { x: 650, y: 120 }, data: { label: "PostgreSQL Cluster", replica: true } },
            { id: "cache-1", type: "cacheNode", position: { x: 650, y: 260 }, data: { label: "Redis State Cache", memory: "16GB" } },
          ],
          edges: [
            { id: "e1-2", source: "gateway-1", target: "service-1", animated: true, style: { stroke: "#ffffff", strokeWidth: 2 } },
            { id: "e2-3", source: "service-1", target: "db-1", animated: false, style: { stroke: "#71717a", strokeWidth: 1.5 } },
            { id: "e2-4", source: "service-1", target: "cache-1", animated: true, style: { stroke: "#ffffff", strokeWidth: 2 } },
          ],
        },
        status: "simulating",
        simResults: {
          p99Latency: 38,
          throughputAchieved: 4950,
          errorRate: "0.01%",
          estimatedCost: "$780/mo",
          bottlenecks: [],
        },
        pullRequests: {
          create: {
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
        },
      },
      include: { pullRequests: true },
    });
    projects = [starter as unknown as ProjectItem];
  }

  // Fetch skill profile
  const skillProfile = (await prisma.skillProfile.findUnique({
    where: { userId: user.id! },
  })) as { designScore?: number; reviewScore?: number } | null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader userName={user.name} userEmail={user.email} />

      <main className="mx-auto max-w-6xl px-8 py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">ENGINEERING_COMMAND_CENTER</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Welcome back, {user.name || "Operator"}
            </h1>
            <p className="mt-1.5 text-xs text-neutral-400">
              Practice real-world system architecture, pull request defect audits, and live incident triage.
            </p>
          </div>
          <Link
            href="/design/new"
            className="inline-flex h-10 items-center justify-center rounded bg-white px-5 text-xs font-mono font-bold uppercase tracking-wider text-black transition-all hover:bg-neutral-200 active:scale-[0.99]"
          >
            + New Simulation
          </Link>
        </div>

        {/* Guided Learning Track Workflow */}
        <div className="mb-12 border border-white/10 bg-neutral-950 p-6 shadow-2xl">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-white mb-4">
            <Sparkles className="h-4 w-4 text-white" />
            Crucible Operational Training Loop
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded border border-white/10 bg-black p-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-white mb-1.5">
                <Layers className="h-4 w-4 text-white" />
                <span>01. Architecture Canvas</span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-400">
                Design topology nodes (Gateways, Microservices, DBs, Caches). Run discrete benchmarks to evaluate P99 latency and cost.
              </p>
            </div>

            <div className="rounded border border-white/10 bg-black p-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-white mb-1.5">
                <ShieldAlert className="h-4 w-4 text-white" />
                <span>02. Code Audit Studio</span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-400">
                Review realistic pull requests. Pinpoint concurrency race conditions, N+1 query bottlenecks, and submit graded inline reviews.
              </p>
            </div>

            <div className="rounded border border-white/10 bg-black p-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-white mb-1.5">
                <AlertTriangle className="h-4 w-4 text-white" />
                <span>03. Incident War Room</span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-400">
                Triage simulated production outages. Inspect real-time error logs and execute automated mitigations before SLA breaches.
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards (Monochrome Grid) */}
        <div className="mb-12 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
          <div className="bg-black p-6">
            <p className="font-mono text-xs uppercase text-neutral-500">System Design Index</p>
            <p className="mt-2 font-mono text-4xl font-bold text-white">
              {skillProfile?.designScore !== undefined ? skillProfile.designScore.toFixed(0) : "75"}
              <span className="text-sm font-normal text-neutral-500"> / 100</span>
            </p>
            <p className="mt-2 font-mono text-[11px] text-neutral-500">Topology latency &amp; resource efficiency</p>
          </div>
          <div className="bg-black p-6">
            <p className="font-mono text-xs uppercase text-neutral-500">Code Audit Accuracy</p>
            <p className="mt-2 font-mono text-4xl font-bold text-white">
              {skillProfile?.reviewScore !== undefined ? skillProfile.reviewScore.toFixed(0) : "80"}
              <span className="text-sm font-normal text-neutral-500"> / 100</span>
            </p>
            <p className="mt-2 font-mono text-[11px] text-neutral-500">Defect detection &amp; inline audit precision</p>
          </div>
          <div className="bg-black p-6">
            <p className="font-mono text-xs uppercase text-neutral-500">Active Workspaces</p>
            <p className="mt-2 font-mono text-4xl font-bold text-white">
              {projects.length.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 font-mono text-[11px] text-neutral-500">Live simulation environments</p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            Active Simulation Workspaces ({projects.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/design/${project.id}`}
              className="group block bg-black p-6 transition-colors hover:bg-neutral-950"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-mono text-sm font-bold text-white group-hover:underline">
                  {project.name}
                </h3>
                <span className="border border-white/20 bg-neutral-900 px-2 py-0.5 font-mono text-[10px] uppercase text-neutral-300">
                  {project.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">
                Click to open interactive topology canvas &amp; discrete benchmarks.
              </p>
              <div className="mt-6 flex items-center justify-between font-mono text-[11px] text-neutral-500 pt-4 border-t border-white/5">
                <span>{project.pullRequests.length} CODE AUDITS</span>
                <span className="flex items-center gap-1 text-white group-hover:translate-x-0.5 transition-transform">
                  Enter Canvas <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
