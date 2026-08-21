import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export type UploadResult = { url: string } | { error: string };

/**
 * Local filesystem storage under public/uploads. Kept behind this single
 * function so it can be swapped for a cloud storage SDK (S3, R2, ...)
 * without touching callers.
 */
export async function saveUploadedImage(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) return { error: "Keine Datei ausgewaehlt." };
  if (file.size > MAX_BYTES) return { error: "Datei ist zu gross (max. 5 MB)." };

  const ext = ALLOWED_MIME[file.type];
  if (!ext) return { error: "Nicht unterstuetzter Dateityp (nur PNG, JPG, WEBP)." };

  const buffer = Buffer.from(await file.arrayBuffer());

  // Basic magic-byte sanity check to reduce risk of mislabeled uploads.
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
  const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isRiff = buffer.slice(0, 4).toString("ascii") === "RIFF"; // webp container
  if (
    (file.type === "image/png" && !isPng) ||
    (file.type === "image/jpeg" && !isJpg) ||
    (file.type === "image/webp" && !isRiff)
  ) {
    return { error: "Datei entspricht nicht dem angegebenen Bildformat." };
  }

  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return { url: `/uploads/${filename}` };
}
