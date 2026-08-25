interface PageHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ badge, title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
      <div>
        {badge && (
          <p className="text-[11px] uppercase tracking-widest text-neutral-500">{badge}</p>
        )}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
