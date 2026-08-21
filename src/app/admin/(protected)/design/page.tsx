import { prisma } from "@/lib/prisma";
import { getDesignConfig, getProfile } from "@/lib/data";
import { DesignEditor } from "@/components/admin/design-editor";

export const metadata = { title: "Design" };

export default async function DesignPage() {
  const [design, profile, themes] = await Promise.all([
    getDesignConfig(),
    getProfile(),
    prisma.themePreset.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Design</h1>
        <p className="text-sm text-white/50">Passen Sie das Erscheinungsbild Ihrer öffentlichen Seite an.</p>
      </div>
      <DesignEditor
        initialDesign={design}
        activeThemeId={profile.activeThemeId}
        themes={themes.map((t) => ({ id: t.id, name: t.name }))}
        brandName={profile.brandName}
      />
    </div>
  );
}
