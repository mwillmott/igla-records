# IGLA+ Records — Build Handoff

> A complete spec for building the IGLA+ Records web app. Hand this folder to your engineering agent / developer — the prototype HTML files are reference implementations of every design decision below.

---

## 1. What this is

A web app for the **International Group of LGBTQIA+ Aquatics (IGLA+)** — replacing a clunky Google Sheet with a beautiful, browsable archive of championship results, all-time records, member clubs, and athlete profiles.

Two main user types:
1. **Stat-watchers** who land on the Results page to scan all-time records and drill into an athlete behind a record.
2. **Community members** who land on Clubs or Tournaments to see who's competing, find their local club, or relive a championship.

---

## 2. Files in this bundle

### Live prototype (canonical)

| File | Purpose |
|---|---|
| `IGLA Records Dashboard.html` | Root entry point — open this in a browser to see the full working prototype |
| `styles.css` | **The complete G3 design system** — palette, typography, tile primitives, pills, all utility classes |
| `app.jsx` | Top-level App component + routing |
| `icons.jsx` | Inline SVG icon components (lucide-style) |
| `results.jsx` | Results / all-time records hub page |
| `clubs.jsx` | Clubs list page |
| `club-detail.jsx` | Per-club detail page (tournament history) |
| `tournaments.jsx` | Tournaments list page |
| `tournament-detail.jsx` | Per-tournament results page (hero + swim/polo toggle) |
| `swimming.jsx` | Swimming results component (used by Tournament Detail) |
| `waterpolo.jsx` | Water polo standings component (used by Tournament Detail) |
| `profile.jsx` | Athlete profile (career timeline) |
| `data.js` | Mock data for Valencia 2026 results + athlete profiles |
| `data-clubs-tournaments.js` | Mock data for clubs and tournaments |
| `data-records.js` | Mock data for all-time records and club tournament histories |

### Design exploration history (reference only)

| File | Purpose |
|---|---|
| `IGLA Records — Sketch.html` | Design canvas with IA, wireframes, and visual-direction explorations |
| `sketch-*.jsx` / `sketch-styles.css` | Sketch source — kept for reference, not part of the live app |
| `design-canvas.jsx` | Pan/zoom canvas component used by the sketch file |

You can delete the sketch files if you want; they're not used by the live app.

---

## 3. Information architecture

```
                     ┌─ Top nav: Clubs · Tournaments · Results · About ─┐
                     │                                                   │
                     ▼                ▼                  ▼               ▼
                  Clubs        Tournaments           Results          About
                     │                │                  │
                     ▼                ▼                  ▼
              Club Detail     Tournament Detail          │
                     │                │                  │
                     └────────────┬───┴──────────────────┘
                                  ▼
                          Athlete Profile
```

### Page roles
- **Clubs** — browse all IGLA+ member clubs (filter by region, search). Entry point for community.
- **Club Detail** — one club's identity, tagline, lifetime stats, and **tournament history** (the only sub-list). Athletes who've represented a club aren't shown here — clubs change rosters constantly and it would mislead.
- **Tournaments** — list of past/present/upcoming championships. Features the next-up tournament prominently.
- **Tournament Detail** — full results for one championship. Swim/water polo toggle. This is where most drilling-in happens.
- **Results** — the **all-time records hub**. Every all-time record across IGLA+ history, filterable. The main entry point for stat-watchers.
- **Athlete Profile** — career timeline showing every championship that athlete has competed in (swim + water polo unified).
- **About** — placeholder for now.

### Key flows

1. **Find a record → see the athlete**
   Results → filter (event/age) → click row → Athlete Profile

2. **Browse championships → see this year's results**
   Tournaments → click "Valencia 2026" → Tournament Detail → click athlete → Athlete Profile

3. **Find local club → see what they've achieved**
   Clubs → filter by region → click card → Club Detail → click tournament row → Tournament Detail

---

## 4. Design system

The design system is called **G3 · Splash + Depth**. It's defined entirely in `styles.css` as CSS custom properties — port these to your styling solution (Tailwind config, CSS modules, design tokens JSON, etc).

### 4.1 Palette

| Token | Value | Use |
|---|---|---|
| `--bg` | `#eaf4f7` | Page background (pale aqua wash) |
| `--bg-2` | `#d8eaf0` | Subtle secondary surface |
| `--paper` | `#ffffff` | White tile background |
| `--ink` | `#0d3a52` | Deep teal — borders, primary text |
| `--ink-2` | `#3a4a55` | Secondary text |
| `--ink-3` | `#6e7a85` | Tertiary text, captions |
| `--aqua` | `#37a3c4` | Primary aqua (hero, accents) |
| `--aqua-sky` | `#cfeaf3` | Light aqua wash |
| `--aqua-pale` | `#e3f0f5` | Hover state on light surfaces |
| `--coral` | `#ff6f50` | The accent pop — records, live status, highlighter pill |
| `--coral-deep` | `#cf4827` | Coral hover / active |
| `--coral-pale` | `#ffe6dd` | Coral-tinted row backgrounds |
| `--gold` | `#f1c050` | 1st place badge |
| `--silver` | `#c9d0d6` | 2nd place badge |
| `--bronze` | `#c08b5b` | 3rd place badge |

**Restraint rules:**
- Aqua and coral do almost all the work. Don't add new accent colors.
- Medal tones (gold/silver/bronze) are for podium indicators only — not general accents.
- Every primary surface uses `--ink` for its border (2px). This is what makes the system feel chunky and coherent.

### 4.2 Typography

| Font | Stack | Use |
|---|---|---|
| **Display** | `"Instrument Serif", Georgia, serif` | All display headlines, large numbers, italic accents |
| **UI** | `"Geist", -apple-system, system-ui, sans-serif` | Body text, labels, buttons |
| **Mono** | `"Geist Mono", ui-monospace, monospace` | Times, year tags, monospace numbers |

Load from Google Fonts: `Instrument+Serif:ital@0;1` + `Geist:wght@400;500;600;700` + `Geist+Mono:wght@400;500`.

**Type scales (in styles.css as `.display-1` / `.display-2` / `.display-3`):**
- `display-1`: `clamp(48px, 6.5vw, 78px)` — page heroes
- `display-2`: `clamp(36px, 4.8vw, 56px)` — secondary heroes (next-up tournament card)
- `display-3`: `clamp(28px, 3.4vw, 36px)` — section heads (`<h2>`)
- Body: 14.5px / 1.45 line-height
- Section labels (eyebrow text in tables): 10.5px monospace-feeling sans, 0.12em letter-spacing, uppercase

**Italic rule:** any word wrapped in `<em>` inside a `.display` headline becomes italic. Use it for **city names, year, "summer," "every," "record"** — emphasis words. Don't underline, don't squiggle.

### 4.3 The tile primitive

Everything in this system is a tile. Define one base class and color variants:

```css
.tile {
  background: var(--paper);
  border: 2px solid var(--ink);
  border-radius: 16px;
  box-shadow: 3px 4px 0 var(--ink);   /* hard offset, no blur */
}
.tile-lg { border-radius: 24px; box-shadow: 5px 6px 0 var(--ink); }
.tile-sm { border-radius: 14px; box-shadow: 2px 3px 0 var(--ink); }
```

**Color variants:**
- `.tile-aqua` — aqua background, white text (stat tiles)
- `.tile-deep` — deep teal background, white text
- `.tile-coral` — coral background, white text (records, accents)
- `.tile-sky` — sky-aqua background

**The atmospheric hero tile** (the signature element):
```css
:root {
  --depth-overlay: linear-gradient(180deg,
    rgba(255,255,255,0.00) 0%,
    rgba(255,255,255,0.10) 12%,
    rgba(255,255,255,0.00) 22%,
    rgba(255,255,255,0.06) 42%,
    rgba(255,255,255,0.00) 56%,
    rgba(255,255,255,0.09) 76%,
    rgba(255,255,255,0.00) 90%);
}
.tile-depth-aqua {
  background: var(--depth-overlay), var(--aqua);
  color: white;
}
```
This gradient creates the soft horizontal "depth" bands — felt more than seen. **Only the largest tile on each page gets this treatment.** Stat tiles and row tiles stay flat.

**Tile press interaction:**
```css
.tile-pressable:hover  { transform: translate(-1px, -1px); box-shadow: 4px 5px 0 var(--ink); }
.tile-pressable:active { transform: translate(2px, 3px);   box-shadow: 1px 2px 0 var(--ink); }
```

### 4.4 The highlighter pill (`.hl`)

The single visual signature of the brand. A coral pill behind one word in every display headline:

```css
.hl {
  display: inline-block;
  background: var(--coral);
  color: white;
  padding: 0 16px;
  border-radius: 12px;
  border: 2px solid var(--ink);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  line-height: 1.04;
}
```

**Use sparingly.** One `.hl` per page max, on the emphasis word:
- Results page: "Every **record**, ever."
- Clubs: "Find your **family**."
- Tournaments: "Every summer, a new **city**."
- Tournament Detail: "Valencia **2026**"
- Athlete profile: athlete name is its own splash (no `.hl`)

### 4.5 Pills, status badges, buttons

- `.pill` — base pill (border + paper bg). Variants: `.active` (deep teal), `.coral`, `.aqua`, `.ghost`. Used for filters and segmented tabs.
- `.status-pill.live` / `.upcoming` / `.past` — colored uppercase status badges. Live status has a small pulsing dot.
- `.btn` — paper bg + coral/success variants. Used for "Claim profile", "Share", etc.
- `.icon-btn` — square 34px tile-style icon button.

### 4.6 Sport toggle (Swimming ↔ Water polo)

A pill-style segmented control with a sliding active background:

```jsx
<div className="sport-toggle">
  <span className="pill-bg" style={{ left: pillStyle.left, width: pillStyle.width }} />
  <button ref={a} className={sport === 'swimming' ? 'active' : ''}>Swimming</button>
  <button ref={b} className={sport === 'wp' ? 'active' : ''}>Water polo</button>
</div>
```

Animate the `.pill-bg` between the two buttons using their measured offsets (see any of `results.jsx`, `tournament-detail.jsx` for the pattern). 280ms `cubic-bezier(.65,.05,.36,1)`.

### 4.7 Motion

- View enter: `opacity + translateY 8px → 0`, 280ms ease.
- Tile rows: `transform: translate(-1px, -1px)` + shadow shrink on hover.
- Sport toggle pill: 280ms `cubic-bezier(.65,.05,.36,1)`.
- WP team card expansion: `grid-template-rows: 0fr → 1fr` over 320ms.
- Live status dot: 1.6s opacity pulse.

### 4.8 Layout

- Page max-width: **1180px**
- Page horizontal padding: 24px (16px on mobile)
- Bottom padding: 80px
- Sticky top-bar at `top: 16px` (the topbar is itself a floating tile)
- Hero margin-top: 22px from top of content area
- Section margin-top: 40px
- Tile-to-tile vertical gap in lists: 8–10px
- Stat strip is always a 4-column grid (2 on mobile)

### 4.9 Responsive breakpoint

Single breakpoint at **880px**. Below that:
- Page padding shrinks to 16px
- Top-nav becomes horizontally scrollable
- Stat strip collapses to 2 columns
- Record / tournament rows collapse — extra columns hidden
- Profile header stacks (actions below)
- Hero padding shrinks

---

## 5. Components

Each component file in this folder exposes one or more globals via `Object.assign(window, {...})`. In your real build, convert these to ES modules.

### 5.1 `<ResultsView onSelectAthlete>`
The all-time records hub. State: search, course, age, gender, sport (swim/wp), heldOnly.

**Records list row shape:** ★ badge / event + cat + course / athlete + club / tournament + flag / time / year tag.
**Coral row:** records that still stand have a pale coral row background.
**Click athlete name** → Athlete Profile.

### 5.2 `<ClubsView onSelectClub>`
Hero + stats + region-filter pills + search + responsive grid of `.club-card`s.
**Card shape:** color strip on top (uses `clubColor` from data), name + locale + flag, italic tagline, sport pills, footer with members count + gold-medal pill.

### 5.3 `<ClubDetail clubId onBack onSelectTournament>`
Hero tile tinted with the club's signature color. Lifetime KPIs across 5 stat tiles (championships / gold / silver / bronze / records). Sports they participate in (pills). Tournament history list — each row links to the tournament detail.

**Important:** Don't list athletes by name on this page. Athletes move clubs. We show medal counts + records + water polo finish per tournament. If you must add anything athlete-related later, scope it explicitly per-year.

### 5.4 `<TournamentsView onSelectTournament>`
Hero + stats + featured "Next up" tile (deeper aqua, prominent CTA) + filter tabs + list of tournament rows.

**Row anatomy:** year (large display) / flag + name + co-name + dates + podium dots / status pill / participant + clubs stats / records count / chevron.

### 5.5 `<TournamentDetail tournamentId onBack onSelectAthlete>`
Per-tournament page. Breadcrumb → hero → stats → swim/polo toggle → `<SwimmingView>` or `<WaterPoloView>`.

Only Valencia 2026 has full mock data. Other tournaments show a friendly "Results archive" stub. In production, every past tournament should have its own dataset.

### 5.6 `<SwimmingView data onSelectAthlete>`
Filter row (search + course/event/age/gender selects + records-only toggle) + tile-row list of results.

**Row anatomy:** 1/2/3 medal place badge / event + cat + course / athlete + club / "★ New record" status pill if applicable / time / spacer.

### 5.7 `<WaterPoloView data onSelectAthlete>`
Divisions A/B/C grouped. Each team is a `.team-card` with `.team-header` always visible and a collapsible `.roster` block underneath.

- 1st-place team gets `.champion` class (cream gradient background + coral place number).
- Click the header to expand. Cap badges in the roster — `.captain` variant flips the cap badge to filled deep teal.
- Click any roster name → Athlete Profile.

### 5.8 `<AthleteProfile athleteId onBack onSelectAthlete>`
Hero (name as the splash) → meta row → claim/share buttons → 4 stat tiles → vertical timeline.

**Timeline row:** year + flag tournament label on the left, swim + water polo blocks on the right. Each event line: name + cat + place badge + time + "Xth place" or "★ Record" pill.

---

## 6. Data shapes

All shapes live in `data.js`, `data-clubs-tournaments.js`, and `data-records.js`. In production, fetch these from your API.

### Records
```ts
type SwimRecord = {
  id: string;
  event: string;          // "1500m Freestyle"
  course: "LCM" | "SCM";
  age: string;            // "40-44"
  gender: "Men" | "Women" | "Mixed";
  athlete: string;
  athleteId: string | null;  // null when the record was set by a now-broken-record holder
  club: string;
  clubId: string;
  time: string;           // "17:48.22"
  year: number;
  tournament: string;     // "Valencia"
  flag: string;           // "🇪🇸"
  held: boolean;          // is this record still the current best?
  brokenBy?: string;      // when held=false, who broke it
};

type WPTitle = {
  id: string;
  division: "A" | "B" | "C";
  year: number;
  tournament: string;
  flag: string;
  champion: string;
  clubId: string;
  score: string;          // "12–9 v. À Contre-Courant"
  held?: boolean;
};
```

### Clubs
```ts
type Club = {
  id: string;
  name: string;
  short: string;          // "WH2O" — used on small surfaces
  city: string;
  country: string;
  flag: string;
  region: "Europe" | "North America" | "Asia" | "Oceania" | "Africa" | "South America";
  founded: number;
  members: number;
  color: string;          // OKLCH or hex — the club's signature color, used for the card strip + detail-page hero tint
  sports: string[];       // ["Swimming", "Water Polo", "Diving", "Pink Flamingo", ...]
  tagline: string;        // italic, used in both card and detail hero
  medals: { gold: number; silver: number; bronze: number; records: number };
  tournamentsAttended: number;
  topAthletes: string[];  // athleteIds — not displayed on the club detail; used to surface "top of club" elsewhere
  captain: string;        // string name, plain reference
};
```

### Club tournament history
```ts
// IGLA_CLUB_HISTORY[clubId] = []
type ClubTournamentHistory = {
  year: number;
  tournament: string;
  flag: string;
  tournamentId: string | null;   // null if no detail page available
  medals: { g: number; s: number; b: number };
  records: number;
  wpDivision?: "A" | "B" | "C";
  wpFinish?: number;
  isLive?: boolean;
};
```

### Tournaments
```ts
type Tournament = {
  id: string;
  name: string;            // "Valencia 2026"
  coName: string;          // "Gay Games XII" / "IGLA+ Championship"
  city: string;
  country: string;
  flag: string;
  region: string;
  year: number;
  dates: string;           // "June 14 – 21, 2026"
  venue: string;
  status: "live" | "upcoming" | "past";
  participants: number | null;   // null when upcoming
  nations: number | null;
  clubs: number | null;
  records: number | null;
  sports: string[];
  color: string;           // hero gradient base
  description: string;
  highlight: string;
  podium?: string[];       // ["West Hollywood Aquatics", "À Contre-Courant", "London Out To Swim"]
  expected?: { athletes: number; nations: number; clubs: number };  // when upcoming
};
```

### Athletes
```ts
type Athlete = {
  id: string;
  name: string;
  club: string;            // current club name
  clubId: string;
  pronouns: string;
  hometown: string;
  joined: number;          // year first competed
  claimed: boolean;        // has the athlete logged in and verified the profile?
  timeline: AthleteTimelineEntry[];
};

type AthleteTimelineEntry = {
  year: number;
  tournament: string;
  flag: string;
  swimming?: { event: string; category: string; time: string; place: number; record: boolean }[];
  waterPolo?: { team: string; division: "A"|"B"|"C"; finish: number; role: string };
};
```

### Per-tournament results (used by Tournament Detail)
```ts
type SwimResult = {
  id: string;
  event: string;
  course: "LCM" | "SCM";
  age: string;
  gender: "Men" | "Women" | "Mixed";
  athlete: string;
  athleteId: string;
  club: string;
  clubId: string;
  time: string;
  place: number;
  record: boolean;
  year: number;
};

type WaterPoloStandings = {
  divisions: {
    id: "A" | "B" | "C";
    name: string;
    subtitle: string;
    standings: {
      place: number;
      teamId: string;
      team: string;
      wins: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
      roster: { name: string; athleteId: string; role: string; cap: number; captain?: boolean }[];
    }[];
  }[];
};
```

---

## 7. Brand voice

- The org is **IGLA+** (with the coral plus). Always render the `+` in coral.
- Tagline: "Dive in with pride."
- Italics are warmth, not decoration. Use them on emotional/proper-noun words.
- No emoji except country flags + a handful of dot/star symbols for status. The system is friendly without being giddy.
- No squiggles, no rainbows, no neon. Pride lives in the IGLA+ name and the welcome — not the chrome.

---

## 8. Implementation notes for your stack

The prototype uses inline React + Babel + plain CSS for fast iteration. For production, recommend:

- **Framework:** Next.js (App Router) or Remix. Each top-level page becomes a route. Detail pages take `[id]` segments (`/clubs/[id]`, `/tournaments/[id]`, `/athletes/[id]`).
- **Styling:** Port `styles.css` tokens into a Tailwind config or CSS modules. The class names are flat and copy-paste-able. Tile primitives become Tailwind components: `<Tile>`, `<TilePressable>`, etc.
- **Icons:** swap inline SVGs for `lucide-react` (`Waves`, `Trophy`, `Search`, `MapPin`, `Calendar`, `Users`, `Globe`, `ChevronDown`, `ChevronRight`, `ChevronLeft`, `Sparkles`, `Award`, `X`, `Bell`, `Filter`, `ArrowLeft`, `UserPlus`, `CheckCircle`, `Share`, `Hash`, `Target`).
- **Fonts:** load via `next/font/google`.
- **Data:** replace `window.IGLA_*` globals with API fetches. SWR or React Query work well.
- **Search:** the prototype filters in-memory; for a real club/athlete search across a big dataset, hook up Algolia or a server-side search endpoint.
- **State:** local `useState` is fine for view-level state. No global store needed yet.
- **Routing:** prototype uses a single `view` state — replace with file-system routing in your framework of choice. Smooth scroll on navigation, preserve back-button behavior.
- **Accessibility audit needed:** focus rings, keyboard nav for the sport toggle, screen-reader labels on icon buttons, semantic landmarks. Prototype skips most of this.

---

## 9. Authentication / write surfaces

The prototype has placeholder UI for these but no real implementation:

- **Claim profile** — athlete logs in, verifies they own the profile (probably via email associated with a recent tournament registration). After claim, they can edit pronouns / hometown / photo and see a "Claimed" success pill.
- **Share** — copy a profile / club / tournament URL to clipboard.
- **(Future) Submit club** — an org admin can apply for membership. Out of scope for v1.
- **(Future) Register for tournament** — link out to the host's external registration.

---

## 10. What's not built / next steps

| Area | Notes |
|---|---|
| Other sports | IGLA+ has 6 disciplines (Swimming, Water Polo, Diving, Artistic Swimming, Open Water, Pink Flamingo). Currently only Swimming + Water Polo are spec'd. Diving & Artistic will use the swimming row pattern; Open Water needs distance/conditions; Pink Flamingo (team comedic routines) needs a video-card pattern. |
| Tournament archives | Only Valencia 2026 has full data. Each past tournament needs digitized swim results + water polo standings. |
| Club detail | History list is generic for most clubs — WH2O/ACC/LOTS have real histories. Each club needs its full record. |
| About page | Placeholder. Should pull mission, board, partnership info from the real IGLA+ site. |
| Search | Currently in-memory + per-page. A global search (top-bar magnifier) would be valuable. |
| Compare | "Compare two athletes / clubs side-by-side" is a power-user request worth exploring. |
| Records timeline | A "Records broken at this championship" view per tournament would be a great editorial moment. |
| Live splash | When a tournament is live, the homepage could lean harder into real-time updates. |

---

## 11. Quick reference: open the prototype

```
open "IGLA Records Dashboard.html"   # macOS
```
or just drag the HTML file into a browser. No build step needed — everything is CDN-loaded.

For the sketch/exploration canvas (IA + wireframes + design directions):
```
open "IGLA Records — Sketch.html"
```

---

*Built as a high-fidelity prototype. Treat the HTML files as the source of truth for visual and interaction decisions — this document explains the why.*
