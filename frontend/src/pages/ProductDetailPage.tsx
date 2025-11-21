import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { productsAPI } from '../services/api'

const ProductDetailPage = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setLoading(false)
        setError('Product slug is required')
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await productsAPI.getBySlug(slug)
        setProduct(response.data)
        if (response.data.images && response.data.images.length > 0) {
          const primaryImage = response.data.images.find((img: any) => img.is_primary) || response.data.images[0]
          // Use image_url if available (from backend), otherwise use image_path
          const imagePath = primaryImage.image_url || primaryImage.image_path
          setSelectedImage(imagePath)
        }
      } catch (error: any) {
        console.error('Error fetching product:', error)
        setError(error.response?.data?.message || 'Failed to load product. Please try again.')
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  const resolveImageUrl = (image: any) => {
    if (!image) return '/placeholder-product.jpg'
    
    // Use image_url if available (from backend ProductImage model)
    const imagePath = image.image_url || image.image_path
    if (!imagePath) return '/placeholder-product.jpg'
    
    if (imagePath.startsWith('http')) return imagePath
    
    // Remove 'storage/' prefix if present
    let normalized = imagePath.startsWith('storage/') ? imagePath.substring(8) : imagePath
    normalized = normalized.startsWith('/') ? normalized.substring(1) : normalized
    
    return `http://localhost:8000/storage/${normalized}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 text-lg mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <a href="/products" className="text-primary-600 hover:text-primary-700 underline">
            Back to Products
          </a>
        </div>
      </div>
    )
  }

  const mainImageUrl = resolveImageUrl(
    product.images?.find((img: any) => img.image_path === selectedImage || img.image_url === selectedImage) ||
    product.images?.[0]
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="mb-4">
            <img
              src={mainImageUrl}
              alt={product.name || 'Product image'}
              className="w-full h-96 object-contain rounded-lg bg-gray-100"
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.jpg'
              }}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image: any) => {
                const imageUrl = resolveImageUrl(image)
                const imagePath = image.image_url || image.image_path
                return (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(imagePath)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImage === imagePath
                        ? 'border-primary-600'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={image.alt_text || product.name}
                      className="w-full h-24 object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.jpg'
                      }}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name || 'Product'}</h1>
          
          {product.category && (
            <div className="mb-4">
              <span className="text-sm text-gray-600">
                {product.category.name}
                {product.subcategory && ` / ${product.subcategory.name}`}
              </span>
            </div>
          )}

          {product.short_description && (
            <p className="text-lg text-gray-700 mb-6">{product.short_description}</p>
          )}

          {product.description && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <div
                className="text-gray-700 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {product.sku && (
            <p className="text-sm text-gray-600 mb-4">SKU: {product.sku}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage

