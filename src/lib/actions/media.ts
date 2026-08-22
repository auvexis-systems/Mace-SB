"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { saveUploadedImage } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export type UploadMediaState = { error: string | null };

export async function uploadMediaAction(
  _prev: UploadMediaState,
  formData: FormData
): Promise<UploadMediaState> {
  const session = await requireAdmin();
  const file = formData.get("file");
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "sonstiges");

  if (!(file instanceof File)) {
    return { error: "Keine Datei erhalten." };
  }

  const result = await saveUploadedImage(file);
  if ("error" in result) return { error: result.error };

  await prisma.mediaAsset.create({
    data: {
      name: name || file.name.replace(/\.[a-zA-Z0-9]+$/, ""),
      category,
      fileUrl: result.url,
      accent: "accent",
      source: "upload",
      isSystemAsset: false,
      uploadedBy: session.userId,
    },
  });

  revalidatePath("/admin/media");
  return { error: null };
}

export async function deleteMediaAssetAction(id: string) {
  await requireAdmin();
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset || asset.isSystemAsset) return; // system motifs can never be deleted
  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
}
