"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, PenTool, GitPullRequest, AlertTriangle, Star, LogOut } from "lucide-react";

interface AppHeaderProps {
  userEmail?: string | null;
  userName?: string | null;
  projectId?: string;
  prId?: string;
}

export function AppHeader({ userEmail, userName, projectId, prId }: AppHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Home",
      tooltip: "Your personal dashboard",
      icon: LayoutDashboard,
    },
    {
      href: projectId ? `/design/${projectId}` : "/design/new",
      label: "System Design",
      tooltip: "Design cloud architectures",
      icon: PenTool,
    },
    {
      href: prId ? `/review/${prId}` : "/review/demo",
      label: "Code Review",
      tooltip: "Find bugs in pull requests",
      icon: GitPullRequest,
    },
    {
      href: projectId ? `/incidents/${projectId}` : "/incidents/demo",
      label: "Incident Response",
      tooltip: "Fix simulated outages",
      icon: AlertTriangle,
    },
    {
      href: "/profile",
      label: "My Skills",
      tooltip: "View your skill scores",
      icon: Star,
    },
  ];

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-black/90 px-6 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-white font-mono text-sm font-bold text-black">
            C
          </div>
          <span className="hidden font-mono text-xs font-bold uppercase tracking-wider text-white sm:block">
            Crucible
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.tooltip}
                className={`group flex items-center gap-1.5 rounded px-3 py-1.5 text-xs transition-colors ${
                  isActive
                    ? "bg-white text-black font-semibold"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 text-xs text-neutral-400 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span className="max-w-[120px] truncate">{userName || userEmail}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out of Crucible"
          className="flex items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 py-1 text-[11px] text-neutral-400 transition-colors hover:border-white hover:text-white"
        >
          <LogOut className="h-3 w-3" />
          <span className="hidden sm:block">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
