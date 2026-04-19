# Deploying to Bluehost VPS (Ubuntu)

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
sudo mkdir -p /var/www/longevity-retreats /var/log/longevity-retreats
sudo chown $USER:$USER /var/www/longevity-retreats /var/log/longevity-retreats

git clone https://github.com/tatianajrogel/longevity-retreats.git /var/www/longevity-retreats
cd /var/www/longevity-retreats/web
npm install
```

## 3. Configure environment variables

Create `/var/www/longevity-retreats/web/.env.production.local`:

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
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

> **Security**: Never commit this file. It is in `.gitignore`.

## 4. Apply database migrations

```bash
cd /var/www/longevity-retreats/web
npm run db:apply
```

## 5. Build the app

```bash
npm run build
```

## 6. Start with PM2

```bash
cd /var/www/longevity-retreats
pm2 start ecosystem.config.cjs --env production
pm2 status   # confirm it shows "online"
```

## 7. Configure Nginx

```bash
# Replace yourdomain.com in the config first
sed -i 's/yourdomain.com/YOUR_ACTUAL_DOMAIN/g' nginx/longevity-retreats.conf

sudo cp nginx/longevity-retreats.conf /etc/nginx/sites-available/longevity-retreats
sudo ln -s /etc/nginx/sites-available/longevity-retreats /etc/nginx/sites-enabled/
sudo nginx -t          # test config
sudo systemctl reload nginx
```

## 8. Get TLS certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 9. Enable PM2 on reboot

```bash
pm2 startup    # run the command it prints
pm2 save
```

## 10. Zero-downtime redeploy (future updates)

```bash
cd /var/www/longevity-retreats
git pull
cd web
npm install
npm run build
pm2 reload longevity-retreats
```

---

## Google Sheets setup

1. Create a GCP project → enable **Google Sheets API**
2. Create a **service account** → download JSON key
3. Share your Google Sheet with the service account email (Read-only)
4. Set `GOOGLE_SHEET_ID` to the ID from the sheet URL (`/d/YOUR_ID/edit`)
5. Set `GOOGLE_SERVICE_ACCOUNT_JSON` to the JSON key content (minified, one line)

### Sheet column layout (row 1 = headers)

| Col | Field |
|-----|-------|
| A   | title |
| B   | summary |
| C   | body |
| D   | city |
| E   | region |
| F   | country |
| G   | website_url |
| H   | image_url |
| I   | categories (comma-separated slugs) |
| J   | focus |
| K   | price_text |
| L   | luxury_level (Premium / Luxury / Ultra-Luxury) |
| M   | environment (Coastal / Desert / Lakeside / Mountain / Urban) |

Slug → category name mapping:
- `comprehensive-luxury` → Comprehensive Luxury Wellness Programs
- `mindfulness-restoration` → Mindfulness & Restoration
- `fitness-lifestyle-reset` → Structured Fitness & Lifestyle Reset
- `longevity-clinics` → Longevity Clinics Worth Traveling For

---

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✓ | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | Service role key (server-only, never in browser) |
| `ADMIN_CODE` | ✓ | Admin panel password (server) |
| `NEXT_PUBLIC_ADMIN_CODE` | ✓ | Admin panel password (client validation) |
| `SYNC_SECRET` | ✓ | Random string to authenticate `/api/sync` POST |
| `SYNC_CRON_SCHEDULE` | — | Cron schedule (default: `0 * * * *` = hourly) |
| `GOOGLE_SHEET_ID` | — | Google Sheet ID for bulk content sync |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | — | GCP service account JSON (stringified) |
| `DATABASE_URL` | — | Postgres connection string for `npm run db:apply` |
