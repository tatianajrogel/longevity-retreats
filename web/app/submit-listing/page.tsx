import { getCategories } from "@/lib/listings";
import { SubmitListingForm } from "./submit-listing-form";

export default async function SubmitListingPage() {
  const categoriesRes = await getCategories();
  const categories = categoriesRes.ok ? categoriesRes.categories : [];

  return <SubmitListingForm categories={categories} />;
}