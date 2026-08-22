# MaceSlotsBonus – Render.com Preview-Deployment

Diese Anleitung beschreibt den **minimalen, kostenlosen Preview-Deploy** auf
[Render.com](https://render.com) als "Web Service" (persistenter Node-Prozess,
kein Serverless). Sie ist ausdrücklich für eine **temporäre
Präsentationsumgebung** gedacht, nicht für einen produktiven Dauerbetrieb.

> Änderung an der Anwendung selbst: keine. Es wurden lediglich zusätzliche,
> optionale npm-Skripte (`render:init`, `render:start`) ergänzt sowie diese
> Dokumentation. `next start` liest den von Render vorgegebenen Port bereits
> automatisch aus der Umgebungsvariable `PORT` (verifiziert über
> `next start --help`), ein Eingriff in das eigentliche Start-Skript war
> daher nicht nötig.
>
> **Render Free hat keinen Shell-Zugriff.** Schema-Push, Seed und der
> Medienbibliotheks-Import (`prisma/import-media-pack.ts`) laufen deshalb
> nicht mehr über einen manuellen Shell-Befehl, sondern automatisch bei
> jedem Containerstart — siehe Schritt 2 (`render:start` als Start Command)
> und Schritt 4.

## 1. Voraussetzung

Das Repository [`Mace-SB`](https://github.com/auvexis-systems/Mace-SB) auf
GitHub muss dem Render-Account zugänglich sein. Das Verbinden von Render mit
GitHub erfordert einen Login im Render-Dashboard über den Browser (OAuth) —
dies kann nicht automatisiert im Namen des Nutzers durchgeführt werden.

## 2. Neuen Web Service anlegen

Im Render-Dashboard: **New → Web Service** → Repository `Mace-SB` auswählen.

| Einstellung | Wert |
|---|---|
| Environment | Node |
| Region | frei wählbar |
| Branch | `master` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run render:start` |
| Instance Type | Free |

`npm install` löst automatisch den bestehenden `postinstall`-Hook
(`prisma generate`) aus — die Prisma-Query-Engine wird damit für Renders
Linux-Umgebung passend erzeugt, ohne dass dafür etwas angepasst werden musste.

**Läuft hier bereits ein Web Service mit Start Command `npm run start`?**
Dann einmalig im Render-Dashboard unter **Settings → Start Command** auf
`npm run render:start` umstellen und speichern (löst automatisch einen
Redeploy aus) — das ist eine normale Einstellungsänderung im Dashboard, kein
Shell-Zugriff.

## 3. Environment-Variablen setzen

Im Reiter **Environment** des Web Service:

| Variable | Wert | Hinweis |
|---|---|---|
| `DATABASE_URL` | `file:./prisma/dev.db` | wie lokal; Datei liegt im Container-Dateisystem |
| `SESSION_SECRET` | neuer, zufälliger Wert | **niemals** den lokalen Wert aus der eigenen `.env` wiederverwenden; erzeugen z. B. mit `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_BASE_URL` | die von Render vergebene URL, z. B. `https://mace-sb.onrender.com` | erst nach dem ersten Deploy bekannt; danach eintragen und einmal neu deployen |
| `NODE_ENV` | `production` | aktiviert u. a. `secure`-Cookies für die Admin-Session |
| `ADMIN_USERNAME` | z. B. `admin` | optional, siehe unten |
| `ADMIN_EMAIL` | z. B. `admin@example.com` | optional, siehe unten |
| `ADMIN_PASSWORD` | selbst gewähltes, sicheres Passwort | optional, siehe unten |

Die drei `ADMIN_*`-Variablen sind optional, aber empfohlen: Ohne sie generiert
der Seed-Schritt ein zufälliges Passwort und schreibt es in
`ADMIN_CREDENTIALS.txt` **im flüchtigen Container-Dateisystem** — von dort ist
es ohne Shell-Zugriff auf die laufende Instanz nicht einsehbar. Mit gesetzten
`ADMIN_*`-Variablen ist der Admin-Login von vornherein bekannt.

## 4. Datenbank-Init (Schema + Seed + Medienbibliothek) — automatisch

Render Free bietet keinen Shell-Tab, daher läuft der komplette Init **bei
jedem Containerstart automatisch** ab, solange die Start Command auf
`npm run render:start` steht (siehe Schritt 2). Das entspricht:

```bash
npm run render:init && npm run start
```

`render:init` führt der Reihe nach aus, jeder Schritt geprüft und
non-destruktiv, überspringt also beim nächsten Boot alles bereits
Vorhandene:

1. `prisma db push` – legt das Datenbankschema in der SQLite-Datei an
   (additiv, kein Datenverlust bei Wiederholung).
2. `prisma/seed.ts` – legt den Admin-Benutzer an (überspringt das
   automatisch, falls bereits einer existiert), sowie Demo-Kategorien,
   Demo-Cards, die eingebauten Theme-Presets und die 9 kuratierten
   System-Medienmotive (jeweils per Existenzprüfung übersprungen, wenn schon
   vorhanden).
3. `prisma/import-media-pack.ts` – importiert die 30 PNGs aus dem Asset Pack
   v1.0 (`public/media-pack/…`, bereits Teil des Deploys über Git) als
   `MediaAsset`-Zeilen; erkennt anhand des Ziel-Dateipfads, welche schon
   importiert sind, und legt **nur die fehlenden** an — keine Duplikate,
   keine Änderung an bestehenden Zeilen, egal wie oft der Container neu
   startet.

Da der Free-Tier-Container sein Dateisystem bei jedem Redeploy und jedem
Aufwachen aus dem Ruhezustand zurücksetzt, ist genau dieses automatische,
idempotente Wiederholen bei jedem Boot nötig, um die Datenbank überhaupt
konsistent zu halten — ein einmaliger manueller Schritt würde nach dem
nächsten Neustart wirkungslos sein.

Für ein manuelles Nachvollziehen (z. B. lokal, oder auf einem Render-Tarif
mit Shell-Zugriff) bleibt derselbe Befehl weiterhin direkt aufrufbar:

```bash
npm run render:init
```

## 5. Admin-Login

Nach dem Init unter `https://<deine-render-url>/admin/login` mit den
`ADMIN_*`-Werten aus Schritt 3 anmelden. Ohne gesetzte `ADMIN_*`-Variablen
generiert der Seed-Schritt stattdessen ein zufälliges Passwort in
`ADMIN_CREDENTIALS.txt` im Container — auf Render Free ohne Shell-Zugriff ist
diese Datei nicht einsehbar, daher sind die `ADMIN_*`-Variablen aus Schritt 3
auf diesem Tarif praktisch **erforderlich**, nicht nur empfohlen.

## 6. Bekannte Persistenzgrenzen (wichtig)

Dies ist eine **Free-Tier-Preview-Umgebung ohne persistentes Volume**:

- Die Free-Instanz **schläft nach Inaktivität ein** (ca. 15 Minuten) und
  braucht beim nächsten Aufruf einen Cold-Start (spürbare Verzögerung).
- Das Container-Dateisystem ist **flüchtig**: Bei jedem Redeploy (z. B. neuer
  Push auf `master`) oder jedem Neustart der Instanz wird es zurückgesetzt.
  Das betrifft:
  - die SQLite-Datenbank (`prisma/dev.db`) — alle über die Admin-Oberfläche
    angelegten/ge-änderten Cards, Kategorien, Klick-Statistiken gehen
    verloren. Mit `npm run render:start` als Start Command wird Schema,
    Seed und Medienbibliotheks-Import bei jedem Neustart automatisch
    wiederhergestellt (Demo-Daten, System-Motive, Asset-Pack-Medien) — nur
    Inhalte, die der Betreiber selbst über die Admin-Oberfläche angelegt
    hat (eigene Cards, eigene Uploads), müssen nach einem Redeploy erneut
    eingegeben werden, da dafür kein Seed existiert;
  - hochgeladene Bilder unter `public/uploads/` (eigene Operator-Uploads,
    nicht Teil des Git-Repos).

Für dauerhafte Persistenz über Redeploys/Neustarts hinweg wäre ein bezahltes
Render-Disk-Volume oder ein Wechsel auf Fly.io mit persistentem Volume nötig —
beides bewusst **nicht** Teil dieses minimalen Preview-Deploys.

## 7. Was NICHT verändert wurde

- Keine Migration von SQLite auf Postgres.
- Keine Migration der lokalen Uploads auf einen Blob-/Objektspeicher.
- Keine Änderung an Auth-, CMS-, Tracking- oder Server-Action-Logik.
- Keine Änderung am Design/UI.
