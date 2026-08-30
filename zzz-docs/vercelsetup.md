# Vercel Setup Guide

How to host this Next.js app (Tawau Homestay) on Vercel and keep updating it.

## Current Git setup (already done)

- Repository: `homestay_tawau_1`
- Remote: `https://github.com/bytepeak-by-peaknomad/homestay_tawau_1.git`
- Branch: `main`
- Git identity: `bytepeak-by-peaknomad` / `bytepeaknomad@gmail.com`
- Code is pushed to GitHub and tracked at `origin/main`.

## Deploying to Vercel (one-time)

1. Go to https://vercel.com and sign in with GitHub.
2. **Add New → Project**.
3. Select `homestay_tawau_1` from the repo list → **Import**.
4. Vercel auto-detects **Next.js** — no settings to change:
   - No environment variables needed (no backend/database).
   - No build command changes (`next build` is used automatically).
5. Click **Deploy**. You get a public URL like `https://homestay-tawau-1.vercel.app`.

Note: remote images (`picsum.photos`) are already whitelisted in `next.config.ts`, so photos load on the deployed site too.

## Making changes later

Edit the code (or `data/homestays.json`), then:

```
git add -A
git commit -m "describe the change"
git push
```

Vercel rebuilds and redeploys automatically on every push to `main`.

### Important: `data/homestays.json`

`data/homestays.json` is bundled at build time. To update homestay data, edit the JSON and push — no code changes needed, but it does require a rebuild/redeploy (which the push triggers automatically).

## Useful commands

- Dev server: `npm run dev`
- Production build (check before pushing): `npm run build`
- Serve production build locally: `npm start`
- Lint: `npm run lint`

> Tip: on Windows, after installing Git you may need to open a new terminal for the `git` command to be recognized.
