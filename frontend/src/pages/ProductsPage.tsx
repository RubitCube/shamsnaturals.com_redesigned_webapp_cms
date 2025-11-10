import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { productsAPI, categoriesAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

const ProductsPage = () => {
  const { category, subcategory } = useParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subcategory || null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          category && subcategory
            ? productsAPI.getBySubcategory(category, subcategory)
            : category
            ? productsAPI.getByCategory(category)
            : productsAPI.getAll(),
          categoriesAPI.getAll(),
        ])

        setProducts(productsRes.data.data || productsRes.data)
        setCategories(categoriesRes.data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [category, subcategory])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">All Products</h1>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              setSelectedCategory(null)
              setSelectedSubcategory(null)
            }}
            className={`px-4 py-2 rounded-lg ${
              !selectedCategory
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => {
                  setSelectedCategory(cat.slug)
                  setSelectedSubcategory(null)
                }}
                className={`px-4 py-2 rounded-lg ${
                  selectedCategory === cat.slug
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {cat.name}
              </button>
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg p-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {cat.subcategories.map((sub: any) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug)
                        setSelectedSubcategory(sub.slug)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found.</p>
        </div>
      )}
    </div>
  )
}

export default ProductsPage

