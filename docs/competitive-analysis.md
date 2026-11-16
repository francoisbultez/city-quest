# Competitive Analysis: City Treasure-Hunt Apps

*Snapshot: November 2026. Figures come from vendor sites, app stores and review aggregators, so treat them as self-reported.*

## 1. Landscape

The market splits into four groups:

| Segment | Players | Model |
|---|---|---|
| **Curated city hunts (B2C)** | Let's Roam, Questo, World City Trail, Urban Adventure Quest, Strayboots | Pay per hunt or subscription; content made in-house |
| **AI-generated hunts** | Scavlandia, CityDiscovery, Destplore | Cheap, wide coverage, made in bulk |
| **Hunt-builder platforms (B2B / DIY)** | Actionbound, GooseChase, ClueKeeper | Organizers write hunts for schools, events and companies |
| **Adjacent** | Geocaching, Niantic games, GPSmyCity, VoiceMap | Location play or self-guided tours, but not story-driven hunts |

### Key competitors

**Let's Roam**
- Claims 3,000+ locations in 27 countries. It also does a lot of corporate team-building.
- Strengths: huge catalog, strong brand, team and party packages.
- Weaknesses: Trustpilot scores of about 3.5–4/5. Complaints cover refunds and cancellations, vouchers that don't work, double charges and account confusion. Hunts are fairly generic trivia and photo challenges.

**Questo**
- Claims 1M+ players and 1,000+ cities. You start right away, with no booking. Hunts are wrapped in mystery stories (detective plots).
- Strengths: the best at storytelling among the large players, and it's easy to start.
- Weaknesses: story quality varies by city. Routes are fixed, so playing again adds little.

**World City Trail**
- 167 cities in 37 countries. Puzzles unlock landmarks.
- Strengths: wide coverage and a simple loop.
- Weaknesses: thin local depth, and it plays like a checklist.

**AI-generated apps (Scavlandia and similar)**
- Hunts cost $1.99–$7.99, with a $19.99 premium tier.
- Strengths: they cover almost anywhere at very low cost.
- Weaknesses: nobody checks the content on the ground. Clues can point to things that are closed, moved or wrong, and many answers can be found with a web search.

**Actionbound / GooseChase / ClueKeeper**
- Platforms where organizers write the hunts.
- Strengths: flexible, and strong in schools and companies.
- Weaknesses: GooseChase has about two-thirds negative sentiment, driven by paywalls (a teacher hit a $299 wall after building a hunt) and clumsy switching between organizer and player modes. Actionbound has an empty catalog in many cities, plus bugs with preloaded media and the QR scanner.

## 2. Recurring pain points across the market

1. **Generic content.** Clues are often trivia anyone can look up ("What year was this built?") instead of things you only notice by being there.
2. **Stale content.** Shops close, statues get moved and roads get closed, and nothing in the app is updated to match.
3. **Fixed routes.** Hunts ignore your time budget, mobility, the weather, opening hours and the crowds right now.
4. **Billing friction.** Pricing per player or per hunt is confusing, refunds are hard to get, and vouchers fail.
5. **Shaky group play.** Phones fall out of sync, one person ends up holding the phone, and the others get bored.
6. **Coverage vs. depth.** You either get many cities with thin content or a few cities with good content.
7. **No offline mode.** Tourists on roaming data lose the game when they lose signal.
8. **No reason to replay.** Once you've finished a hunt, there's nothing new in it.
9. **Locals are ignored.** Products target tourists, so there's no recurring use from people who live in the city.

## 3. Our opportunity

**Positioning:** *"The hunt that knows the city right now."* We would be the first to combine story-driven hunts, routes that adapt to the player, and content that is checked on the ground and kept up to date.

### Differentiators

| # | Feature | Pain point it fixes | Why it's hard to copy |
|---|---|---|---|
| 1 | **"Be-there" clues.** Answers come from physical details (count the lions on a fountain, read a worn inscription, match a photo fragment). Can't be found online. | 1 | Needs verified details from the ground; AI-only apps can't produce them |
| 2 | **Adaptive routing.** Player sets time (30 min–4 h), pace, accessibility, kids or adults. The route rebuilds itself around weather, opening hours and closures. | 3 | Needs a modular content graph, not linear scripts |
| 3 | **Freshness loop.** Players flag broken clues in one tap; AI drafts a replacement; a local creator or the next players confirm it. Every clue carries a "last verified" date. | 2, 6 | A data moat that grows with every game played |
| 4 | **Creator marketplace.** Local guides, historians and students write hunts with AI help and earn a revenue share. | 6, 9 | Network effects and local authenticity |
| 5 | **Role-based group play.** Each phone gets a different role (navigator, decoder, photographer, historian) and its own clue fragments. State syncs live. | 5 | Better social play than passing one phone around |
| 6 | **Offline first.** The whole hunt (map tiles, media, logic) downloads ahead of time; GPS works without data. | 7 | Engineering discipline that many competitors skip |
| 7 | **Branching stories and seasonal events.** Choices change the ending; monthly city-wide events give locals a reason to come back. | 8, 9 | Recurring content becomes habit |
| 8 | **Honest pricing.** One price per group per hunt, a free first chapter, refunds in-app with one tap. | 4 | Turns competitors' worst reviews into our selling point |
| 9 | **Local-business "treasure."** The final stop or a bonus clue gives a real reward (a café pastry, a museum discount). Partners pay to be included. | Revenue | Second revenue stream that can subsidize free hunts |

### What we deliberately won't do (at first)
- Hundreds of thin AI cities. We start with **2–3 cities done extremely well**, then scale with the creator tools.
- Full AR. It drains batteries and makes people stare at screens. We use light camera-based clues instead.
- Corporate team-building sales at launch. It's a later revenue channel, built on the same group-play engine.

## 4. Business model

- **B2C:** free first chapter, then about €12–20 per group per hunt, or a City Pass subscription (unlimited hunts in one city for 30 days).
- **Creators:** 50–70% revenue share.
- **Partners:** businesses pay to feature as a stop or a reward; tourism boards sponsor hunts.
- **B2B (phase 3):** team-building and school packages built on the same engine.

## 5. MVP scope

1. One pilot city with 3 handcrafted hunts, all built as modular "clue nodes"
2. Adaptive route builder that takes time budget and accessibility filters
3. Offline download and GPS geofence check-in
4. Clue types: be-there questions, photo match, cipher or riddle
5. Group mode for 2–6 phones with roles
6. One-tap "this clue is broken" report

**Success metrics:** completion rate above 70%, NPS above 50, rate of broken-clue reports, and share of groups that buy a second hunt.

## Sources
- [Questo – City scavenger hunts](https://questoapp.com/blog/city-scavenger-hunt-the-best-way-to-explore-any-city)
- [Questo – Escape-room alternatives](https://questoapp.com/blog/escape-room-alternatives-10-interactive-city-games-worth-trying)
- [World City Trail alternatives (AlternativeTo)](https://alternativeto.net/software/world-city-trail/)
- [World City Trail ranking (mwm.ai)](https://mwm.ai/apps/world-city-trail/1627220764)
- [Let's Roam reviews (Trustpilot)](https://www.trustpilot.com/review/www.letsroam.com)
- [Let's Roam competitors (CB Insights)](https://www.cbinsights.com/company/lets-roam/alternatives-competitors)
- [GooseChase reviews (Justuseapp)](https://justuseapp.com/en/app/437330879/goosechase/reviews)
- [Actionbound (App Store)](https://apps.apple.com/app/actionbound/id582660833)
- [Destplore (App Store)](https://apps.apple.com/app/id6736933313)
- [CityDiscovery (AppGoblin)](https://appgoblin.info/apps/6746806637)
