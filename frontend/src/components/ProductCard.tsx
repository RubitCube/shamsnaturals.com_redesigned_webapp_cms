import { Link } from 'react-router-dom'

interface ProductImage {
  id: number
  image_path: string
  alt_text?: string
  is_primary: boolean
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  sale_price?: number
  images?: ProductImage[]
  primaryImage?: ProductImage
  short_description?: string
}

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const image = product.primaryImage || product.images?.[0]
  const imageUrl = image?.image_path
    ? (image.image_path.startsWith('http')
        ? image.image_path
        : `http://localhost:8000/storage/${image.image_path}`)
    : '/placeholder-product.jpg'

  const displayPrice = product.sale_price || product.price
  const hasSale = product.sale_price && product.sale_price < product.price

  return (
    <Link to={`/products/${product.slug}`} className="card hover:shadow-xl transition-shadow duration-200">
      <div className="relative">
        <img
          src={imageUrl}
          alt={image?.alt_text || product.name}
          className="w-full h-64 object-cover"
        />
        {hasSale && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            Sale
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        {product.short_description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div>
            {hasSale && (
              <span className="text-gray-400 line-through mr-2">
                ${product.price.toFixed(2)}
              </span>
            )}
            <span className="text-primary-600 font-bold text-xl">
              ${displayPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

