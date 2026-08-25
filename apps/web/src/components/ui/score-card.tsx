import type { LucideIcon } from "lucide-react";

interface ScoreCardProps {
  icon: LucideIcon;
  label: string;
  score: number | string;
  maxScore?: number;
  subtitle: string;
}

export function ScoreCard({ icon: Icon, label, score, maxScore = 100, subtitle }: ScoreCardProps) {
  return (
    <div className="bg-black p-6">
      <div className="flex items-center gap-2 text-xs uppercase text-neutral-500">
        <Icon className="h-4 w-4 text-white" />
        <span>{label}</span>
      </div>
      <p className="mt-3 font-mono text-4xl font-bold text-white">
        {score}
        {typeof score === "number" && (
          <span className="text-sm font-normal text-neutral-500"> / {maxScore}</span>
        )}
      </p>
      <p className="mt-2 text-[11px] text-neutral-400">{subtitle}</p>
    </div>
  );
}
