import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { categoriesAPI } from '../services/api'
import { translateCategoryName } from '../utils/categoryTranslations'

interface Category {
  id: number
  name: string
  slug: string
  is_active?: boolean
}

const ProductCategoriesSidebar = () => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll()
        setCategories(response.data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <aside className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 lg:p-6 lg:sticky lg:top-24">
      <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
        {t('sidebar.productCategories')}
      </h3>
      {loading ? (
        <div className="text-gray-500 text-sm">{t('sidebar.loadingCategories')}</div>
      ) : (
        <nav className="space-y-1">
          {categories
            .filter((category) => category.is_active !== false)
            .map((category) => (
              <Link
                key={category.id}
                to={`/products/category/${category.slug}`}
                className="block px-4 py-3 text-gray-700 hover:bg-[#f0f6ec] hover:text-[#4a7c28] rounded-lg transition-colors font-medium"
              >
                {translateCategoryName(category.name, t)}
              </Link>
            ))}
          {categories.length === 0 && (
            <p className="text-gray-500 text-sm">{t('sidebar.noCategoriesAvailable')}</p>
          )}
        </nav>
      )}
    </aside>
  )
}

export default ProductCategoriesSidebar

