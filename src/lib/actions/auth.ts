"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isRateLimited } from "@/lib/rate-limit";

export type LoginState = { error: string | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(`login:${ip}`)) {
    return { error: "Zu viele Anmeldeversuche. Bitte spaeter erneut versuchen." };
  }

  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Bitte Benutzername/E-Mail und Passwort angeben." };
  }

  const { identifier, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
    },
  });

  // Constant-shape response: don't reveal whether the account exists.
  const genericError = "Benutzername/E-Mail oder Passwort ist falsch.";

  if (!user) {
    return { error: genericError };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: genericError };
  }

  await setSessionCookie({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
