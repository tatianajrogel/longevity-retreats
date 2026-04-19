import cron from "node-cron";
import { syncFromSheet } from "./sheets-sync";

let started = false;

export function startCron() {
  if (started) return;
  started = true;

  const schedule = process.env.SYNC_CRON_SCHEDULE ?? "0 * * * *";

  if (!cron.validate(schedule)) {
    console.error(`[cron] Invalid SYNC_CRON_SCHEDULE: "${schedule}", defaulting to hourly`);
    cron.schedule("0 * * * *", runSync);
    return;
  }

  cron.schedule(schedule, runSync);
  console.log(`[cron] Google Sheets sync scheduled: "${schedule}"`);
}

async function runSync() {
  console.log("[cron] Google Sheets sync starting…");
  try {
    const result = await syncFromSheet();
    console.log(`[cron] Sync complete — upserted: ${result.upserted}, errors: ${result.errors.length}`);
    if (result.errors.length > 0) {
      result.errors.forEach((e) => console.error("[cron] Sync error:", e));
    }
  } catch (err) {
    console.error("[cron] Sync threw:", err);
  }
}
