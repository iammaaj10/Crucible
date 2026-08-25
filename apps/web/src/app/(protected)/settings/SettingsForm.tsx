"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";

interface SettingsFormProps {
  currentName: string;
}

export function SettingsForm({ currentName }: SettingsFormProps) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Display Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded border border-white/15 bg-black px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
        />
      </div>

      {error && <p className="text-xs text-neutral-300">⚠️ {error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || name.trim() === currentName}
          className="flex items-center gap-2 rounded bg-white px-4 py-2 text-xs font-bold text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-white">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}
