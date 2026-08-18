# ClujPulse

Unofficial offline-first PWA companion for UNTOLD 2026. Built because the official app crashes under load and makes it impossible to spot schedule clashes.

## What it does

- **Offline-first** — caches everything on first load. Add to Home Screen and it works 100% without signal at the festival.
- **Horizontal schedule grid** — see all stages at once, spot overlaps instantly. Zoom in/out to fit your screen.
- **Lineup builder** — tap artists to add them to your picks. Clash detection warns you when two sets overlap.
- **Lock screen export** — generate a PNG wallpaper of your lineup so you don't need to unlock your phone.
- **Real-time** — shows what's on stage right now during festival hours (Aug 6–9).

No backend, no accounts, no ads. Lineup saved locally on your device.

## Traction

~5,000 visits on day 1 after sharing on Reddit, then 1.2–1.8k visits/day throughout the festival. Hosted on Vercel's free tier without issues.

## Stack

React + Vite, Tailwind CSS v4, Zustand, Framer Motion, vite-plugin-pwa. Deployed on Vercel.

## Run locally

```bash
npm install
npm run dev
```

## Update artist data

```bash
npx tsx scripts/scrape-artists.ts
```

Pulls all artists from the public UNTOLD API and writes `src/data/scheduleData.ts`.

## Disclaimer

This is an unofficial fan-made project. Not affiliated with or endorsed by UNTOLD Festival.
