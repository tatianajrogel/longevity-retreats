/**
 * Writes the header row + all 18 seed retreats to the Google Sheet.
 * Run: node scripts/populate-sheet.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

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

// Columns: title | summary | body | city | region | country | website_url | image_url | categories | focus | price_text | luxury_level | environment
const HEADERS = [
  "title", "summary", "body", "city", "region", "country",
  "website_url", "image_url", "categories", "focus", "price_text",
  "luxury_level", "environment",
];

const RETREATS = [
  // ── Comprehensive Luxury Wellness Programs ──────────────────────────────
  [
    "Canyon Ranch Tucson",
    "One of the most established wellness destinations in the U.S., offering structured programs focused on fitness, nutrition, stress management, sleep improvement, and preventative health.",
    "Canyon Ranch Tucson offers expert-led classes, spa therapies, and personalized wellness consultations. Guests access a full range of structured programs designed to improve health markers and build sustainable habits. The resort combines evidence-based approaches with a luxury environment that supports full immersion in wellness.",
    "Tucson", "Arizona", "United States",
    "https://www.canyonranch.com/tucson/", "",
    "comprehensive-luxury",
    "Comprehensive wellness", "From $1,500/night", "Luxury", "Desert",
  ],
  [
    "Golden Door",
    "An immersive wellness experience limited to a small number of guests each week, combining guided hikes, fitness training, mindfulness practices, and carefully designed nutrition programs.",
    "Golden Door emphasizes habit formation and sustainable lifestyle improvements within a highly personalized setting. The intimate guest count ensures each participant receives individualized attention from expert practitioners. Programs combine physical training, mindfulness, and nutrition in a seamless week-long experience.",
    "San Marcos", "California", "United States",
    "https://www.goldendoor.com/", "",
    "comprehensive-luxury",
    "Immersive lifestyle reset", "From $9,000/week", "Ultra-Luxury", "Mountain",
  ],
  [
    "Lake Austin Spa Resort",
    "Combines fitness classes, spa therapies, nutrition programming, and wellness education in a lakeside environment designed to support relaxation and long-term health habits.",
    "Lake Austin Spa Resort provides structured yet flexible programming for a range of wellness goals. The lakeside setting creates a calming backdrop for physical activity and restoration. Guests benefit from a balanced approach that integrates movement, nutrition, and mindful recovery.",
    "Austin", "Texas", "United States",
    "https://www.lakeaustin.com/", "",
    "comprehensive-luxury",
    "Balanced wellness", "From $2,000/night", "Luxury", "Lakeside",
  ],
  [
    "Sensei Lanai",
    "Structured wellness programs combining fitness, nutrition guidance, mindfulness practices, and recovery therapies within a quiet island environment.",
    "Sensei Lanai emphasizes personalized consultations and data-driven strategies for energy, resilience, and overall wellbeing. The island setting provides natural isolation that supports deep focus on health improvement. Programs integrate advanced wellness science with luxury hospitality.",
    "Lanai City", "Hawaii", "United States",
    "https://sensei.com/lanai/", "",
    "comprehensive-luxury",
    "Performance optimization and lifestyle design", "From $4,000/night", "Ultra-Luxury", "Coastal",
  ],
  [
    "Rancho La Puerta",
    "Structured wellness programs combining fitness classes, nutrition guidance, spa therapies, and educational sessions emphasizing sustainable habit formation.",
    "Rancho La Puerta emphasizes sustainable habit formation through daily movement, balanced nutrition, and restorative practices within a natural environment. The long-established retreat has refined its approach over decades, creating a comprehensive program that supports lasting lifestyle change.",
    "Tecate", "Baja California", "Mexico",
    "https://rancholapuerta.com/", "",
    "comprehensive-luxury",
    "Comprehensive wellness", "From $3,000/week", "Luxury", "Mountain",
  ],

  // ── Mindfulness & Restoration ───────────────────────────────────────────
  [
    "Miraval Arizona Resort & Spa",
    "Focuses on mindfulness, stress reduction, fitness, and personal development through structured wellness programming.",
    "Guests participate in meditation sessions, yoga classes, nutrition workshops, and experiential activities designed to promote mental and physical wellbeing. The resort environment supports deep restoration while providing structure through expert-led programming. Miraval is recognized for its evidence-informed approach to stress reduction.",
    "Tucson", "Arizona", "United States",
    "https://www.miravalresorts.com/arizona", "",
    "mindfulness-restoration",
    "Mindfulness", "From $2,000/night", "Luxury", "Desert",
  ],
  [
    "The Ranch Malibu",
    "A highly structured fitness and nutrition program designed to improve metabolic health, endurance, and strength through guided hikes, plant-based meals, and daily fitness routines.",
    "The Ranch Malibu emphasizes measurable physical progress within an immersive environment. The program combines intensive daily hikes with strength training and a carefully designed plant-based nutrition protocol. Participants consistently report significant improvements in fitness metrics over the week-long program.",
    "Malibu", "California", "United States",
    "https://www.theranchlife.com/", "",
    "mindfulness-restoration",
    "Fitness reset", "From $4,000/week", "Luxury", "Mountain",
  ],
  [
    "Civana Wellness Resort & Spa",
    "Structured wellness programming focused on mindfulness, movement, relaxation, and recovery emphasizing stress reduction and sustainable lifestyle practices.",
    "Civana emphasizes stress reduction, sleep improvement, and sustainable lifestyle practices in an accessible wellness environment. The resort offers a range of programming options that can be tailored to individual wellness goals. The desert setting supports both active outdoor programming and restorative indoor practices.",
    "Carefree", "Arizona", "United States",
    "https://www.civanacarefree.com/", "",
    "mindfulness-restoration",
    "Mindfulness and recovery", "From $1,500/night", "Premium", "Desert",
  ],

  // ── Structured Fitness & Lifestyle Reset ───────────────────────────────
  [
    "Cal-a-Vie Health Spa",
    "Structured wellness programs combining fitness training, nutrition guidance, spa therapies, and lifestyle education in a European-style retreat environment.",
    "The retreat environment is designed to support habit formation and long-term health improvement through immersive experiences. Cal-a-Vie combines the rigor of structured fitness programming with the refinement of European spa traditions. The small guest count ensures personalized attention and programming.",
    "Vista", "California", "United States",
    "https://www.cal-a-vie.com/", "",
    "fitness-lifestyle-reset",
    "Luxury wellness", "From $4,000/week", "Ultra-Luxury", "Mountain",
  ],
  [
    "Mii amo",
    "A personalized wellness experience focused on mindfulness, relaxation, nutrition, and movement emphasizing reflection and intentional lifestyle improvement.",
    "Mii amo is supported by expert practitioners and structured programming within Sedona's iconic red rock landscape. The retreat emphasizes introspective wellness experiences that connect physical health with mental clarity. The natural setting amplifies the restorative impact of the programming.",
    "Sedona", "Arizona", "United States",
    "https://www.miiamo.com/", "",
    "fitness-lifestyle-reset",
    "Mindfulness", "From $3,000/night", "Luxury", "Desert",
  ],
  [
    "Carillon Miami Wellness Resort",
    "Integrates fitness, spa therapies, recovery treatments, and preventative health services in a coastal environment.",
    "Guests access a wide range of wellness modalities designed to improve physical resilience and overall vitality. The resort's medical spa integration provides access to advanced recovery and preventative treatments. The Miami Beach location combines urban accessibility with a full wellness campus.",
    "Miami Beach", "Florida", "United States",
    "https://www.carillonhotel.com/", "",
    "fitness-lifestyle-reset",
    "Recovery and wellness", "From $2,000/night", "Premium", "Coastal",
  ],
  [
    "Hilton Head Health",
    "Structured wellness programming focused on weight management, fitness improvement, and sustainable lifestyle change with emphasis on education and long-term habit development.",
    "Hilton Head Health emphasizes education and long-term habit development through structured programming. The retreat specializes in creating lasting behavioral change through a combination of fitness, nutrition, and wellness education. The coastal island setting supports an active lifestyle throughout the stay.",
    "Hilton Head Island", "South Carolina", "United States",
    "https://www.hhhealth.com/", "",
    "fitness-lifestyle-reset",
    "Lifestyle change", "From $2,000/week", "Premium", "Coastal",
  ],
  [
    "Skyterra Wellness Retreat",
    "Focuses on fitness, nutrition, and behavioral change strategies designed to support long-term health outcomes and repeatable habits.",
    "Skyterra emphasizes education and repeatable habits that support longevity and improved quality of life. The Blue Ridge Mountain setting provides a natural environment for physical activity and mental restoration. Programs are designed to translate directly into sustainable home routines.",
    "Lake Toxaway", "North Carolina", "United States",
    "https://www.skyterra.com/", "",
    "fitness-lifestyle-reset",
    "Lifestyle reset", "From $2,000/week", "Premium", "Mountain",
  ],
  [
    "Pritikin Longevity Center",
    "Structured programs focused on nutrition, exercise, and lifestyle modification designed to improve metabolic health and long-term wellness outcomes.",
    "Pritikin emphasizes education and habit formation through guided fitness and nutrition planning. The program has decades of research supporting its approach to improving key health markers through lifestyle modification. Medical supervision ensures safe and effective programming for all participants.",
    "Miami", "Florida", "United States",
    "https://www.pritikin.com/", "",
    "fitness-lifestyle-reset",
    "Lifestyle change", "From $3,000/week", "Premium", "Coastal",
  ],
  [
    "Red Mountain Resort",
    "Structured wellness programs combining guided hiking, fitness classes, nutrition guidance, and mindfulness practices in an immersive natural setting.",
    "Red Mountain Resort is designed to support long-term lifestyle improvement within an immersive natural setting. The resort's location in the red rock landscape of southern Utah provides dramatic outdoor programming opportunities. Active travelers benefit from the emphasis on guided hiking and movement.",
    "Ivins", "Utah", "United States",
    "https://www.redmountainresort.com/", "",
    "fitness-lifestyle-reset",
    "Fitness and lifestyle reset", "From $1,500/night", "Premium", "Desert",
  ],

  // ── Longevity Clinics Worth Traveling For ──────────────────────────────
  [
    "Human Longevity, Inc.",
    "Comprehensive health assessments combining advanced diagnostics, imaging, genomic analysis, and physician-guided prevention programs to identify health risks early.",
    "Human Longevity Inc. supports long-term health optimization through data-driven insights. The program uses cutting-edge technology to create a comprehensive baseline health assessment that identifies risks before symptoms appear. Physician teams translate complex data into actionable prevention strategies.",
    "San Diego", "California", "United States",
    "https://www.humanlongevity.com/", "",
    "longevity-clinics",
    "Advanced diagnostics and preventative health", "From $5,000", "Premium", "Urban",
  ],
  [
    "Fountain Life",
    "Physician-guided health optimization programs combining advanced diagnostics, imaging, lab testing, and personalized prevention strategies to detect disease risk early.",
    "Fountain Life supports long-term vitality through proactive screening and personalized health protocols. The program uses advanced diagnostic technology to identify health risks that traditional medicine often misses. Physician-led care teams create individualized prevention plans based on comprehensive data analysis.",
    "Naples", "Florida", "United States",
    "https://www.fountainlife.com/", "",
    "longevity-clinics",
    "Preventative diagnostics and health optimization", "From $5,000", "Premium", "Coastal",
  ],
  [
    "Cleveland Clinic Executive Health",
    "Comprehensive medical evaluations combining diagnostic testing, physician consultations, and preventative health assessments to identify risks and support long-term health management.",
    "Cleveland Clinic Executive Health is backed by one of the world's most respected medical institutions. The program provides thorough physician-led health assessments with access to Cleveland Clinic's full diagnostic capabilities. Executives receive structured evaluations designed to identify and address health risks proactively.",
    "Cleveland", "Ohio", "United States",
    "https://my.clevelandclinic.org/departments/executive-health", "",
    "longevity-clinics",
    "Comprehensive medical evaluation", "From $3,000", "Premium", "Urban",
  ],
];

try {
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: "A:M",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: "A1",
    valueInputOption: "RAW",
    requestBody: { values: [HEADERS, ...RETREATS] },
  });

  console.log(`✓ Written 1 header row + ${RETREATS.length} retreats to sheet.`);
  console.log(`  https://docs.google.com/spreadsheets/d/${sheetId}/edit`);
} catch (err) {
  if (err.message?.includes("403") || err.message?.includes("PERMISSION_DENIED")) {
    console.error(`\nPermission denied. Share the sheet with:\n  ${credentials.client_email}\n  (Editor role)\n`);
  } else {
    console.error("Error:", err.message);
  }
  process.exit(1);
}
