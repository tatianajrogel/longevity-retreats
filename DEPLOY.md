# Deploying Great Health Retreats to Bluehost VPS (Ubuntu)

The cron job for hourly Google Sheets sync requires a persistent server process. Vercel's free tier does not support cron jobs, so this project is deployed to a Bluehost VPS using PM2 + Nginx.

---

## 1. Server prerequisites

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (process manager)
sudo npm install -g pm2

# Nginx
sudo apt-get install -y nginx

# Certbot (Let's Encrypt TLS)
sudo apt-get install -y certbot python3-certbot-nginx
```

## 2. Clone the repo and install dependencies

```bash
sudo mkdir -p /var/www/great-health-retreats /var/log/great-health-retreats
sudo chown $USER:$USER /var/www/great-health-retreats /var/log/great-health-retreats

git clone -b great-health-retreats https://github.com/tatianajrogel/longevity-retreats.git /var/www/great-health-retreats
cd /var/www/great-health-retreats/web
npm install
```

## 3. Configure environment variables

Create `/var/www/great-health-retreats/web/.env.production.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

ADMIN_CODE=your-strong-password
NEXT_PUBLIC_ADMIN_CODE=your-strong-password

SYNC_SECRET=your-32-char-random-string
SYNC_CRON_SCHEDULE=0 * * * *

GOOGLE_SHEET_ID=1abc...xyz
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

DATABASE_URL=postgresql://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:5432/postgres

BEEHIIV_PUBLICATION_ID=pub_...
BEEHIIV_API_KEY=your-beehiiv-api-key

NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

> **Security:** Never commit this file. It is in `.gitignore`.

## 4. Apply database migrations

```bash
cd /var/www/great-health-retreats/web
npm run db:apply
```

This applies both migrations:
- `20260418000000_complete.sql` — tables, RLS, seed data
- `20260419000000_type_field.sql` — listing_type column

## 5. Build the app

```bash
npm run build
```

## 6. Start with PM2

```bash
cd /var/www/great-health-retreats
pm2 start ecosystem.config.cjs --env production
pm2 status   # confirm it shows "online"
pm2 logs great-health-retreats --lines 20  # check for errors
```

## 7. Configure Nginx

```bash
sudo cp nginx/longevity-retreats.conf /etc/nginx/sites-available/great-health-retreats
sudo ln -s /etc/nginx/sites-available/great-health-retreats /etc/nginx/sites-enabled/
sudo nginx -t          # test config
sudo systemctl reload nginx
```

## 8. Get TLS certificate

```bash
sudo certbot --nginx -d greathealthretreats.com -d www.greathealthretreats.com
```

## 9. Enable PM2 on reboot

```bash
pm2 startup    # run the command it prints
pm2 save
```

---

## Zero-downtime redeploy (future updates)

```bash
cd /var/www/great-health-retreats
git pull
cd web
npm install
npm run build
pm2 reload great-health-retreats
```

---

## How the cron job works on VPS

The hourly Sheets sync runs via `node-cron` inside the Next.js process, registered in `web/instrumentation.ts`. On Vercel the `VERCEL` env var suppresses this so Vercel's own cron route can be used instead. On the VPS, it runs automatically as soon as PM2 starts the app.

The sync schedule is controlled by `SYNC_CRON_SCHEDULE` (default: `0 * * * *` = top of every hour).

You can also trigger a manual sync from the admin dashboard at `/admin`.

---

## Google Sheets setup

1. Create a GCP project → enable **Google Sheets API**
2. Create a **service account** → download JSON key
3. Share your Google Sheet with the service account email (Read-only is enough)
4. Set `GOOGLE_SHEET_ID` to the ID from the sheet URL (`/d/YOUR_ID/edit`)
5. Set `GOOGLE_SERVICE_ACCOUNT_JSON` to the JSON key content (minified, one line)

### Sheet column layout (row 1 = headers)

| Col | Field | Notes |
|-----|-------|-------|
| A | title | Required |
| B | summary | 1–2 sentences |
| C | body | Full description |
| D | city | |
| E | region | State / province |
| F | country | |
| G | website_url | Full URL |
| H | image_url | Full URL |
| I | categories | Comma-separated slugs (see below) |
| J | focus | Legacy free-text field |
| K | price_text | e.g. `From $1,500/night` |
| L | luxury_level | `Premium`, `Luxury`, or `Ultra-Luxury` |
| M | environment | `Coastal`, `Desert`, `Lakeside`, `Mountain`, or `Urban` |
| N | listing_type | See values below |

**Category slugs:**
- `comprehensive-luxury`
- `mindfulness-restoration`
- `fitness-lifestyle-reset`
- `longevity-clinics`

**listing_type values:**
- `Comprehensive Wellness`
- `Immersive Lifestyle Reset`
- `Balanced Wellness`
- `Mindfulness`
- `Fitness Reset`
- `Preventative Diagnostics`
- `Longevity Clinic`
- `Other`

---

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✓ | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | Service role JWT (server-only) |
| `ADMIN_CODE` | ✓ | Admin panel passphrase (server) |
| `NEXT_PUBLIC_ADMIN_CODE` | ✓ | Admin panel passphrase (client) |
| `SYNC_SECRET` | ✓ | Bearer token for `POST /api/sync` |
| `SYNC_CRON_SCHEDULE` | — | Cron schedule, default `0 * * * *` |
| `GOOGLE_SHEET_ID` | — | Google Sheet ID |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | — | GCP service account JSON (minified) |
| `DATABASE_URL` | — | Session pooler URI for `npm run db:apply` |
| `BEEHIIV_PUBLICATION_ID` | — | Beehiiv publication ID (`pub_…`) |
| `BEEHIIV_API_KEY` | — | Beehiiv API key |
| `NEXT_PUBLIC_GA4_ID` | — | Google Analytics 4 Measurement ID |
