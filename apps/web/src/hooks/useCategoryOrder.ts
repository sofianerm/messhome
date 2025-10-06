import { supabase } from '@/lib/supabase';

export function useCategoryOrder() {
  const reorderCategories = async (categories: string[]) => {
    try {
      console.log('🔄 Reordering categories:', categories);

      // Mettre à jour l'ordre de toutes les catégories en séquence
      for (let i = 0; i < categories.length; i++) {
        const { error } = await supabase
          .from('packing_items')
          .update({ category_order: i })
          .eq('category', categories[i]);

        if (error) {
          console.error(`❌ Error updating ${categories[i]} to order ${i}:`, error);
          throw error;
        } else {
          console.log(`✅ Updated ${categories[i]} to order ${i}`);
        }
      }

      console.log('✅ All categories reordered successfully');
    } catch (error) {
      console.error('❌ Error reordering categories:', error);
      throw error;
    }
  };

  return {
    reorderCategories,
  };
}
