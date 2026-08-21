"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a12] px-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
        <h1 className="text-lg font-semibold text-white">Etwas ist schiefgelaufen</h1>
        <p className="max-w-xs text-sm text-white/60">
          Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
