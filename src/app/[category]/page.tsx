import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import CategoryPage from "@/components/CategoryPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { createServerSupabase } from "@/lib/supabase/server";

interface CategoryRouteProps {
  params: Promise<{ category: string }>;
}

// Electronics is the only category browsable without an account; every
// other category (existing or added later via the admin panel) requires sign-in.
const PUBLIC_CATEGORY = "electronics";

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

  if (categoryRow.name.toLowerCase() !== PUBLIC_CATEGORY) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/signin");
    }
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CategoryPage categoryName={categoryRow.name} />
    </Suspense>
  );
}
