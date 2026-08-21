# MaceSlotsBonus – Render.com Preview-Deployment

Diese Anleitung beschreibt den **minimalen, kostenlosen Preview-Deploy** auf
[Render.com](https://render.com) als "Web Service" (persistenter Node-Prozess,
kein Serverless). Sie ist ausdrücklich für eine **temporäre
Präsentationsumgebung** gedacht, nicht für einen produktiven Dauerbetrieb.

> Änderung an der Anwendung selbst: keine. Es wurde lediglich ein zusätzliches,
> optionales npm-Skript (`render:init`) ergänzt sowie diese Dokumentation.
> `next start` liest den von Render vorgegebenen Port bereits automatisch aus
> der Umgebungsvariable `PORT` (verifiziert über `next start --help`), ein
> Eingriff in das Start-Skript war daher nicht nötig.

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
| Start Command | `npm run start` |
| Instance Type | Free |

`npm install` löst automatisch den bestehenden `postinstall`-Hook
(`prisma generate`) aus — die Prisma-Query-Engine wird damit für Renders
Linux-Umgebung passend erzeugt, ohne dass dafür etwas angepasst werden musste.

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

## 4. Einmaliger Datenbank-Init (Schema + Seed)

Nach dem ersten erfolgreichen Deploy einmalig über den Render-**Shell**-Tab des
Web Service ausführen:

```bash
npm run render:init
```

Das führt aus:
1. `prisma db push` – legt das Datenbankschema in der SQLite-Datei an
   (nicht-destruktiv, kann bei Bedarf erneut ausgeführt werden).
2. `prisma/seed.ts` – legt den Admin-Benutzer an (überspringt das automatisch,
   falls bereits einer existiert), sowie Demo-Kategorien, Demo-Cards und die
   eingebauten Theme-Presets.

Alternativ kann derselbe Befehl als Render **"Pre-Deploy Command"** hinterlegt
werden, damit er bei jedem Deploy automatisch läuft — beide Schritte sind
idempotent (kein Datenverlust bei Wiederholung), daher unkritisch.

## 5. Admin-Login

Nach dem Init unter `https://<deine-render-url>/admin/login` mit den
`ADMIN_*`-Werten aus Schritt 3 anmelden (bzw. mit dem zufällig generierten
Passwort aus `ADMIN_CREDENTIALS.txt`, falls diese Variablen nicht gesetzt
wurden — dafür ist dann ein Blick in die Render-Shell nötig:
`cat ADMIN_CREDENTIALS.txt`).

## 6. Bekannte Persistenzgrenzen (wichtig)

Dies ist eine **Free-Tier-Preview-Umgebung ohne persistentes Volume**:

- Die Free-Instanz **schläft nach Inaktivität ein** (ca. 15 Minuten) und
  braucht beim nächsten Aufruf einen Cold-Start (spürbare Verzögerung).
- Das Container-Dateisystem ist **flüchtig**: Bei jedem Redeploy (z. B. neuer
  Push auf `master`) oder jedem Neustart der Instanz wird es zurückgesetzt.
  Das betrifft:
  - die SQLite-Datenbank (`prisma/dev.db`) — alle über die Admin-Oberfläche
    angelegten/ge-änderten Cards, Kategorien, Klick-Statistiken gehen verloren
    und müssen nach jedem Redeploy erneut über `npm run render:init`
    initialisiert werden;
  - hochgeladene Bilder unter `public/uploads/`.
- Es findet **keine automatische** erneute Seed-Ausführung nach einem Redeploy
  statt, sofern der Init-Schritt nicht als Pre-Deploy-Command hinterlegt wurde.

Für dauerhafte Persistenz über Redeploys/Neustarts hinweg wäre ein bezahltes
Render-Disk-Volume oder ein Wechsel auf Fly.io mit persistentem Volume nötig —
beides bewusst **nicht** Teil dieses minimalen Preview-Deploys.

## 7. Was NICHT verändert wurde

- Keine Migration von SQLite auf Postgres.
- Keine Migration der lokalen Uploads auf einen Blob-/Objektspeicher.
- Keine Änderung an Auth-, CMS-, Tracking- oder Server-Action-Logik.
- Keine Änderung am Design/UI.
