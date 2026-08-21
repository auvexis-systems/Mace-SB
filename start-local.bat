@echo off
cd /d "%~dp0"

if not exist ".env" (
  echo .env nicht gefunden - bitte .env.example nach .env kopieren und anpassen.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installiere Abhaengigkeiten...
  call npm install
)

if not exist "prisma\dev.db" (
  echo Richte Datenbank ein...
  call npm run db:push
  call npm run db:seed
)

echo Starte MaceSlotsBonus unter http://localhost:3000 ...
call npm run dev
pause
