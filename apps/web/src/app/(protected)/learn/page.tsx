import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/navigation/AppHeader";
import { glossaryData } from "@/lib/constants/glossary";
import { BookOpen, Search } from "lucide-react";
import { LearnSearch } from "./LearnSearch";

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader userName={session.user.name} userEmail={session.user.email} />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-500">
            <BookOpen className="h-4 w-4 text-white" />
            Learn Hub
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            📖 Engineering Dictionary
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
            Every technical term used on Crucible, explained in plain English with real-world
            analogies. You don&apos;t need to memorize these — just come back here whenever you see a
            word you don&apos;t understand.
          </p>
        </div>

        <LearnSearch glossaryData={glossaryData} />
      </main>
    </div>
  );
}
