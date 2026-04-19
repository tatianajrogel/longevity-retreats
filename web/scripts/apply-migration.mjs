import { spawnSync } from "node:child_process";
import { resolve6 } from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const migrationsDir = path.join(repoRoot, "supabase", "migrations");
const migrationPlans = [
  {
    file: "20260418000000_complete.sql",
    probe:
      "select to_regclass('public.listings') is not null and to_regclass('public.sync_log') is not null and exists (select 1 from information_schema.columns where table_name='listings' and column_name='luxury_level');",
  },
];

const POOLER_REGIONS = [
  "us-east-1",
  "us-west-1",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
  "ap-northeast-1",
];

function projectRefFromPublicUrl(publicUrl) {
  try {
    const host = new URL(publicUrl).hostname;
    return host.replace(/\.supabase\.co$/i, "") || "";
  } catch {
    return "";
  }
}

function directUrl(ref, pass) {
  const user = encodeURIComponent("postgres");
  const password = encodeURIComponent(pass);
  return `postgresql://${user}:${password}@db.${ref}.supabase.co:5432/postgres?sslmode=require`;
}

function directUrlIpv6(addr, pass) {
  const user = encodeURIComponent("postgres");
  const password = encodeURIComponent(pass);
  return `postgresql://${user}:${password}@[${addr}]:5432/postgres?sslmode=require`;
}

function transactionPoolerUrl(ref, pass) {
  const user = encodeURIComponent("postgres");
  const password = encodeURIComponent(pass);
  return `postgresql://${user}:${password}@db.${ref}.supabase.co:6543/postgres?sslmode=require`;
}

function sessionPoolerUrl(ref, pass, region) {
  const user = encodeURIComponent(`postgres.${ref}`);
  const password = encodeURIComponent(pass);
  return `postgresql://${user}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres?sslmode=require`;
}

async function buildTryUrls(ref, pass, regionOverride) {
  const urls = [];

  try {
    const v6 = await resolve6(`db.${ref}.supabase.co`);
    if (v6?.length) {
      urls.push({
        url: directUrlIpv6(v6[0], pass),
        label: `direct IPv6 [${v6[0]}]:5432`,
      });
    }
  } catch {
    /* no AAAA */
  }

  urls.push({
    url: transactionPoolerUrl(ref, pass),
    label: `transaction pooler db.${ref}.supabase.co:6543`,
  });
  urls.push({
    url: directUrl(ref, pass),
    label: `direct db.${ref}.supabase.co:5432`,
  });

  if (regionOverride) {
    urls.push({
      url: sessionPoolerUrl(ref, pass, regionOverride),
      label: `session pooler aws-0-${regionOverride}:5432`,
    });
  }
  for (const r of POOLER_REGIONS) {
    if (r === regionOverride) continue;
    urls.push({
      url: sessionPoolerUrl(ref, pass, r),
      label: `session pooler aws-0-${r}:5432`,
    });
  }

  return urls;
}

async function resolveDatabaseUrl() {
  const explicit = process.env.DATABASE_URL?.trim();
  if (explicit) return { url: explicit, label: "DATABASE_URL" };

  const pass = process.env.SUPABASE_DB_PASSWORD?.trim();
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!pass || !publicUrl) return null;

  const ref = projectRefFromPublicUrl(publicUrl);
  if (!ref) return null;

  const regionOverride = process.env.SUPABASE_POOLER_REGION?.trim();
  const tryUrls = await buildTryUrls(ref, pass, regionOverride);
  return { tryUrls };
}

function availableMigrationPlans() {
  const files = new Set(fs.readdirSync(migrationsDir));
  return migrationPlans
    .filter((plan) => files.has(plan.file))
    .map((plan) => ({
      ...plan,
      path: path.join(migrationsDir, plan.file),
    }));
}

function runPsql(databaseUrl, migrationPath) {
  return spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", migrationPath], {
    stdio: "inherit",
  });
}

function migrationAlreadyApplied(databaseUrl, probeQuery) {
  const result = spawnSync(
    "psql",
    [
      databaseUrl,
      "-Atqc",
      probeQuery,
    ],
    { encoding: "utf8" },
  );

  if (result.error || result.status !== 0) return false;
  return result.stdout.trim() === "t";
}

function applyPendingMigrations(databaseUrl, label) {
  const plans = availableMigrationPlans();
  let appliedAny = false;

  for (const plan of plans) {
    if (migrationAlreadyApplied(databaseUrl, plan.probe)) {
      console.error(`Skipping ${plan.file}; already applied.`);
      continue;
    }

    console.error(`Applying ${plan.file}${label ? ` via ${label}` : ""} ...`);
    const psql = runPsql(databaseUrl, plan.path);
    if (psql.error) {
      console.error(psql.error.message);
      process.exit(1);
    }
    if ((psql.status ?? 1) !== 0) {
      process.exit(psql.status ?? 1);
    }
    appliedAny = true;
  }

  if (!appliedAny) {
    console.error("Schema already present; nothing to apply.");
  }

  process.exit(0);
}

const resolved = await resolveDatabaseUrl();
if (!resolved) {
  console.error(`
No database connection configured.

Add DATABASE_URL (Dashboard → Connect → Session pooler) or SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL.

Then: npm run db:apply
`);
  process.exit(1);
}

if ("url" in resolved && resolved.url) {
  console.error(`Using ${resolved.label} ...`);
  applyPendingMigrations(resolved.url, resolved.label);
}

let lastStatus = 2;
for (const { url, label } of resolved.tryUrls) {
  console.error(`Trying ${label} ...`);
  applyPendingMigrations(url, label);
}

console.error(`
Migration failed. Set DATABASE_URL to the Session pooler URI from Supabase → Connect, then npm run db:apply
`);
process.exit(lastStatus);
