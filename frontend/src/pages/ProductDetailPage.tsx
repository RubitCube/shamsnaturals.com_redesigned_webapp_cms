import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { productsAPI } from '../services/api'

const ProductDetailPage = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getBySlug(slug!)
        setProduct(response.data)
        if (response.data.images && response.data.images.length > 0) {
          const primaryImage = response.data.images.find((img: any) => img.is_primary) || response.data.images[0]
          setSelectedImage(primaryImage.image_path)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Product not found.</p>
      </div>
    )
  }

  const mainImageUrl = selectedImage
    ? (selectedImage.startsWith('http')
        ? selectedImage
        : `http://localhost:8000/storage/${selectedImage}`)
    : '/placeholder-product.jpg'

  const displayPrice = product.sale_price || product.price
  const hasSale = product.sale_price && product.sale_price < product.price

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="mb-4">
            <img
              src={mainImageUrl}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image: any) => {
                const imageUrl = image.image_path.startsWith('http')
                  ? image.image_path
                  : `http://localhost:8000/storage/${image.image_path}`
                return (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image.image_path)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImage === image.image_path
                        ? 'border-primary-600'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={image.alt_text || product.name}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          {product.category && (
            <div className="mb-4">
              <span className="text-sm text-gray-600">
                {product.category.name}
                {product.subcategory && ` / ${product.subcategory.name}`}
              </span>
            </div>
          )}

          <div className="mb-6">
            {hasSale && (
              <span className="text-gray-400 line-through text-xl mr-2">
                ${product.price.toFixed(2)}
              </span>
            )}
            <span className="text-primary-600 font-bold text-3xl">
              ${displayPrice.toFixed(2)}
            </span>
          </div>

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

          <div className="flex gap-4">
            <button className="btn-primary flex-1">
              Add to Cart
            </button>
            <button className="btn-secondary">
              Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage

