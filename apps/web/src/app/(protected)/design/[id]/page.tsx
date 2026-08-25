import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/navigation/AppHeader";
import { ArchitectureCanvas } from "@/components/canvas/ArchitectureCanvas";
import { Node, Edge } from "reactflow";

export default async function DesignProjectPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project || project.userId !== session.user.id) {
    notFound();
  }

  const designGraph = (project.designGraph as unknown as { nodes?: Node[]; edges?: Edge[] }) || {
    nodes: [],
    edges: [],
  };

  const simResults = project.simResults as {
    p99Latency: number;
    throughputAchieved: number;
    errorRate: string;
    estimatedCost: string;
    bottlenecks: string[];
  } | undefined;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader
        userName={session.user.name}
        userEmail={session.user.email}
        projectId={project.id}
      />
      <div className="border-b border-white/10 bg-neutral-950 px-8 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-neutral-500 uppercase">Topology Instance:</span>
          <h1 className="font-mono text-sm font-bold text-white">{project.name}</h1>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400">
          <span>Status: <span className="text-white uppercase">{project.status}</span></span>
        </div>
      </div>
      <ArchitectureCanvas
        projectId={project.id}
        initialGraph={{
          nodes: designGraph.nodes || [],
          edges: designGraph.edges || [],
        }}
        initialSimResults={simResults}
      />
    </div>
  );
}
