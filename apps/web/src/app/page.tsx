import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white selection:bg-white selection:text-black">
      {/* Subtle grid background */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" 
      />

      {/* Top Navbar */}
      <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-8 py-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-mono text-sm font-bold text-black shadow-sm">
            C
          </div>
          <span className="font-mono text-sm tracking-widest uppercase font-semibold text-white">
            Crucible
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-white bg-white px-4 py-1.5 text-xs font-semibold text-black transition-all hover:bg-neutral-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950 px-3.5 py-1 text-xs font-mono text-neutral-400">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          SYSTEM_SIMULATION_V1.0
        </div>

        <h1 className="max-w-4xl font-sans text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
          Design it. Ship it. Defend it.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">
          An engineering simulation platform. Design distributed cloud systems, review code for concurrency anomalies, and triage high-severity production outages.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center rounded-md bg-white px-7 text-sm font-semibold text-black transition-all hover:bg-neutral-200"
          >
            Start Practicing
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md border border-white/15 bg-neutral-950 px-7 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-neutral-900"
          >
            Sign In
          </Link>
        </div>

        {/* Technical Architecture Blocks */}
        <div className="mt-24 grid max-w-5xl grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
          {[
            {
              code: "01 // ARCHITECTURE",
              title: "System Topology Canvas",
              desc: "Model complex microservice topologies, queuing dynamics, and failover boundaries with discrete-event simulations.",
            },
            {
              code: "02 // CODE_REVIEW",
              title: "Defect Mutation Engine",
              desc: "Inspect subtle race conditions, unbounded retries, and missing indexes embedded into real-world code diffs.",
            },
            {
              code: "03 // INCIDENT_OPS",
              title: "Live Production War Room",
              desc: "Diagnose telemetry metrics, trace latency spikes, and execute real-time mitigation under simulated load pressure.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group relative bg-black p-8 text-left transition-colors hover:bg-neutral-950"
            >
              <p className="font-mono text-xs text-neutral-500">{item.code}</p>
              <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Minimal Monochrome Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs font-mono text-neutral-600">
        CRUCIBLE LABS &copy; {new Date().getFullYear()} &mdash; ARCHITECTURE UNDER PRESSURE
      </footer>
    </div>
  );
}
