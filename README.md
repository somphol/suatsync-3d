# SuatSync 3D

**Chinabunchorn 9 Recitations — Chanting & Karaoke Studio**

A single-page, bilingual studio for chanting the Chinabunchorn Chant (พระคาถาชินบัญชร) nine times.
Large Pali lines, Thai meaning and English gloss stay in step with a YouTube chant video — or with
your own audio file, or a silent guide timer. A slow golden lotus mandala turns behind the text and
keeps a petal for every round you finish.

[**Open the studio →**](https://somphol.github.io/suatsync-3d/)

[![Landing screen](docs/screenshot-landing.png)](https://somphol.github.io/suatsync-3d/)

No account. No build step. No analytics. Practice history stays in your browser.

---

## What it does

- **Nine full recitations.** Fifteen Chinabunchorn verses per round, with the Namo, the traditional
  homage and a dedication (แผ่เมตตา) at the close.
- **Karaoke that follows the sound.** The active line grows brighter as it plays; click any line to
  jump to its timestamp.
- **Three sound sources.** The official YouTube video, a local MP3/M4A/OGG, or a silent guide timer
  with a soft bell at each completed round.
- **Calibration when the video differs.** Sync Lab stores the start of the intro, each of the nine
  rounds and the dedication, so the text can match any edition.
- **A practice that remembers.** Round completion, full sittings, day streaks, lifetime minutes and a
  private JSON export.
- **Bilingual, dual-script.** Thai or English interface; Thai Pali script or Roman transliteration;
  Thai meaning always available, with an English gloss in English mode.
- **Made to be read.** High contrast, generous type, focus mode, keyboard controls, reduced-motion
  support and a print view of the full chant.

![Karaoke view](docs/screenshot-karaoke.png)

## Quick start

There is nothing to install and nothing to compile.

```bash
git clone https://github.com/somphol/suatsync-3d.git
cd suatsync-3d
python3 -m http.server 8080
# open http://localhost:8080/
```

`npm start` runs the same server. Opening `index.html` directly with `file://` mostly works, but the
YouTube IFrame API requires an `http(s)` origin, so use a local server for video playback.

### First chant

1. Choose **YouTube**, **My audio** or **Timer** in the Sound panel.
2. Press **Play**. With YouTube, press **Connect the video** first — the embed is not loaded before
   that, so no YouTube cookie is set until you ask.
3. Chant the highlighted line. The list below shows the rest of the round; click a line to seek.
4. Finish all nine rounds. The mandala lights one petal per round and records the sitting.

## Features

### Sound

| Control | Behaviour |
| --- | --- |
| Play / pause | Fades the volume in and out when Soft fade is on |
| Restart | Returns to 0:00 without changing the play state |
| Volume | 0–100, applied to YouTube or the local audio element |
| Tempo | 0.75×–1.25×, pitch preserved (`setPlaybackRate` / `playbackRate`) |
| Mute | Fades to silence and back |
| My audio | Plays a local file via an object URL; it never leaves the tab |
| Timer | A silent media clock with an optional completion chime |

### Karaoke and Sync Lab

The timeline is a set of eleven markers: intro, rounds 1–9, dedication. Inside a section, each line
receives a slice of time proportional to its Pali length. That makes the dataset portable and lets the
same verses stretch or compress with the audio.

Default markers assume the source video's measured length of **5,837 seconds (1:37:17)**. They are
estimates, not chapter data — the video description contains no chapters. If the spoken intro or a
round starts elsewhere, open **Sync Lab**, pause the video at the real start, press **Use current**,
and save. Markers are stored in `localStorage`; nothing is uploaded.

### Progress

- A round is marked complete only after at least 50% of it has actually played and the playhead
  reaches its end. Seeking straight to the end does not count.
- Finishing all nine rounds records a sitting, updates the streak and opens a summary.
- Streaks are consecutive calendar days with a completed nine-round sitting.
- `Reset this sitting` clears the current nine rounds without touching history.
- **Session history → Export JSON** downloads settings, calibration, totals and sittings.

### The mandala

The 3D scene is generated at runtime with Three.js r128: a gold lotus mandala of nine outer petals
(one per round), fifteen inner petals (one per verse), concentric rings, an emissive core, a soft glow
sprite and 460 additive particles. It rotates slowly, breathes with the audio analyser when a local
file is playing, and lights a petal when a round is completed. YouTube audio is cross-origin and cannot
be analysed; in that mode the pulse is a gentle synthetic envelope. Reduced-motion preferences stop
the rotation.

## Controls

| Key | Action |
| --- | --- |
| `Space` | Play / pause |
| `←` / `→` | Seek 5 seconds (`Shift` = 30 seconds) |
| `M` | Mute / unmute |
| `F` | Focus mode |
| `Esc` | Close the open dialog |

## Screenshots

| Roman + English | Sync Lab | Mobile |
| --- | --- | --- |
| ![Roman transliteration](docs/screenshot-roman.png) | ![Sync Lab](docs/screenshot-sync.png) | ![Mobile](docs/screenshot-mobile.png) |

## Verification

The release ships with two dependency-free checks.

```bash
node scripts/check.mjs                 # static contract: files, links, syntax, dataset, hygiene
node scripts/verify-browser.mjs        # headless Chrome: 27 self-tests + DOM + interactions
node scripts/verify-browser.mjs --screenshots   # also refreshes docs/screenshot-*.png
```

`check.mjs` prints `OK <n> checks`. `verify-browser.mjs` starts its own server and exits 0 only when
the in-app tests, DOM checks, timer transport, Sync Lab and console-error scan all pass. Node 22+ and
Chrome/Chromium are required; set `CHROME_PATH` if Chrome is not in the usual place.

The last verified run is recorded in [docs/TESTING.md](docs/TESTING.md) and
[docs/BUILD-STATE.md](docs/BUILD-STATE.md).

## Project layout

```text
index.html                 structure, dialogs, bilingual hooks
style.css                  design tokens, layout, responsive, print
script.js                  dataset, i18n, timeline, audio, renderer, 3D, tests
docs/                      architecture, reproduction, content, testing, deployment
scripts/check.mjs          static release contract
scripts/verify-browser.mjs headless verification and screenshots
state.json                 build record: time, tokens, verification
```

There is no bundler, framework, backend or service worker. Three.js is the only runtime dependency and
is loaded from cdnjs; the app degrades to a static, readable karaoke surface without it.

## Deploy

GitHub Pages serves the repository root. Push `main`, then confirm the Pages build.

```bash
git push origin main
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for repository creation, Pages API settings, cache
behaviour and the post-deploy smoke test.

## Documentation

- [docs/REPRODUCTION.md](docs/REPRODUCTION.md) — the rebuild book for another engineer or agent
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — runtime map and state schema
- [docs/CONTENT.md](docs/CONTENT.md) — chant edition, translations, timing model
- [docs/TESTING.md](docs/TESTING.md) — what was run and what it proved
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Pages operations
- [docs/DESIGN.md](docs/DESIGN.md) — visual and interaction system
- [AGENTS.md](AGENTS.md) — handoff for the next agent
- [CONTRIBUTING.md](CONTRIBUTING.md) · [SECURITY.md](SECURITY.md) · [CHANGELOG.md](CHANGELOG.md)

## Credits

- Chant text: traditional Thai Pali recension, reproduced from Thai Wikisource (CC BY-SA 4.0); Thai
  and English glosses written for this project.
- Video: [Joao Felix — Chinabunchorn 9 recitations](https://www.youtube.com/watch?v=LAo569-mflM),
  embedded, never re-hosted.
- Built with [OpenCode](https://opencode.ai/) and **DeepSeek V4.1 Flash**.
- Three.js r128 (MIT).

## Licence

Code, interface and original glosses: **MIT**. Chant transcription: CC BY-SA 4.0. Video: all rights
with its creator. See [LICENSE](LICENSE) and [ATTRIBUTION.md](ATTRIBUTION.md).
