const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function isSafeUrl(value: string): boolean {
  if (!value || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return ALLOWED_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

export function safeUrlOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  return isSafeUrl(value) ? value : null;
}
