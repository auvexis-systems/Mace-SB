import { getProfile } from "@/lib/data";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-sm text-white/50">Zusätzliche Seiten und Suchmaschinen-Optionen.</p>
      </div>

      <SettingsForm
        settings={{
          seoTitle: profile.seoTitle,
          seoDescription: profile.seoDescription,
          canonicalUrl: profile.canonicalUrl,
          robotsIndex: profile.robotsIndex,
          impressumText: profile.impressumText,
          datenschutzText: profile.datenschutzText,
          affiliateText: profile.affiliateText,
          kontaktText: profile.kontaktText,
          disclaimerText: profile.disclaimerText,
          showImpressumLink: profile.showImpressumLink,
          showDatenschutzLink: profile.showDatenschutzLink,
          showAffiliateLink: profile.showAffiliateLink,
          showKontaktLink: profile.showKontaktLink,
          showDisclaimerLink: profile.showDisclaimerLink,
        }}
      />
    </div>
  );
}
