"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import type { GlossaryCategory } from "@/lib/types";

interface LearnSearchProps {
  glossaryData: GlossaryCategory[];
}

export function LearnSearch({ glossaryData }: LearnSearchProps) {
  const [search, setSearch] = useState("");
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  const toggleTerm = (term: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(term)) {
        next.delete(term);
      } else {
        next.add(term);
      }
      return next;
    });
  };

  const filteredCategories = glossaryData
    .map((cat) => ({
      ...cat,
      entries: cat.entries.filter(
        (e) =>
          e.term.toLowerCase().includes(search.toLowerCase()) ||
          e.definition.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.entries.length > 0);

  const totalEntries = glossaryData.reduce((sum, cat) => sum + cat.entries.length, 0);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${totalEntries} terms... (e.g. "cache", "race condition")`}
          className="w-full rounded border border-white/15 bg-neutral-950 py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
        />
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {filteredCategories.map((category) => (
          <div key={category.title}>
            <h2 className="mb-4 flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400">
              <span className="text-lg">{category.emoji}</span>
              {category.title}
              <span className="text-neutral-600">({category.entries.length})</span>
            </h2>

            <div className="space-y-2">
              {category.entries.map((entry) => {
                const isExpanded = expandedTerms.has(entry.term);
                return (
                  <div key={entry.term} className="border border-white/10 bg-neutral-950">
                    <button
                      onClick={() => toggleTerm(entry.term)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-neutral-900"
                    >
                      <div>
                        <span className="text-sm font-bold text-white">{entry.term}</span>
                        {!isExpanded && (
                          <span className="ml-3 text-xs text-neutral-500">
                            {entry.definition.slice(0, 80)}...
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-neutral-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/10 px-5 py-4 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                            What is it?
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-neutral-300">
                            {entry.definition}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                            🍕 Real-world analogy
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-neutral-300">
                            {entry.analogy}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 rounded border border-white/10 bg-black px-3 py-2 text-[11px] text-neutral-400">
                          <span>📍 Used in:</span>
                          <span className="font-semibold text-white">{entry.usedIn}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="py-12 text-center text-neutral-500">
            <p className="text-lg">🔍</p>
            <p className="mt-2 text-sm">No terms found matching &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
