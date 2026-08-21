import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDesignConfig } from "@/lib/data";
import { designToCssVars } from "@/lib/design";

export async function LegalPageLayout({
  title,
  content,
}: {
  title: string;
  content: string | null;
}) {
  const design = await getDesignConfig();
  const cssVars = designToCssVars(design) as React.CSSProperties;

  return (
    <div className="msb-page" style={cssVars}>
      <main
        className="relative z-10 mx-auto flex w-full flex-col gap-6 px-4 py-10 sm:py-14"
        style={{ maxWidth: "var(--msb-max-width)" }}
      >
        <Link href="/" className="flex items-center gap-1.5 text-sm msb-text-secondary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Zurueck
        </Link>
        <div className="msb-card p-6">
          <h1 className="text-xl font-bold msb-text-primary">{title}</h1>
          {content ? (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed msb-text-secondary">
              {content}
            </div>
          ) : (
            <p className="mt-4 text-sm italic msb-text-secondary">
              Dieser Bereich wurde vom Betreiber noch nicht ausgefuellt. Dies ist kein
              Rechtstext — der Betreiber muss eigene, rechtsgueltige Inhalte im Admin-Bereich
              unter „Profil“ eintragen.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
