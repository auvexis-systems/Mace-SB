import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_DESIGN, BUILT_IN_THEMES } from "../src/lib/design";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedAdmin() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log(`Admin-Benutzer existiert bereits: ${existing.username}`);
    return;
  }

  const username = process.env.ADMIN_USERNAME || "admin";
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { username, email, passwordHash, role: "ADMIN" },
  });

  if (!process.env.ADMIN_PASSWORD) {
    const credFile = path.join(__dirname, "..", "ADMIN_CREDENTIALS.txt");
    const content = `MaceSlotsBonus – generierte Admin-Zugangsdaten\n\nBenutzername: ${username}\nE-Mail: ${email}\nPasswort: ${password}\n\nWICHTIG: Bitte nach dem ersten Login das Passwort aendern und diese Datei loeschen.\n`;
    fs.writeFileSync(credFile, content, "utf-8");
    console.log("Admin-Benutzer erstellt. Zugangsdaten wurden in ADMIN_CREDENTIALS.txt gespeichert.");
  } else {
    console.log(`Admin-Benutzer '${username}' erstellt (Passwort aus ADMIN_PASSWORD env).`);
  }
}

async function seedProfile() {
  const existing = await prisma.profileSettings.findUnique({ where: { id: "singleton" } });
  if (existing) return;
  await prisma.profileSettings.create({
    data: {
      id: "singleton",
      brandName: "MaceSlotsBonus",
      description: "Kuratierte Demo-Angebote an einem Ort. Bitte durch echte Inhalte ersetzen.",
      noticeText: "Dies ist eine Demo-Installation mit Platzhalterinhalten.",
      designConfig: JSON.stringify(DEFAULT_DESIGN),
      seoTitle: "MaceSlotsBonus",
      seoDescription: "Kuratierte Angebote an einem Ort.",
    },
  });
}

async function seedThemes() {
  for (const theme of BUILT_IN_THEMES) {
    await prisma.themePreset.upsert({
      where: { name: theme.name },
      update: { config: JSON.stringify(theme.config), isBuiltIn: true },
      create: { name: theme.name, config: JSON.stringify(theme.config), isBuiltIn: true },
    });
  }
}

async function seedCategoriesAndCards() {
  const count = await prisma.card.count();
  if (count > 0) return;

  const categoryNames = ["Neu", "Beliebt", "Empfehlung"];
  const categories = [];
  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    const cat = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), position: i, active: true },
    });
    categories.push(cat);
  }

  const demoCards = [
    {
      title: "Demo Offer Alpha",
      shortDesc: "Fiktives Beispielangebot fuer Testzwecke.",
      longDesc:
        "Dies ist ein Platzhalter-Angebot. Ersetzen Sie Titel, Bild, Beschreibung und Link durch Ihre echten Inhalte im Admin-Bereich.",
      badge: "Neu",
      promoCode: "DEMO10",
      newPrice: "10% Bonus",
      ctaText: "Angebot ansehen",
      ctaUrl: "https://example.com/demo-alpha",
      tags: ["demo", "einsteiger"],
      featured: true,
      status: "PUBLISHED" as const,
      categoryId: categories[0].id,
      position: 0,
    },
    {
      title: "Demo Offer Nova",
      shortDesc: "Ein weiteres fiktives Beispielangebot.",
      badge: "Beliebt",
      newPrice: "50 Freispiele*",
      hint: "*Fiktiver Platzhaltertext, durch echte Bedingungen ersetzen.",
      ctaText: "Mehr erfahren",
      ctaUrl: "https://example.com/demo-nova",
      tags: ["demo"],
      status: "PUBLISHED" as const,
      categoryId: categories[1].id,
      position: 1,
    },
    {
      title: "Demo Offer Pulse",
      shortDesc: "Beispiel fuer eine Karte mit Rabatt-Darstellung.",
      oldPrice: "49€",
      newPrice: "29€",
      discountText: "-40%",
      ctaText: "Jetzt sichern",
      ctaUrl: "https://example.com/demo-pulse",
      tags: ["demo", "rabatt"],
      status: "PUBLISHED" as const,
      categoryId: categories[1].id,
      position: 2,
    },
    {
      title: "Demo Offer Prime",
      shortDesc: "Beispiel fuer eine hervorgehobene Karte.",
      badge: "Empfehlung",
      featured: true,
      ctaText: "Ansehen",
      ctaUrl: "https://example.com/demo-prime",
      tags: ["demo", "premium"],
      status: "PUBLISHED" as const,
      categoryId: categories[2].id,
      position: 3,
    },
  ];

  for (const card of demoCards) {
    await prisma.card.create({
      data: { ...card, tags: JSON.stringify(card.tags) },
    });
  }
}

async function main() {
  await seedAdmin();
  await seedProfile();
  await seedThemes();
  await seedCategoriesAndCards();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
