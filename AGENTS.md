<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Homestay Hub

Next.js 16 (App Router, TypeScript, Turbopack) + Tailwind v4. Server-rendered, Vercel-ready, no backend or database. `test.py` is an unrelated leftover — leave it alone.

## Commands

- Dev: `npm run dev`
- Build (production check): `npm run build`
- Lint: `npm run lint` (ESLint CLI — `next lint` is removed in Next 16 and does not exist here)

## Data model

- `data/homestays.json` is the single source of truth; `lib/homestays.ts` imports it statically (bundled at build). Editing the JSON requires a rebuild/redeploy.
- `types/homestay.ts` defines the `Homestay` shape; keep JSON and type in sync.
- Add/edit a homestay in the JSON — no code changes needed.

## WhatsApp

- Owner number lives in `lib/constants.ts` (`OWNER_WHATSAPP`, E.164, no `+`/spaces). `waLink(name)` builds the `wa.me` URL with a pre-filled message. Same number for every card.

## Next 16 gotchas to remember

- Remote images (`picsum.photos`) are allowed only because `images.remotePatterns` is set in `next.config.ts`; add new hosts there.
- `next/image` on a remote host needs explicit `width`/`height` or `fill` (cards use `fill` + a sized parent).
- Async request APIs only: `params`/`searchParams`/`cookies` are Promises.
- `next lint` does not exist; `next build` no longer runs linting.

## Structure

- `app/page.tsx` — browse page (server component) with hero; renders `HomestayList`.
- `components/HomestayList.tsx` (client) — search + sort over the homestays.
- `components/HomestayListItem.tsx` (client) — Traveloka-style row card with inline photo gallery; name/`View Details` open the detail page in a new tab (`target="_blank"`).
- `components/ImageGallery.tsx` (client) — big image + scrollable thumbnail strip on the detail page.
- `app/homestays/[/id]/page.tsx` — static detail page (`generateStaticParams`), `notFound()` for bad ids.
- `components/Header.tsx` / `Footer.tsx` — shared chrome, site name `Tawau Homestay`.
- `components/icons.tsx` — small inline SVG icon set (no icon library).
- `app/layout.tsx` — root layout + site metadata.

## Design notes

- Brand color is **orange** (`orange-600`), deliberately distinct from Traveloka's green; WhatsApp CTAs stay `green-600`.
- One city (Tawau) — no city filter. `area` field is the neighbourhood label (Apas, Kuhara, Takada...) used for search + display.
