module.exports = {
  apps: [
    {
      name: "longevity-retreats",
      cwd: "/var/www/longevity-retreats/web",
      script: "node_modules/.bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        // Fill in the values below on the server — do NOT commit secrets
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
        ADMIN_CODE: "",
        NEXT_PUBLIC_ADMIN_CODE: "",
        SYNC_SECRET: "",
        SYNC_CRON_SCHEDULE: "0 * * * *",
        GOOGLE_SHEET_ID: "",
        GOOGLE_SERVICE_ACCOUNT_JSON: "",
        DATABASE_URL: "",
      },
      out_file: "/var/log/longevity-retreats/out.log",
      error_file: "/var/log/longevity-retreats/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
    },
  ],
};
