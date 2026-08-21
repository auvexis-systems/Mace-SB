import { getProfile } from "@/lib/data";
import { LegalPageLayout } from "@/components/public/legal-page";

export const metadata = { title: "Kontakt" };

export default async function KontaktPage() {
  const profile = await getProfile();
  return <LegalPageLayout title="Kontakt" content={profile.kontaktText} />;
}
