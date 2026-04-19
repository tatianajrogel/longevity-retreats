# Longevity Retreats

A curated directory of premium wellness retreats and longevity clinics. Built with Next.js 16, Supabase, and Google Sheets as the bulk content management tool.

## Repository Structure

```
longevity-retreats/
├── web/                        # Next.js application
│   ├── app/                    # App Router pages and API routes
│   ├── components/             # React components
│   ├── lib/                    # Supabase clients, sync logic, cron
│   ├── scripts/                # DB migration and Sheet setup scripts
│   ├── types/                  # TypeScript types
│   └── vercel.json             # Vercel deployment + cron config
├── supabase/
│   └── migrations/
│       └── 20260418000000_complete.sql   # Single consolidated migration
├── nginx/
│   └── longevity-retreats.conf           # Nginx config for VPS
├── ecosystem.config.cjs                  # PM2 config for VPS
└── DEPLOY.md                             # Full VPS deployment guide
```

## Quick Start

```bash
cd web
cp .env.local.example .env.local   # fill in your values
npm install
npm run db:apply                   # create tables + seed 18 retreats
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Curated Directory** — 18+ real retreats grouped by category
- **Browse & Filter** — Full-text search, Environment filter, Luxury Level filter
- **Google Sheets Sync** — Bulk-manage listings from a shared Sheet; auto-syncs hourly
- **Admin CRUD** — Create, edit, publish, delete listings at `/admin`
- **Vercel Cron** — `GET /api/cron/sync` fires every hour on Vercel
- **VPS Support** — `node-cron` runs in-process via Next.js instrumentation hook on self-hosted deployments
- **Row Level Security** — Anonymous read of published listings only

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components) |
| Database | Supabase (Postgres + RLS) |
| UI | React 19, Tailwind CSS 4 |
| Sheets sync | `googleapis` v4 + GCP service account |
| Cron (Vercel) | Vercel Cron Jobs via `vercel.json` |
| Cron (VPS) | `node-cron` via `instrumentation.ts` |
| Deployment | Vercel — or PM2 + Nginx on Bluehost VPS |

## Deployment

| Target | Guide |
|--------|-------|
| Vercel | Push to GitHub → import on vercel.com → add env vars |
| VPS (Bluehost) | See [DEPLOY.md](DEPLOY.md) |

## Environment Variables

Set these in `web/.env.local` (local) or Vercel dashboard (production):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role JWT — server only |
| `DATABASE_URL` | Session pooler URI for `npm run db:apply` |
| `ADMIN_CODE` | Admin panel passphrase |
| `NEXT_PUBLIC_ADMIN_CODE` | Same value — client-side login check |
| `SYNC_SECRET` | Bearer token for `POST /api/sync` |
| `GOOGLE_SHEET_ID` | Sheet ID from the URL |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Minified GCP service account JSON |
| `CRON_SECRET` | Auto-set by Vercel for cron auth |

See `web/.env.local.example` for the full template with instructions.

## Google Sheet Column Layout

| Col | Field | Values |
|-----|-------|--------|
| A | title | Required |
| B | summary | 1–2 sentences |
| C | body | Full description |
| D | city | |
| E | region | State / province |
| F | country | |
| G | website_url | Full URL |
| H | image_url | Full URL |
| I | categories | `comprehensive-luxury`, `mindfulness-restoration`, `fitness-lifestyle-reset`, `longevity-clinics` |
| J | focus | e.g. `Comprehensive wellness` |
| K | price_text | e.g. `From $1,500/night` |
| L | luxury_level | `Premium`, `Luxury`, or `Ultra-Luxury` |
| M | environment | `Coastal`, `Desert`, `Lakeside`, `Mountain`, or `Urban` |

Sync upserts on slug (auto-generated from title). Listings added via the admin panel and not present in the Sheet are never deleted by sync.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:apply` | Apply database migration |
| `npm run sheet:setup` | Write header row to Google Sheet |
| `npm run sheet:populate` | Write all 18 seed retreats to Sheet |
