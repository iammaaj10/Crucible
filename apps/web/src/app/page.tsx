import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      step: "Step 01",
      emoji: "🏗️",
      title: "Build a Cloud System",
      desc: "Drag and drop servers, databases, and caches onto a canvas to design how a real app like Instagram or Uber works behind the scenes. Then simulate millions of users hitting it.",
    },
    {
      step: "Step 02",
      emoji: "🔍",
      title: "Review Real Code Bugs",
      desc: "Look at actual code changes (like a real engineer would) and find hidden bugs — such as a race condition that causes your app to crash under heavy load.",
    },
    {
      step: "Step 03",
      emoji: "🚨",
      title: "Fix Live Production Outages",
      desc: "Your app just went down at 3am! Read the error logs, diagnose the root cause, and hit the right button to restore service before users notice.",
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white selection:bg-white selection:text-black">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-8 py-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-mono text-sm font-bold text-black">
            C
          </div>
          <span className="font-mono text-sm font-semibold uppercase tracking-widest text-white">
            Crucible
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-medium text-neutral-400 transition-colors hover:text-white">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-white bg-white px-4 py-1.5 text-xs font-semibold text-black transition-all hover:bg-neutral-200"
          >
            Get Started — It&apos;s Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950 px-4 py-1.5 text-xs text-neutral-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Engineering Simulation Platform — Open to All Skill Levels
        </div>

        <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-7xl">
          Learn how real software<br className="hidden sm:block" /> engineers work.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
          Crucible is a <strong className="text-white">hands-on training platform</strong> where you practice 
          designing cloud systems, catching bugs in code, and responding to production crises — 
          the exact skills that get you hired at top tech companies.
        </p>

        <p className="mt-3 text-sm text-neutral-500">
          No experience needed. Everything is guided with step-by-step instructions.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-bold text-black transition-all hover:bg-neutral-200"
          >
            Start Learning for Free
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 bg-neutral-950 px-8 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-neutral-900"
          >
            I already have an account
          </Link>
        </div>

        {/* What you'll practice */}
        <div className="mt-20 w-full max-w-5xl">
          <p className="mb-8 font-mono text-xs uppercase tracking-widest text-neutral-500">
            What you will practice
          </p>
          <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {features.map((item) => (
              <div key={item.title} className="bg-black p-8 text-left">
                <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">{item.step}</p>
                <p className="mt-3 text-3xl">{item.emoji}</p>
                <h3 className="mt-2 text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why it matters */}
        <div className="mt-16 max-w-2xl rounded border border-white/10 bg-neutral-950 p-8 text-left">
          <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">Why Crucible?</p>
          <h2 className="mt-2 text-xl font-bold text-white">
            Textbooks teach you theory. Crucible teaches you what actually happens on the job.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            Most engineering interviews test your ability to <em>think like a senior engineer</em>. 
            Crucible builds exactly that — by giving you real scenarios with real tradeoffs and 
            instant feedback on every decision you make.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-neutral-600">
        Crucible &copy; {new Date().getFullYear()} — Built for engineers, by engineers.
      </footer>
    </div>
  );
}
