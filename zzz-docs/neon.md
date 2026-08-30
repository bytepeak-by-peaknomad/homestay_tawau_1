# Neon Database & Reviews Guide

Everything you need to know about the database behind the review system.

## What Neon is

The site stores reviews in a **Neon Postgres** database (Vercel Postgres was retired and is now Neon). The app talks to it with the `@neondatabase/serverless` package using one connection string.

- The **website** is what customers see — reviews render on each homestay page.
- **Neon** is just the storage behind the scenes. You normally only open Neon to inspect or fix data.

## Environment variables

Two are required (set in `.env.local` for local dev, and in Vercel → Settings → Environment Variables for production):

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string, e.g. `postgresql://user:pass@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require` |
| `ADMIN_SECRET` | A long random string **you invent** — used to unlock the `/admin` page |

## Tables

The schema is created automatically on first use. Two tables:

**`reviews`** — the submitted reviews.

| column | type | notes |
| --- | --- | --- |
| `id` | text | uuid |
| `homestay_id` | text | which homestay (see list below) |
| `rating` | integer | 1–5 |
| `title` | text | optional headline |
| `comment` | text | the review text |
| `reviewer_name` | text | guest name |
| `created_at` | timestamptz | when submitted |

**`review_tokens`** — one-time review links.

| column | type | notes |
| --- | --- | --- |
| `token` | text | random secret in the review link |
| `homestay_id` | text | which homestay the link is for |
| `created_at` | timestamptz | when generated |
| `used_at` | timestamptz | set once the link is used (NULL = still valid) |

## Homestay IDs

Used in SQL queries and review links.

| id | name |
| --- | --- |
| `hs-t01` | Rumah Kampung Tawau Homestay |
| `hs-t02` | Sinsuran Townhouse Stay |
| `hs-t03` | Kuhara Garden Homestay |
| `hs-t04` | Takada Riverside Homestay |
| `hs-t05` | Merotai Village Retreat |
| `hs-t06` | Balung River View Homestay |

## How reviews work

1. You open `/admin`, enter `ADMIN_SECRET`, pick a homestay, and generate review links.
2. Each link contains a one-time token. Send one link per guest **after** their stay.
3. The guest opens the link, writes a review, and submits. The token is consumed (one link = one review).
4. The review is saved to `reviews` and shown on the homestay page. Ratings/counts on the homepage and detail page are computed live from the database.

## Using the Neon console (SQL Editor)

**Important:** use the **SQL Editor**, not the "Tables" data viewer. Deleting from the Tables view did not persist (that's why a deleted review kept showing).

- **See all reviews:**
  ```sql
  SELECT * FROM reviews ORDER BY created_at DESC;
  ```
- **See reviews for one homestay:**
  ```sql
  SELECT * FROM reviews WHERE homestay_id = 'hs-t01' ORDER BY created_at DESC;
  ```
- **Delete a review:**
  ```sql
  DELETE FROM reviews WHERE reviewer_name = 'Anif';
  ```
  Then re-run the `SELECT` to confirm it's gone, and hard-refresh the site.
- **See unused / used tokens:**
  ```sql
  SELECT * FROM review_tokens ORDER BY created_at DESC;
  ```

## Branches (gotcha)

Neon has **branches** (like git branches for data). Your `DATABASE_URL` points to one specific branch — usually `main`.

- Check the branch selector at the top of the Neon dashboard matches the `ep-...` host in your `DATABASE_URL`.
- If you run a `DELETE` on a different branch, it won't affect the site (which reads `main`).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Deleted a review but it's still on the site | You used the Tables viewer or the wrong branch. Delete via **SQL Editor** on the correct branch, then hard-refresh (Ctrl+Shift+R). |
| `/admin` says failed / unauthorized | Wrong `ADMIN_SECRET`, or `ADMIN_SECRET` not set in Vercel. |
| Homepage or detail page errors | `DATABASE_URL` missing/incorrect in Vercel (or `.env.local`). |
| Rating still shows old fixed number | Old build. Check Vercel → Deployments for a recent successful deploy. |
