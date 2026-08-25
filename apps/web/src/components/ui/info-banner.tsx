import type { LucideIcon } from "lucide-react";

interface InfoBannerProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  children: React.ReactNode;
}

export function InfoBanner({ icon: Icon, emoji, title, children }: InfoBannerProps) {
  return (
    <div className="rounded border border-white/10 bg-neutral-950 p-5 text-sm leading-relaxed text-neutral-400">
      <p className="mb-1.5 font-bold text-white">
        {emoji && <span className="mr-1">{emoji}</span>}
        {Icon && <Icon className="mr-1.5 inline h-4 w-4" />}
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}
