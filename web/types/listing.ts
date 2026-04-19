export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type ListingRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  city: string | null;
  region: string | null;
  country: string;
  website_url: string | null;
  image_url: string | null;
  featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  // Extended fields from the real retreat data
  focus: string | null;
  length_text: string | null;
  price_text: string | null;
  target_audience: string | null;
  best_for: string | null;
  notes: string | null;
  luxury_level: 'Premium' | 'Luxury' | 'Ultra-Luxury' | null;
  environment: 'Coastal' | 'Desert' | 'Lakeside' | 'Mountain' | 'Urban' | null;
};

export type ListingCategoryJoin = {
  categories: CategoryRow | CategoryRow[] | null;
};

export type ListingWithCategories = ListingRow & {
  listing_categories: ListingCategoryJoin[] | null;
};

export function normalizeCategories(listing: ListingWithCategories): CategoryRow[] {
  const rows = listing.listing_categories ?? [];
  return rows.flatMap((row) => {
    const c = row.categories;
    if (!c) return [];
    return Array.isArray(c) ? c : [c];
  });
}
