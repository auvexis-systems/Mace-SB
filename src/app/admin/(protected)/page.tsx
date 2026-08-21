import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, LayoutGrid, Palette, UserCog, FolderKanban, ExternalLink } from "lucide-react";

export const metadata = { title: "Dashboard" };

function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboardPage() {
  const [activeCount, draftCount, disabledCount, totalClicks, clicksToday, clicks7d, topCards] =
    await Promise.all([
      prisma.card.count({ where: { status: "PUBLISHED" } }),
      prisma.card.count({ where: { status: "DRAFT" } }),
      prisma.card.count({ where: { status: "DISABLED" } }),
      prisma.clickEvent.count(),
      prisma.clickEvent.count({ where: { createdAt: { gte: startOfDay() } } }),
      prisma.clickEvent.count({ where: { createdAt: { gte: daysAgo(7) } } }),
      prisma.card.findMany({
        orderBy: { clicks: { _count: "desc" } },
        take: 5,
        select: { id: true, title: true, status: true, _count: { select: { clicks: true } } },
      }),
    ]);

  const stats = [
    { label: "Aktive Cards", value: activeCount },
    { label: "Entwuerfe", value: draftCount },
    { label: "Deaktivierte Cards", value: disabledCount },
    { label: "Klicks gesamt", value: totalClicks },
    { label: "Klicks heute", value: clicksToday },
    { label: "Klicks letzte 7 Tage", value: clicks7d },
  ];

  const quickActions = [
    { href: "/admin/cards/new", label: "Neue Card", icon: Plus },
    { href: "/admin/cards", label: "Cards verwalten", icon: LayoutGrid },
    { href: "/admin/design", label: "Design bearbeiten", icon: Palette },
    { href: "/admin/profile", label: "Profil bearbeiten", icon: UserCog },
    { href: "/admin/categories", label: "Kategorien", icon: FolderKanban },
    { href: "/", label: "Öffentliche Seite", icon: ExternalLink },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-white/50">Überblick über MaceSlotsBonus.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-white/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-white/70">Schnellaktionen</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              target={a.href === "/" ? "_blank" : undefined}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <a.icon className="w-4 h-4" /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-white/70">Meistgeklickte Cards</h2>
        {topCards.length === 0 ? (
          <p className="text-sm text-white/40">Noch keine Klicks erfasst.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="px-4 py-2 font-medium">Card</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium text-right">Klicks</th>
                </tr>
              </thead>
              <tbody>
                {topCards.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-2">{c.title}</td>
                    <td className="px-4 py-2 text-white/50">{c.status}</td>
                    <td className="px-4 py-2 text-right font-semibold">{c._count.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
