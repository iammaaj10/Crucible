import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { nodes, edges } = await req.json();

  const nodeCount = Array.isArray(nodes) ? nodes.length : 0;
  const edgeCount = Array.isArray(edges) ? edges.length : 0;

  const hasGateway = nodes?.some((n: { type?: string }) => n.type === "gatewayNode");
  const hasDB = nodes?.some((n: { type?: string }) => n.type === "dbNode");
  const hasCache = nodes?.some((n: { type?: string }) => n.type === "cacheNode");
  const serviceNodes = nodes?.filter((n: { type?: string }) => n.type === "serviceNode") || [];

  const bottlenecks: string[] = [];
  if (!hasGateway) bottlenecks.push("Missing Ingress / API Gateway entry point");
  if (!hasDB) bottlenecks.push("No persistent storage layer detected");
  if (!hasCache && serviceNodes.length > 2) bottlenecks.push("High DB IOPS alert: Add Redis cache layer to absorb query spikes");
  if (serviceNodes.length === 1) bottlenecks.push("Single point of failure on core service instance");

  // Realistic simulation calculations
  const baseLatency = hasCache ? 28 : 64;
  const loadFactor = Math.max(1, nodeCount * 0.4);
  const p99 = Math.round(baseLatency + (bottlenecks.length * 15) + (Math.random() * 8));
  const throughput = Math.round(Math.max(1000, 5000 - (bottlenecks.length * 750)));
  const errorRate = bottlenecks.length === 0 ? "0.01%" : (bottlenecks.length * 0.45).toFixed(2) + "%";
  const monthlyCost = `$${Math.round(200 + (nodeCount * 140) + (edgeCount * 20))}/mo`;

  const simResults = {
    p99Latency: p99,
    throughputAchieved: throughput,
    errorRate,
    estimatedCost: monthlyCost,
    bottlenecks,
    timestamp: new Date().toISOString(),
  };

  // Update project in DB
  await prisma.project.update({
    where: { id },
    data: {
      designGraph: { nodes, edges },
      simResults,
    },
  });

  return NextResponse.json(simResults);
}
