import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminAPI } from '../../services/api'

interface ProductImage {
  id: number
  image_path: string
  image_url?: string
  alt_text?: string
  is_primary?: boolean
  order?: number
}

interface Product {
  id: number
  name: string
  sku?: string
  images?: ProductImage[]
}

const AdminCategoryProductGallery = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [categoryName, setCategoryName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEntries, setShowEntries] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  // Track current image index for each product
  const [productImageIndices, setProductImageIndices] = useState<Record<number, number>>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!categoryId) return
        
        const [categoryResp, productsResp] = await Promise.all([
          adminAPI.categories.getById(Number(categoryId)),
          adminAPI.products.getAll({ category_id: categoryId, per_page: 1000 }),
        ])

        setCategoryName(categoryResp.data.name)
        const data = productsResp.data.data || productsResp.data
        // Sort by order if available, otherwise by id
        const sorted = [...data].sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order
          }
          return a.id - b.id
        })
        
        // Fetch full product details with images for each product
        const productsWithImages = await Promise.all(
          sorted.map(async (product: Product) => {
            try {
              const fullProductResp = await adminAPI.products.getById(product.id)
              return { ...product, images: fullProductResp.data.images || [] }
            } catch {
              return product
            }
          })
        )
        
        setProducts(productsWithImages)
      } catch (err) {
        setError('Unable to load products for this category.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [categoryId])

  const resolveImageUrl = (image?: ProductImage) => {
    if (!image) return ''
    if (image.image_url) return image.image_url
    if (!image.image_path) return ''

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    const backendOrigin = apiUrl.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8000'
    let normalized = image.image_path.startsWith('storage/') ? image.image_path.substring(8) : image.image_path
    normalized = normalized.startsWith('/') ? normalized.substring(1) : normalized
    return `${backendOrigin}/storage/${normalized}`
  }

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower)
    )
  })

  const getProductImages = (product: Product) => {
    if (!product.images || product.images.length === 0) return []
    // Sort by order, then by is_primary, then by id
    return [...product.images].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return a.id - b.id
    })
  }

  const getCurrentImageForProduct = (product: Product) => {
    const images = getProductImages(product)
    if (images.length === 0) return null
    const currentIndex = productImageIndices[product.id] || 0
    return images[currentIndex] || images[0]
  }

  const handlePreviousImage = (productId: number, totalImages: number) => {
    setProductImageIndices((prev) => {
      const currentIndex = prev[productId] || 0
      const newIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1
      return { ...prev, [productId]: newIndex }
    })
  }

  const handleNextImage = (productId: number, totalImages: number) => {
    setProductImageIndices((prev) => {
      const currentIndex = prev[productId] || 0
      const newIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0
      return { ...prev, [productId]: newIndex }
    })
  }

  const totalPages = Math.ceil(filteredProducts.length / showEntries)
  const startIndex = (currentPage - 1) * showEntries
  const endIndex = startIndex + showEntries
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  const goBack = () => navigate('/admin/categories')

  const handleViewDetails = (productId: number) => {
    navigate(`/admin/categories/${categoryId}/products?product=${productId}`)
  }

  const handleSetPriority = () => {
    // Navigate to a product priority page (if needed) or show a modal
    // For now, we'll navigate to category priority
    navigate(`/admin/categories/${categoryId}/products/priority`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error}</p>
        <button className="btn-primary px-4 py-2" onClick={goBack}>
          Back to Categories
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <button className="text-[#2c7a4b]" onClick={goBack}>
          Category
        </button>
        <span>/</span>
        <span className="text-gray-400">Product</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            List Of Full Product: {categoryName} ({filteredProducts.length})
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSetPriority}
            className="inline-flex items-center gap-2 rounded-full bg-[#2c7a4b] text-white px-4 py-2 text-sm font-semibold hover:bg-[#25633d]"
          >
            <span>⇅</span> SET PRIORITY
          </button>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search:"
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[#2c7a4b]/50 focus:border-[#2c7a4b]"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          </div>
        </div>
      </div>

      {/* Show Entries */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Show</span>
        <select
          value={showEntries}
          onChange={(e) => {
            setShowEntries(Number(e.target.value))
            setCurrentPage(1)
          }}
          className="border border-gray-200 rounded-md px-2 py-1 text-sm"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>entries</span>
      </div>

      {/* Product Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedProducts.map((product) => {
              const productImages = getProductImages(product)
              const currentImage = getCurrentImageForProduct(product)
              const imageUrl = resolveImageUrl(currentImage || undefined)
              const currentIndex = productImageIndices[product.id] || 0
              const hasMultipleImages = productImages.length > 1

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                    
                    {/* Previous/Next Navigation Buttons - Only show if multiple images */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviousImage(product.id, productImages.length)
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-sm transition-colors z-10"
                          title="Previous Image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNextImage(product.id, productImages.length)
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-sm transition-colors z-10"
                          title="Next Image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {/* View Details Icon */}
                    <button
                      onClick={() => handleViewDetails(product.id)}
                      className="absolute bottom-2 left-2 bg-white/90 hover:bg-white rounded-lg p-2 shadow-sm transition-colors z-10"
                      title="View Details"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-[#2c7a4b]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    
                    {/* Image Counter - Only show if multiple images */}
                    {hasMultipleImages && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {currentIndex + 1} / {productImages.length}
                      </div>
                    )}
                  </div>

                  {/* Product Code */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 text-center">
                      {product.sku || product.name}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
          <span>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of{' '}
            {filteredProducts.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              &lt; Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === page
                    ? 'bg-[#2c7a4b] text-white'
                    : 'border text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Next &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategoryProductGallery

