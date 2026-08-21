import { getProfile } from "@/lib/data";
import { LegalPageLayout } from "@/components/public/legal-page";

export const metadata = { title: "Affiliate-Hinweis" };

export default async function AffiliateHinweisPage() {
  const profile = await getProfile();
  return <LegalPageLayout title="Affiliate-Hinweis" content={profile.affiliateText} />;
}
