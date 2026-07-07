import { createServerSupabase } from '@/lib/supabase/server';
import { CategoryType } from '@/types';

export async function getCategoriesServer(): Promise<CategoryType[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data as CategoryType[];
  } catch (error) {
    console.error('Error in getCategoriesServer:', error);
    return [];
  }
}
