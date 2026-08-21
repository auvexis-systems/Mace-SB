import { getProfile } from "@/lib/data";
import { LegalPageLayout } from "@/components/public/legal-page";

export const metadata = { title: "Hinweis" };

export default async function DisclaimerPage() {
  const profile = await getProfile();
  return <LegalPageLayout title="Hinweis" content={profile.disclaimerText} />;
}
