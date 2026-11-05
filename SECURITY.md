# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.0.x | Yes |

## Reporting a vulnerability

Do not open a public issue for a security problem. Use GitHub's private vulnerability reporting on
the repository (Security → Report a vulnerability), or contact the maintainer through the GitHub
profile. Include the browser/OS, steps to reproduce, impact, and any proof of concept. You should get
an acknowledgement within a few days.

## Scope

SuatSync 3D is a static page with no backend, no accounts and no server-side data. The realistic
attack surface is small:

- **Third-party script:** Three.js r128 from cdnjs. A compromised CDN could run code in the page. The
  version is pinned; there is no SRI because the classic script is loaded by URL. If you need stronger
  supply-chain control, vendor a reviewed copy and update the CSP/deployment notes.
- **YouTube iframe:** loaded only after a user presses Connect. It can set cookies under YouTube's
  policy. The app does not read from or post to it beyond the official API.
- **Local file:** selected by the user, read through an object URL, never uploaded. A malicious media
  file is handled by the browser's decoder, not by application code.
- **localStorage:** contains only practice settings and history. It is readable by any script on the
  same origin, which is why no third-party analytics or remote scripts beyond the pinned CDN are
  allowed.
- **XSS:** user-controlled text is limited to file names, which are inserted with `textContent`. The
  export is generated with `JSON.stringify` and downloaded, not rendered. The print view escapes
  content with `escapeHtml`.

## Out of scope

- Denial of service through enormous local files.
- Browser or OS vulnerabilities.
- Content accuracy of the chant (see [CONTENT.md](docs/CONTENT.md)).
- The privacy practices of YouTube when the user chooses to connect it.
- Missing CSP headers on GitHub Pages (Pages cannot set response headers).

## Hardening checklist for forks

- [ ] Vendor Three.js locally and add a CSP that allows only self, the CDN if vendored, and YouTube
      frames.
- [ ] If you add a backend, add authentication, rate limiting and CSRF protection; none exist today.
- [ ] Never commit tokens, `.env` files or personal paths.
- [ ] Keep `localStorage` free of names, emails or free-text notes.
