# Design notes

## Concept

A dark meditation hall, not a media player. The interface is built around one luminous line of Pali at
a time, with a slow gold mandala turning behind it. Controls are quiet until needed; the chant is the
loudest thing on the screen.

Three principles:

1. **The line is the interface.** Type size, contrast and position do the work. Chrome recedes.
2. **Gold is meaning, not decoration.** Gold marks the active line, the current round, the streak and
   completed petals. It is never used for large flat surfaces.
3. **Nothing moves faster than the chant.** Rotation, pulse and fades are slow; the only brisk motion is
   a control press.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0b0a14` | Page, deep indigo-black |
| `--panel` | `rgba(24,21,36,.76)` | Glass panels |
| `--ink` | `#f7f1e3` | Primary text, warm cream |
| `--ink-soft` | `#ded4bf` | Translation and lede |
| `--muted` | `#a99f8c` | Secondary labels |
| `--gold` | `#e9b85c` | Accent, active state |
| `--gold-bright` | `#ffdc96` | Highlight, focus |
| `--gold-deep` | `#a97427` | Progress fills |
| `--good` | `#8fd3a8` | Completed round |
| `--line` | `rgba(233,184,92,.16)` | Hairlines |

Contrast: cream on the near-black panel is >12:1; muted text is used only at ≥14 px and is not the
sole carrier of meaning. Gold on dark is >8:1. Completed state also uses a check mark, not colour
alone.

## Type

- **Display:** `Trirong`, `Sarabun`, `Noto Serif Thai`, `Iowan Old Style`, Georgia. Used for the title,
  section headings and the Pali line.
- **Sans:** `Sarabun`, `Noto Sans Thai`, `Thonburi`, system. Used for UI, translations and prose.
- **Serif italic:** Iowan/Palatino/Georgia for the Roman transliteration.
- **Pali line:** `clamp(1.55rem, 3.1vw, 2.75rem)`, line-height 1.62, `text-wrap: pretty`.
- **Mobile Pali:** `clamp(1.35rem, 6.4vw, 1.9rem)`, line-height 1.7 to clear Thai marks.
- **Eyebrows:** 0.66–0.7 rem, 0.16–0.28 em tracking, uppercase, gold.

No webfonts are downloaded. This avoids a third-party request and keeps Thai rendering native. The
trade-off is that the exact display face varies by OS; the stacks are chosen so the metrics remain
close.

## Themes, text size and atmosphere

- **Themes:** Midnight (warm gold on indigo), Emerald (jade on forest black), Saffron (amber on
  umber), Rosewood (rose gold on plum). Themes change the CSS tokens *and* the Three.js palette, so the
  mandala, rings, glow and particles follow the interface.
- **Text size:** three stored steps, driven by `--font-scale` (0.9 / 1 / 1.14). It scales the Pali
  line, Roman line, translation and list text, not the whole UI.
- **Atmosphere:** Night (star field), Clouds (drifting sprite banks), Ocean (rising bubbles and light
  shafts), Forest (fireflies, mist and beams). Each is a Three.js layer plus a slow CSS wash on the
  stage. The mandala remains in front; the backdrop is deliberately quieter than the chant.
- All three settings persist in `localStorage` and are exposed in the Appearance card in the Sound
  panel.

## Layout

- Max width 1560 px, 16 px gutters, three columns: 288 px path, fluid karaoke, 336 px player.
- The karaoke card is the visual centre: bordered, 16 px radius, a warm top glow, and a line-progress
  hairline.
- Panels share one glass treatment and a hairline border. They do not stack shadows.
- At 1120 px the player drops below the first two columns and becomes a two-column sub-grid.
- At 840 px everything is one column; the path panel follows the karaoke so the chant is first.
- The fixed transport is the only persistent chrome: seek bar, play, ±15 s, focus.
- The hero is deliberately compact so the studio begins above the fold on a 900 px-tall laptop. On
  phones the lede shrinks and the stats tighten; the karaoke is one short scroll away.

## Interaction

- **Active line:** scale and glow are avoided to prevent reflow; colour, background wash and the
  progress hairline carry the state. The line itself does not animate on every frame.
- **Line list:** the active row is scrolled to the middle of its own container only, never the page.
- **Click-to-seek:** any line in the list seeks to its computed start plus a fraction of a second.
- **Round pills:** one click jumps to that round; a check mark and green hairline mean complete.
- **Timing sheet:** verse cues live in `data/timings.csv`; there is no in-app calibration. The UI
  states that timings come from the measured sheet.
- **Focus mode:** hides the side panels and enlarges the line; the transport remains.
- **Toasts:** single line, 2.8 s, bottom centre, above the transport.
- **Sound:** all playback begins with a gesture. Soft fade is on by default; turning it off makes
  pause/play instantaneous.

## Motion

- Mandala rotation is ~0.000045 rad/ms (one revolution in several minutes).
- Core pulse follows the smoothed audio level plus a 2.6 s breathing sine.
- Active petals lerp scale toward a target; no spring overshoot.
- Hero and studio rise 14 px once on load (0.8 s, staggered).
- The status dot breathes over 2.4 s.
- `prefers-reduced-motion: reduce` removes rotation and nearly all transitions.

## Accessibility

- Skip link to the transport.
- Landmarks: header, main, aside, section, footer; dialogs use native `<dialog>`.
- Every icon-only button has an `aria-label`; toggles use `aria-pressed`; the current round and jump
  use `aria-current`; tabs use `role="tab"` + `aria-selected`.
- Keyboard: Space, arrows, Shift+arrows, M, F, Escape. Events from form controls and open dialogs are
  ignored.
- Focus ring: 2 px gold-bright with 3 px offset.
- Text is not placed over busy 3D without a dark card; the stage is `aria-hidden`.
- Thai line height and wrapping are tested at 320 px.
- Print stylesheet strips the stage, panels and transport.

## Mobile

- 390×844 is the reference. Topbar wraps to two rows; the brand subtitle hides.
- Round pills become a 3-column grid below 560 px; the tag text hides.
- The player panel is full width, video aspect 4:3, and all controls remain 38 px or larger.
- The fixed footer reserves 150 px plus the safe area at the bottom of `body`.
- The mandala camera pulls back to 14.5 so it reads as atmosphere, not a wall of petals.

## What was rejected

- **OrbitControls / free 3D navigation.** It would fight the reading task and add a CDN dependency.
- **Audible autoplay.** The video may load paused on start, but sound still begins only after a press.
- **A second calibration screen.** The CSV is the single timing authority.
- **Word-by-word karaoke highlighting.** Thai/Pali word segmentation is unreliable and would add false
  precision; the line is the unit of chanting.
- **A second page for settings.** Dialogs keep the chant in place.
- **Charts and dashboards.** The streak and the nine petals are enough; this is a practice room, not a
  fitness tracker.
- **Third-party fonts and analytics.** They cost privacy and load time for little gain.
