import crypto from "node:crypto";
import type { DeviceType } from "@/generated/prisma";

export function detectDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return "UNKNOWN";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return "TABLET";
  if (/mobi|android|iphone|ipod/.test(ua)) return "MOBILE";
  if (/mozilla|chrome|safari|firefox|edg/.test(ua)) return "DESKTOP";
  return "UNKNOWN";
}

/** One-way hash so we never persist raw IP addresses. */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.SESSION_SECRET || "fallback-salt";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
