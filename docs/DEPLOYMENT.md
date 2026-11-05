# Deployment

The studio is a static site. GitHub Pages serves the repository root from `main`; `.nojekyll` keeps
underscore-prefixed paths working and avoids Jekyll processing.

## Repository

- <https://github.com/somphol/suatsync-3d>
- Live: <https://somphol.github.io/suatsync-3d/>
- Local master: `~/Projects/suatsync-3d`

## Create the repository

`gh` is not required. With a GitHub token in the environment (never commit it):

```bash
export GH_TOKEN="$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill | sed -n 's/^password=//p')"
curl -sS -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"suatsync-3d","description":"SuatSync 3D — Chinabunchorn 9 recitations chanting & karaoke studio","homepage":"https://somphol.github.io/suatsync-3d/","private":false,"has_issues":true,"has_wiki":false}'
```

If the credential helper already stores a GitHub credential, this prompts the keychain at most once.
Do not print the token and do not put it in `git remote`; the normal credential helper handles pushes.

```bash
git init
git add -A
git commit -m "SuatSync 3D 1.0.0 — Chinabunchorn karaoke studio"
git branch -M main
git remote add origin https://github.com/somphol/suatsync-3d.git
git push -u origin main
```

## Enable Pages

```bash
curl -sS -X POST \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/somphol/suatsync-3d/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

If Pages is already configured:

```bash
curl -sS -X PUT \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/somphol/suatsync-3d/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

Check the build:

```bash
curl -sS -H "Authorization: Bearer $GH_TOKEN" \
  https://api.github.com/repos/somphol/suatsync-3d/pages/builds/latest
```

Wait for `"status": "built"` (usually under two minutes). The first deployment can take longer.

## Post-deploy smoke test

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://somphol.github.io/suatsync-3d/
curl -s https://somphol.github.io/suatsync-3d/ | grep -o '<title>[^<]*</title>'
curl -s -o /dev/null -w "%{http_code}\n" https://somphol.github.io/suatsync-3d/script.js
curl -s -o /dev/null -w "%{http_code}\n" https://somphol.github.io/suatsync-3d/docs/screenshot-landing.png
```

Then open the live page and check:

1. The mandala renders and the intro line is visible.
2. Thai/English and Thai/Roman toggles work.
3. Timer play advances the line and the clock.
4. Sync Lab opens with 11 rows.
5. Connect YouTube (optional) and confirm the iframe loads only after the click.
6. No console errors.

## Cache behaviour

Pages serves through a CDN with a short cache. After a push:

- HTML is usually fresh within a minute.
- `script.js` and `style.css` may be cached; append `?v=1.0.1` in `index.html` for a hard release
  boundary, or rely on GitHub's ETag revalidation.
- Screenshots in `docs/` can lag; they are documentation, not runtime assets.

## Rollback

```bash
git revert <bad-commit>
git push origin main
```

Pages rebuilds on the new commit. There is no server to restart and no database to migrate.

## Custom domain (not configured)

If one is added later:

1. Add a `CNAME` file with the apex/host.
2. Set the DNS records GitHub documents.
3. Enable HTTPS in repository settings and wait for the certificate.
4. Update `sitemap.xml`, `robots.txt`, Open Graph URLs and `README.md` links.

Do not add a `CNAME` for the current `github.io` deployment.
