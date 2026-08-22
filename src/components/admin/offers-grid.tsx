"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronUp, ChevronDown, Pencil, Copy, Trash2, Star, Eye, EyeOff, Plus } from "lucide-react";
import {
  deleteCardAction,
  duplicateCardAction,
  moveCardAction,
  reorderCardsAction,
  toggleCardFeaturedAction,
  toggleCardStatusAction,
} from "@/lib/actions/cards";
import { MediaMotifIcon } from "@/components/public/media-icon";
import { useToast } from "./toast-provider";
import { useConfirm } from "./confirm-dialog";

type OfferItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  mediaIconKey: string | null;
  categoryName: string | null;
  status: "DRAFT" | "PUBLISHED" | "DISABLED";
  featured: boolean;
  clicks: number;
  position: number;
};

const STATUS_LABEL: Record<OfferItem["status"], string> = {
  DRAFT: "Entwurf",
  PUBLISHED: "Veröffentlicht",
  DISABLED: "Deaktiviert",
};

function OfferCardRow({
  offer,
  index,
  total,
  onMove,
  onDeleted,
}: {
  offer: OfferItem;
  index: number;
  total: number;
  onMove: (id: string, dir: "up" | "down") => void;
  onDeleted: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: offer.id });
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleDelete() {
    const ok = await confirm({
      title: `"${offer.title}" wirklich löschen?`,
      description: "Dieses Angebot wird dauerhaft entfernt. Das kann nicht rückgängig gemacht werden.",
      confirmLabel: "Endgültig löschen",
      danger: true,
    });
    if (!ok) return;
    onDeleted(offer.id);
    startTransition(() => deleteCardAction(offer.id));
    showToast("Angebot gelöscht ✓");
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-3 sm:contents">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Verschieben"
          className="hidden shrink-0 cursor-grab text-white/30 hover:text-white/70 active:cursor-grabbing sm:block"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10 flex items-center justify-center">
          {offer.imageUrl ? (
            <Image src={offer.imageUrl} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <MediaMotifIcon iconKey={offer.mediaIconKey} className="h-6 w-6 text-white/40" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium">{offer.title}</span>
            {offer.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                offer.status === "PUBLISHED"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : offer.status === "DRAFT"
                  ? "bg-white/10 text-white/60"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {STATUS_LABEL[offer.status]}
            </span>
            <span>{offer.categoryName || "Ohne Kategorie"}</span>
            <span>{offer.clicks} Klicks</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 flex-wrap sm:shrink-0">
        <button
          type="button"
          disabled={index === 0 || pending}
          onClick={() => onMove(offer.id, "up")}
          aria-label="Nach oben"
          className="rounded-md p-2 text-white/50 hover:bg-white/10 disabled:opacity-20 sm:hidden"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={index === total - 1 || pending}
          onClick={() => onMove(offer.id, "down")}
          aria-label="Nach unten"
          className="rounded-md p-2 text-white/50 hover:bg-white/10 disabled:opacity-20 sm:hidden"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            startTransition(() =>
              toggleCardStatusAction(offer.id, offer.status === "PUBLISHED" ? "DISABLED" : "PUBLISHED")
            );
            showToast(offer.status === "PUBLISHED" ? "Angebot deaktiviert ✓" : "Angebot veröffentlicht ✓");
          }}
          aria-label={offer.status === "PUBLISHED" ? "Deaktivieren" : "Aktivieren"}
          className="rounded-md p-2 text-white/50 hover:bg-white/10"
          title={offer.status === "PUBLISHED" ? "Deaktivieren" : "Aktivieren"}
        >
          {offer.status === "PUBLISHED" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={() => startTransition(() => toggleCardFeaturedAction(offer.id, !offer.featured))}
          aria-label="Hervorheben"
          title="Hervorheben"
          className="rounded-md p-2 text-white/50 hover:bg-white/10"
        >
          <Star className={`w-4 h-4 ${offer.featured ? "fill-amber-400 text-amber-400" : ""}`} />
        </button>
        <Link
          href={`/admin/cards/${offer.id}`}
          aria-label="Bearbeiten"
          title="Bearbeiten"
          className="rounded-md p-2 text-white/50 hover:bg-white/10"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={() => {
            startTransition(() => duplicateCardAction(offer.id));
            showToast("Angebot dupliziert ✓");
          }}
          aria-label="Duplizieren"
          title="Duplizieren"
          className="rounded-md p-2 text-white/50 hover:bg-white/10"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Löschen"
          title="Löschen"
          className="rounded-md p-2 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function OffersGrid({ offers: initialOffers }: { offers: OfferItem[] }) {
  const [offers, setOffers] = useState(initialOffers);
  const [, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function flashSaved() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOffers((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const next = [...items];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      startTransition(() => reorderCardsAction(next.map((c) => c.id)));
      flashSaved();
      return next;
    });
  }

  function handleMove(id: string, dir: "up" | "down") {
    setOffers((items) => {
      const idx = items.findIndex((i) => i.id === id);
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= items.length) return items;
      const next = [...items];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
    startTransition(() => moveCardAction(id, dir));
    flashSaved();
  }

  function handleDeleted(id: string) {
    setOffers((items) => items.filter((i) => i.id !== id));
  }

  if (offers.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
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
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {savedFlash && (
        <p className="text-xs font-medium text-emerald-400" role="status">
          Reihenfolge gespeichert ✓
        </p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={offers.map((o) => o.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {offers.map((offer, index) => (
              <OfferCardRow
                key={offer.id}
                offer={offer}
                index={index}
                total={offers.length}
                onMove={handleMove}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
