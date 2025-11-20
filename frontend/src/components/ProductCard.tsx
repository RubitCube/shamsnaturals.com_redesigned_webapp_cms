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
  is_new_arrival?: boolean
}

interface ProductCardProps {
  product: Product
  imageFit?: 'cover' | 'contain'
}

const ProductCard = ({ product, imageFit = 'cover' }: ProductCardProps) => {
  const image = product.primaryImage || product.images?.[0]
  const imageUrl = image?.image_path
    ? (image.image_path.startsWith('http')
        ? image.image_path
        : `http://localhost:8000/storage/${image.image_path}`)
    : '/placeholder-product.jpg'

  const imageClass =
    imageFit === 'contain'
      ? 'w-full h-64 object-contain p-4 mix-blend-multiply bg-white'
      : 'w-full h-64 object-cover'

  return (
    <Link to={`/products/${product.slug}`} className="card hover:shadow-xl transition-shadow duration-200">
      <div className="relative">
        <img
          src={imageUrl}
          alt={image?.alt_text || product.name}
          className={imageClass}
          loading="lazy"
          decoding="async"
        />
        {product.is_new_arrival && (
          <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            New
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        {product.short_description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {product.short_description}
          </p>
        )}
      </div>
    </Link>
  )
}

export default ProductCard

