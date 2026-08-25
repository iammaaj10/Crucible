"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

interface AppHeaderProps {
  userEmail?: string | null;
  userName?: string | null;
  projectId?: string;
  prId?: string;
}

export function AppHeader({ userEmail, userName, projectId, prId }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-black/90 px-6 backdrop-blur-md">
      {/* Brand & Tabs */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-white font-mono text-xs font-bold text-black">
            C
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            Crucible
          </span>
        </Link>

        {/* Global Navigation */}
        <nav className="flex items-center gap-1 font-mono text-xs">
          <Link
            href="/dashboard"
            className="rounded px-3 py-1.5 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href={projectId ? `/design/${projectId}` : `/design/new`}
            className="rounded px-3 py-1.5 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            Design Canvas
          </Link>
          <Link
            href={prId ? `/review/${prId}` : `/review/demo`}
            className="rounded px-3 py-1.5 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            Code Audit
          </Link>
          <Link
            href={projectId ? `/incidents/${projectId}` : `/incidents/demo`}
            className="rounded px-3 py-1.5 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            Incidents
          </Link>
          <Link
            href="/profile"
            className="rounded px-3 py-1.5 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            Skill Matrix
          </Link>
        </nav>
      </div>

      {/* Operator Status & Sign Out */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span>{userName || userEmail || "Operator"}</span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded border border-white/20 bg-black px-2.5 py-1 font-mono text-[11px] uppercase text-neutral-400 transition-colors hover:border-white hover:text-white"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
