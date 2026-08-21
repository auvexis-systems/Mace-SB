import { prisma } from "@/lib/prisma";
import { CardForm } from "@/components/admin/card-form";

export const metadata = { title: "Neue Card" };

export default async function NewCardPage() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Neue Card</h1>
        <p className="text-sm text-white/50">Erstellen Sie ein neues Angebot.</p>
      </div>
      <CardForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
