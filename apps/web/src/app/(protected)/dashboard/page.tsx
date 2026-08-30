import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AppHeader } from "@/components/navigation/AppHeader";
import { PenTool, GitPullRequest, AlertTriangle, ArrowRight, BookOpen } from "lucide-react";

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

  let projects = (await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { pullRequests: true },
  })) as unknown as ProjectItem[];

  // Auto-create a starter project for brand-new users
  if (projects.length === 0 && user.id) {
    const starter = await prisma.project.create({
      data: {
        userId: user.id,
        name: "E-Commerce Checkout & Payment System (Starter)",
        constraints: {
          throughput: "5000 req/sec",
          targetLatency: "< 50ms",
          regions: ["us-east-1", "eu-central-1"],
          monthlyBudget: "$1,200",
        },
        designGraph: {
          nodes: [],
          edges: [],
        },
        status: "active",
        pullRequests: {
          create: {
            title: "PR #101: Add rate limiter to protect the checkout service",
            description: "This code change is supposed to stop too many requests from hitting the checkout server at once. But there is a hidden bug — can you find it?",
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
+        # Bug: Reads and writes token count in two separate steps.
+        # Under heavy traffic, two users can read the same count at the same time,
+        # both think there is a token available, and both get through — breaking the limit.
+        current_tokens = await self.redis.get(key)
+        tokens = self.capacity if current_tokens is None else int(current_tokens)
+        if tokens > 0:
+            await self.redis.set(key, str(tokens - 1))
+            return True
+        return False`,
            hasBug: true,
            bugType: "race_condition",
            bugLocation: { file: "services/order_service/limiter.py", lineStart: 18, lineEnd: 24 },
            status: "pending",
          },
        },
      },
      include: { pullRequests: true },
    });
    projects = [starter as unknown as ProjectItem];
  }

  const skillProfile = (await prisma.skillProfile.findUnique({
    where: { userId: user.id! },
  })) as { designScore?: number; reviewScore?: number } | null;

  const steps = [
    {
      number: "1",
      icon: PenTool,
      title: "Lesson 1: How the Internet Works (Gateway & Services)",
      description:
        "Learn the basics of system architecture. You'll build a simple system, run a simulation, and watch data packets flow through your servers.",
      cta: "Start Lesson 1 →",
      href: projects[0] ? `/design/${projects[0].id}` : "/design/new",
    },
    {
      number: "2",
      icon: GitPullRequest,
      title: "Lesson 2: Catching Sneaky Code Bugs (Race Conditions)",
      description:
        "Not all bugs throw errors. Learn about 'Race Conditions' by stepping through the code visually and watching two users collide.",
      cta: "Start Lesson 2 →",
      href: projects[0]?.pullRequests?.[0] ? `/review/${projects[0].pullRequests[0].id}` : "/review/demo",
    },
    {
      number: "3",
      icon: AlertTriangle,
      title: "Lesson 3: Fixing Live Outages (When Things Break)",
      description:
        "What happens when your servers crash in production? Learn how to read logs and mitigate a live outage just like a real on-call engineer.",
      cta: "Start Lesson 3 →",
      href: projects[0] ? `/incidents/${projects[0].id}` : "/incidents/demo",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader userName={user.name} userEmail={user.email} projectId={projects[0]?.id} prId={projects[0]?.pullRequests?.[0]?.id} />

      <main className="mx-auto max-w-5xl px-6 py-12">

        {/* Welcome Banner */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500">Welcome back 👋</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {user.name || "Engineer"}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-400">
              Crucible gives you hands-on experience with real engineering scenarios. 
              Work through the 3 exercises below — each one teaches a different, critical skill.
            </p>
          </div>
          <Link
            href="/design/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded bg-white px-5 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-neutral-200 active:scale-[0.99]"
          >
            + New Project
          </Link>
        </div>

        {/* Score Cards */}
        <div className="mb-10 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
          <div className="bg-black p-6">
            <p className="text-xs text-neutral-500">Lessons Completed</p>
            <p className="mt-1 font-mono text-4xl font-bold text-white">
              0<span className="text-sm font-normal text-neutral-500"> / 3</span>
            </p>
            <p className="mt-1 text-[11px] text-neutral-500">Keep going!</p>
          </div>
          <div className="bg-black p-6">
            <p className="text-xs text-neutral-500">Current Streak</p>
            <p className="mt-1 font-mono text-4xl font-bold text-white">
              1<span className="text-sm font-normal text-neutral-500"> Day</span>
            </p>
            <p className="mt-1 text-[11px] text-neutral-500">Log in tomorrow to keep it going</p>
          </div>
          <div className="bg-black p-6">
            <p className="text-xs text-neutral-500">Active Projects</p>
            <p className="mt-1 font-mono text-4xl font-bold text-white">
              {projects.length.toString().padStart(2, "0")}
            </p>
            <p className="mt-1 text-[11px] text-neutral-500">Systems you have designed</p>
          </div>
        </div>

        {/* The 3 Core Exercises */}
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-neutral-400" />
          <h2 className="text-xs uppercase tracking-widest text-neutral-400">Your Learning Path</h2>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="border border-white/10 bg-neutral-950 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-white/20 bg-black">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase text-neutral-500">Lesson {step.number}</span>
                      </div>
                      <h3 className="mt-0.5 text-base font-bold text-white">{step.title}</h3>
                      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-neutral-400">{step.description}</p>
                    </div>
                  </div>
                  <Link
                    href={step.href}
                    className="inline-flex shrink-0 items-center gap-2 rounded border border-white/30 bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-white hover:bg-neutral-900"
                  >
                    {step.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* All Projects */}
        {projects.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-400">Your Projects</h2>
            <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/design/${project.id}`}
                  className="group block bg-black p-6 transition-colors hover:bg-neutral-950"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-bold text-white group-hover:underline">{project.name}</h3>
                    <span className="rounded border border-white/20 bg-neutral-900 px-2 py-0.5 text-[10px] uppercase text-neutral-300">
                      {project.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">Click to open your architecture canvas and run benchmarks.</p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-[11px] text-neutral-500">
                    <span>{project.pullRequests.length} code review(s)</span>
                    <span className="flex items-center gap-1 text-white">Open <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
