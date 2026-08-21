import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin-Login" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0a0a12] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">MaceSlotsBonus</h1>
          <p className="mt-1 text-sm text-white/50">Admin-Anmeldung</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
