"use client";

import { useState, useCallback, createContext, useContext, useRef } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm muss innerhalb von ConfirmProvider verwendet werden.");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  function settle(value: boolean) {
    setOptions(null);
    resolverRef.current?.(value);
    resolverRef.current = null;
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14121e] p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  options.danger ? "bg-red-500/15 text-red-400" : "bg-violet-500/15 text-violet-400"
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 id="confirm-dialog-title" className="font-semibold text-white">
                  {options.title}
                </h2>
                {options.description && (
                  <p className="mt-1 text-sm text-white/60">{options.description}</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => settle(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5"
              >
                {options.cancelLabel || "Abbrechen"}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                autoFocus
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  options.danger ? "bg-red-600 hover:bg-red-500" : "bg-violet-600 hover:bg-violet-500"
                }`}
              >
                {options.confirmLabel || "Bestätigen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
