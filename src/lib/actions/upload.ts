"use server";

import { requireAdmin } from "@/lib/require-admin";
import { saveUploadedImage } from "@/lib/storage";

export type UploadState = { url: string | null; error: string | null };

export async function uploadImageAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { url: null, error: "Keine Datei erhalten." };
  }
  const result = await saveUploadedImage(file);
  if ("error" in result) return { url: null, error: result.error };
  return { url: result.url, error: null };
}
