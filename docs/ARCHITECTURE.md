# Architecture

## One page, three layers

```text
┌──────────────────────────────────────────────────────────────┐
│ Fixed #stage: Three.js canvas + vignette (pointer-events:none)│
├──────────────────────────────────────────────────────────────┤
│ .topbar   brand · Pali toggle · language · about              │
│ .hero     title, lede, four lifetime stats                    │
│ .studio                                                       │
│   .path-panel   rounds 1–9 · section jumps · streak           │
│   .karaoke      badge · now-card · line list                  │
│   .player-panel sources · video · transport · volume · sync   │
├──────────────────────────────────────────────────────────────┤
│ fixed .transport   seek · play · ±15s · focus                 │
│ <dialog> × 4 + toast                                          │
└──────────────────────────────────────────────────────────────┘
```

Load order: `style.css`, CDN Three.js r128, `script.js`. There is no module graph, bundler, server or
service worker. `script.js` is a single strict-mode IIFE and exposes `window.SuatSync` only after boot.

## Data flow

```text
YouTube / file / timer
        │  position(), duration()
        ▼
   audio adapter ──────────────► renderNow() at ~9 fps
        │                         │
        │                         ├─ Timeline.lineAt(pos) → section, index, bounds, progress
        │                         ├─ line list active/done
        │                         ├─ transport, badges, meters
        │                         └─ 3D petal states
        │
        └─ 1 s interval → processPlayback(pos)
                              ├─ accum[round] += delta
                              └─ threshold met → markRound(n)
                                                   └─ all 9 → finishSession()
```

The 1-second interval is deliberate: `requestAnimationFrame` stops in hidden tabs, while background
intervals are only throttled. A delta larger than 4 s is discarded, so a seek never credits listening.

## State schema

Key: `localStorage["suatsync3d.v1"]`.

```jsonc
{
  "settings": {
    "lang": "th",              // "th" | "en"
    "script": "thai",          // "thai" | "roman"
    "volume": 70,              // 0–100
    "rate": 1,                 // 0.75–1.25
    "fade": true,
    "showVideo": true,
    "source": "youtube",        // reset to youtube on boot
    "theme": "midnight",        // midnight | emerald | saffron | rosewood
    "fontSize": "medium",       // small | medium | large
    "atmosphere": "night"       // night | clouds | ocean | forest
  },
  "session": {
    "startedAt": "ISO",
    "savedAt": "ISO",
    "accum": [0,0,0,0,0,0,0,0,0],  // seconds played per round
    "done": [false,false,false,false,false,false,false,false,false],
    "completedAt": null
  },
  "stats": {
    "roundsTotal": 0,
    "totalSeconds": 0,
    "sessions": [
      { "date": "2026-11-04", "rounds": 9, "seconds": 5400, "completedAt": "ISO" }
    ]
  },
  "savedAt": "ISO"
}
```

`normalizeStore` is the only trust boundary. It drops unknown keys, validates enums, clamps numbers,
coerces arrays, rebuilds missing objects and tolerates JSON that is not an object. A stored session
older than 24 hours is cleared on boot (lifetime stats remain).

## Timeline

`Timeline` is a pure facade over `audio.duration()` and `timings.js`.

| Method | Contract |
| --- | --- |
| `duration()` | Media length, or `NOMINAL_DURATION` (5837) |
| `markers()` | 11 absolute seconds; scaled defaults or custom |
| `sectionAt(t)` | 0 intro, 1–9 rounds, 10 dedication |
| `sectionStart/End/Duration(s)` | Boundaries derived from markers |
| `explicitStarts(s)` | 15 absolute verse starts from `timings.js`, or `null` |
| `lineStart(s,i)` / `lineEnd(s,i)` | Exact cue bounds, explicit or weighted |
| `linesFor(s)` | `INTRO`, `VERSES`, `OUTRO` |
| `lineAt(t)` | Current line plus section/line bounds and 0–1 progress |
| `label(s)` | Localised section name |

Sections are contiguous: there is no gap. Without an explicit cue sheet, `lineAt` allocates each line
a span proportional to `max(30, pali.length without spaces) × (weight || 1)`. With
`data/timings.csv` → `timings.js`, complete rounds use absolute per-verse starts instead. The
generated file is loaded before `script.js` as `window.SUAT_TIMINGS`. There is no in-app calibration;
the CSV is the only timing authority.

## Audio adapter

`audio` owns all three sources. Public surface:

```text
source, playing, muted, rate, volume, level
duration()  position()  playAudio()  pauseAudio()  togglePlay()
seekTo(t)   restartAudio()  applyRate()  applyVolume()
connectYouTube()  setSource(s)  loadFile(file)
```

### YouTube

- `ensureYT(ok, fail)` injects `https://www.youtube.com/iframe_api` once and queues callbacks.
- The player is created on boot (unless `?noauto=1`), paused, and seeks to Round 1 verse 1.
- `onReady` hides the loading placeholder, applies volume/rate, updates duration.
- `onStateChange` mirrors playing/buffering/paused/ended; it also restores volume if the user starts
  via YouTube's own controls (which bypass the fade-in).
- Errors and a 15-second timeout show a reconnect button; the timer and file tabs stay usable.

### Local file

- `<audio id="localAudio" class="sr-only">` is created lazily.
- `URL.createObjectURL(file)` is stored in `audio.fileURL`; the previous URL is revoked.
- On `loadedmetadata`, the current playhead is restored, then a `MediaElementSource → Analyser →
  Gain → destination` graph is attached once.
- The file is never uploaded and is not persisted; a reload asks for it again.

### Timer

`timerPos` is a media-time cursor. While playing, `position()` adds wall-clock elapsed × rate. On pause,
the computed position is frozen. Duration is the nominal video length. It is silent except for the
completion chime.

### Fade state machine

```text
play:   volCurrent = 0 → volTarget = volume → source.play()
pause:  volTarget = 0, pendingPause = true → source.pause() when volCurrent < 0.02
source ends: playing = false; volTarget = volume
mute:   volTarget = 0; unmute restores volume
fade off: volCurrent = volTarget immediately
```

The loop adjusts volume every ~70 ms with a 0.28 ease factor. YouTube receives `setVolume(0–100)`; the
file receives the gain node value.

## Rendering

| Function | Responsibility |
| --- | --- |
| `renderAll` | apply i18n, then all static regions and a forced line render |
| `renderNow` | current line, translation, badge, count, progress, transport |
| `renderLineList` | rebuild the active section's 15/3/2 rows |
| `renderLineStates` | active/done classes and non-page-scrolling auto-scroll |
| `renderRounds` | 9 pills, done/partial/current states |
| `renderJump` | 11 section buttons with timestamps |
| `renderSource` | tabs, video visibility, file/timer blocks, source note |
| `renderSession` / `renderStats` | sitting meter and lifetime streak/minutes |
| `renderPlayState` | play/pause icon, aria labels, mute state, status chip |

DOM writes are intentionally coarse: the line text changes only when `section:index` changes; the
transport updates at ~9 fps; 3D runs every frame.

## 3D scene

`world` holds `scene`, `camera`, `renderer`, `root`, `spin`, `inner`, `petals[9]`, `innerPetals[15]`,
`center`, `glow`, `particles`, `halo`, `palette`, `atmospheres`, `pointer`, `reduced`.

- Renderer: alpha, antialias, DPR capped at 2, no tone mapping.
- Camera: perspective 45°, z = 10.8 desktop / 14.5 mobile, lookAt origin.
- Lights: ambient purple 0.62, warm point at (4,4,6), cool point at (-5,-3,4).
- Geometry: extruded bezier petal, torus rings, icosahedron core, sprite glow, 460-point buffer.
- Motion: slow z rotations, core pulse from `audio.level`, glow opacity, petal scale lerp, pointer
  parallax. `prefers-reduced-motion` disables rotation.
- State: `updatePetalStates` uses `state.session.done` and the active section.
- Appearance: `applyWorldTheme` recolours petals, rings, core, glow, particles, halo and lights from
  `THEMES`; `buildAtmosphereLayers` creates night stars, cloud sprites, ocean bubbles/shafts and forest
  fireflies/beams; `applyAtmosphere` toggles one layer and CSS sets the matching stage wash.

`audio.level` comes from the analyser for local files. For YouTube it is a synthetic slow envelope;
YouTube audio is cross-origin and cannot be analysed.

## Internationalisation

- `I18N.en` and `I18N.th` are complete tables. `t(key, vars)` falls back to English then key.
- Static DOM uses `data-i18n` (text), `data-i18n-html` (title mark-up), `data-i18n-aria`.
- Dynamic strings (section label, status, source note, file name, session copy, streak) are set after
  `applyI18n`.
- The initial language follows `navigator.language` (Thai if it starts with `th`); the stored choice
  wins afterwards.
- Thai Pali script and Roman transliteration are independent of UI language. In Thai-script mode the
  Roman line appears underneath; in Roman mode the primary line is Roman.

## Self-tests

`window.SuatSync.runSelfTests(false)` returns `{ pass, total, failed, checks[] }`. It covers:

- dataset counts and field completeness, unique ids;
- 11 default markers, monotonicity, timing-sheet integrity;
- section mapping at start, round 1, near-end and across 1001 samples;
- line mapping at the intro, round 1 and dedication;
- time formatting and streak arithmetic;
- normalisation of blank, out-of-range and malformed state;
- i18n completeness for every static key;
- nine round labels, 9 pills and 11 jump buttons;
- versioned storage key.

The browser harness adds DOM, interaction and timing checks. See [TESTING.md](TESTING.md).

## Failure modes

| Failure | Behaviour |
| --- | --- |
| Three.js CDN blocked | App still renders; body gets `.no-webgl`; 3D skipped |
| YouTube blocked/offline | Reconnect button appears; timer and local file work |
| `localStorage` blocked | Practice works for the tab; a toast explains it will not persist |
| Audio file cannot decode | Toast; source remains selected, timer still available |
| Tab hidden | 1 s interval keeps crediting playback; full OS suspension stops it |
| Malformed stored JSON | `readStore` ignores it; normal defaults boot |
| Invalid timing sheet | `build-timings.mjs` refuses to write `timings.js` |
