/**
 * Writes the required header row to the Google Sheet.
 * Run once: node scripts/setup-sheet.mjs
 * Requires GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON in .env.local
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

// Parse .env.local manually
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const sheetId = env.GOOGLE_SHEET_ID;
const serviceAccountJson = env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!sheetId || !serviceAccountJson) {
  console.error("Missing GOOGLE_SHEET_ID or GOOGLE_SERVICE_ACCOUNT_JSON in .env.local");
  process.exit(1);
}

const { google } = await import("googleapis");

const credentials = JSON.parse(serviceAccountJson);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const HEADERS = [
  "title",
  "summary",
  "body",
  "city",
  "region",
  "country",
  "website_url",
  "image_url",
  "categories",
  "focus",
  "price_text",
  "luxury_level",
  "environment",
];

try {
  // Check if row 1 already has content
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "A1:M1",
  });

  if (existing.data.values?.[0]?.length) {
    console.log("Row 1 already has content:", existing.data.values[0]);
    console.log("Skipping header write. Clear row 1 manually if you want to reset.");
    process.exit(0);
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: "A1:M1",
    valueInputOption: "RAW",
    requestBody: { values: [HEADERS] },
  });

  console.log("✓ Header row written to sheet:");
  console.log(HEADERS.map((h, i) => `  ${String.fromCharCode(65 + i)}: ${h}`).join("\n"));
  console.log("\nSheet is ready. Add retreat rows starting from row 2.");
  console.log(`Sheet URL: https://docs.google.com/spreadsheets/d/${sheetId}/edit`);
} catch (err) {
  if (err.message?.includes("403") || err.message?.includes("PERMISSION_DENIED")) {
    console.error(`\nPermission denied. Share the sheet with the service account:\n  ${credentials.client_email}\n  (Viewer or Editor role)\n`);
  } else {
    console.error("Error:", err.message);
  }
  process.exit(1);
}
