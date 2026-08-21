"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Code ${code} kopieren`}
      className="flex items-center justify-between gap-2 w-full rounded-xl border border-dashed px-3 py-2 text-sm font-mono tracking-wide msb-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msb-accent)]"
      style={{ borderColor: "var(--msb-card-border)" }}
    >
      <span>{code}</span>
      <span className="flex items-center gap-1 text-xs msb-text-secondary">
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" /> Code kopiert
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" /> Kopieren
          </>
        )}
      </span>
    </button>
  );
}
