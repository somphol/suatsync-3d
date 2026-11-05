# Testing

## What is verified

Three layers, all dependency-free.

| Layer | Command | Proves |
| --- | --- | --- |
| Static contract | `node scripts/check.mjs` | Files, local links, syntax, dataset counts, pinned dependencies, hygiene, package metadata |
| In-app self-tests | `node scripts/verify-browser.mjs` → `SuatSync.runSelfTests()` | Timeline maths, calibration validation, streak arithmetic, storage normalisation, i18n completeness, DOM wiring |
| Browser integration | `node scripts/verify-browser.mjs` | Real layout, WebGL, timer transport, seek-to-line, round tracking, reset, Sync Lab, console errors |

Screenshots are regenerated with the same harness:

```bash
node scripts/verify-browser.mjs --screenshots
```

## Environment used for release 1.0.0

- macOS 27.2 (Darwin)
- Node v26.13.0
- Google Chrome 156.0.8078.80, headless with `--use-angle=swiftshader`
- Python 3 static server on an ephemeral port
- No npm dependencies installed

## Last verified run

```text
PASS 27/27 in-app self-tests
PASS 8/8 DOM checks
PASS 9/9 interaction checks
PASS Sync Lab opens with 11 markers
PASS no uncaught runtime errors
OK browser verification complete
```

`scripts/check.mjs` result:

```text
OK 62 checks
```

The static check is intentionally strict about links: if you add a screenshot or doc, update both the
file and the link.

## Live deployment check

After GitHub Pages reported `built`:

```text
GET https://somphol.github.io/suatsync-3d/                 200
<title>SuatSync 3D — …</title>
data-suat-sync="ready"
#paliLine → นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (3 จบ)
```

The DOM check proves the script booted and rendered a line, not merely that the host served HTML.
Catalog: `index.json` lists 13 skills and `suatsync-3d-studio/SKILL.md` returns 200.

## Test inventory

### In-app (27)

1. 15 verses in the canonical dataset
2. intro and dedication present (3 + 2 lines)
3. every verse has Pali, Roman, Thai and English
4. verse ids unique
5. 11 default markers
6. default markers strictly increase
7. calibration validator rejects a flat line
8. calibration validator accepts a ramp
9. `sectionAt(0)` is the intro
10. `sectionAt(round 1 + 1s)` is round 1
11. `sectionAt(end − 1s)` is the dedication
12. `lineAt(0)` is the first intro line
13. `lineAt(round 1 + 0.5s)` is verse 1
14. `lineAt(end − 2s)` is the dedication
15. sections never move backwards across 1,001 samples
16. `formatTime(5837) === "1:37:17"`
17. `formatTime(0) === "0:00"`
18. three consecutive sitting dates produce a streak of 3
19. an incomplete sitting does not count toward a streak
20. blank data normalises to nine empty rounds
21. volume 1000 → 100 and rate 20 → 1.25
22. malformed calibration is replaced by 11 defaults
23. every static i18n key exists in English and Thai
24. nine round labels resolve without `{n}`
25. nine round controls render
26. eleven section jumps render
27. storage key is `suatsync3d.v1`

### DOM (8)

- 9 round pills
- 11 section jumps
- WebGL mandala ready
- canvas at the 1440×900 viewport
- YouTube consent placeholder visible on boot
- 3 source tabs
- 4 dialogs
- intro line rendered

### Interaction (9)

- Roman transliteration renders Latin characters
- jump lands on “Round 1”
- 15 verses render in a round
- seek-to-line selects line 04 (0-based API call `3`)
- timer transport plays and the clock moves
- timer transport pauses
- `markRound(1)` sets the session flag, lights the pill and increments lifetime totals
- `resetSession(true)` clears the sitting
- switching back to Thai renders Thai text

### Sync Lab

- opens modally
- renders 11 rows and 11 numeric inputs
- cancel closes without changing calibration

### Console

Any uncaught exception or `console.error` fails the run, except known benign GPU/autoplay messages.

## Manual checks not automated

These were checked by hand and should be re-checked when changing the area:

- **YouTube on demand.** Press Connect on a normal browser. Confirm the iframe appears, the button is
  pressed after a gesture, the player responds to play/pause/seek/volume/rate, and closing/reloading
  does not create a player before Connect.
- **Local file.** Load an MP3 and an M4A. Confirm metadata, seek, tempo, mute, analyser pulse and that
  no network request carries the file.
- **Mobile Safari.** 390×844 and 360×640, safe-area padding, no horizontal scroll, Thai line wrapping,
  and the fixed transport not covering the active line at rest.
- **Keyboard only.** Tab to every control, Space, arrows, M, F, Escape.
- **Print.** About → Print the chant. The new window should include intro, all 15 verses and
  dedication, and print legibly in black on white.
- **Storage blocked.** Disable site data; the app should still chant and show the warning toast.
- **Offline.** Block cdnjs; the page should still render text and controls without exceptions.

## Known limitations in verification

- Headless Chrome uses SwiftShader, so frame rate and visual fidelity differ from a GPU browser.
  Screenshots are still valid for layout, but not for performance.
- YouTube is deliberately not loaded in CI because it needs a user gesture, network and consent. Its
  integration is verified manually.
- The analyser path is exercised only when a local file is chosen; the harness uses the timer.
- No automated axe/Lighthouse pass is included. The app uses semantic landmarks, labels, focus styles
  and reduced-motion rules, but a screen-reader pass is manual.
- Tests are stateful within one page load: the interaction test marks a round and resets it. A real
  user's stored sitting is cleared by the test only if it runs in the same browser profile; the
  harness uses a fresh temporary profile.
