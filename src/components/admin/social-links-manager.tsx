"use client";

import { useActionState, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { upsertSocialLinkAction, deleteSocialLinkAction, type SocialFormState } from "@/lib/actions/social";
import { PLATFORM_LABELS } from "@/components/public/social-icon";

type SocialLink = { id: string; platform: string; url: string; active: boolean };

const PLATFORMS = Object.keys(PLATFORM_LABELS);
const initialState: SocialFormState = { error: null };

function AddForm() {
  const [action, formAction, pending] = useActionState(upsertSocialLinkAction.bind(null, null), initialState);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/50">Plattform</label>
        <select name="platform" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm">
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
        <label className="text-xs text-white/50">URL / E-Mail</label>
        <input
          name="url"
          required
          placeholder="https://…"
          className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-center gap-1.5 pb-2.5 text-sm text-white/70">
        <input type="checkbox" name="active" defaultChecked /> Aktiv
      </label>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500 disabled:opacity-60"
      >
        <Plus className="w-4 h-4" /> Hinzufügen
      </button>
      {action.error && <p className="w-full text-sm text-red-400">{action.error}</p>}
    </form>
  );
}

export function SocialLinksManager({ links: initialLinks }: { links: SocialLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <AddForm />
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium shrink-0">
                {PLATFORM_LABELS[link.platform] || link.platform}
              </span>
              <span className="truncate text-sm text-white/70">{link.url}</span>
              {!link.active && <span className="text-xs text-white/30 shrink-0">(inaktiv)</span>}
            </div>
            <button
              type="button"
              onClick={() => {
                setLinks((items) => items.filter((l) => l.id !== link.id));
                startTransition(() => deleteSocialLinkAction(link.id));
              }}
              aria-label="Löschen"
              className="shrink-0 rounded-md p-1.5 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {links.length === 0 && <p className="text-sm text-white/40">Noch keine Social Links.</p>}
      </div>
    </div>
  );
}
