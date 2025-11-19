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
  order?: number
  images?: ProductImage[]
}

const AdminCategoryProductPriority = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [categoryName, setCategoryName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
      } catch (error) {
        setMessage({ type: 'error', text: 'Unable to load products.' })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [categoryId])

  const reorderList = (list: Product[], startIndex: number, endIndex: number) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  const handleDragStart = (index: number) => {
    setDraggingIndex(index)
  }

  const handleDragEnter = (index: number) => {
    if (draggingIndex === null || draggingIndex === index) return
    setProducts((prev) => reorderList(prev, draggingIndex, index))
    setDraggingIndex(index)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = products.map((product, index) => ({
        id: product.id,
        order: index, // Start from 0
      }))
      
      // Update each product's order
      await Promise.all(
        payload.map((item) =>
          adminAPI.products.update(item.id, { order: item.order })
        )
      )
      
      setMessage({ type: 'success', text: 'Product priorities updated successfully.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save ordering. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

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

  // Track current image index for each product
  const [productImageIndices, setProductImageIndices] = useState<Record<number, number>>({})

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

  const goBack = () => navigate(`/admin/categories/${categoryId}/products/gallery`)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <button className="text-[#2c7a4b]" onClick={() => navigate('/admin/categories')}>
          Category
        </button>
        <span>/</span>
        <button className="text-[#2c7a4b]" onClick={goBack}>
          Product
        </button>
        <span>/</span>
        <span className="text-gray-400">Set Priority Product</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Set Priority Product : {categoryName}</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'SAVE REORDERING'}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Drag and Drop Priority Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => {
                const productImages = getProductImages(product)
                const currentImage = getCurrentImageForProduct(product)
                const imageUrl = resolveImageUrl(currentImage || undefined)
                const currentImageIndex = productImageIndices[product.id] || 0
                const hasMultipleImages = productImages.length > 1
                
                return (
                  <div
                    key={product.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`rounded-2xl border px-4 py-4 bg-gray-50 shadow-sm cursor-move transition ${
                      draggingIndex === index ? 'border-[#2c7a4b] bg-white shadow-lg' : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden rounded-xl bg-white mb-3 relative">
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
                      
                      {/* Image Counter - Only show if multiple images */}
                      {hasMultipleImages && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {currentImageIndex + 1} / {productImages.length}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 text-center mb-2">
                      {product.sku || product.name}
                    </p>
                    <p className="text-sm text-gray-500 text-center">
                      Priority:{' '}
                      <span className="text-[#d9534f] font-bold">
                        {index}
                      </span>
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600">1.</span>
              <span>Drag Product to reorder.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600">2.</span>
              <span>Click 'Save Reordering' when finished.</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default AdminCategoryProductPriority

