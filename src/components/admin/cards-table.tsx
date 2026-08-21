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
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Pencil,
  Copy,
  Trash2,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  deleteCardAction,
  duplicateCardAction,
  moveCardAction,
  reorderCardsAction,
  toggleCardFeaturedAction,
  toggleCardStatusAction,
} from "@/lib/actions/cards";

type CardRow = {
  id: string;
  title: string;
  imageUrl: string | null;
  categoryName: string | null;
  status: "DRAFT" | "PUBLISHED" | "DISABLED";
  featured: boolean;
  clicks: number;
  position: number;
};

const STATUS_LABEL: Record<CardRow["status"], string> = {
  DRAFT: "Entwurf",
  PUBLISHED: "Veröffentlicht",
  DISABLED: "Deaktiviert",
};

function SortableRow({
  card,
  index,
  total,
  onMove,
}: {
  card: CardRow;
  index: number;
  total: number;
  onMove: (id: string, dir: "up" | "down") => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });
  const [pending, startTransition] = useTransition();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-white/5 last:border-0">
      <td className="px-3 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Verschieben"
          className="cursor-grab text-white/30 hover:text-white/70 active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-3 py-3">
        <div className="w-12 h-8 rounded-md overflow-hidden bg-white/10 relative shrink-0">
          {card.imageUrl && (
            <Image src={card.imageUrl} alt="" fill sizes="48px" className="object-cover" />
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{card.title}</span>
          {card.featured && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
        </div>
        <span className="text-xs text-white/40">{card.categoryName || "Ohne Kategorie"}</span>
      </td>
      <td className="px-3 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            card.status === "PUBLISHED"
              ? "bg-emerald-500/15 text-emerald-400"
              : card.status === "DRAFT"
              ? "bg-white/10 text-white/60"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {STATUS_LABEL[card.status]}
        </span>
      </td>
      <td className="px-3 py-3 text-right">{card.clicks}</td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1 flex-wrap">
          <button
            type="button"
            disabled={index === 0 || pending}
            onClick={() => onMove(card.id, "up")}
            aria-label="Nach oben"
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10 disabled:opacity-20"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={index === total - 1 || pending}
            onClick={() => onMove(card.id, "down")}
            aria-label="Nach unten"
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10 disabled:opacity-20"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              startTransition(() =>
                toggleCardStatusAction(card.id, card.status === "PUBLISHED" ? "DISABLED" : "PUBLISHED")
              )
            }
            aria-label={card.status === "PUBLISHED" ? "Deaktivieren" : "Aktivieren"}
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10"
          >
            {card.status === "PUBLISHED" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => startTransition(() => toggleCardFeaturedAction(card.id, !card.featured))}
            aria-label="Hervorheben"
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10"
          >
            <Star className={`w-4 h-4 ${card.featured ? "fill-amber-400 text-amber-400" : ""}`} />
          </button>
          <Link
            href={`/admin/cards/${card.id}`}
            aria-label="Bearbeiten"
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => startTransition(() => duplicateCardAction(card.id))}
            aria-label="Duplizieren"
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`"${card.title}" wirklich löschen?`)) {
                startTransition(() => deleteCardAction(card.id));
              }
            }}
            aria-label="Löschen"
            className="rounded-md p-1.5 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CardsTable({ cards: initialCards }: { cards: CardRow[] }) {
  const [cards, setCards] = useState(initialCards);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCards((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const next = [...items];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      startTransition(() => reorderCardsAction(next.map((c) => c.id)));
      return next;
    });
  }

  function handleMove(id: string, dir: "up" | "down") {
    setCards((items) => {
      const idx = items.findIndex((i) => i.id === id);
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= items.length) return items;
      const next = [...items];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
    startTransition(() => moveCardAction(id, dir));
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white/50">
              <th className="px-3 py-2 font-medium"></th>
              <th className="px-3 py-2 font-medium">Bild</th>
              <th className="px-3 py-2 font-medium">Titel</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-right">Klicks</th>
              <th className="px-3 py-2 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {cards.map((card, index) => (
                <SortableRow key={card.id} card={card} index={index} total={cards.length} onMove={handleMove} />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
    </div>
  );
}
