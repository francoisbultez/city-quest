# City Quest (working title)

A treasure-hunt app for exploring a city. Players solve story-driven clues that can only be answered by being on the spot. Routes adapt to each group's time, pace and accessibility needs, and every clue is checked on the ground and kept up to date.

**Pilot city:** Madrid. The first hunt, *The Cartographer's Last Map*, runs from Puerta del Sol to Templo de Debod.

## Docs
- [Competitive analysis and product strategy](docs/competitive-analysis.md)

## Run it

```bash
cd web
npm install
npm run dev        # opens on your network too, so you can test on a phone
```

GPS on a phone requires HTTPS. Over plain LAN HTTP, use the "GPS not working? I'm there" button, or deploy to any static host (Vercel, Netlify, Cloudflare Pages).

## Testing

```bash
cd web
npm test              # unit tests: route builder + content checks for every clue
npm run test:e2e      # plays the hunt in a simulated iPhone with fake GPS
```

Before the first e2e run on a new machine, run `npx playwright install chromium`.

**Play-testing without being in Madrid:** open the app with `?test` at the end of the URL (for example `http://localhost:5173/?test`). A "🧪 Teleport to this stop" button appears on each clue. Use `?test=off` to hide it again.

## Stack and path to mobile

- **Vite + React + TypeScript**, installable as a **PWA** (works offline once loaded)
- **Leaflet** with OpenStreetMap tiles. Before launch, switch to a tile provider that allows offline packs, such as MapTiler or Stadia
- **No backend yet.** Progress and clue reports are stored in localStorage

For phones, wrap the same code in **Capacitor** to get iOS and Android apps. That adds native GPS, background location and app-store presence without a rewrite.

## Code map

| Path | What it is |
|---|---|
| `web/src/content/madrid-bear.ts` | The Madrid hunt as modular clue nodes (all marked **draft** until checked on site) |
| `web/src/lib/route.ts` | Adaptive route builder: time budget, pace, step-free filter |
| `web/src/components/Setup.tsx` | Route planning screen |
| `web/src/components/Play.tsx` | Map, geofence check-in, clue, hints, broken-clue report |

## Next steps
1. **Walk the route in Madrid** to verify each clue, coordinate and geofence radius, then mark the nodes `verified`
2. Translate to Spanish (and French?)
3. Group mode with roles (needs a realtime backend, e.g. Supabase)
4. Add "be-there" clue types: photo match, counting, ciphers
5. Payments (free first chapter), then wrap with Capacitor
