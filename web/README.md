# Longevity Retreats

A curated directory of premium wellness retreats and longevity clinics, built with Next.js 16 and Supabase. Google Sheets is used as the bulk content management tool, with an hourly sync cron and a full admin CRUD panel.

## Features

- **Curated Directory** — 18+ real retreats grouped by category, editorially vetted
- **Browse & Filter** — Full-text search + Environment filter + Luxury Level filter
- **Listing Detail Pages** — Program details, focus, pricing, location, and external links
- **Google Sheets Sync** — Bulk-manage listings from a shared Google Sheet; auto-syncs hourly
- **Admin CRUD** — Create, edit, publish, and delete listings from the admin panel
- **Admin Submissions Queue** — Review incoming retreat submissions
- **Scheduled Sync** — `node-cron` job runs in-process via Next.js instrumentation hook
- **Row Level Security** — Anonymous read of published listings only; writes require service role key
- **SEO-Optimized** — Dynamic `<title>` and `<meta>` per listing page
- **Responsive Design** — Mobile-first layout matching the reference design palette

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components, ISR) |
| UI | React 19, Tailwind CSS 4, Lucide icons |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase anon/service-role keys; admin panel code-gated |
| Sheets sync | `googleapis` v4 + GCP service account JWT |
| Cron | `node-cron` via Next.js `instrumentation.ts` |
| Deployment | PM2 + Nginx on Bluehost VPS (see `DEPLOY.md`) |
| Language | TypeScript |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage: hero, filter bar, listings grouped by category |
| `/listings/[slug]` | Listing detail page |
| `/admin` | Admin login |
| `/admin/listings` | All listings table with publish/delete actions |
| `/admin/listings/new` | Create a new listing |
| `/admin/listings/[id]/edit` | Edit an existing listing |
| `/admin/submissions` | Submission review queue |
| `/admin/sync` | Google Sheets sync status + manual trigger |
| `/api/admin/listings` | `GET` all / `POST` create |
| `/api/admin/listings/[id]` | `GET` / `PATCH` / `DELETE` |
| `/api/admin/listings/[id]/publish` | `POST` publish |
| `/api/sync` | `GET` last sync log / `POST` trigger sync |

## Setup

### 1. Supabase Project

Create a Supabase project, then apply the single consolidated migration:

```bash
# Set DATABASE_URL in .env.local (Supabase → Connect → Session pooler URI)
npm run db:apply
```

This creates all tables, RLS policies, indexes, and seeds 18 real retreats.

### 2. Google Cloud — Sheets API

1. Create a GCP project and enable the **Google Sheets API**
2. Create a **Service Account** → generate a JSON key
3. Share your Google Sheet with the service account email (Editor role)
4. Minify the JSON key: `jq -c . service-account.json`
5. Paste the output as `GOOGLE_SERVICE_ACCOUNT_JSON` in `.env.local`

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role JWT — server only |
| `DATABASE_URL` | Session pooler URI for `npm run db:apply` |
| `ADMIN_CODE` | Admin panel passphrase (server-side check) |
| `NEXT_PUBLIC_ADMIN_CODE` | Same value — client-side login validation |
| `SYNC_SECRET` | Bearer token to authenticate `POST /api/sync` |
| `SYNC_CRON_SCHEDULE` | node-cron schedule (default: `0 * * * *`) |
| `GOOGLE_SHEET_ID` | Sheet ID from the URL `/d/<ID>/edit` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Minified GCP service account key JSON |

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run db:apply` | Apply database migrations |
| `npm run sheet:setup` | Write header row to Google Sheet |
| `npm run sheet:populate` | Write all 18 seed retreats to Google Sheet |

## Google Sheet Column Layout

Row 1 is the header row. Add retreats from row 2 onward.

| Col | Field | Notes |
|-----|-------|-------|
| A | title | Required |
| B | summary | Short description (1–2 sentences) |
| C | body | Full description (2–4 paragraphs) |
| D | city | |
| E | region | State / province |
| F | country | |
| G | website_url | Full URL including `https://` |
| H | image_url | Full URL to a hosted image |
| I | categories | Comma-separated slugs: `comprehensive-luxury`, `mindfulness-restoration`, `fitness-lifestyle-reset`, `longevity-clinics` |
| J | focus | Short program focus label |
| K | price_text | e.g. `From $1,500/night` |
| L | luxury_level | Exactly: `Premium`, `Luxury`, or `Ultra-Luxury` |
| M | environment | Exactly: `Coastal`, `Desert`, `Lakeside`, `Mountain`, or `Urban` |

Sync upserts on slug (auto-generated from title). Keep title consistent to update existing rows.

## Data Model

```
categories
  id, slug, name, sort_order

listings
  id, slug, title, summary, body
  city, region, country, website_url, image_url
  featured, status (draft | published)
  focus, length_text, price_text, target_audience, best_for, notes
  luxury_level (Premium | Luxury | Ultra-Luxury)
  environment (Coastal | Desert | Lakeside | Mountain | Urban)
  created_at, updated_at

listing_categories  (junction)
  listing_id, category_id

listing_submissions
  id, business_name, contact_name, contact_email
  website_url, location, category_slug, summary, notes
  status (pending | approved | rejected)
  created_at

sync_log
  id, synced_at, rows_upserted, errors, source
```

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` is used only in server-side API routes — never imported by client components.
- Admin routes check the `x-admin-code` header against `process.env.ADMIN_CODE` (not the public env var).
- `POST /api/sync` requires `Authorization: Bearer <SYNC_SECRET>`.
- RLS allows anonymous `SELECT` only on `listings` and `categories` where `status = 'published'`.

## Deployment

See [DEPLOY.md](../DEPLOY.md) for the full VPS deployment guide (PM2 + Nginx + Certbot).
