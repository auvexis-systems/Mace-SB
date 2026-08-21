"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { OfferCard, type PublicCardData } from "./offer-card";
import { ScrollReveal } from "./scroll-reveal";

type CategoryOption = { id: string; name: string; color: string | null };

export function OffersExplorer({
  cards,
  categories,
  searchEnabled,
  showClicks,
}: {
  cards: PublicCardData[];
  categories: CategoryOption[];
  searchEnabled: boolean;
  showClicks: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let result = cards;
    if (activeCategory) {
      result = result.filter((c) => c.category?.id === activeCategory);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((c) => {
        const haystack = [c.title, c.shortDesc, c.badge || "", ...c.tags].join(" ").toLowerCase();
        return haystack.includes(q);
      });
    }
    return result;
  }, [cards, activeCategory, query]);

  return (
    <div className="flex flex-col">
      {searchEnabled && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 msb-text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Angebote durchsuchen…"
            aria-label="Angebote durchsuchen"
            className="msb-card w-full pl-10 pr-10 py-3 text-sm msb-text-primary placeholder:msb-text-secondary bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msb-accent)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Suche zuruecksetzen"
              className="absolute right-3 top-1/2 -translate-y-1/2 msb-text-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {categories.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto msb-no-scrollbar pb-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === null ? "msb-btn-primary msb-filter-active" : "msb-card msb-text-primary"
            }`}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === cat.id ? "msb-btn-primary msb-filter-active" : "msb-card msb-text-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="msb-card mt-6 p-10 text-center msb-text-secondary">
          Keine Angebote gefunden.
        </div>
      ) : (
        <div className="msb-offers-grid mt-6">
          {filtered.map((card, i) => (
            <ScrollReveal key={card.id} delayMs={(i % 4) * 70}>
              <OfferCard card={card} showClicks={showClicks} accentIndex={i} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
