# AGENTS.md — SuatSync 3D

> Read [docs/REPRODUCTION.md](docs/REPRODUCTION.md) first — it is the rebuild book. The runtime map is
> in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), verification evidence in
> [docs/TESTING.md](docs/TESTING.md), Pages operations in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 1. What it is

A single-page, bilingual (EN/TH) 3D chanting and karaoke studio for the Chinabunchorn Chant, nine
recitations. It synchronizes large Pali lines (Thai script or Roman transliteration), Thai meaning and
an English gloss to a YouTube chant video, a local audio file, or a silent timer. It includes a
calibratable eleven-marker timeline, per-round completion, day streaks, private `localStorage`
persistence, JSON export, a procedural gold lotus mandala in Three.js, and a print view of the chant.
Source is three files (`index.html`, `style.css`, `script.js`) with no build step and no backend. It is
**not** offline-first (Three.js and the optional YouTube IFrame API come from CDNs), not a
medical/religious authority, and not a framework starter. Release **1.0.0**, MIT.

Live: <https://somphol.github.io/suatsync-3d/> · Local master: `~/Projects/suatsync-3d`

## 2. Commands

```bash
# install: none — no dependencies, no build
python3 -m http.server 8080            # then open http://localhost:8080/
npm start                              # same server

node scripts/check.mjs                 # static contract; must print "OK <n> checks"
node scripts/build-timings.mjs         # data/timings.csv → timings.js
node scripts/verify-browser.mjs        # headless Chrome; 27 self-tests + 8 DOM + 9 interaction checks
node scripts/verify-browser.mjs --screenshots   # also rewrites docs/screenshot-*.png
CHROME_PATH="/path/to/Chrome" node scripts/verify-browser.mjs
```

`verify-browser.mjs` requires Node 22+ (built-in `WebSocket`) and starts its own server on a free port.
It exits non-zero on any failed self-test, DOM check, interaction, Sync Lab check or uncaught console
error. Deploy is `git push origin main`; GitHub Pages serves the repository root.

## 3. Architecture

Load order: `index.html` → `style.css` → CDN Three.js r128 → `script.js`. `script.js` is one
strict-mode IIFE in twelve numbered sections:

1. **Chant dataset** — `INTRO` (3 lines), `VERSES` (15), `OUTRO` (2). Fields: `id`, `pali`, `roman`,
   `th`, `en`, optional `weight`. Thai Pali is the canonical text; Roman is a pronunciation guide.
2. **I18N** — complete `en` and `th` tables plus runtime keys (`streakActive`, `days`). `t(key, vars)`
   interpolates `{name}`; `applyI18n` fills `[data-i18n]`, `[data-i18n-html]`, `[data-i18n-aria]`.
3. **Utilities** — `formatTime`, `dateKey`, `addDays`, `computeStreak`, `detectLang`, `weightedTotal`.
   Thai is the default language when the browser locale starts with `th`.
4. **Persistence** — `DEFAULT_SETTINGS`, `defaultMarkers()`, `normalizeStore()`, `readStore`,
   `persist`; key `suatsync3d.v1`. Every field is normalised on read.
5. **Timeline** — `Timeline` object: `markers()`, `sectionAt()`, `explicitStarts()`, `lineStart()`,
   `lineEnd()`, `linesFor()`, `lineAt()`, `label()`. Eleven markers, index 0 intro, 1–9 rounds, 10
   dedication. Per-verse starts can come from the generated `timings.js`; otherwise lines are weighted
   by text length.
6. **Audio engine** — `audio` object with a unified `position()` / `duration()` / `playAudio()` /
   `pauseAudio()` / `seekTo()` across YouTube (`YT.Player`), local `<audio>`, and a performance-clock
   timer. Soft fade, volume, rate, analyser, completion chime, consent-first YouTube loader.
7. **Rendering** — `cacheElements`, `applyI18n`, `renderRounds`, `renderJump`, `renderSource`,
   `renderLineList`, `renderNow`, `renderSession`, `renderStats`, `renderPlayState`, `updateTransport`.
8. **Progress** — `processPlayback`, `markRound`, `finishSession`, `resetSession`, `clearHistory`,
   `renderHistory`, `exportPractice`, `printChant`.
9. **3D mandala** — `initWorld`, `updatePetalStates`, `resizeWorld`, `updateWorld`; nine outer petals,
   fifteen inner petals, core, glow sprite, rings, 460 particles; pointer parallax.
10. **Sync Lab** — `validateMarkers`, `renderSyncRows`, `saveSync`, `resetSync`; strictly increasing
    markers, stored locally.
11. **Events** — language/script toggles, source tabs, transport, line seeks, keyboard shortcuts,
    dialogs, resize, visibility. Playback accumulation is driven by a 1-second interval so it keeps
    working when `requestAnimationFrame` is throttled.
12. **Loop / self-tests / boot** — `loop` (volume fade, UI at ~9 fps, 3D at 60 fps), `backgroundTick`,
    `runSelfTests`, `init`, `window.SuatSync` debug API, `data-suat-sync="ready"` marker.

## 4. Decisions and constraints

- **Three.js is pinned to r128 as a classic script.** Do not convert to ES modules without replacing
  the global `THREE` usage and the CDN URL. The app must still boot and read when Three.js is absent.
- **No build step and no backend.** Keep the three files directly runnable from disk or Pages.
- **The 15 verses are canonical.** Edit them in `script.js` only, and keep all four fields filled.
  `scripts/check.mjs` enforces 15 verse ids and 20 complete bilingual line records (3 intro + 15
  verses + 2 dedication).
- **`weight` is a multiplier on text length**, not a duration in seconds. Verses 9 and 15 use 1.5× and
  1.7×. Treating the number as an absolute weight collapses those verses to under a second.
- **Timing is estimated, never claimed as chapter data.** The source video is 5,837 s and has no
  chapters. Default markers split intro (0–218 s), nine equal rounds of 591 s, dedication (from
  5,537 s). Round 1 verse 1 is measured at 3:38; the remaining round anchors are equally spaced
  estimates. If you change the video, change `NOMINAL_DURATION` and `defaultMarkers()`; custom markers
  stay absolute.
- **Line timing is proportional to Pali length by default**, via `lineWeight` and `lineAt`. Exact
  per-verse starts can be supplied in `data/timings.csv`, which builds `timings.js`; those override
  proportional timing for complete rounds. Sync Lab calibration overrides both. Do not edit
  `timings.js` by hand.
- **YouTube is consent-first.** The IFrame API script and player must only be created inside
  `connectYouTube()`, which is called by a user gesture. Do not auto-connect on boot.
- **Video is embedded, never downloaded or re-hosted.** Keep the credit and the outbound link.
- **Round completion requires listening.** `processPlayback` credits at most 4 s per tick and requires
  ≥50% coverage plus reaching the round end. Do not replace this with a simple seek check.
- **Storage schema is versioned and tolerant.** `suatsync3d.v1` normalises every field; older or
  malformed values must not throw. Export shape is public: `settings`, `calibration`, `stats`,
  `session`.
- **Audio starts on a gesture.** Never autoplay. Local file is kept as an object URL in the tab only.
- **The UI is bilingual in both directions.** Every `data-i18n` key must exist in both tables; the
  self-test enforces it. Keep Thai copy natural, not literal.
- **Accessibility is part of the contract.** Preserve skip link, focus styles, dialog semantics,
  `aria-pressed`/`aria-current`, reduced-motion and print behaviour.
- **No tracking, cookies, webfonts or third-party analytics.** Only cdnjs (Three.js), YouTube (on
  demand) and the user's own file.

## 5. Known issues

- Default karaoke timings are estimates. The first minute of a round can drift by tens of seconds until
  Sync Lab is used. This is documented in the UI and [docs/CONTENT.md](docs/CONTENT.md).
- YouTube's cross-origin audio cannot feed the Web Audio analyser. The 3D pulse in YouTube mode is a
  synthetic envelope, not real frequency data. Local files do use a real analyser.
- Headless WebGL needs SwiftShader flags; `verify-browser.mjs` passes them. Plain `--disable-gpu` can
  produce a blank canvas.
- Browser autoplay policies may require a second press after switching to a local file; the app catches
  `play()` rejection and shows a toast.
- A background tab that is fully suspended by the OS stops `setInterval`; a round then needs to be
  watched in the foreground. The 1-second interval covers ordinary throttling, not full suspension.
- `file://` cannot create the YouTube player (origin), and some browsers block `localStorage` on
  `file://`. Use the local server for the full experience.
- The print view opens a new window; a popup blocker can require a second press. It then calls the
  browser's print dialog.
- `navigator.language` chooses the initial UI language once; after that the stored choice wins.
- There is no service worker or manifest, so the app is not installable and not offline-first.

## 6. Continuity

- Deployed copy: <https://somphol.github.io/suatsync-3d/> (branch `main`, repository root, `.nojekyll`).
- Repository: <https://github.com/somphol/suatsync-3d>
- Local master: `~/Projects/suatsync-3d`
- Build record: [state.json](state.json) and [docs/BUILD-STATE.md](docs/BUILD-STATE.md)
- Skill: `~/.config/opencode/skills/suatsync-3d-studio` and the public catalog
  <https://somphol.github.io/opencode-skills/>
- Credit: built with OpenCode + DeepSeek V4.1 Flash.
