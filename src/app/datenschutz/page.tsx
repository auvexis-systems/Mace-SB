import { getProfile } from "@/lib/data";
import { LegalPageLayout } from "@/components/public/legal-page";

export const metadata = { title: "Datenschutz" };

export default async function DatenschutzPage() {
  const profile = await getProfile();
  return <LegalPageLayout title="Datenschutz" content={profile.datenschutzText} />;
}
