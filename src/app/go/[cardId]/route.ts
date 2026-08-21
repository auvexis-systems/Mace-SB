import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSafeUrl } from "@/lib/url";
import { detectDeviceType, hashIp } from "@/lib/tracking";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;

  const card = await prisma.card.findUnique({ where: { id: cardId } });

  if (!card || card.status !== "PUBLISHED" || !isSafeUrl(card.ctaUrl)) {
    return NextResponse.redirect(new URL("/?ungueltig=1", request.url));
  }

  const userAgent = request.headers.get("user-agent");
  const referrer = request.headers.get("referer");
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  await prisma.clickEvent.create({
    data: {
      cardId: card.id,
      referrer: referrer ? referrer.slice(0, 300) : null,
      deviceType: detectDeviceType(userAgent),
      ipHash: hashIp(ip),
    },
  });

  return NextResponse.redirect(card.ctaUrl, { status: 302 });
}
