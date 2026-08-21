import { getProfile } from "@/lib/data";
import { LegalPageLayout } from "@/components/public/legal-page";

export const metadata = { title: "Impressum" };

export default async function ImpressumPage() {
  const profile = await getProfile();
  return <LegalPageLayout title="Impressum" content={profile.impressumText} />;
}
