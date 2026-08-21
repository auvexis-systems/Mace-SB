# MaceSlotsBonus

MaceSlotsBonus ist eine moderne Link-in-Bio-/Angebots-Seite mit geschütztem
Admin-Bereich. Diese Anleitung richtet sich an einen Betreiber ohne
Programmierkenntnisse.

> **Wichtig:** MaceSlotsBonus ist eine technische Plattform. Sie enthält
> ausschließlich fiktive Demo-Inhalte (z.B. "Demo Offer Alpha"). Es sind
> keine echten Glücksspielanbieter, Logos oder Affiliate-Links enthalten.
> Alle echten Inhalte müssen vom Betreiber selbst eingetragen werden.

## Inhaltsverzeichnis

1. [Was ist MaceSlotsBonus?](#was-ist-maceslotsbonus)
2. [Voraussetzungen](#voraussetzungen)
3. [Installation](#installation)
4. [Lokale Ausführung](#lokale-ausführung)
5. [Admin-Einrichtung & Login](#admin-einrichtung--login)
6. [Cards erstellen, bearbeiten, löschen](#cards-erstellen-bearbeiten-löschen)
7. [Kategorien](#kategorien)
8. [Design ändern](#design-ändern)
9. [Bilder](#bilder)
10. [Links & Tracking](#links--tracking)
11. [Analytics](#analytics)
12. [Backup](#backup)
13. [Deployment](#deployment)
14. [Environment-Variablen](#environment-variablen)
15. [Datenbank](#datenbank)
16. [Updates](#updates)
17. [Fehlerbehebung](#fehlerbehebung)
18. [Kundenübergabe-Checkliste](#kundenübergabe-checkliste)

## Was ist MaceSlotsBonus?

Eine öffentliche Profil-/Angebotsseite ("Link in Bio") mit hochwertigen
Angebots-Cards (Titel, Bild, Promo-Code, Preis, Call-to-Action) sowie einem
geschützten Admin-Bereich, in dem der Betreiber alle Inhalte, Kategorien,
Social Links und das Design selbst verwalten kann — ohne Programmierung.

## Voraussetzungen

- Windows 10/11
- [Node.js](https://nodejs.org) Version 20 oder neuer (inkl. npm)
- Ein Texteditor (optional, für die `.env`-Datei)

## Installation

1. Terminal (PowerShell) im Ordner `D:\MaceSlotsBonus` öffnen.
2. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

3. `.env.example` nach `.env` kopieren und `SESSION_SECRET` durch einen
   zufälligen, langen Wert ersetzen (mind. 32 Zeichen). Ein Beispiel lässt
   sich erzeugen mit:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Datenbank anlegen und mit Demo-Daten sowie einem Admin-Konto befüllen:

   ```bash
   npm run db:push
   npm run db:seed
   ```

   Beim ersten Ausführen wird automatisch ein Admin-Konto erstellt. Die
   Zugangsdaten werden in der Datei `ADMIN_CREDENTIALS.txt` im Projektordner
   gespeichert (nur beim ersten Seed, danach nicht mehr überschrieben).
   **Bitte das Passwort nach dem ersten Login ändern und diese Datei
   anschließend löschen.**

   Alternativ können eigene Zugangsdaten vorab per Umgebungsvariablen
   gesetzt werden (`ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) bevor
   `npm run db:seed` ausgeführt wird.

## Lokale Ausführung

Doppelklick auf `start-local.bat`, oder im Terminal:

```bash
npm run dev
```

Die Seite ist danach unter `http://localhost:3000` erreichbar, der
Admin-Bereich unter `http://localhost:3000/admin`.

## Admin-Einrichtung & Login

1. `http://localhost:3000/admin` öffnen — es erscheint automatisch die
   Login-Seite, falls nicht angemeldet.
2. Mit den Zugangsdaten aus `ADMIN_CREDENTIALS.txt` anmelden.
3. Passwort ändern: aktuell muss dies direkt in der Datenbank erfolgen
   (z.B. über `npm run db:studio`, Feld `passwordHash` mit einem neuen,
   bcrypt-gehashten Wert ersetzen) oder ein neuer Admin-Benutzer wird über
   ein eigenes Skript angelegt. Für Version 1.0 gibt es bewusst keine
   Passwort-Ändern-Oberfläche im UI (siehe "Bekannte Einschränkungen" in
   `PROJECT_STATUS.md`).

## Cards erstellen, bearbeiten, löschen

Im Admin-Bereich unter **Cards**:

- **Neue Card**: Button oben rechts. Titel, Kurzbeschreibung und Ziel-URL
  sind Pflichtfelder. Alle anderen Felder (Bild, Promo-Code, Preise, Badge,
  zweiter Button, Ablaufdatum, Hinweistext …) sind optional — leere Felder
  werden auf der öffentlichen Seite automatisch ausgeblendet.
- **Bearbeiten**: Stift-Symbol in der Card-Liste.
- **Duplizieren**: Kopier-Symbol — legt eine Kopie als Entwurf an.
- **Aktivieren/Deaktivieren**: Augen-Symbol — deaktivierte Cards
  verschwinden sofort von der öffentlichen Seite, bleiben aber im
  Admin-Bereich erhalten.
- **Hervorheben**: Stern-Symbol — aktiviert einen dezenten Glow-Effekt auf
  der öffentlichen Seite (Featured).
- **Löschen**: Papierkorb-Symbol (mit Sicherheitsabfrage) — permanent.
- **Sortieren**: per Drag & Handle (Griff-Symbol) oder mit den
  Pfeil-Buttons (barrierefrei, ohne Maus bedienbar).

Live-Vorschau: Beim Erstellen/Bearbeiten einer Card wird rechts (auf
Desktop) bzw. über den "Vorschau"-Button (auf Mobilgeräten) direkt
angezeigt, wie die Card später aussieht.

## Kategorien

Unter **Kategorien**: neue Kategorie anlegen (Name, Farbe, aktiv/inaktiv),
bearbeiten, per Pfeil-Buttons sortieren, löschen. Nur aktive Kategorien mit
mindestens einer veröffentlichten Card erscheinen im Filter der
öffentlichen Seite.

## Design ändern

Unter **Design**: Theme-Presets (Mace Dark, Midnight Glass, Neon Edge,
Royal Dark, Clean Light) mit einem Klick anwenden, danach beliebig
individuell anpassen (Hintergrund, Card-Stil, Farben, Buttons, Abstände,
Animationen). Änderungen werden automatisch gespeichert (kurze Verzögerung
nach der letzten Eingabe) und sind sofort auf der öffentlichen Seite
sichtbar. Rechts befindet sich eine Live-Vorschau.

## Bilder

Beim Card-Editor unter "Bild" per Klick hochladen (PNG, JPG oder WEBP,
max. 5 MB). Bilder werden lokal unter `public/uploads/` gespeichert. Für
ein Produktions-Deployment mit mehreren Server-Instanzen sollte dies auf
einen Cloud-Speicher (z.B. S3-kompatibel) umgestellt werden — die
entsprechende Stelle im Code ist zentral in `src/lib/storage.ts` gekapselt.

## Links & Tracking

Der Haupt-Button jeder Card führt über die interne Route `/go/[cardId]`
zum Ziel-Link. Dabei wird: die Card validiert, geprüft ob sie
veröffentlicht ist, ein Klick-Ereignis gespeichert, und erst danach
weitergeleitet. Ungültige oder deaktivierte Cards führen zurück auf die
Startseite statt zu einem Fehler.

## Analytics

Im **Dashboard**: aktive/inaktive Cards, Klicks gesamt/heute/7 Tage,
meistgeklickte Cards. Es werden pro Klick nur Card-ID, Zeitpunkt, gekürzter
Referrer und grober Gerätetyp gespeichert — keine vollständigen
IP-Adressen (stattdessen ein Einweg-Hash, siehe Sicherheitsreview in
`PROJECT_STATUS.md`).

## Backup

Die gesamte Anwendung besteht aus zwei Teilen, die gesichert werden
sollten:

1. **Datenbank**: Datei `prisma/dev.db` (SQLite). Einfach kopieren.
2. **Hochgeladene Bilder**: Ordner `public/uploads/`.

Beides regelmäßig an einem separaten Ort sichern (z.B. externe Festplatte,
Cloud-Speicher).

## Deployment

Diese Version wurde **nicht** eigenständig veröffentlicht (keine Domain,
kein Hosting-Vertrag wurde abgeschlossen). Für ein späteres Deployment:

1. Produktionsdatenbank vorbereiten (SQLite reicht für kleine Installationen;
   für mehr Traffic wird PostgreSQL empfohlen — das Prisma-Schema ist dafür
   vorbereitet, `provider` in `prisma/schema.prisma` müsste auf `postgresql`
   umgestellt werden).
2. `.env` auf dem Server mit echten Werten anlegen (siehe unten),
   insbesondere einen neuen, zufälligen `SESSION_SECRET`.
3. `npm run build` ausführen, danach `npm run start`.
4. Hinter einem Reverse Proxy mit HTTPS betreiben (z.B. nginx, Caddy, oder
   einen Hosting-Anbieter mit automatischem HTTPS).
5. `NODE_ENV=production` setzen, damit Cookies mit `secure`-Flag gesendet
   werden.

## Environment-Variablen

Siehe `.env.example`. Kurzüberblick:

| Variable | Zweck |
|---|---|
| `DATABASE_URL` | Verbindung zur Datenbank (lokal: `file:./dev.db`) |
| `SESSION_SECRET` | Geheimer Schlüssel zum Signieren der Admin-Session |
| `NEXT_PUBLIC_BASE_URL` | Öffentliche Basis-URL (für SEO/OG-Tags/Sitemap) |
| `NODE_ENV` | `development` lokal, `production` im Live-Betrieb |

## Datenbank

SQLite-Datei unter `prisma/dev.db`. Schema in `prisma/schema.prisma`.
Änderungen am Schema übernehmen mit:

```bash
npm run db:push
```

Datenbank per grafischer Oberfläche einsehen/bearbeiten:

```bash
npm run db:studio
```

## Updates

1. Vor jedem Update ein Backup (siehe oben) erstellen.
2. Neue Dateien in `D:\MaceSlotsBonus` einspielen.
3. `npm install` erneut ausführen (falls sich Abhängigkeiten geändert
   haben).
4. `npm run db:push` ausführen (übernimmt Schema-Änderungen, ohne
   bestehende Daten zu löschen).
5. `npm run build && npm run start` (Produktion) bzw. `npm run dev`
   (lokal).

## Fehlerbehebung

- **Seite lädt nicht**: Prüfen, ob `npm run dev` bzw. `npm run start` noch
  läuft und Port 3000 nicht durch eine andere Anwendung belegt ist.
- **Admin-Login funktioniert nicht**: `SESSION_SECRET` in `.env` muss
  gesetzt sein. Zugangsdaten aus `ADMIN_CREDENTIALS.txt` prüfen.
- **Bilder werden nicht angezeigt**: Prüfen, ob der Ordner
  `public/uploads/` existiert und beschreibbar ist.
- **Änderungen erscheinen nicht auf der Seite**: Browser-Cache leeren bzw.
  Seite neu laden (harte Aktualisierung, Strg+F5).
- **Datenbankfehler beim Start**: `npm run db:push` erneut ausführen.

## Kundenübergabe-Checkliste

Vor der Übergabe an den Betreiber bzw. vor dem Live-Gang bitte prüfen:

- [ ] Demo-Daten entfernt (Demo-Cards und Demo-Kategorien im Admin-Bereich
      löschen oder durch echte Inhalte ersetzen)
- [ ] Admin-Passwort geändert, `ADMIN_CREDENTIALS.txt` gelöscht
- [ ] Domain konfiguriert (DNS, `NEXT_PUBLIC_BASE_URL` angepasst)
- [ ] Produktionsdatenbank konfiguriert (SQLite-Backup-Strategie oder
      Umstieg auf PostgreSQL)
- [ ] Produktions-Secrets gesetzt (neuer `SESSION_SECRET`, `.env` niemals
      ins Git-Repository einchecken)
- [ ] Impressum eingetragen (Admin → Profil)
- [ ] Datenschutzerklärung eingetragen (Admin → Profil)
- [ ] Affiliate-Hinweis eingetragen, falls zutreffend (Admin → Profil)
- [ ] Alle Inhalte und Links geprüft (keine Platzhaltertexte mehr)
- [ ] Mobilansicht geprüft (375px, 390px, 430px)
- [ ] Desktopansicht geprüft
- [ ] Klick-Tracking funktioniert (Testklick im Dashboard sichtbar)
- [ ] Backup von Datenbank und `public/uploads/` erstellt

---

Weitere technische Details zum aktuellen Stand, Tests und bekannten
Einschränkungen: siehe [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).
