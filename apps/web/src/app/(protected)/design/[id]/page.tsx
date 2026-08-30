import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/navigation/AppHeader";
import { ArchitectureCanvas } from "@/components/canvas/ArchitectureCanvas";
import { systemDesignLessons } from "@/lib/constants/lessons";
import { Node, Edge } from "reactflow";

export default async function DesignProjectPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { pullRequests: true },
  });

  if (!project || project.userId !== session.user.id) notFound();

  const designGraph = (project.designGraph as unknown as { nodes?: Node[]; edges?: Edge[] }) || { nodes: [], edges: [] };

  const simResults = project.simResults as {
    p99Latency: number;
    throughputAchieved: number;
    errorRate: string;
    estimatedCost: string;
    bottlenecks: string[];
  } | undefined;

  const firstPrId = project.pullRequests?.[0]?.id;
  const lessonId = (project.constraints as any)?.lessonId || "basics";
  const activeLesson = systemDesignLessons[lessonId] || systemDesignLessons["basics"];

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader
        userName={session.user.name}
        userEmail={session.user.email}
        projectId={project.id}
        prId={firstPrId}
      />

      {/* Page Context Banner */}
      <div className="border-b border-white/10 bg-neutral-950 px-8 py-3">
        <div className="mx-auto flex max-w-full items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-neutral-500 uppercase tracking-widest">
              {activeLesson.title}
            </p>
            <h1 className="mt-0.5 text-sm font-bold text-white">{project.name}</h1>
          </div>
          <div className="rounded border border-white/10 bg-black px-4 py-2 text-[11px] text-neutral-400">
            <span className="font-bold text-white">How to use:</span> Add nodes from the toolbar → Wire them by dragging between the dots → Click &ldquo;Run Simulation&rdquo; to test performance.
          </div>
        </div>
      </div>

      <ArchitectureCanvas
        projectId={project.id}
        initialGraph={{ nodes: designGraph.nodes || [], edges: designGraph.edges || [] }}
        initialSimResults={simResults}
        lessonId={lessonId}
      />
    </div>
  );
}
