import { requireAdmin } from "@/lib/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell username={session.username}>{children}</AdminShell>;
}
