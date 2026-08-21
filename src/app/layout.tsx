import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getProfile } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const title = profile.seoTitle || profile.brandName;
  const description = profile.seoDescription || profile.description || "MaceSlotsBonus";

  return {
    metadataBase: new URL(baseUrl),
    title: { default: title, template: `%s · ${profile.brandName}` },
    description,
    robots: profile.robotsIndex ? "index, follow" : "noindex, nofollow",
    alternates: profile.canonicalUrl ? { canonical: profile.canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      images: profile.ogImageUrl ? [profile.ogImageUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: profile.ogImageUrl ? [profile.ogImageUrl] : undefined,
    },
    icons: profile.avatarUrl ? [{ rel: "icon", url: profile.avatarUrl }] : undefined,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-geist-sans)" }}>
        {children}
      </body>
    </html>
  );
}
