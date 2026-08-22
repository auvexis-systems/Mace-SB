"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast } from "./toast-provider";

const MESSAGES: Record<string, string> = {
  created: "Angebot gespeichert ✓",
  published: "Angebot veröffentlicht ✓",
  saved: "Änderungen gespeichert ✓",
};

/** Shows a toast once based on a one-shot query param, then strips it from the URL. */
export function ToastFromQuery() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  useEffect(() => {
    for (const key of Object.keys(MESSAGES)) {
      if (params.get(key) === "1") {
        showToast(MESSAGES[key]);
        router.replace(pathname);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
