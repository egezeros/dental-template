/**
 * Tiny fixed-window rate limiter (per server instance). Enough to slow down form
 * spam and password guessing on a small clinic site; use a shared store
 * (e.g. Upstash) if you ever need limits across instances.
 */
const g = globalThis as unknown as { __rateLimits?: Map<string, { count: number; resetAt: number }> };

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  g.__rateLimits ??= new Map();
  const buckets = g.__rateLimits;
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count++;
  return bucket.count <= limit;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
