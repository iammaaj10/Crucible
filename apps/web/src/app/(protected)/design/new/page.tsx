"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/navigation/AppHeader";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { projectTemplates } from "@/lib/constants/templates";
import type { ProjectTemplate } from "@/lib/types";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [throughput, setThroughput] = useState("5000 req/sec");
  const [targetLatency, setTargetLatency] = useState("< 50ms");
  const [monthlyBudget, setMonthlyBudget] = useState("$1,500");
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const applyTemplate = (template: ProjectTemplate) => {
    setName(template.name);
    setThroughput(template.throughput);
    setTargetLatency(template.targetLatency);
    setMonthlyBudget(template.monthlyBudget);
    setSelectedTemplate(template.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          constraints: {
            throughput,
            targetLatency,
            regions: ["us-east-1", "eu-central-1"],
            monthlyBudget,
          },
        }),
      });
      const data = await res.json();
      router.push(`/design/${data.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-8 py-12">
        {/* Page Header */}
        <div className="mb-10 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Create a New System Design
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
            Pick a template or give your project a name, then choose how big and fast you want
            the system to be. After that, you&apos;ll go to the canvas to start building.
          </p>
        </div>

        {/* Template Picker */}
        <div className="mb-10">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-400">
            🧩 Pick a template to get started quickly
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projectTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className={`rounded border p-4 text-left transition-all ${
                  selectedTemplate === t.id
                    ? "border-white bg-neutral-900"
                    : "border-white/10 bg-neutral-950 hover:border-white/30 hover:bg-neutral-900"
                }`}
              >
                <p className="text-2xl">{t.emoji}</p>
                <p className="mt-2 text-sm font-bold text-white">{t.name}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">{t.description}</p>
                {selectedTemplate === t.id && (
                  <p className="mt-2 text-[10px] font-bold uppercase text-white">✓ Selected</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Or customize manually */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">
            or customize your own
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6 border border-white/10 bg-neutral-950 p-8">
            {/* Project Name */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                What are you building?
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Food Delivery App, Chat Messenger, Streaming Platform"
                className="w-full rounded border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
              />
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  How many users at once?
                </label>
                <select
                  value={throughput}
                  onChange={(e) => setThroughput(e.target.value)}
                  className="w-full rounded border border-white/15 bg-black px-3 py-2.5 text-xs text-white outline-none focus:border-white"
                >
                  <option value="1000 req/sec">Small app — 1,000 users/sec</option>
                  <option value="5000 req/sec">Medium app — 5,000 users/sec</option>
                  <option value="25000 req/sec">Large app — 25,000 users/sec</option>
                  <option value="100000 req/sec">Massive — 100,000 users/sec</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  How fast should it feel?
                </label>
                <select
                  value={targetLatency}
                  onChange={(e) => setTargetLatency(e.target.value)}
                  className="w-full rounded border border-white/15 bg-black px-3 py-2.5 text-xs text-white outline-none focus:border-white"
                >
                  <option value="< 20ms">Super fast (&lt; 20ms) — gaming, trading</option>
                  <option value="< 50ms">Normal (&lt; 50ms) — most apps</option>
                  <option value="< 150ms">Relaxed (&lt; 150ms) — email, reports</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Monthly cloud budget
                </label>
                <select
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full rounded border border-white/15 bg-black px-3 py-2.5 text-xs text-white outline-none focus:border-white"
                >
                  <option value="$500">$500 / month — hobby project</option>
                  <option value="$1,500">$1,500 / month — startup</option>
                  <option value="$5,000">$5,000 / month — growing app</option>
                  <option value="$20,000">$20,000 / month — enterprise</option>
                </select>
              </div>
            </div>

            {/* Region Info */}
            <div className="rounded border border-white/10 bg-black px-4 py-3 text-xs text-neutral-400">
              🌍 Your servers will run in <strong className="text-white">US (Virginia)</strong> and{" "}
              <strong className="text-white">Europe (Frankfurt)</strong> for reliability.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Go Back
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-2 rounded bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
            >
              {loading ? "Creating your project..." : "Create & Start Designing"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
