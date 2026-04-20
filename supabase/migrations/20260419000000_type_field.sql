-- Promote focus to a constrained listing_type dropdown field
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS listing_type text
    CHECK (listing_type IN (
      'Comprehensive Wellness',
      'Immersive Lifestyle Reset',
      'Balanced Wellness',
      'Mindfulness',
      'Fitness Reset',
      'Preventative Diagnostics',
      'Longevity Clinic',
      'Other'
    ));

-- Backfill from focus where value matches a valid type
UPDATE public.listings SET listing_type =
  CASE
    WHEN focus ILIKE '%comprehensive%' THEN 'Comprehensive Wellness'
    WHEN focus ILIKE '%immersive%'     THEN 'Immersive Lifestyle Reset'
    WHEN focus ILIKE '%balanced%'      THEN 'Balanced Wellness'
    WHEN focus ILIKE '%mindfulness%'   THEN 'Mindfulness'
    WHEN focus ILIKE '%fitness%'       THEN 'Fitness Reset'
    WHEN focus ILIKE '%diagnostic%' OR focus ILIKE '%preventative%' THEN 'Preventative Diagnostics'
    WHEN focus ILIKE '%longevity%' OR focus ILIKE '%clinic%' OR focus ILIKE '%medical%' THEN 'Longevity Clinic'
    ELSE 'Other'
  END
WHERE focus IS NOT NULL AND listing_type IS NULL;

CREATE INDEX IF NOT EXISTS listings_type_idx ON public.listings (listing_type);
