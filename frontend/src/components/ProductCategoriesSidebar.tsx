import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categoriesAPI } from '../services/api'
import { useEffect } from 'react'

interface Category {
  id: number
  name: string
  slug: string
}

const ProductCategoriesSidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
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
    <div className="relative">
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-40 bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50 transition-colors"
        aria-label="Toggle categories menu"
        style={{ top: '5rem' }}
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] lg:h-auto lg:top-0
          w-64 bg-white shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}
      >
        <div className="p-4 lg:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
            Product Categories
          </h3>
          {loading ? (
            <div className="text-gray-500 text-sm">Loading categories...</div>
          ) : (
            <nav className="space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products/${category.slug}`}
                  className="block px-4 py-3 text-gray-700 hover:bg-[#f0f6ec] hover:text-[#4a7c28] rounded-lg transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              {categories.length === 0 && (
                <p className="text-gray-500 text-sm">No categories available.</p>
              )}
            </nav>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ProductCategoriesSidebar

