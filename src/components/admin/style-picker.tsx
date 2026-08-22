"use client";

import { CARD_STYLES } from "@/lib/card-styles";

export function StylePicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {CARD_STYLES.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onChange(s.key)}
          className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-colors ${
            value === s.key ? "border-white/40 bg-white/10" : "border-white/10 hover:bg-white/5"
          }`}
        >
          <span
            className="h-8 w-full rounded-lg"
            style={{ background: `linear-gradient(135deg, ${s.accent}, ${s.accent2})`, boxShadow: `0 0 10px ${s.glow}` }}
          />
          <span className="text-[11px] text-white/70">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
