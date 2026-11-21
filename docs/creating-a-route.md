# Creating a route

City Quest is a generic engine. It knows nothing about any city: every route is plain data that plugs in. You can add or remove a route without touching any code.

## What a route is

A route is one folder:

```
web/routes/lisbon-alfama/
  route.json      ← everything about the route
  images/         ← optional photos, referenced from route.json
    tram.jpg
```

- **Add a route:** add a folder. The app picks it up on the next build.
- **Remove a route:** delete its folder.
- **Share a route without changing the app:** put `route.json` (and its `images/`) anywhere on the web over https, and open the app as `…/city-quest/?route=https://your.site/lisbon-alfama/route.json`. The app downloads it, checks it, and keeps it on that phone. Image paths are read relative to the `route.json` link. A team in Together mode downloads it automatically too.

## Cities come from routes

There is no list of cities in the code. Every route names its `city`; routes with the same city are grouped together, and the city's position (for "Near you" and distances) is the average of its routes' starting points. Add the first route for Lisbon and Lisbon appears in the city list.

Cities that are on the way are listed in `web/routes/coming-soon.json`. A city disappears from "Coming soon" as soon as it has a route.

## Start a new route

From `web/`:

```bash
npm run route:new lisbon-alfama
```

That creates a template with two stops. Edit `routes/lisbon-alfama/route.json`. Editors like VS Code autocomplete and underline mistakes as you type, thanks to the `$schema` line at the top.

Check it:

```bash
npm run route:check routes/lisbon-alfama
```

It reports mistakes, such as an answer that is not one of the options, a missing photo or a duplicated stop id. It also warns you about walking problems: legs over 1.5 km, and stops so close that players would "arrive" too early.

## The format

The full, always-current definition is `web/src/engine/schema.ts`, exported as `web/routes/route.schema.json`.

### The route

| Field | Required | What it is |
|---|---|---|
| `formatVersion` | yes | Always `1` for now |
| `id` | yes | Same as the folder name: lower-case, numbers, dashes |
| `city`, `name`, `tagline` | yes | "Lisboa", "The Alfama Route", one line to make people go |
| `badgeLine` | yes | Printed on the badge, 22 characters max: "THE ALFAMA ROUTE" |
| `start`, `duration` | yes | For "Start at …" and the "~1.5 h" chip |
| `stops` | yes | 2 to 30 stops, in walking order |
| `language` | no | What the route is written in (default `en`); sets the read-aloud voice |
| `localLanguage` | no | `{ "code": "pt", "name": "Portuguese" }`, which titles the words section |
| `theme` | no | `{ "colors": ["#006600", "#ffcc00"] }`, the badge's outer and band colours, also used for the confetti |
| `cover` | no | The photo on route cards and the preview (same shape as a lesson photo). Defaults to the first stop's photo |
| `region` | no | Shown in the city list, e.g. `"Castilla-La Mancha"` |
| `kind` | no | Short label on the route card, e.g. `"Classic"` or `"Neighbourhood"`. With 4 or more routes in a city, the list can be filtered by it |
| `country`, `author` | no | `"PT"`, `{ "name": "…", "url": "https://…" }`. An author other than City Quest is credited on the route preview |

### A stop

| Field | Required | What it is |
|---|---|---|
| `id` | yes | Unique within the route |
| `place` | yes | `{ name, lat, lng, radiusM }`: radius 20–200 m; how close counts as "arrived" |
| `riddle` | yes | Shown while walking. Must not contain the answer |
| `question`, `options`, `answer` | yes | 2 to 4 options; `answer` must be one of them. Ask about something **you can only see on the spot** and that won't change (a date on a façade, a number of arches, an animal on a statue) |
| `lesson` | yes | At least `{ "title": "…" }`; see below |
| `whereHint` | no | Plain-words location, behind a free "Where is it?" button |
| `look` | no | Small instruction above the question: "Read the plaque" |
| `hint` | no | Costs points; the hint button only appears if there is one |
| `verification` | no | `{ "status": "verified", "date": "2026-11-19" }` once someone has walked it. Defaults to `draft` |

### A lesson

Only `title` is required. Every other part shows up when you fill it in:

`subtitle`, `image`, `recap` (for the end screen), `numbers` (up to 3 big facts), `story` (paragraphs with a bold lead), `timeline`, `context`, `lookCloser` (things to tick off on the spot), `words` (`{ word, meaning }` in the local language), `think` (a question to discuss), `check` (a bonus quick-check with 2 to 4 options), `sources` (`{ name, url }`).

Photos: `{ "src": "images/tram.jpg", "alt": "…", "credit": { "artist": "…", "license": "CC BY-SA 4.0", "licenseUrl": "https://…", "page": "https://…", "site": "Wikimedia Commons" } }`. Use only photos you took or free-licence photos, and credit them.

## Built-in routes have a higher bar

Routes in `web/routes/` ship to everyone, so the tests (`npm test`) also ask for a full lesson at every stop: subtitle, recap, a story, things to look at, words, a quick check and sources. They also check that riddles don't give answers away and that the walk works. Routes added by link only need to pass `route:check`.

## Before a route is real

Walk it. Check every answer on the spot, adjust each `radiusM` where GPS is poor, then set `verification` to `verified`. The research in `docs/routes-spain.md` has 30 candidate routes waiting for exactly that.
