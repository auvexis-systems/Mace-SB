"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Nach oben scrollen"
      className="msb-back-to-top fixed bottom-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full msb-text-primary sm:bottom-8 sm:right-8"
    >
      <ArrowUp className="h-4.5 w-4.5" />
    </button>
  );
}
