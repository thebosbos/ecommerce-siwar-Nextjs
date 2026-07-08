import { Suspense } from "react";
import { notFound } from "next/navigation";
import CategoryPage from "@/components/CategoryPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { createServerSupabase } from "@/lib/supabase/server";

interface CategoryRouteProps {
  params: Promise<{ category: string }>;
}

export default async function DynamicCategoryPage({
  params,
}: CategoryRouteProps) {
  const { category } = await params;

  const supabase = await createServerSupabase();
  const { data: categoryRow } = await supabase
    .from("categories")
    .select("name")
    .ilike("name", category)
    .maybeSingle();

  if (!categoryRow) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CategoryPage categoryName={categoryRow.name} />
    </Suspense>
  );
}
