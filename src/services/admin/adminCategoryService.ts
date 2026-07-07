import { supabase } from "@/lib/supabase/client";
import { CategoryType } from "@/types";

export interface CategoryWithCount extends CategoryType {
  product_count: number;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  parent_id?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

/**
 * Admin service for category management
 * Requires admin privileges for insert/update/delete operations (enforced via RLS)
 */
export const adminCategoryService = {
  /**
   * Get all categories along with how many products reference each one
   */
  async getAllCategories(): Promise<CategoryWithCount[]> {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id);

        return { ...category, product_count: count || 0 };
      }),
    );

    return categoriesWithCount;
  },

  async createCategory(data: CreateCategoryData): Promise<CategoryType> {
    const { data: category, error } = await supabase
      .from("categories")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      throw error;
    }

    return category;
  },

  async updateCategory(
    categoryId: number,
    data: UpdateCategoryData,
  ): Promise<CategoryType> {
    const { data: category, error } = await supabase
      .from("categories")
      .update(data)
      .eq("id", categoryId)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      throw error;
    }

    return category;
  },

  async deleteCategory(categoryId: number): Promise<boolean> {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error("Error deleting category:", error);
      throw error;
    }

    return true;
  },
};
