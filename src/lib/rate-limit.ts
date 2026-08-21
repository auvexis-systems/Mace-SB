type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 10;

/**
 * In-memory rate limiter. Fine for a single-instance deployment; if this app
 * ever runs across multiple server instances, swap this for a shared store
 * (e.g. Redis) — noted as a known limitation for now.
 */
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > MAX_ATTEMPTS) return true;
  return false;
}
