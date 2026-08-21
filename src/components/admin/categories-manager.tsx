"use client";

import { useActionState, useState, useTransition } from "react";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  type CategoryFormState,
} from "@/lib/actions/categories";

type Category = {
  id: string;
  name: string;
  color: string | null;
  active: boolean;
  cardCount: number;
};

const initialState: CategoryFormState = { error: null };

function EditRow({ category, onCancel }: { category: Category; onCancel: () => void }) {
  const boundAction = updateCategoryAction.bind(null, category.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/5 p-3">
      <input
        name="name"
        defaultValue={category.name}
        required
        className="rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-violet-400"
      />
      <input
        name="color"
        type="color"
        defaultValue={category.color || "#7c5cff"}
        className="h-8 w-10 rounded border border-white/15 bg-black/30"
      />
      <label className="flex items-center gap-1.5 text-sm text-white/70">
        <input type="checkbox" name="active" defaultChecked={category.active} /> Aktiv
      </label>
      <button type="submit" disabled={pending} className="rounded-md p-1.5 text-emerald-400 hover:bg-white/10">
        <Check className="w-4 h-4" />
      </button>
      <button type="button" onClick={onCancel} className="rounded-md p-1.5 text-white/50 hover:bg-white/10">
        <X className="w-4 h-4" />
      </button>
      {state.error && <p className="w-full text-xs text-red-400">{state.error}</p>}
    </form>
  );
}

export function CategoriesManager({ categories: initialCategories }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [createState, createAction, createPending] = useActionState(createCategoryAction, initialState);

  function move(id: string, dir: "up" | "down") {
    setCategories((items) => {
      const idx = items.findIndex((i) => i.id === id);
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= items.length) return items;
      const next = [...items];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      startTransition(() => reorderCategoriesAction(next.map((c) => c.id)));
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        action={createAction}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Name</label>
          <input
            name="name"
            required
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/50">Farbe</label>
          <input name="color" type="color" defaultValue="#7c5cff" className="h-9 w-12 rounded border border-white/15 bg-black/30" />
        </div>
        <label className="flex items-center gap-1.5 pb-2.5 text-sm text-white/70">
          <input type="checkbox" name="active" defaultChecked /> Aktiv
        </label>
        <button
          type="submit"
          disabled={createPending}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500 disabled:opacity-60"
        >
          <Plus className="w-4 h-4" /> Hinzufügen
        </button>
        {createState.error && <p className="w-full text-sm text-red-400">{createState.error}</p>}
      </form>

      <div className="flex flex-col gap-2">
        {categories.length === 0 && <p className="text-sm text-white/40">Noch keine Kategorien.</p>}
        {categories.map((cat, index) =>
          editingId === cat.id ? (
            <EditRow key={cat.id} category={cat} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={cat.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: cat.color || "#7c5cff" }}
                  aria-hidden="true"
                />
                <span className="font-medium">{cat.name}</span>
                <span className="text-xs text-white/40">{cat.cardCount} Cards</span>
                {!cat.active && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">Inaktiv</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(cat.id, "up")}
                  className="rounded-md p-1.5 text-white/50 hover:bg-white/10 disabled:opacity-20"
                  aria-label="Nach oben"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={index === categories.length - 1}
                  onClick={() => move(cat.id, "down")}
                  className="rounded-md p-1.5 text-white/50 hover:bg-white/10 disabled:opacity-20"
                  aria-label="Nach unten"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(cat.id)}
                  className="rounded-md p-1.5 text-white/50 hover:bg-white/10"
                  aria-label="Bearbeiten"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Kategorie "${cat.name}" wirklich löschen?`)) {
                      startTransition(() => deleteCategoryAction(cat.id));
                      setCategories((items) => items.filter((c) => c.id !== cat.id));
                    }
                  }}
                  className="rounded-md p-1.5 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                  aria-label="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
