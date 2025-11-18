import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { adminAPI } from '../../services/api'

interface ProductImage {
  id: number
  image_path: string
  image_url?: string
  alt_text?: string
  order: number
  is_primary: boolean
}

interface Product {
  id: number
  name: string
  category?: { name: string }
}

const resolveImageUrl = (path?: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
  const backendOrigin = apiUrl.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8000'

  let normalized = path.startsWith('storage/') ? path.substring(8) : path
  normalized = normalized.startsWith('/') ? normalized.substring(1) : normalized
  
  return `${backendOrigin}/storage/${normalized}`
}

const AdminProductImagePriority = () => {
  const navigate = useNavigate()
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const productIdFromQuery = searchParams.get('product')
  
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const id = productId || productIdFromQuery
    if (id) {
      fetchProductAndImages(Number(id))
    }
  }, [productId, productIdFromQuery])

  const fetchProductAndImages = async (id: number) => {
    try {
      setLoading(true)
      const response = await adminAPI.products.getById(id)
      const data = response.data
      
      setProduct({
        id: data.id,
        name: data.name,
        category: data.category,
      })
      
      // Sort images by order
      const sortedImages = (data.images || []).sort((a: ProductImage, b: ProductImage) => 
        (a.order || 0) - (b.order || 0)
      )
      setImages(sortedImages)
    } catch (error) {
      setMessage({ type: 'error', text: 'Unable to load product images.' })
    } finally {
      setLoading(false)
    }
  }

  const reorderList = (list: ProductImage[], startIndex: number, endIndex: number) => {
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
    setImages((prev) => reorderList(prev, draggingIndex, index))
    setDraggingIndex(index)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
  }

  const handleSave = async () => {
    if (!product) return
    
    try {
      setSaving(true)
      const payload = images.map((image, index) => ({
        id: image.id,
        order: index,
      }))
      
      await adminAPI.products.reorderImages(product.id, payload)
      setMessage({ type: 'success', text: 'Product image priorities updated successfully.' })
      
      // Refresh images to get updated order
      setTimeout(() => {
        fetchProductAndImages(product.id)
      }, 1000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save ordering. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Product not found.</p>
        <button className="btn-primary px-4 py-2" onClick={() => navigate('/admin/products')}>
          Back to Products
        </button>
      </div>
    )
  }

  const categoryName = product.category?.name || 'Unknown Category'

  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <button className="text-[#2c7a4b]" onClick={() => navigate('/admin/categories')}>
          Category
        </button>
        <span>/</span>
        <button 
          className="text-[#2c7a4b]" 
          onClick={() => navigate(`/admin/categories/${product.category?.id || ''}/products?product=${product.id}`)}
        >
          Products
        </button>
        <span>/</span>
        <span className="text-gray-400">Set Priority Product Images</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Set Priority Product Images : {categoryName}
          </h1>
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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {images.length > 0 ? (
              images.map((image, index) => {
                const imageSrc = image.image_url || resolveImageUrl(image.image_path)
                return (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`rounded-2xl border px-4 py-4 bg-gray-50 shadow-sm cursor-move transition ${
                      draggingIndex === index ? 'border-blue-500 bg-white shadow-lg' : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden rounded-xl bg-white mb-3">
                      <img
                        src={imageSrc}
                        alt={image.alt_text || product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Priority:{' '}
                      <span className="text-red-600 font-bold">{index}</span>
                    </p>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 col-span-full">No product images found.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600">1.</span>
              <span>Drag product photos to reorder.</span>
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

export default AdminProductImagePriority

