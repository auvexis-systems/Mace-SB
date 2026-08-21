import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/data";
import { ProfileForm } from "@/components/admin/profile-form";
import { SocialLinksManager } from "@/components/admin/social-links-manager";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const [profile, socialLinks] = await Promise.all([
    getProfile(),
    prisma.socialLink.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-sm text-white/50">Marke, Social Links, SEO und rechtliche Texte.</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Social Links</h2>
        <SocialLinksManager
          links={socialLinks.map((l) => ({ id: l.id, platform: l.platform, url: l.url, active: l.active }))}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Profil, SEO &amp; Rechtliches</h2>
        <ProfileForm profile={profile} />
      </section>
    </div>
  );
}
