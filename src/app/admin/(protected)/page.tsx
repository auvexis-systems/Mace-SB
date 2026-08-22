import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Plus, LayoutGrid, Palette, FileEdit, ExternalLink, Pencil } from "lucide-react";

export const metadata = { title: "Dashboard" };

function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Entwurf",
  PUBLISHED: "Veröffentlicht",
  DISABLED: "Deaktiviert",
};

export default async function AdminDashboardPage() {
  const [activeCount, draftCount, totalClicks, clicksToday, recentCards] = await Promise.all([
    prisma.card.count({ where: { status: "PUBLISHED" } }),
    prisma.card.count({ where: { status: "DRAFT" } }),
    prisma.clickEvent.count(),
    prisma.clickEvent.count({ where: { createdAt: { gte: startOfDay() } } }),
    prisma.card.findMany({
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, title: true, status: true, imageUrl: true },
    }),
  ]);

  const stats = [
    { label: "Aktive Angebote", value: activeCount },
    { label: "Entwürfe", value: draftCount },
    { label: "Klicks heute", value: clicksToday },
    { label: "Klicks insgesamt", value: totalClicks },
  ];

  const quickActions = [
    { href: "/admin/cards/new", label: "+ Neues Angebot", icon: Plus, primary: true },
    { href: "/admin/cards", label: "Meine Angebote", icon: LayoutGrid },
    { href: "/admin/profile", label: "Seite bearbeiten", icon: FileEdit },
    { href: "/admin/design", label: "Design ändern", icon: Palette },
    { href: "/", label: "Öffentliche Seite ansehen", icon: ExternalLink },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Willkommen zurück</h1>
        <p className="text-sm text-white/50">Hier ist der Überblick über deine Website.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-white/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-white/70">Schnellaktionen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              target={a.href === "/" ? "_blank" : undefined}
              className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-sm font-medium transition-colors ${
                a.primary
                  ? "border-violet-500/40 bg-violet-600/20 hover:bg-violet-600/30"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <a.icon className="w-5 h-5" /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-white/70">Zuletzt bearbeitet</h2>
        {recentCards.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
            Noch keine Angebote vorhanden.
            <div className="mt-3">
              <Link
                href="/admin/cards/new"
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500"
              >
                <Plus className="w-4 h-4" /> Erstes Angebot erstellen
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentCards.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cards/${c.id}`}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/10">
                  {c.imageUrl && <Image src={c.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-white/40">{STATUS_LABEL[c.status] ?? c.status}</p>
                </div>
                <Pencil className="h-4 w-4 shrink-0 text-white/20 group-hover:text-white/50" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
