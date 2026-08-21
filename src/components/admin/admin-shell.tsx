"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LayoutGrid,
  FolderKanban,
  Palette,
  UserCog,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cards", label: "Cards", icon: LayoutGrid },
  { href: "/admin/categories", label: "Kategorien", icon: FolderKanban },
  { href: "/admin/design", label: "Design", icon: Palette },
  { href: "/admin/profile", label: "Profil", icon: UserCog },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-violet-600 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="w-4.5 h-4.5" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#0b0b14] text-white">
      <div className="flex flex-col md:flex-row min-h-dvh">
        <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-white/10 md:p-4 md:gap-1">
          <div className="px-2 py-3 mb-2">
            <p className="font-bold text-lg">MaceSlotsBonus</p>
            <p className="text-xs text-white/40">Admin-Bereich</p>
          </div>
          <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-white/10">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="w-4.5 h-4.5" /> Öffentliche Seite
            </a>
            <p className="px-3 py-1 text-xs text-white/30">{username}</p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="w-4.5 h-4.5" /> Abmelden
              </button>
            </form>
          </div>
        </aside>

        <header className="flex items-center justify-between border-b border-white/10 p-4 md:hidden">
          <p className="font-bold">MaceSlotsBonus</p>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="rounded-lg p-2 hover:bg-white/10"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="flex flex-col gap-1 border-b border-white/10 p-4 md:hidden">
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5"
            >
              <ExternalLink className="w-4.5 h-4.5" /> Öffentliche Seite
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5"
              >
                <LogOut className="w-4.5 h-4.5" /> Abmelden
              </button>
            </form>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
