/**
 * Category name translation mapper
 * Maps database category names to translation keys
 */

interface CategoryTranslationMap {
  [key: string]: string;
}

// Map English category names (from database) to translation keys
export const categoryTranslationKeys: CategoryTranslationMap = {
  'Jute Bags': 'categories.juteBags',
  'Juco Bags': 'categories.jucoBags',
  'Canvas/Jute Bags': 'categories.canvasJuteBags',
  'Cotton / Jute String Bags': 'categories.cottonJuteStringBags',
  'Cotton Bags-120 gsm': 'categories.cottonBags120gsm',
  'Cotton Bags-135 gsm': 'categories.cottonBags135gsm',
  'Cotton Bags-150 gsm': 'categories.cottonBags150gsm',
  'Cotton Bags-220/235 gsm': 'categories.cottonBags220235gsm',
  'Cotton Bags-260 gsm': 'categories.cottonBags260gsm',
};

/**
 * Get translation key for a category name
 * @param categoryName - Category name from database
 * @returns Translation key or null if no mapping exists
 */
export const getCategoryTranslationKey = (categoryName: string): string | null => {
  return categoryTranslationKeys[categoryName] || null;
};

/**
 * Translate category name or return original if no translation exists
 * @param categoryName - Category name from database
 * @param t - Translation function from useTranslation
 * @returns Translated category name or original
 */
export const translateCategoryName = (
  categoryName: string,
  t: (key: string) => string
): string => {
  const translationKey = getCategoryTranslationKey(categoryName);
  return translationKey ? t(translationKey) : categoryName;
};

