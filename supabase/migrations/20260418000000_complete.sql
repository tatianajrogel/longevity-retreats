-- Complete schema for Longevity Retreats
-- Single migration: tables, RLS, indexes, seed data

create extension if not exists "pg_trgm";

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Listings (includes all extended fields)
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body text not null,
  city text,
  region text,
  country text not null default 'United States',
  website_url text,
  image_url text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  focus text,
  length_text text,
  price_text text,
  target_audience text,
  best_for text,
  notes text,
  luxury_level text check (luxury_level in ('Premium', 'Luxury', 'Ultra-Luxury')),
  environment text check (environment in ('Coastal', 'Desert', 'Lakeside', 'Mountain', 'Urban')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Junction table
create table public.listing_categories (
  listing_id uuid not null references public.listings (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (listing_id, category_id)
);

-- Submission inbox (admin reviews these)
create table public.listing_submissions (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  contact_email text not null,
  website_url text,
  location text,
  category_slug text,
  summary text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  constraint listing_submissions_business_name_length check (char_length(business_name) between 2 and 120),
  constraint listing_submissions_contact_name_length check (char_length(contact_name) between 2 and 120),
  constraint listing_submissions_contact_email_length check (char_length(contact_email) between 5 and 160),
  constraint listing_submissions_summary_length check (char_length(summary) between 40 and 1200),
  constraint listing_submissions_notes_length check (notes is null or char_length(notes) <= 2000),
  constraint listing_submissions_website_url_format check (
    website_url is null or website_url ~ '^https?://'
  ),
  constraint listing_submissions_contact_email_format check (
    contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

-- Sync log (Google Sheets sync history)
create table public.sync_log (
  id uuid primary key default gen_random_uuid(),
  synced_at timestamptz not null default now(),
  rows_upserted int not null default 0,
  errors jsonb,
  source text not null default 'sheets'
);

-- Indexes
create index listings_status_idx on public.listings (status);
create index listings_featured_idx on public.listings (featured);
create index listings_slug_idx on public.listings (slug);
create index listings_luxury_level_idx on public.listings (luxury_level);
create index listings_environment_idx on public.listings (environment);
create index listings_title_trgm_idx on public.listings using gin (title gin_trgm_ops);
create index listings_summary_trgm_idx on public.listings using gin (summary gin_trgm_ops);
create index listing_submissions_status_idx on public.listing_submissions (status);
create index listing_submissions_created_at_idx on public.listing_submissions (created_at desc);
create index sync_log_synced_at_idx on public.sync_log (synced_at desc);

-- RLS
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.listing_categories enable row level security;
alter table public.listing_submissions enable row level security;

create policy "categories_select_public" on public.categories for select using (true);

create policy "listings_select_published" on public.listings for select using (status = 'published');

create policy "listing_categories_select_public" on public.listing_categories for select using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id and l.status = 'published'
  )
);

create policy "listing_submissions_insert_public" on public.listing_submissions
  for insert to anon, authenticated
  with check (status = 'pending');

-- Seed: categories
insert into public.categories (slug, name, sort_order)
values
  ('comprehensive-luxury',    'Comprehensive Luxury Wellness Programs', 1),
  ('mindfulness-restoration', 'Mindfulness & Restoration',              2),
  ('fitness-lifestyle-reset', 'Structured Fitness & Lifestyle Reset',   3),
  ('longevity-clinics',       'Longevity Clinics Worth Traveling For',   4);

-- Seed: 18 retreats
with
  c_comp as (select id from public.categories where slug = 'comprehensive-luxury'    limit 1),
  c_mind as (select id from public.categories where slug = 'mindfulness-restoration' limit 1),
  c_fit  as (select id from public.categories where slug = 'fitness-lifestyle-reset' limit 1),
  c_long as (select id from public.categories where slug = 'longevity-clinics'       limit 1),
  ins as (
    insert into public.listings (
      slug, title, summary, body, city, region, country,
      website_url, featured, status,
      focus, length_text, price_text, target_audience, best_for, notes,
      luxury_level, environment
    ) values
      -- Comprehensive Luxury (5)
      ('canyon-ranch-tucson','Canyon Ranch Tucson',
       'One of the most established wellness destinations in the U.S., offering structured programs focused on fitness, nutrition, stress management, sleep improvement, and preventative health.',
       'Canyon Ranch Tucson offers expert-led classes, spa therapies, and personalized wellness consultations. Guests access a full range of structured programs designed to improve health markers and build sustainable habits. The resort combines evidence-based approaches with a luxury environment that supports full immersion in wellness.',
       'Tucson','Arizona','United States','https://www.canyonranch.com/tucson/',
       true,'published','Comprehensive wellness','3–7 days','$1,500 – $6,000',
       'Health-conscious professionals 40+','Structured wellness programs with extensive programming options','Established wellness brand',
       'Luxury','Desert'),

      ('golden-door','Golden Door',
       'An immersive wellness experience limited to a small number of guests each week, combining guided hikes, fitness training, mindfulness practices, and carefully designed nutrition programs.',
       'Golden Door emphasizes habit formation and sustainable lifestyle improvements within a highly personalized setting. The intimate guest count ensures each participant receives individualized attention from expert practitioners. Programs combine physical training, mindfulness, and nutrition in a seamless week-long experience.',
       'San Marcos','California','United States','https://www.goldendoor.com/',
       true,'published','Immersive lifestyle reset','7 days','$9,000+',
       'Affluent wellness travelers','Highly personalized luxury wellness immersion','Highly personalized program',
       'Ultra-Luxury','Mountain'),

      ('lake-austin-spa-resort','Lake Austin Spa Resort',
       'Combines fitness classes, spa therapies, nutrition programming, and wellness education in a lakeside environment designed to support relaxation and long-term health habits.',
       'Lake Austin Spa Resort provides structured yet flexible programming for a range of wellness goals. The lakeside setting creates a calming backdrop for physical activity and restoration. Guests benefit from a balanced approach that integrates movement, nutrition, and mindful recovery.',
       'Austin','Texas','United States','https://www.lakeaustin.com/',
       false,'published','Balanced wellness','3–5 days','$2,000 – $5,000',
       'Wellness travelers 40+','Balanced wellness experience combining relaxation and activity','Strong reputation',
       'Luxury','Lakeside'),

      ('sensei-lanai','Sensei Lanai',
       'Structured wellness programs combining fitness, nutrition guidance, mindfulness practices, and recovery therapies within a quiet island environment.',
       'Sensei Lanai emphasizes personalized consultations and data-driven strategies for energy, resilience, and overall wellbeing. The island setting provides natural isolation that supports deep focus on health improvement. Programs integrate advanced wellness science with luxury hospitality.',
       'Lanai City','Hawaii','United States','https://sensei.com/lanai/',
       false,'published','Performance optimization and lifestyle design','3–7 days','$4,000 – $10,000',
       'High-income individuals focused on long-term health optimization','Structured, data-informed wellness programs emphasizing measurable lifestyle improvement','Strong integration of data-driven wellness programming',
       'Ultra-Luxury','Coastal'),

      ('rancho-la-puerta','Rancho La Puerta',
       'Structured wellness programs combining fitness classes, nutrition guidance, spa therapies, and educational sessions emphasizing sustainable habit formation.',
       'Rancho La Puerta emphasizes sustainable habit formation through daily movement, balanced nutrition, and restorative practices within a natural environment. The long-established retreat has refined its approach over decades, creating a comprehensive program that supports lasting lifestyle change.',
       'Tecate','Baja California','Mexico','https://rancholapuerta.com/',
       false,'published','Comprehensive wellness','4–7 days','$3,000 – $6,000',
       'Wellness-oriented individuals seeking structured lifestyle improvement','Comprehensive programs supporting long-term lifestyle change','Long-established destination wellness retreat',
       'Luxury','Mountain'),

      -- Mindfulness & Restoration (3)
      ('miraval-arizona','Miraval Arizona Resort & Spa',
       'Focuses on mindfulness, stress reduction, fitness, and personal development through structured wellness programming.',
       'Guests participate in meditation sessions, yoga classes, nutrition workshops, and experiential activities designed to promote mental and physical wellbeing. The resort environment supports deep restoration while providing structure through expert-led programming. Miraval is recognized for its evidence-informed approach to stress reduction.',
       'Tucson','Arizona','United States','https://www.miravalresorts.com/arizona',
       false,'published','Mindfulness','3–5 days','$2,000 – $4,000',
       'Stress reduction focused guests','Mindfulness-based wellness experiences','Experiential programming',
       'Luxury','Desert'),

      ('the-ranch-malibu','The Ranch Malibu',
       'A highly structured fitness and nutrition program designed to improve metabolic health, endurance, and strength through guided hikes, plant-based meals, and daily fitness routines.',
       'The Ranch Malibu emphasizes measurable physical progress within an immersive environment. The program combines intensive daily hikes with strength training and a carefully designed plant-based nutrition protocol. Participants consistently report significant improvements in fitness metrics over the week-long program.',
       'Malibu','California','United States','https://www.theranchlife.com/',
       false,'published','Fitness reset','4–7 days','$4,000 – $8,000',
       'Fitness-motivated individuals','Intensive fitness-focused longevity retreat','Structured daily program',
       'Luxury','Mountain'),

      ('civana-wellness','Civana Wellness Resort & Spa',
       'Structured wellness programming focused on mindfulness, movement, relaxation, and recovery emphasizing stress reduction and sustainable lifestyle practices.',
       'Civana emphasizes stress reduction, sleep improvement, and sustainable lifestyle practices in an accessible wellness environment. The resort offers a range of programming options that can be tailored to individual wellness goals. The desert setting supports both active outdoor programming and restorative indoor practices.',
       'Carefree','Arizona','United States','https://www.civanacarefree.com/',
       false,'published','Mindfulness and recovery','3–5 days','$1,500 – $3,500',
       'Individuals seeking restorative wellness experiences','Mindfulness-focused wellness and recovery programs','Accessible wellness resort with structured programming',
       'Premium','Desert'),

      -- Structured Fitness & Lifestyle Reset (7)
      ('cal-a-vie','Cal-a-Vie Health Spa',
       'Structured wellness programs combining fitness training, nutrition guidance, spa therapies, and lifestyle education in a European-style retreat environment.',
       'The retreat environment is designed to support habit formation and long-term health improvement through immersive experiences. Cal-a-Vie combines the rigor of structured fitness programming with the refinement of European spa traditions. The small guest count ensures personalized attention and programming.',
       'Vista','California','United States','https://www.cal-a-vie.com/',
       false,'published','Luxury wellness','3–7 days','$4,000 – $8,000',
       'Affluent wellness travelers','Luxury wellness retreat with structured programming','European-style retreat',
       'Ultra-Luxury','Mountain'),

      ('mii-amo','Mii amo',
       'A personalized wellness experience focused on mindfulness, relaxation, nutrition, and movement emphasizing reflection and intentional lifestyle improvement.',
       'Mii amo is supported by expert practitioners and structured programming within Sedona''s iconic red rock landscape. The retreat emphasizes introspective wellness experiences that connect physical health with mental clarity. The natural setting amplifies the restorative impact of the programming.',
       'Sedona','Arizona','United States','https://www.miiamo.com/',
       false,'published','Mindfulness','3–4 days','$3,000 – $6,000',
       'Reflective travelers','Introspective wellness experiences in a natural setting','Strong Sedona positioning',
       'Luxury','Desert'),

      ('carillon-miami','Carillon Miami Wellness Resort',
       'Integrates fitness, spa therapies, recovery treatments, and preventative health services in a coastal environment.',
       'Guests access a wide range of wellness modalities designed to improve physical resilience and overall vitality. The resort''s medical spa integration provides access to advanced recovery and preventative treatments. The Miami Beach location combines urban accessibility with a full wellness campus.',
       'Miami Beach','Florida','United States','https://www.carillonhotel.com/',
       false,'published','Recovery and wellness','3–5 days','$2,000 – $5,000',
       'Urban wellness travelers','Wellness programs combined with medical spa services','Medical spa integration',
       'Premium','Coastal'),

      ('hilton-head-health','Hilton Head Health',
       'Structured wellness programming focused on weight management, fitness improvement, and sustainable lifestyle change with emphasis on education and long-term habit development.',
       'Hilton Head Health emphasizes education and long-term habit development through structured programming. The retreat specializes in creating lasting behavioral change through a combination of fitness, nutrition, and wellness education. The coastal island setting supports an active lifestyle throughout the stay.',
       'Hilton Head Island','South Carolina','United States','https://www.hhhealth.com/',
       false,'published','Lifestyle change','5–7 days','$2,000 – $4,000',
       'Weight-management focused guests','Structured lifestyle improvement programs','Educational programming',
       'Premium','Coastal'),

      ('skyterra-wellness','Skyterra Wellness Retreat',
       'Focuses on fitness, nutrition, and behavioral change strategies designed to support long-term health outcomes and repeatable habits.',
       'Skyterra emphasizes education and repeatable habits that support longevity and improved quality of life. The Blue Ridge Mountain setting provides a natural environment for physical activity and mental restoration. Programs are designed to translate directly into sustainable home routines.',
       'Lake Toxaway','North Carolina','United States','https://www.skyterra.com/',
       false,'published','Lifestyle reset','4–7 days','$2,000 – $5,000',
       'Habit-change focused guests','Practical lifestyle-focused longevity improvements','Practical wellness approach',
       'Premium','Mountain'),

      ('pritikin-longevity-center','Pritikin Longevity Center',
       'Structured programs focused on nutrition, exercise, and lifestyle modification designed to improve metabolic health and long-term wellness outcomes.',
       'Pritikin emphasizes education and habit formation through guided fitness and nutrition planning. The program has decades of research supporting its approach to improving key health markers through lifestyle modification. Medical supervision ensures safe and effective programming for all participants.',
       'Miami','Florida','United States','https://www.pritikin.com/',
       false,'published','Lifestyle change','5–7 days','$3,000 – $7,000',
       'Individuals focused on measurable health improvements','Structured programs focused on improving metabolic health','Strong emphasis on nutrition and behavior change',
       'Premium','Coastal'),

      ('red-mountain-resort','Red Mountain Resort',
       'Structured wellness programs combining guided hiking, fitness classes, nutrition guidance, and mindfulness practices in an immersive natural setting.',
       'Red Mountain Resort is designed to support long-term lifestyle improvement within an immersive natural setting. The resort''s location in the red rock landscape of southern Utah provides dramatic outdoor programming opportunities. Active travelers benefit from the emphasis on guided hiking and movement.',
       'Ivins','Utah','United States','https://www.redmountainresort.com/',
       false,'published','Fitness and lifestyle reset','3–5 days','$1,500 – $3,500',
       'Active travelers seeking structured wellness programming','Active wellness experiences with strong outdoor programming','Strong emphasis on guided hiking and movement',
       'Premium','Desert'),

      -- Longevity Clinics (3)
      ('human-longevity-inc','Human Longevity, Inc.',
       'Comprehensive health assessments combining advanced diagnostics, imaging, genomic analysis, and physician-guided prevention programs to identify health risks early.',
       'Human Longevity Inc. supports long-term health optimization through data-driven insights. The program uses cutting-edge technology to create a comprehensive baseline health assessment that identifies risks before symptoms appear. Physician teams translate complex data into actionable prevention strategies.',
       'San Diego','California','United States','https://www.humanlongevity.com/',
       false,'published','Advanced diagnostics and preventative health','1–3 days','$5,000 – $15,000',
       'Individuals seeking data-driven insights into long-term health risks','Comprehensive baseline health assessment using advanced testing','Strong emphasis on early detection and personalized prevention',
       'Premium','Urban'),

      ('fountain-life','Fountain Life',
       'Physician-guided health optimization programs combining advanced diagnostics, imaging, lab testing, and personalized prevention strategies to detect disease risk early.',
       'Fountain Life supports long-term vitality through proactive screening and personalized health protocols. The program uses advanced diagnostic technology to identify health risks that traditional medicine often misses. Physician-led care teams create individualized prevention plans based on comprehensive data analysis.',
       'Naples','Florida','United States','https://www.fountainlife.com/',
       false,'published','Preventative diagnostics and health optimization','1–2 days','$5,000 – $12,000',
       'High-income individuals focused on early detection and prevention','Proactive screening using advanced diagnostic technology','Strong focus on early disease detection',
       'Premium','Coastal'),

      ('cleveland-clinic-executive-health','Cleveland Clinic Executive Health',
       'Comprehensive medical evaluations combining diagnostic testing, physician consultations, and preventative health assessments to identify risks and support long-term health management.',
       'Cleveland Clinic Executive Health is backed by one of the world''s most respected medical institutions. The program provides thorough physician-led health assessments with access to Cleveland Clinic''s full diagnostic capabilities. Executives receive structured evaluations designed to identify and address health risks proactively.',
       'Cleveland','Ohio','United States','https://my.clevelandclinic.org/departments/executive-health',
       false,'published','Comprehensive medical evaluation','1–2 days','$3,000 – $8,000',
       'Executives seeking structured preventative health evaluations','Comprehensive physician-led health assessment','Well-established medical institution',
       'Premium','Urban')
    returning id, slug
  )
insert into public.listing_categories (listing_id, category_id)
  select ins.id, c_comp.id from ins cross join c_comp
    where ins.slug in ('canyon-ranch-tucson','golden-door','lake-austin-spa-resort','sensei-lanai','rancho-la-puerta')
  union all
  select ins.id, c_mind.id from ins cross join c_mind
    where ins.slug in ('miraval-arizona','the-ranch-malibu','civana-wellness')
  union all
  select ins.id, c_fit.id from ins cross join c_fit
    where ins.slug in ('cal-a-vie','mii-amo','carillon-miami','hilton-head-health','skyterra-wellness','pritikin-longevity-center','red-mountain-resort')
  union all
  select ins.id, c_long.id from ins cross join c_long
    where ins.slug in ('human-longevity-inc','fountain-life','cleveland-clinic-executive-health');
