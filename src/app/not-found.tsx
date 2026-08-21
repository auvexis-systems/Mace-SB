import Link from "next/link";

export default function NotFound() {
  return (
    <div className="msb-page flex min-h-dvh items-center justify-center px-4">
      <div className="msb-card relative z-10 flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-5xl font-bold msb-accent">404</p>
        <h1 className="text-lg font-semibold msb-text-primary">Seite nicht gefunden</h1>
        <p className="max-w-xs text-sm msb-text-secondary">
          Die angeforderte Seite existiert nicht oder wurde entfernt.
        </p>
        <Link href="/" className="msb-btn-primary mt-2 px-5 py-2.5 text-sm font-semibold">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
