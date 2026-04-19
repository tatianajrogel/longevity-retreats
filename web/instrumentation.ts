export async function register() {
  // Skip node-cron on Vercel — syncs are handled by Vercel Cron via /api/cron/sync
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.VERCEL) {
    const { startCron } = await import("./lib/cron");
    startCron();
  }
}
