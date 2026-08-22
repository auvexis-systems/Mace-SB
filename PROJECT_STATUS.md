# MaceSlotsBonus — Projektstatus

Stand: 2026-08-22 (v1.0 Kernversion, v1.1 Visual & Motion Upgrade, v1.2 Referenzbild-Feinabstimmung, v1.3 Visueller Neuaufbau, Admin 2.0 No-Code CMS, Media Pack v1.0 Import)

## Stabile Online-Baseline (Tag `mace-v1.3-online-baseline`)

- Render-Deployment funktioniert (Build, `render:init`, Start).
- Admin-Login funktioniert.
- Öffentliche Seite funktioniert.
- 4 Demo-Cards vorhanden.
- Dieser Tag ist der stabile Rücksetzpunkt vor Admin 2.0.

## Implementiert

### Öffentliche Seite
- Profil-Header (Logo/Avatar, Name, Beschreibung, Hinweistext, Social Links, Teilen-Button)
- Angebots-Cards mit allen spezifizierten optionalen Feldern (Bild, Badge, Promo-Code
  mit Copy-Button, alter/neuer Preis, Rabatttext, Ablaufdatum, Hinweis, Tags,
  zweiter Button, Featured-Glow) — leere Felder werden nicht als leere UI-Bereiche
  angezeigt
- Kategorie-Filter ("Alle" + aktive Kategorien, horizontal scrollbar, ohne Reload)
- Suchfunktion (Titel/Beschreibung/Badge/Tags, ohne Reload, ein-/ausschaltbar)
- Promo-Code-Copy via Clipboard API mit Feedback ("Code kopiert")
- Rechtsseiten: Impressum, Datenschutz, Affiliate-Hinweis, Kontakt, Hinweis/Disclaimer
  (zeigen Platzhaltertext, solange der Betreiber nichts eingetragen hat)
- SEO: dynamische Meta-Tags, Open Graph, robots.txt, sitemap.xml
- Responsive, mobile-first, Premium-Dark-Design mit Glassmorphism/Glow/Animationen
  (deaktivierbar, respektiert `prefers-reduced-motion`)
- 404- und globale Fehlerseite

### Admin-Bereich (`/admin`, geschützt)
- Login (Benutzername/E-Mail + Passwort), Logout, Session-Cookie (httpOnly, signiert)
- Dashboard: aktive/Entwurf/deaktivierte Cards, Klicks gesamt/heute/7 Tage,
  meistgeklickte Cards, Schnellaktionen
- Card-CMS: erstellen, bearbeiten, duplizieren, aktivieren/deaktivieren, hervorheben,
  löschen, sortieren (Drag & Drop via dnd-kit + barrierefreie Pfeil-Buttons),
  Live-Vorschau im Editor
- Bild-Upload (PNG/JPG/WEBP, MIME- und Magic-Byte-Prüfung, Größenlimit, Alt-Text)
- Kategorien: erstellen, bearbeiten, sortieren, aktivieren/deaktivieren, löschen
- Design-Editor: Hintergrund (einfarbig/Gradient/Bild), Card-Stil, Text-, Button- und
  Akzentfarben, Layout-Parameter, Animationen an/aus, 5 Theme-Presets, automatisches
  Speichern, Live-Vorschau
- Profil: Marke, Beschreibung, Hinweistext, Toggles (Teilen/Suche/öffentliche Klicks),
  SEO-Felder, rechtliche Textfelder (Impressum, Datenschutz, Affiliate, Kontakt,
  Disclaimer)
- Social Links: Instagram, TikTok, YouTube, X, Twitch, Discord, Telegram, Facebook,
  Website, E-Mail

### Tracking & Analytics
- Interne Redirect-Route `/go/[cardId]`: validiert Card + Status + Ziel-URL, speichert
  Klick-Ereignis, leitet erst dann weiter; ungültige/deaktivierte Cards landen sicher
  auf der Startseite statt in einem Fehler
- Gespeicherte Klick-Daten: Card-ID, Zeitpunkt, gekürzter Referrer, grober Gerätetyp
  (Mobile/Tablet/Desktop), Einweg-Hash der IP (keine Klartext-IP-Speicherung)

### Sicherheit
- Passwörter mit bcrypt gehasht (Faktor 12), nie im Klartext geloggt
- Session als signiertes JWT (HS256, `jose`) im httpOnly-Cookie, `secure` in Produktion
- `SESSION_SECRET` ausschließlich über Environment-Variable, `.env.example` ohne echte
  Secrets
- Zod-Validierung serverseitig für alle Formulare (zusätzlich zu HTML5-Validierung
  clientseitig)
- URL-Validierung: nur `http:`, `https:`, `mailto:` erlaubt (blockiert `javascript:`,
  `data:`, `file:` etc.) — sowohl bei Card-CTAs als auch bei Social Links
- Bild-Upload: MIME-Type-Prüfung, Magic-Byte-Prüfung, Größenlimit (5 MB), zufällig
  generierte Dateinamen
- Adminbereich serverseitig geschützt (Layout-Guard) **und** zusätzlich per
  Proxy/Middleware (`src/proxy.ts`) als zweite Verteidigungslinie
- Rate-Limiting für Login-Versuche (in-memory, 10 Versuche/10 Minuten je IP)
- Generische Fehlermeldung bei Login (kein Hinweis, ob Benutzername existiert)
- Security-Header (X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
  Permissions-Policy) auf allen Seiten
- Keine rohen Stacktraces für Endnutzer (eigene 404-/Error-Seiten)

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Server Actions) mit Turbopack
- **React 19**
- **Tailwind CSS 4**
- **Prisma 6** + SQLite (lokal), Schema PostgreSQL-ready (Provider-Wechsel genügt)
- **Zod** für Validierung
- **jose** (JWT-Session) + **bcryptjs** (Passwort-Hashing) — bewusst ohne größeres
  Auth-Framework, um die Abhängigkeitsliste klein zu halten
- **dnd-kit** für Drag-and-Drop-Sortierung
- **lucide-react** für Icons (Hinweis: aktuelle Version enthält keine Marken-/Logo-Icons
  mehr, Social-Icons nutzen daher neutrale Ersatzsymbole statt Plattform-Logos)
- **tsx** für Seed-Skript und Test-Ausführung ohne zusätzlichen Test-Runner

Hinweis zur Prisma-Version: Bewusst Prisma 6 statt 7 verwendet, da Prisma 7 für SQLite
zwingend einen Driver-Adapter voraussetzt (zusätzliche native Abhängigkeit unter
Windows). Prisma 6 deckt die Anforderungen vollständig ab und ist wartungsärmer.

## Projektstruktur

```
src/
  app/                    Next.js App Router (öffentliche Seiten, /admin, /go/[cardId])
  components/
    public/               Öffentliche UI-Komponenten (Cards, Header, Suche, Icons)
    admin/                Admin-UI-Komponenten (Formulare, Tabellen, Editoren)
  lib/
    actions/               Server Actions (Cards, Kategorien, Profil, Social, Upload, Auth)
    auth.ts, session-token.ts   Session-/Passwort-Logik
    design.ts               Design-Konfiguration, Presets, CSS-Variablen-Mapping
    validation.ts            Zod-Schemas
    storage.ts               Bild-Upload (lokal, austauschbar)
    tracking.ts               Geräte-/IP-Hash-Logik
  tests/                   Unit- und Integrationstests
prisma/
  schema.prisma            Datenmodell
  seed.ts                  Demo-Daten, Admin-Konto, Theme-Presets
public/uploads/            Hochgeladene Bilder (lokal)
```

## Tests

Ausgeführt mit `npm run test` (Node.js Test Runner via `tsx`) — **29/29 Tests
bestanden**:

- URL-Validierung (sichere/unsichere Schemes, inkl. `javascript:`-Blockierung)
- Passwort-Hashing- und Session-Token-Rundlauf, Manipulationserkennung
- Zod-Validierung für Card-, Kategorie- und Login-Formulare
- Geräte-Erkennung (Mobile/Tablet/Desktop) und IP-Hashing (keine Klartext-IP)
- Design-Konfiguration (Fallback bei ungültigem JSON, Merge mit Defaults)
- Datenbank-Integrationstests (temporäre SQLite-Instanz): Card-Erstellung im
  Entwurfsstatus, Veröffentlichen/Deaktivieren inkl. sofortiger Sichtbarkeitsänderung
  im öffentlichen Feed, Sortierung/Reorder, Löschen, Promo-Code-Rundlauf, aktive vs.
  inaktive Kategorien, Klick-Ereignis-Erfassung

Zusätzlich manueller End-to-End-Check im Browser durchgeführt (siehe unten).

## Manueller UI-Check (durchgeführt)

- Produktions-nahe Vorschau via `npm run dev`, echte Browser-Interaktion
- Öffentliche Seite: Demo-Cards, Kategorie-Filter, Copy-Code-Button — funktionsfähig,
  keine Konsolenfehler, keine fehlgeschlagenen Netzwerk-Requests
- Admin-Login mit generierten Zugangsdaten erfolgreich, Dashboard zeigt korrekte
  Live-Zahlen (inkl. tatsächlich getrackter Testklick)
- Card-Deaktivierung: Card verschwindet sofort von der öffentlichen Seite (inkl.
  Kategorie-Filter, wenn dadurch keine sichtbare Card mehr in der Kategorie ist)
- Neue Card erstellt (Titel, Kurzbeschreibung, Ziel-URL, Status "Veröffentlicht") —
  erscheint korrekt in Admin-Liste und öffentlicher Seite, anschließend wieder entfernt
- Design-Editor: Theme-Preset "Royal Dark" angewendet, Änderung serverseitig
  gespeichert und auf der öffentlichen Seite (CSS-Variablen) sofort sichtbar
- Tracking-Redirect `/go/[cardId]` geprüft: leitet zur echten Ziel-URL weiter,
  Klick-Ereignis wird mit gehashter IP gespeichert; ungültige Card-ID leitet sicher
  zur Startseite um (kein Fehlerabsturz)
- Mobilansicht (375×812) geprüft: kein horizontales Scrollen auf öffentlicher Seite
  und im Card-Editor, mobiles Hamburger-Menü im Admin-Bereich vorhanden
- 404-Seite für unbekannte Routen funktioniert

## Security-Review

Durchgeführt vor Fertigstellung, siehe Abschnitt "Sicherheit" oben für umgesetzte
Maßnahmen. Verbleibende Risiken/Hinweise:

- **Rate-Limiting ist in-memory**: schützt einen einzelnen Serverprozess, aber nicht
  über mehrere Instanzen hinweg (z.B. hinter einem Load Balancer). Für den
  Ein-Instanz-Betrieb, für den diese Version ausgelegt ist, ausreichend.
- **Kein Passwort-Reset-/Ändern-UI**: In v1.0 bewusst nicht enthalten, um Umfang zu
  begrenzen (siehe "Bekannte Einschränkungen"). Passwortänderung aktuell nur über
  direkten Datenbankzugriff.
- **Uploads liegen im `public/`-Ordner**: für den lokalen/Ein-Server-Betrieb passend;
  bei einem Umstieg auf mehrere Server-Instanzen oder verteiltes Hosting sollte auf
  Cloud-Storage umgestellt werden (Anpassungspunkt ist zentral in `src/lib/storage.ts`).
- **SQLite** ist nicht für gleichzeitige Schreibzugriffe vieler Nutzer ausgelegt —
  für diese Anwendung (ein Admin-Nutzer) unkritisch, für stark wachsenden Traffic wird
  der Wechsel zu PostgreSQL empfohlen.

## Deployment

**Nicht durchgeführt.** Es wurde keine Domain registriert, kein Hosting-Vertrag
abgeschlossen und keine externe Veröffentlichung vorgenommen — wie vom Auftraggeber
vorgegeben. Die Anwendung ist deploymentfähig vorbereitet:

- Production Build läuft fehlerfrei (`npm run build`)
- `.env.example` dokumentiert alle benötigten Variablen
- Empfohlene nächste Schritte stehen in der README unter "Deployment"

Der finale externe Deployment-Schritt (Domain, Hosting, DNS) erfolgt erst nach
ausdrücklicher Freigabe durch den Auftraggeber.

## Bekannte Einschränkungen

- Kein UI zum Ändern des Admin-Passworts oder Anlegen weiterer Admin-Benutzer
  (aktuell nur ein Admin-Konto, Änderung nur über Datenbank/Skript)
- Social-Icons sind neutrale Ersatzsymbole statt Marken-Logos, da die aktuell
  installierte `lucide-react`-Version keine Markenzeichen mehr enthält
- Kein automatisierter End-to-End-Browsertest (z.B. Playwright) eingerichtet — der
  End-to-End-Check wurde manuell im Rahmen dieser Übergabe durchgeführt, nicht als
  wiederholbares Testskript
- Zweiter CTA-Button einer Card wird nicht über die Klick-Statistik erfasst (nur der
  Haupt-Button läuft über `/go/[cardId]`)
- Bild-Upload ist lokal (kein Cloud-Storage angebunden); Architektur ist dafür
  vorbereitet, aber nicht implementiert
- Kein Passwort-Reset-Mechanismus (z.B. per E-Mail) — für diese Betreiber-geführte
  Installation bewusst ausgelassen

## Empfohlene spätere Erweiterungen (nach Priorität)

1. UI zum Ändern des Admin-Passworts (kleine, aber sinnvolle Sicherheitsverbesserung)
2. Automatisierte E2E-Tests mit Playwright für die wichtigsten Nutzerflüsse
3. Cloud-Storage-Anbindung für Bild-Uploads, falls Mehr-Server-Betrieb geplant ist
4. Umstieg auf PostgreSQL, sobald der Traffic wächst
5. Klick-Tracking auch für den zweiten CTA-Button
6. Mehrsprachigkeit (aktuell rein deutschsprachige Oberfläche)

## Betreiber-Aufgaben

Siehe README.md, Abschnitt "Kundenübergabe-Checkliste" — insbesondere:

- Demo-Inhalte durch echte Angebote ersetzen
- Admin-Passwort ändern, `ADMIN_CREDENTIALS.txt` löschen
- Impressum, Datenschutzerklärung, Affiliate-Hinweis (falls zutreffend) mit
  rechtsgültigen, selbst geprüften Texten eintragen — MaceSlotsBonus liefert keine
  Rechtstexte
- Domain und Produktions-Secrets für ein tatsächliches Deployment einrichten
- Regelmäßige Backups von Datenbank und hochgeladenen Bildern einplanen

---

# v1.1 Visual & Motion Upgrade

Gezielter Visual-/Motion-/UX-Polish-Pass auf Basis der funktionierenden v1.0-Anwendung.
Kein Neubau: Datenbank, Authentifizierung, Card-CMS, Tracking und Server Actions
wurden nicht angetastet — nur öffentliche UI-Komponenten, Styling, ein neues
Casino-Hintergrundsystem und die zugehörigen Design-Editor-Einstellungen kamen hinzu.
Alle Prisma-Schemaänderungen waren additiv (nur neue Spalten mit Defaults); bestehende
Cards, Kategorien, Klick-Daten und das Admin-Konto blieben unverändert erhalten.

## Neue visuelle Komponenten

- **Mace-Logo** (`src/components/public/mace-logo.tsx`): eigenständiges, generisches
  "M"-Monogramm mit angedeutetem Karten-/Spade-Motiv, violett-magenta Gradient-Glow.
  Ersetzt den bisherigen Buchstaben-Platzhalter im Profil-Header.
- **Casino-Hintergrundszene** (`casino-scene.tsx`): mehrschichtige, generische
  Casino-Deko (Spielkarten, Pokerchips, Würfel, 777-Slot-Reel, Crown, Spade) als
  eigenständig gestaltete SVG-Formen — kein Screenshot, keine fremden Assets, keine
  echten Glücksspiel-Logos.
- **Partikelsystem** (`particle-field.tsx`): leichtgewichtiges DOM-/CSS-Partikelfeld
  (violett/magenta/gold), Anzahl abhängig von Intensität-Einstellung und Viewport.
- **Scroll-Reveal** (`scroll-reveal.tsx`): IntersectionObserver-basiertes Einblenden
  der Offer-Cards beim ersten Eintritt in den Viewport (nur einmalig, kein Re-Trigger).
- **Back-to-Top-Button** (`back-to-top.tsx`): erscheint ab definierter Scrolltiefe,
  Glass-Look mit violettem Glow.
- **Motion-/Media-Hilfsfunktionen** (`lib/motion.ts`, `lib/hooks/use-media.ts`): reine,
  getestete Funktionen für Parallax-Bereichsberechnung sowie ein
  `useSyncExternalStore`-basierter Media-Query-Hook (hydration-sicher für
  `prefers-reduced-motion` und `pointer: coarse`).

## Parallax-System

- Scroll- und Mausposition werden per `requestAnimationFrame`-gedrosseltem,
  passivem Event-Listener erfasst und als CSS-Custom-Properties auf einen einzigen
  Container geschrieben (`--msb-scene-scroll`, `--msb-scene-mouse-x/y`). Einzelne
  Deko-Objekte lesen diese Werte über `calc()` und ein eigenes `--depth`
  (0.12–0.75), sodass weiter entfernte Objekte sich langsamer bewegen als nahe.
- Es gibt bewusst **eine** rAF-Schleife und **einen** Satz Event-Listener für die
  gesamte Szene statt pro Objekt — vermeidet unnötige Re-Renders und Layout Thrashing.
- Mausbewegung wird auf Geräten mit grobem Zeigemedium (`pointer: coarse`, i.d.R.
  Touch) nicht erfasst.
- Parallax-Stärke ist im Design-Editor konfigurierbar (0–100).

## Floating Objects & Partikel

- Casino-Objekte floaten dauerhaft sehr langsam (5–16 s Zyklus, versetzte
  `animation-delay`-Werte je Objekt), damit kein erkennbar synchroner Loop entsteht.
- Partikel nutzen goldene-Winkel-Verteilung (deterministisch, kein `Math.random()` im
  Server-Render, damit keine Hydration-Mismatches entstehen) mit individueller Größe,
  Deckkraft, Drift und Pulsieren.

## Card-Microinteractions

- Hover (Desktop, `@media (hover: hover)`): Card hebt sich ~4 px, Border hellt sich
  auf, Schatten verstärkt sich, Bild skaliert leicht (`.msb-card-image`).
- Featured Cards erhalten einen langsam wandernden, konischen Border-Glow (`@property
  --msb-border-angle` + `conic-gradient`-Animation), Intensität über
  `glowIntensity` im Design-Editor steuerbar.
- Primärer CTA-Button besitzt einen dezenten, wiederkehrenden Shine-Sweep
  (`.msb-btn-shine`, alle 6 s ein kurzer Lichtstreifen statt Dauerschleife).
- Aktive Kategorie-Filter erhalten einen Glow-Ring (`.msb-filter-active`).

## Responsive Anpassungen

- Card-Grid: 1 Spalte (Mobile) → 2 Spalten (Tablet/mittlerer Desktop) → 4 Spalten
  (breiter Desktop, ab `xl`), geprüft bei 375 px, 430 px, 768 px, 1440 px — kein
  horizontales Scrollen an keinem Breakpoint.
- Standard-Inhaltsbreite von 640 px auf 1240 px angehoben (im Design-Editor nun bis
  1400 px einstellbar), damit die vierspaltige Card-Reihe auf breiten Bildschirmen
  tatsächlich Platz hat.
- Casino-Deko-Objekte werden über `hideOnMobile`/`hideOnTablet`-Flags responsiv
  reduziert; Partikelanzahl sinkt auf Mobile automatisch (`particleCountFor`).

## Performance-Maßnahmen

- Ausschließlich `transform`/`opacity`-Animationen (keine Layout-auslösenden
  Properties), ein gemeinsamer rAF-Loop statt vieler einzelner.
- `IntersectionObserver` statt Scroll-Polling für Card-Reveals.
- Passive Event-Listener für Scroll/Mouse.
- Partikelzahl bewusst niedrig gehalten (16 Desktop/6 Mobile bei "niedrig", 26/10 bei
  "mittel") — kein Canvas/WebGL, reine DOM-/CSS-Lösung.
- Casino-Hintergrund und Partikel sind vollständig deaktivierbar (Design-Editor) und
  werden bei den Themes, die dafür nicht gedacht sind (Clean Light), standardmäßig
  automatisch deaktiviert ausgeliefert.

## Reduced-Motion-Unterstützung

- `usePrefersReducedMotion()` (hydration-sicherer `useSyncExternalStore`-Hook)
  deaktiviert Parallax-Listener, Partikel-Rendering und Scroll-Reveal-Animationen
  vollständig, sobald `prefers-reduced-motion: reduce` aktiv ist.
- Zusätzliche CSS-Absicherung über `@media (prefers-reduced-motion: reduce)`:
  Floating-, Border-Glow-, Shine- und Partikel-Animationen werden hart deaktiviert,
  Scroll-Reveal-Elemente sind sofort sichtbar. Die Seite bleibt in jedem Fall
  vollständig nutzbar.

## Neue Design-Editor-Einstellungen

Neuer Abschnitt "Casino-Hintergrund & Bewegung" im Admin-Design-Editor:

- Casino-Hintergrund aktiv/inaktiv
- Parallax-Stärke (0–100)
- Partikel aktiv/inaktiv
- Partikelintensität (niedrig/mittel)
- Glow-Intensität (0–100)
- Sekundärer Akzent (Magenta/Pink-Ton)
- Featured-Farbe (Gold-Ton für hervorgehobene Cards)

Diese Felder sind Teil des bestehenden `DesignConfig`-JSON-Objekts (rückwärtskompatibel
über `parseDesignConfig`, das fehlende Felder aus gespeicherten Alt-Konfigurationen mit
den neuen Defaults auffüllt). "Mace Dark" ist weiterhin das Standardtheme, jetzt mit
aktivierter Casino-Szene; "Clean Light" deaktiviert Casino-Hintergrund und Partikel
automatisch, da für dieses helle Theme nicht passend.

## Footer-Konfiguration

Fünf neue boolesche Felder auf `ProfileSettings` (additive Migration:
`showImpressumLink`, `showDatenschutzLink`, `showAffiliateLink`, `showKontaktLink`,
`showDisclaimerLink`, alle `@default(true)`), im Admin unter Profil → "Footer-Links"
einstellbar. Deaktivierte Links verschwinden nur aus dem Footer — die zugehörigen
Seiten bleiben unter ihrer URL weiterhin direkt erreichbar. Manuell im Browser
verifiziert: Toggle deaktiviert → Link verschwindet aus dem Footer, Seite selbst
bleibt unter `/affiliate-hinweis` erreichbar.

## Nebenbei behobener Fehler (im Rahmen des Visual-Passes gefunden)

Beim manuellen Konsolen-Check fiel ein aus v1.0 stammendes Hydration-Problem in der
Card-Tabelle auf: `dnd-kit`s `DndContext` rendert ein verstecktes Beschreibungs-`<div>`,
das als direktes Kind von `<table>` landete (ungültiges HTML, da `<table>` nur
`<thead>/<tbody>/<tr>` etc. als Kinder erlaubt) und dadurch bei jedem Laden einen
Hydration-Mismatch in der Konsole erzeugte. Behoben durch Umstellung der
Komponentenstruktur in `cards-table.tsx`: `<DndContext>` umschließt jetzt die gesamte
`<table>` statt zwischen `<table>` und `<tbody>` zu sitzen. Funktional keine Änderung
(Drag-and-Drop, Sortierung, Pfeil-Buttons unverändert getestet), aber die Konsole ist
jetzt sauber.

## Tests (v1.1)

Zusätzlich zu den 29 bestehenden v1.0-Tests kamen hinzu (insgesamt **35/35 bestanden**):

- `motion.test.ts`: `clamp`, `lerp`, `particleCountFor` (bleibt in leichtgewichtigem
  Bereich, reduziert auf Mobile), `parallaxRangeFor` (Clamping 0–100)
- `design.test.ts` (erweitert): neue v1.1-Felder in `DEFAULT_DESIGN` vorhanden und
  aktiviert; "Clean Light"-Preset deaktiviert Casino-Hintergrund/Partikel

`npm run lint`, `npm run typecheck`, `npm run test` und `npm run build` liefen nach
Abschluss aller Änderungen fehlerfrei durch.

## Manueller Browser-Check (v1.1)

Durchgeführt über `npm run dev` mit echten Browser-Interaktionen:

- Homepage: Mace-Logo, Casino-Szene (10 Deko-Objekte + 2 Glow-Blobs auf Desktop,
  automatisch reduziert auf Mobile/Tablet), 16 Partikel (Desktop, Intensität
  "niedrig") — alle `aria-hidden`, keine Beeinträchtigung der Bedienbarkeit oder
  Screenreader-Struktur (per Accessibility-Tree geprüft)
- Card-Grid: 4 Spalten bei 1440 px (eine Reihe für 4 Demo-Cards), 2 Spalten bei
  768 px, 1 Spalte bei 375 px — kein horizontales Scrollen an keinem Breakpoint
- Theme-Presets: "Clean Light" angewendet → Casino-Szene und Partikel verschwinden
  automatisch; zurück zu "Mace Dark" → beides wieder aktiv
- Footer-Link-Toggle: "Affiliate-Hinweis" im Profil deaktiviert → Link verschwindet
  aus dem Footer, Seite bleibt direkt erreichbar; anschließend zurückgesetzt
- Admin-Bereich (Dashboard, Cards, Design, Profil) nach allen Änderungen weiterhin
  funktionsfähig, keine Konsolenfehler
- CSS-Formel des Parallax-Systems isoliert verifiziert (Custom-Property-Vererbung,
  `calc()`-Berechnung liefert exakt erwartete Werte bei manuell gesetzten
  Test-Variablen)

**Bekannte Einschränkung des Testprozesses:** Der automatisierte Browser in dieser
Entwicklungsumgebung lief in einem nicht sichtbaren/nicht kompositierenden Tab
(`document.hidden === true`). Dadurch pausieren Browser `requestAnimationFrame` und
CSS-Transitions vollständig (Standardverhalten aller gängigen Browser für
Hintergrund-Tabs) — die tatsächliche *Bewegung* von Scroll-/Maus-Parallax und
Floating-Objekten ließ sich in dieser Sitzung deshalb nicht Frame für Frame
live beobachten. Stattdessen wurden Formel, Vererbungskette und Event-Wiring einzeln
isoliert verifiziert (siehe oben) sowie die zugrundeliegenden reinen Funktionen
unit-getestet. Empfehlung: vor Kundenübergabe einmal kurz in einem echten,
sichtbaren Browser-Tab (normale Nutzung, `npm run dev` + Seite tatsächlich anschauen)
gegenprüfen, dass sich Parallax und Floating-Animationen wie erwartet flüssig
bewegen — der Code folgt einem Standard-React-Muster (addEventListener in
`useEffect`, rAF-Drosselung, CSS-Custom-Properties), das Risiko eines tatsächlichen
Laufzeitfehlers wird als gering eingeschätzt, aber eine visuelle Ansicht in einem
echten Tab wurde in dieser Sitzung nicht erreicht.

## Betreiber-Hinweis (v1.1)

Die Live-Demo-Instanz wurde im Rahmen dieses Passes auf die neuen Design-Defaults
zurückgesetzt (u. a. `maxContentWidth` von 640 px auf 1240 px), damit die neue
vierspaltige Card-Ansicht sofort sichtbar ist. Falls der Betreiber das Design bereits
manuell angepasst hatte, wurde dieser Stand überschrieben — da es sich um die
Demo-/Testinstallation ohne reale Betreiberkonfiguration handelte, war dies
unkritisch. Bei einer produktiven Installation mit bereits vom Betreiber angepasstem
Design würde dieser Schritt nicht automatisch durchgeführt.

---

# v1.2 Referenzbild-Feinabstimmung

Gezielter Abgleich der öffentlichen Seite gegen ein vom Auftraggeber bereitgestelltes
Referenzbild (Layout, Farben, Typografie, Abstände, Card-Reihe). Nur öffentliche
UI-Komponenten und Styling geändert — Admin, Auth, Datenbankschema (bis auf die bereits
in v1.1 additiv ergänzten Felder), Server Actions, Tracking und Card-CMS unverändert.

## Geänderte Werte (Design-Defaults)

- Kartenrundung: 20px → 16px
- Kartenabstand: 18px → 24px
- Karten-Innenabstand: 20px (`p-5`) → 24px (`p-6`)
- Max. Inhaltsbreite: 1240px → 1280px
- Primärakzent (Violett): `#7c5cff` → `#8b3eff`
- Sekundärakzent (Magenta/Pink): `#ff5ec4` → `#ff2d95`
- Featured-Farbe (Gold): `#e2b84f` → `#f0b840`
- Text-Primärfarbe: `#f5f5fa` → `#ffffff`; Text-Sekundärfarbe: `#a3a3b8` → `#a1a1aa`
- Card-Hover-Anhebung: `-4px` → `-6px`
- Card-Titel: `text-lg font-semibold` (18px/600) → `text-xl font-bold` (20px/700)

Hinweis zu Farbwerten: Die im Referenzbild abgedruckten Hex-Codes waren in der
Bildvorlage teils nur 5-stellig bzw. abgeschnitten lesbar (z. B. "#8A3E2",
"#FF2D9"). Es wurden plausible, vollständige 6-stellige Werte in unmittelbarer
Nähe der abgebildeten Farbtöne gewählt; ein exakter Pixel-für-Pixel-Farbabgleich
war anhand der Bildvorlage nicht zuverlässig möglich.

## Card-Grid: einheitliche Höhen und exakte Spaltenzahl

Die im Auftrag ausdrücklich genannte uneinheitliche Card-Höhe war ein reales Problem:
Die Karten füllten ihre Grid-Zelle nicht vollständig aus. Behoben durch `h-full` auf
dem Scroll-Reveal-Wrapper und der Card selbst, sodass jede Card die volle Höhe ihrer
Grid-Zeile einnimmt (Button bleibt per `mt-auto` unten verankert). Ergebnis: alle
Cards einer Reihe sind jetzt exakt gleich hoch (im Test: 4 Cards à 437px bei 1440px
Breite, identischer `top`-Wert).

Zusätzlich wurde ein Bug im responsiven Grid gefunden und behoben: Ein
Tailwind-Arbitrary-Breakpoint (`min-[1400px]:grid-cols-4`) landete an einer anderen
Stelle in der kompilierten Stylesheet-Kaskade als der reguläre `md:grid-cols-2`
(768px), sodass bei Viewport-Breiten über 1400px beide Media Queries gleichzeitig
zutrafen und die spätere Regel (2 Spalten) fälschlich gewann — auf breiten
Bildschirmen erschienen nur 2 statt 4 Spalten. Behoben durch eine eigene,
unlayerte CSS-Klasse (`.msb-offers-grid`) mit expliziten `@media`-Breakpoints bei
768px und 1400px, die deterministisch und unabhängig von Tailwinds interner
Regel-Reihenfolge funktioniert. Breakpoints exakt wie gefordert: Desktop ≥1400px
= 4 Spalten, Tablet/mittlerer Desktop 768–1399px = 2 Spalten, Mobile <768px =
1 Spalte.

## Hero-Struktur überarbeitet

`ProfileHeader` in zwei Bereiche aufgeteilt, wie im Referenzbild:

1. **Top-Bar**: kleines Logo + Markenname links, Social Icons + Teilen-Button rechts.
2. **Zentrierter Hero-Block**: großes Logo (72px), Titel groß (36px mobil / 64px
   Desktop, Gewicht 800), Untertitel, optionales Badge, vierteilige Vorteile-Zeile.

Der Titel färbt sich automatisch zweifarbig (weiß + Akzentfarbe), wenn der
Markenname mit "Mace" beginnt — für den Standardnamen "MaceSlotsBonus" ergibt das
exakt "Mace" (weiß) + "SlotsBonus" (violett) wie im Referenzbild. Bei einem vom
Betreiber frei gewählten, abweichenden Markennamen wird stattdessen der gesamte
Titel einheitlich in Weiß dargestellt (kein hartkodiertes Aufbrechen fremder Namen).

Das Highlight-Badge nutzt das bereits bestehende, CMS-editierbare `noticeText`-Feld
(Admin → Profil) — kein neues Datenbankfeld nötig. Erscheint nur, wenn der Betreiber
einen Text hinterlegt hat; mit Flammen-Icon und Farbverlauf-Hintergrund gestaltet.

Die vierteilige Vorteile-Zeile ("Beste Boni", "Sichere Anbieter", "Aktuelle
Angebote", "Exklusive Vorteile") ist als statischer, generischer Vertrauens-Hinweis
umgesetzt (kein CMS-Feld, rein dekorativ passend zum Referenzbild) — bewusst nicht
an eine neue Datenbanktabelle gebunden, um keine unnötige Architekturänderung
einzuführen.

## "Mehr Angebote laden"

Rein clientseitige Anzeige-Erweiterung in `OffersExplorer`: initial werden 8 Cards
gezeigt, ein Klick auf "Mehr Angebote laden" blendet die nächsten 8 ein. Keine
Backend-/Server-Action-Änderung — alle veröffentlichten Cards werden weiterhin wie
zuvor serverseitig geladen, nur die Anzeige wird client-seitig limitiert. Filter-
und Suchänderungen setzen die Anzeige zurück auf 8.

## Tests & Quality Gate

Keine neue testbare Kernlogik in diesem Pass (reine Layout-/Styling-Änderungen plus
eine clientseitige Slice-Anzeige ohne eigene Randfall-Logik, die einen zusätzlichen
Unit-Test rechtfertigen würde). Alle 35 bestehenden Tests laufen weiterhin fehlerfrei.
`npm run lint`, `npm run typecheck`, `npm run test` und `npm run build` wurden nach
Abschluss aller Änderungen erneut vollständig und fehlerfrei ausgeführt.

## Browser-Check (v1.2)

Durchgeführt mit `npm run dev` und echten Browser-Interaktionen, in einem frischen
Tab (leere Konsole als Ausgangspunkt):

- 1440px: 4 Spalten, alle Cards exakt gleich hoch (437px), gleicher `top`-Wert —
  Grid-Bug live gefunden und behoben (siehe oben)
- 768px: 2 Spalten, kein horizontales Scrollen
- 430px und 375px: 1 Spalte, kein horizontales Scrollen, Hero-Titel exakt 36px
- Hero-Struktur (Top-Bar, großes Logo, zweifarbiger Titel, Badge, Vorteile-Zeile)
  über Accessibility-Tree und gezielte DOM-Abfragen verifiziert
- Admin-Bereich (Dashboard, Cards) nach den Änderungen weiterhin ohne Konsolenfehler
  erreichbar, bestehende Session blieb gültig
- Keine Konsolenfehler auf der öffentlichen Seite bei keinem geprüften Breakpoint

Die Live-Demo-Instanz wurde erneut auf die neuen Design-Defaults zurückgesetzt
(gleiche Begründung wie in v1.1: eigene Test-/Demo-Konfiguration, keine reale
Betreiberanpassung vorhanden).

---

# v1.2.1 Feinkorrektur nach direktem Referenzvergleich

Reiner Nachschärf-Pass auf Basis eines erneuten, systematischen Abgleichs der
öffentlichen Seite mit dem Referenzbild bei 1440px, danach responsiv für Tablet/
Mobile geprüft. Keine neuen Funktionen, keine Backend-/CMS-/Auth-/Tracking-/
Datenbankänderungen; nur CSS/Layout und die unmittelbar betroffenen
Public-UI-Komponenten (`ProfileHeader`, `OffersExplorer`, `page.tsx`,
`globals.css`).

## "Mehr Angebote laden" entfernt

Der in v1.2 hinzugefügte Lade-mehr-Button war nicht angefordert und wurde
vollständig zurückgebaut: `OffersExplorer` zeigt wieder alle gefilterten Cards
ohne Limitierung, wie vor v1.2. Keine Restlogik (State, Slice, Button) verblieben.

## Exakte Abstände im Hero und in der Angebots-Leiste

Die zuvor pauschal per Flex-`gap` gesetzten Abstände wurden durch die im
Referenzbild einzeln genannten Werte ersetzt und im Browser bei 1440px
nachgemessen:

| Übergang | Soll | Gemessen |
|---|---|---|
| Titel → Untertitel | 20px | 20px |
| Untertitel → Badge | 16px | 16px |
| Badge → Vorteile-Zeile | 24px | 24px |
| Suchfeld → Filterleiste | 16px | 16px |
| Filterleiste → Karten-Grid | 24px | 24px |

## Card-Glow auf Buttons ergänzt

Primäre CTA-Buttons (`.msb-btn-primary`) erhalten jetzt einen dauerhaften,
dezenten Glow-Schatten (verstärkt sich leicht bei Hover), passend zum
Referenzbild ("Buttons: Glow Effekt"). Zuvor gab es nur den Hover-Helligkeits-
und Shine-Effekt ohne permanenten Glow.

## Erneute Verifikation

`npm run lint`, `npm run typecheck`, `npm run test` (35/35) und `npm run build`
liefen nach Abschluss fehlerfrei durch. Im Browser erneut geprüft:

- 1440px: 4 gleich hohe, gleich breite Cards in einer Reihe (unverändert korrekt
  seit dem in v1.2 behobenen Grid-Bug), alle oben genannten Abstände exakt
  nachgemessen
- 768px: 2 Spalten, Karten je Reihe gleich hoch, kein horizontales Scrollen
- 375px: 1 Spalte, Hero-Titel exakt 36px, kein horizontales Scrollen
- Keine Konsolenfehler auf der öffentlichen Seite bei keinem Breakpoint
- Admin-Bereich (Dashboard, Cards) nach den Änderungen weiterhin ohne
  Konsolenfehler erreichbar, bestehende Session blieb gültig

## Bewusst nicht umgesetzt (Begründung)

- **Individuelle Card-Hintergrundbilder** (Trophäe/Stern/Würfel/Krone wie im
  Referenzbild): Die Demo-Cards besitzen aktuell keine hochgeladenen Bilder.
  Passende Bild-Icons zu erraten oder platzhalterhaft neu zu erstellen wäre eine
  eigene inhaltliche Interpretation gewesen, die ausdrücklich nicht gewünscht war
  ("keine eigene Interpretation"). Bilder werden regulär über den bestehenden
  Card-Editor (Admin → Cards → Bild) vom Betreiber hochgeladen.
- **Exakte Filter-Button-Beschriftungen** ("Freispiele", "Einzahlungsbonus", "VIP",
  "Cashback" statt der aktuellen Demo-Kategorien): Kategorien sind bewusst
  CMS-gesteuert (Admin → Kategorien) und nicht im Code hartkodiert; ein Abgleich
  auf Text-Ebene hätte Kategorie-Daten statt UI-Code verändert und wurde daher
  nicht vorgenommen.
- **Badge-Text "Exklusive Deals – täglich aktualisiert"**: Das Badge ist bereits
  korrekt an das bestehende `noticeText`-Feld angebunden und stilistisch passend
  umgesetzt (Flammen-Icon, Verlauf, Glow); der aktuell angezeigte Text stammt aus
  den Demo-Inhalten und ist reine Dateneingabe, keine UI-Änderung.

---

# v1.3 Visueller Neuaufbau

Deutlich weiterreichender Visual-Pass als v1.2, ausdrücklich mit Freigabe zur
Neustrukturierung der öffentlichen UI-Komponenten (Hero, Casino-Szene, Card-Aufbau,
Typografie, Abstände). Weiterhin unverändert: Backend, CMS-Logik, Auth, Datenbankschema,
Server Actions, Tracking, Theme-System-Mechanik. Keine neue Architektur, keine neuen
Backend-Funktionen, keine neuen Admin-Module.

## "Mehr Angebote laden" — endgültig entfernt

War bereits in v1.2.1 entfernt; in diesem Pass nochmals verifiziert, dass keine Reste
vorhanden sind. `OffersExplorer` zeigt weiterhin alle gefilterten Cards ohne Limitierung.

## Cards: großer Bildbereich ergänzt

Jede Card hat jetzt einen Bildbereich (`.msb-card-banner`) über dem Textinhalt,
`clamp(180px, 24vw, 220px)` hoch — bei den aktuellen Demo-Card-Höhen entspricht das
±35–40 % der Card-Höhe, wie gefordert. Zwei Fälle:

- **Mit hochgeladenem Bild** (`imageUrl` gesetzt): echtes Bild, `object-cover`, wie
  zuvor.
- **Ohne Bild** (aktueller Stand aller vier Demo-Cards): ein dekorativer Fallback aus
  radialem Farbverlauf plus großem, glühendem Icon. Gewählt wurde bewusst KEINE neue
  Datenbank-/CMS-Funktion, sondern eine reine Darstellungsregel nach Card-Position
  (Reihenfolge 1–4 zyklisch): Trophy/Violett, Star/Magenta, Dices/Violett,
  Crown/Gold — exakt die im Referenzbild gezeigte Zuordnung für die vier
  Demo-Cards. Lädt der Betreiber ein echtes Bild hoch, ersetzt es diesen Fallback
  automatisch.

## Card-Akzentfarben pro Position

Border, Badge, Preisauszeichnung und CTA-Button jeder Card sind jetzt in der zur
Bildposition passenden Akzentfarbe eingefärbt (`--msb-card-accent`, lokal pro Card via
Inline-Style auf `--msb-card-border`/`--msb-card-glow` gesetzt) — Card 1 und 3 violett,
Card 2 magenta, Card 4 gold, exakt wie im Referenzbild. Der globale Featured-Glow
(`.msb-card-featured`) bleibt davon unabhängig bestehen.

## Casino-Szene deutlich aufgewertet

Die bisherige dünne Outline-Dekoration wurde durch eine reichhaltigere Komposition
ersetzt:

- **Links**: drei überlappende, große Spielkarten (bis 220×308px, teils außerhalb
  des Viewports positioniert) mit gefüllten Flächen, Eckindizes und Pik-/Herz-Pip,
  darunter zwei Pokerchips und ein Pik-Symbol.
- **Rechts**: eine neue, deutlich größere Slot-Machine-Grafik (260×340px, eigenes
  Gehäuse, drei "7"-Walzen, Hebel) statt der bisherigen einfachen Walzen-Kontur, ein
  großer Würfel (128px, gefüllt statt nur Umriss), zwei Pokerchips, eine Krone.
- Alle Formen nutzen jetzt gefüllte, halbtransparente Flächen statt reiner
  Strichzeichnung, plus stärkeren Drop-Shadow-Glow (24px statt 14px) — wirkt
  dadurch räumlicher und hochwertiger statt wie dünne Icons.
- Drei statt zwei Glow-Zonen, kleiner und stärker lokalisiert (links violett, rechts
  oben magenta, rechts mittig gold) statt zwei großer diffuser Flächen.
- Weiterhin generische, selbst erzeugte SVG-Formen — keine echten Casino-Marken,
  keine externen Assets.
- Parallax-/Floating-Mechanik, Reduced-Motion-Verhalten und responsive
  Sichtbarkeits-Flags (`hideOnMobile`/`hideOnTablet`) unverändert aus v1.1 übernommen.

## Hintergrund abgedunkelt

Basisfarben von `#0a0a12`/`#151022` auf `#040308`/`#0c0716` (nahezu Schwarz →
sehr dunkles Navy-Violett) abgedunkelt, Overlay-Stärke von 40 auf 25 reduziert (die
neuen, lokaleren Glow-Zonen sollen sichtbar bleiben statt von einem starken
schwarzen Overlay gedämpft zu werden). Card-Hintergrundfarbe ebenfalls dunkler
(`#0e0b18` statt `#15151f`) für mehr Kontrast zum Seitenhintergrund.

## Hero kompaktiert

- Oberer Seitenabstand: `pt-20` (80px) → `pt-10` (40px) auf Desktop.
- Abstand zwischen Top-Bar und Hero-Block: `gap-8` (32px) → `gap-5` (20px).
- Alle in v1.2 exakt gesetzten Innenabstände (Titel→Untertitel 20px,
  Untertitel→Badge 16px, Badge→Vorteile-Zeile 24px, Suchfeld→Filter 16px,
  Filter→Grid 24px) blieben unverändert erhalten.

Ergebnis bei 1440×900: Der Hero-Titel beginnt jetzt bei 200px statt 268px, der
Anfang der Card-Reihe liegt bei 565px (statt vorher deutlich tiefer) — der obere Teil
der Card-Reihe ist damit im initial sichtbaren Bereich sichtbar. Die vollständigen
Card-Unterkanten liegen bei aktueller Demo-Textmenge weiterhin unterhalb der
900px-Grenze; das ist inhaltlich bedingt (variable Demo-Texte wie Hinweistexte
strecken alle Cards einer Reihe auf gleiche Höhe) und ließe sich nur durch Kürzen der
Demo-Texte weiter verbessern, nicht durch zusätzliches CSS.

## Demo-Kategorien an Referenzbild angeglichen (reine Dateneingabe)

Wie im Auftrag ausdrücklich erlaubt ("darfst du ausschließlich für die
Demo-Darstellung passende neutrale Demo-Kategorien anlegen oder vorhandene
Demo-Kategorien anpassen"): die Demo-Kategorie "Empfehlung" wurde zu "Freispiele"
umbenannt (gleiche ID, keine Card-Verknüpfung geändert), zusätzlich wurden
"Einzahlungsbonus", "VIP" und "Cashback" als neue, leere Demo-Kategorien angelegt.
Damit zeigt die Filterleiste jetzt exakt die sechs im Referenzbild genannten Namen
(zzgl. "Alle"). Dies ist eine reine Dateneingabe über die bestehende
Kategorien-Verwaltung (Admin → Kategorien), keine neue Funktion.

Kleine, bewusste Public-UI-Anpassung dazu: Die Filterleiste zeigte bisher nur
Kategorien mit mindestens einer veröffentlichten Card an. Da drei der sechs neuen
Demo-Kategorien noch keine Cards enthalten, wurde dieser Filter entfernt, damit alle
aktiven Kategorien als Pills erscheinen (Klick auf eine leere Kategorie zeigt
regulär "Keine Angebote gefunden" — bestehendes, unverändertes Verhalten).

## CTA-Buttons: dauerhafter Glow ergänzt (aus v1.2.1 übernommen, hier erneut geprüft)

`.msb-btn-primary` besitzt weiterhin den in v1.2.1 ergänzten Glow-Schatten; die neuen
card-eigenen CTA-Buttons in `OfferCard` nutzen denselben Glow-Mechanismus über
Inline-`box-shadow`, jetzt mit der jeweiligen Card-Akzentfarbe statt der globalen
Akzentfarbe.

## Erneute Verifikation

`npm run lint`, `npm run typecheck`, `npm run test` (35/35) und `npm run build`
liefen nach Abschluss fehlerfrei durch. Im Browser bei 1440px, 768px und 375px erneut
geprüft:

- 1440px: 4 gleich hohe, gleich breite Cards (617px) in einer Reihe, Bildbereich
  35 % der Card-Höhe, Card-Akzentfarben exakt violett/magenta/violett/gold,
  Fallback-Icons exakt Trophy/Star/Dices/Crown, Casino-Szene mit 11 sichtbaren
  Objekten (3 Karten links, Slot-Machine + Würfel + Chips + Krone rechts), dunklerer
  Hintergrund bestätigt (`rgb(4,3,8)` → `rgb(12,7,22)`), kein horizontales Scrollen
- 768px: 2 Spalten, Karten je Reihe gleich hoch, Szene auf 9 Objekte reduziert, kein
  horizontales Scrollen
- 375px: 1 Spalte, Hero-Titel exakt 36px, Szene auf 2 Objekte reduziert, kein
  horizontales Scrollen
- Keine Konsolenfehler auf der öffentlichen Seite bei keinem Breakpoint
- Admin-Bereich (Dashboard, Cards, Card-Editor mit Live-Vorschau, Design-Editor,
  Kategorien) nach den Änderungen weiterhin ohne Konsolenfehler erreichbar,
  bestehende Session blieb gültig, neue Kategorienamen korrekt in der
  Kategorien-Verwaltung sichtbar

## Bewusst nicht (weiter) verändert

- Reale Bild-Uploads für die vier Demo-Cards wurden nicht vorgenommen (keine
  Bilddateien verfügbar, kein Fetch externer Bilder erlaubt) — stattdessen der oben
  beschriebene Icon-Fallback, der beim Hochladen eines echten Bildes automatisch
  weicht.
- Keine Änderung an Card-CRUD, Promo-Code-Copy, Tracking-Redirect, Auth oder
  Datenbankschema.

---

# Admin 2.0 — No-Code CMS

Größter Umbau des Admin-Bereichs seit v1.0: Ziel war, dass ein technisch
unerfahrener Betreiber seine Website vollständig selbst pflegen kann, ohne auf
Begriffe wie Datenbank, JSON, API, Server Action, Dateipfad oder Environment
Variable zu stoßen. Die technische Basis (Prisma/SQLite, Auth/Session,
Tracking, Server Actions, Render-Deployment) wurde dafür **nicht neu gebaut**
— nur additiv erweitert und die komplette Admin-Oberfläche neu strukturiert.

## Neue Navigation

Von "Dashboard / Cards / Kategorien / Design / Profil" auf sechs klar
benannte Bereiche umgestellt: **Dashboard, Angebote, Medien, Design, Profil,
Einstellungen**. "Kategorien" ist kein eigener Menüpunkt mehr, sondern über
einen Button oben auf der Angebote-Seite erreichbar (Funktion unverändert,
nur die vorherige Verwaltungsseite unter `/admin/categories` bleibt technisch
bestehen). SEO-Felder und die optionalen Rechtstexte wurden aus "Profil" in
den neuen Bereich "Einstellungen" verschoben, damit "Profil" für den
alltäglichen Gebrauch übersichtlich bleibt.

## Dashboard 2.0

Neu aufgebaut nach Vorgabe: vier Kennzahlen oben (aktive Angebote, Entwürfe,
Klicks heute, Klicks insgesamt — die bisherige "Klicks letzte 7 Tage" und
"Meistgeklickte Cards"-Tabelle entfernt, wie gefordert "keine unnötigen
Analytics-Diagramme"), große Schnellaktions-Kacheln (**+ Neues Angebot**,
Meine Angebote, Seite bearbeiten, Design ändern, Öffentliche Seite ansehen)
und ein neuer Bereich "Zuletzt bearbeitet" mit den drei zuletzt geänderten
Angeboten inkl. Thumbnail/Icon und Status.

## Angebote — visuelle Card-Verwaltung

Die bisherige Tabelle (`cards-table.tsx`) wurde durch eine neue
Card-basierte Ansicht (`offers-grid.tsx`) ersetzt: jede Zeile zeigt
Bild/Motiv-Icon, Titel, Status, Kategorie, Klickzahl, Drag-Handle sowie
Bearbeiten/Duplizieren/Aktivieren-Deaktivieren/Löschen als Icon-Buttons —
exakt wie im Auftrag skizziert. Drag & Drop (weiterhin `dnd-kit`) speichert
die Reihenfolge sofort ohne "Position speichern"-Schritt und zeigt kurz
"Reihenfolge gespeichert ✓" an; zusätzlich gibt es Hoch-/Runter-Pfeile als
barrierearme bzw. mobile Alternative. Löschen läuft jetzt über einen echten
Bestätigungsdialog (siehe unten) statt über den nativen Browser-`confirm()`.

## "Neues Angebot" als 5-Schritte-Assistent

Kernstück des Umbaus: `card-wizard.tsx` führt durch **Stil → Bild → Inhalt →
Kategorie → Vorschau**, statt ein großes Formular auf einmal zu zeigen.

- **Stil**: sechs visuelle Presets (Purple Neon, Hot Pink, Royal Gold,
  Midnight, VIP, Clean Dark) als Farbverlauf-Kacheln — keine Hex-Codes
  sichtbar.
- **Bild**: Galerie mit neun vorbereiteten Motiven (Trophy, Crown, Dice,
  Playing Cards, Poker Chips, 777, VIP, Jackpot, Roulette) plus eigener
  Upload, mit Kategorie-Filtern (Alle/Slots/Karten/Chips/Würfel/VIP/Jackpot/
  Sonstiges).
- **Inhalt**: nur Titel, Beschreibung, Highlight, Promo-Code, Buttontext und
  "Wohin soll der Button führen?" — genau die im Auftrag geforderte
  Feldauswahl, keine technischen Bezeichner sichtbar.
- **Kategorie**: bestehende Kategorien als anklickbare Pillen, keine
  Kategorie-ID sichtbar.
- **Vorschau**: Live-Card exakt wie auf der öffentlichen Seite, mit
  Desktop-/Smartphone-Umschalter, danach "Als Entwurf speichern" oder
  "Veröffentlichen".

Beide Speichern-Buttons nutzen weiterhin die bestehende, bereits getestete
`createCardAction` (Feld `status` je nach geklicktem Button) — keine neue
Backend-Logik, nur ein neuer Weg, dieselbe Aktion auszulösen.

## Card-Editor vereinfacht

Für das Bearbeiten bestehender Angebote (`card-form.tsx`) bleiben alle
Felder erreichbar, aber neu gruppiert: Titel/Beschreibung/Highlight/
Promo-Code/Button/Kategorie/Bild/Card-Stil/Status sind sofort sichtbar,
alles andere (Badge, alter Preis, Rabatttext, Ablaufdatum, ausführlichere
Beschreibung, Hinweistext, Stichwörter, zweiter Button) liegt hinter einem
"Weitere Optionen"-Aufklapper. Live-Vorschau rechts (Desktop) bzw. über
einen "Vorschau anzeigen"-Button (Mobil) blieb erhalten. `StylePicker` und
`ImagePicker` wurden als eigene, wiederverwendbare Komponenten
herausgezogen, damit Wizard und Editor exakt dieselbe Optik/Logik nutzen.

## Card-Design-Presets

Neue Datei `src/lib/card-styles.ts`: sechs benannte Stile mit
Akzent-/Glow-Farben, die Card-Border, Badge, Preis-Highlight und
CTA-Button einfärben. Card-Felder `stylePreset` und `mediaIconKey`
(additiv, Prisma-Schema erweitert, `db push` non-destruktiv ausgeführt)
speichern die Wahl; ist keins gesetzt, greift wie bisher die
positionsbasierte Farbfolge — bestehende Demo-Cards sehen dadurch
unverändert aus.

## Medienbibliothek

Neuer Adminbereich **Medien** (`/admin/media`) plus neues additives Modell
`MediaAsset` (id, name, category, fileUrl, iconKey, accent, source,
isSystemAsset, uploadedBy, createdAt). Die neun kuratierten Motive sind als
`isSystemAsset: true` markiert und über die Admin-Oberfläche **nicht
löschbar** (die Löschen-Aktion prüft serverseitig `isSystemAsset` und bricht
sonst ab); eigene Uploads sind es. Gleiche Bild-Validierung wie bisher
(JPG/PNG/WEBP, max. 5 MB, verständliche Fehlermeldung statt HTTP-Code) —
`saveUploadedImage` in `storage.ts` wurde nicht verändert, nur ein neuer
Aufrufer (`uploadMediaAction`) ergänzt, der zusätzlich eine `MediaAsset`-Zeile
anlegt. Die Galerie ist bewusst nur eine technische Grundstruktur mit
Icon-Platzhaltern — echte Bild-Assets sollen laut Auftrag später ersetzt
werden.

## Live-Vorschau

Sowohl im Wizard (Schritt 5, mit Desktop-/Smartphone-Umschalter) als auch im
Card-Editor (Desktop: fest sichtbar daneben; Mobil: über Button einblendbar)
zeigt dieselbe `OfferCard`-Komponente wie die öffentliche Seite — Änderungen
an Titel, Bild, Stil etc. sind sofort sichtbar, ohne Neuladen.

## Design-Bereich vereinfacht

`design-editor.tsx` neu geordnet: Design-Vorlage (Presets) oben, danach nur
noch Hintergrund-Art, Hauptfarbe, Animationen Ein/Aus und Casino-Hintergrund
Ein/Aus mit dreistufiger Intensität (Dezent/Normal/Stark statt Rohwert-
Slidern — mappt intern auf Parallax-/Glow-/Partikel-Werte). Alle bisherigen
Detail-Regler (Card-Farbe/-Transparenz/-Schatten, Text-/Button-Farben,
Sekundärakzent, Featured-Farbe, Max. Inhaltsbreite, Partikel-Schalter) sind
weiterhin vorhanden, aber hinter "Erweitert" versteckt. Automatisches
Speichern und die Live-Vorschau blieben unverändert.

## Profil & Einstellungen getrennt

"Profil" zeigt jetzt nur Marke (Name, Beschreibung, **Logo-Upload neu
ergänzt** — das Feld existierte in der Datenbank bereits, hatte aber bisher
keine Oberfläche), Hinweistext, Funktionen (Teilen/Suche/Klickzahlen) und
Social Media. "Einstellungen" zeigt die "Zusätzliche Seiten"
(Impressum/Datenschutz/Affiliate-Hinweis/Kontakt/Eigener Hinweis) als
Ein/Aus-Kacheln — ist eine Seite deaktiviert, verschwindet nur ihr
Texteditor aus der Oberfläche; die öffentliche URL bleibt wie zuvor
erreichbar. SEO liegt darunter hinter einem eigenen Aufklapper. Serverseitig
wurde dafür `profileSchema` in `profileBrandSchema` und `siteSettingsSchema`
aufgeteilt und `updateProfileAction` um `updateSiteSettingsAction` ergänzt —
beide schreiben weiterhin in dieselbe `ProfileSettings`-Tabelle, keine neue
Architektur.

## Rollenmodell — vorbereitet, nicht ausgebaut

Wie im Auftrag ausdrücklich als Option genannt ("Datenmodell und Architektur
vorbereiten, UI aber transparent als späteren Schritt dokumentieren"): Das
bestehende `User.role`-Feld (String, aktuell immer `"ADMIN"`) ist bereits
vorhanden und erweiterbar für eine künftige OWNER/ADMIN-Unterscheidung. Eine
vollständige Benutzerverwaltung (`Einstellungen → Benutzer`: Benutzer
anlegen, Passwort zurücksetzen, deaktivieren, Schutz vor Löschen des letzten
Admins) wurde in diesem Schritt **nicht gebaut** — das wäre über den Rahmen
eines "keine Neuarchitektur"-Auftrags hinausgegangen und ist als nächster
Schritt hier dokumentiert, nicht heimlich ausgelassen.

## Bestätigungsdialoge & Rückmeldungen

Neue, geteilte Komponenten `confirm-dialog.tsx` (`useConfirm()`-Hook, ersetzt
`window.confirm()` für Löschen-Aktionen bei Angeboten und Medien) und
`toast-provider.tsx` (`useToast()`-Hook) — beide in `AdminShell` gemountet,
damit jede Admin-Seite sie nutzen kann. Rückmeldungen wie "Angebot gespeichert
✓", "Angebot veröffentlicht ✓", "Bild hochgeladen ✓", "Reihenfolge
gespeichert ✓", "Design aktualisiert" und "Angebot gelöscht ✓" erscheinen
jetzt als Toast statt stiller Redirects. Für den Wizard/Editor (die per
Server-Redirect auf die Angebote-Seite zurückspringen) übernimmt eine kleine
Helper-Komponente (`toast-from-query.tsx`) die Übergabe per einmaligem
Query-Parameter, der danach aus der URL entfernt wird.

## Mobile Admin

Bestehende Hamburger-Navigation (`AdminShell`) unverändert übernommen;
`OffersGrid` stellt auf Mobil die Pfeil-Buttons statt des Drag-Handles in
den Vordergrund, Formulare bleiben einspaltig. Bei 375px geprüft: kein
horizontales Scrollen auf Dashboard, Angebote, Wizard, Medien, Design,
Profil, Einstellungen.

## Tests

35 bestehende Tests weiterhin grün. Neu hinzugekommen (**51/51 insgesamt**):

- `card-styles.test.ts` — die sechs Presets existieren, liefern gültige
  Farben, `getCardStyle` fällt bei unbekanntem/fehlendem Schlüssel sauber
  auf den Standard zurück.
- `media.test.ts` — alle neun kuratierten Motive haben ein passendes Icon in
  der Registry, Kategorien sind gültig.
- `storage.test.ts` — Upload-Validierung (leere Datei, über 5 MB, falscher
  Dateityp, Inhalt passt nicht zum angegebenen Format) liefert verständliche
  Fehlermeldungen; bewusst nur die Ablehnungs-Pfade getestet, damit keine
  echten Dateien in `public/uploads/` landen.
- `card-crud.test.ts` (erweitert) — `mediaIconKey`/`stylePreset` laufen
  korrekt durch Anlegen/Lesen, Duplizieren übernimmt beide Felder und setzt
  den Status auf Entwurf, System-Medien überleben das Löschen eigener
  Uploads (Schutz-Logik nachgebildet).

## Manueller Browser-Check (Admin 2.0)

Durchgeführt gegen einen echten **Production-Build** (`npm run build && npm
run start`), nicht nur den Dev-Server:

- Vollständiger Workflow: Login → Neues Angebot → Stil (Royal Gold) → Bild
  (Crown aus der Galerie) → Inhalt ausgefüllt → Kategorie (VIP) → Vorschau
  (Gold-CTA + Crown-Icon bestätigt) → Veröffentlichen → Angebot erscheint in
  der Angebote-Liste und auf der öffentlichen Seite
- Drag-&-Drop-Alternative (Pfeil-Buttons) getestet: Reihenfolge ändert sich
  sofort und übersteht ein Neuladen (serverseitig persistiert)
  bestätigt — kein natives Browser-Popup mehr
- Testkarte wieder gelöscht, Demo-Datenstand (4 Cards) wiederhergestellt
- Medien-, Design-, Profil- und Einstellungen-Seiten einzeln aufgerufen,
  öffentliche Seite geprüft — überall keine Konsolenfehler im
  Production-Build
- 375px-Ansicht für Angebote-Liste und Wizard geprüft: kein horizontales
  Scrollen

**Bekannte Einschränkung des Dev-Servers (nicht der Anwendung):** Im
Next.js-Dev-Modus erscheint bei der neuen Angebote-Seite ein
Hydration-Warnhinweis von `dnd-kit` (`aria-describedby="DndDescribedBy-N"`
weicht zwischen Server- und Client-Render ab). Das ist ein bekannter,
React-StrictMode-spezifischer Effekt von `dnd-kit`s internem
ID-Zähler unter Reacts absichtlicher doppelter Render-Ausführung in der
Entwicklungsumgebung — **im echten Production-Build (identisch mit dem
Render-Deployment) tritt der Hinweis nicht auf**, mehrfach gegengeprüft
inklusive wiederholter Navigation. Keine funktionale Auswirkung
festgestellt.

## Bewusst nicht umgesetzt

- Vollständige Benutzerverwaltung (`Einstellungen → Benutzer`) — Datenmodell
  vorbereitet (`User.role`), UI als nächster Schritt dokumentiert statt
  überstürzt gebaut.
- Echte, individuell gestaltete Bild-Assets für die neun Medien-Motive —
  aktuell Icon-Platzhalter, wie im Auftrag als Zwischenschritt vorgesehen
  ("Jetzt zunächst technische Struktur schaffen").
- Keine Postgres-Migration, kein Storage-Wechsel, keine Hosting-Änderung,
  kein Deploy — wie im Auftrag ausdrücklich ausgeschlossen. Der aktuelle
  Stand liegt nur lokal committet vor, noch nicht auf `master` gepusht bzw.
  nicht auf Render deployt (siehe Abschlussbericht im Chat für die
  Freigabe-Rückfrage).

---

# Media Pack v1.0 — Bulk-Import in die Medienbibliothek

Einmaliger, wiederholbar sicherer Import des fertigen Asset Packs
(`assets/MaceSlotsBonus_AssetPack_v1.0/`, 30 PNGs: 4 Hintergründe, 12
Card-Motive dunkel, 12 Card-Motive freigestellt/transparent, 2 UI-Icons) in
die bestehende `MediaAsset`-Tabelle, per neuem Skript
`prisma/import-media-pack.ts` (`npm run import:media-pack`).

- **Additiv:** Datenbankschema um zwei nullable Felder erweitert
  (`assetType`, `tags` auf `MediaAsset`), per `prisma db push` non-destruktiv
  angewendet — keine bestehende Spalte, Zeile oder Tabelle verändert.
- **Keine Duplikate:** Vor jedem Insert prüft das Skript, ob bereits ein
  `MediaAsset` mit demselben Ziel-Dateipfad existiert; ein zweiter Lauf
  überspringt alle 30 Dateien (getestet, 0 neu / 30 übersprungen).
- **Kategorien aus Ordnerstruktur + Dateiname:** `01_Backgrounds` →
  Kategorie „Hintergründe", `04_UI_Assets` → „UI-Elemente" (beide additiv als
  neue Filter-Kacheln in `src/lib/media.ts` ergänzt); Card-Motive aus
  `02_Card_Motifs_Dark`/`03_Card_Motifs_Transparent` werden zusätzlich anhand
  des Dateinamens kategorisiert (z. B. `card_vip_crown_01.png` → VIP,
  `card_slot_neon777_01.png` → Slots), alle als Typ „Card Motif".
- **Metadaten:** Name, Kategorie, Tags (kommagetrennt) und Asset-Typ stammen
  aus einer Zuordnungstabelle im Importskript, die die Beschreibungen aus
  dem README des Asset Packs übernimmt (z. B. „VIP Club & Loyalty Rewards"
  statt des rohen Dateinamens); der Dateipfad wird als `fileUrl`
  gespeichert.
- **Kein Eingriff ins bestehende Upload-System:** `saveUploadedImage`,
  `uploadMediaAction` und die Upload-Zone in der Medienbibliothek wurden
  nicht verändert — der Import läuft komplett getrennt über Node/Prisma
  direkt, die Dateien werden nach `public/media-pack/…` kopiert (nicht nach
  `public/uploads/`, das weiterhin ausschließlich für Operator-Uploads
  reserviert bleibt).
- **Vorher geprüft:** Alle 30 Quelldateien per PNG-Signaturprüfung
  validiert (das Importskript bricht bei einer ungültigen Datei komplett ab,
  bevor irgendetwas kopiert oder in die Datenbank geschrieben wird); vor dem
  Schema-Push wurde `prisma/dev.db` nach `prisma/backups/` gesichert
  (lokal, git-ignoriert).
- **Ergebnis nach Import:** 39 `MediaAsset`-Zeilen insgesamt (9 bestehende
  kuratierte System-Motive unverändert + 30 neu importiert), sichtbar unter
  „Medien" im Adminbereich inklusive der beiden neuen Filter-Kacheln; per
  Browser-Test (Production-Build) bestätigt, keine Konsolenfehler.
- **Tests:** 3 neue Tests in `src/tests/media-import.test.ts` (Speichern von
  `assetType`/`tags`, Duplikat-Erkennung über `fileUrl`, bestehende Zeilen
  bleiben beim Einfügen neuer Assets unverändert) — Gesamt **54/54 Tests
  grün**.
