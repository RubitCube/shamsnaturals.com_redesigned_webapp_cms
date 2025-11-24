import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productsAPI } from '../services/api'
import { translateCategoryName } from '../utils/categoryTranslations'

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
  sku?: string
  images?: ProductImage[]
  primaryImage?: ProductImage
  category?: { name: string; slug: string }
}

interface ProductCategoryCarouselProps {
  categorySlug?: string
  limit?: number
}

const ProductCategoryCarousel = ({ categorySlug, limit = 20 }: ProductCategoryCarouselProps) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let response
        if (categorySlug) {
          response = await productsAPI.getByCategory(categorySlug)
        } else {
          response = await productsAPI.getAll({ per_page: limit })
        }
        const data = response.data?.data || response.data || []
        setProducts(data.slice(0, limit))
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [categorySlug, limit])

  const resolveImageUrl = (image?: ProductImage) => {
    const BASE_URL = import.meta.env.VITE_SITE_URL
      ? import.meta.env.VITE_SITE_URL + "/backend"
      : "http://localhost:8000/backend";

    if (!image?.image_path) return `${BASE_URL}/public/storage/products/placeholder-product.jpg`;
    
    // Check if it's an absolute URL
    if (image.image_path.startsWith('http')) {
      // Fix incorrect backend URLs that are missing /backend/public/
      const siteUrl = import.meta.env.VITE_SITE_URL || "http://localhost:8000";
      if (image.image_path.includes("/storage/products/") && !image.image_path.includes("/backend/public/")) {
        const filename = image.image_path.split("/storage/products/")[1];
        return `${siteUrl}/backend/public/storage/products/${filename}`;
      }
      return image.image_path;
    }
    
    let normalized = image.image_path;
    // Remove leading 'storage/' or '/'
    normalized = normalized.replace(/^storage\//, "").replace(/^\//, "");
    // Remove 'products/' if it exists (backend already includes it in path)
    normalized = normalized.replace(/^products\//, "");
    
    return `${BASE_URL}/public/storage/products/${normalized}`;
  }

  const productsPerSlide = 3
  const totalSlides = Math.ceil(products.length / productsPerSlide)

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a7c28]"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No products available in this category.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {/* Previous Button */}
      {totalSlides > 1 && (
        <button
          onClick={goToPrevious}
          className="flex-shrink-0 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200 cursor-pointer"
          aria-label="Previous slide"
          type="button"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      <div className="flex-1 relative">
        <div className="overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => {
              const startIndex = slideIndex * productsPerSlide
              const slideProducts = products.slice(startIndex, startIndex + productsPerSlide)

              return (
                <div key={slideIndex} className="min-w-full grid grid-cols-3 gap-6 px-4">
                {slideProducts.map((product) => {
                  const image = product.primaryImage || product.images?.[0]
                  const imageUrl = resolveImageUrl(image)

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <Link to={`/products/${product.slug}`} className="block">
                        <div className="relative h-64 bg-gray-100 flex items-center justify-center">
                          <img
                            src={imageUrl}
                            alt={image?.alt_text || product.name}
                            className="w-full h-full object-contain p-4 mix-blend-multiply"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              const BASE_URL = import.meta.env.VITE_SITE_URL
                                ? import.meta.env.VITE_SITE_URL + "/backend"
                                : "http://localhost:8000/backend";
                              e.currentTarget.src = `${BASE_URL}/public/storage/products/placeholder-product.jpg`
                            }}
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-xl text-gray-900 mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          {product.sku && (
                            <p className="text-base text-gray-500 mb-2">Code: {product.sku}</p>
                          )}
                          {product.category && (
                            <p className="text-sm text-gray-400 uppercase">
                              {translateCategoryName(product.category.name, t)}
                            </p>
                          )}
                        </div>
                      </Link>
                      <div className="px-5 pb-5">
                        <Link
                          to={`/products/${product.slug}`}
                          className="block w-full text-center bg-[#dcecd5] hover:bg-[#c5d9b8] text-[#0f3b1e] font-semibold py-3 rounded-lg transition-colors text-base"
                        >
                          View More
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
            })}
          </div>
        </div>

        {/* Dots Indicator */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-[#4a7c28]' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
            ))}
          </div>
        )}
      </div>

      {/* Next Button */}
      {totalSlides > 1 && (
        <button
          onClick={goToNext}
          className="flex-shrink-0 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200 cursor-pointer"
          aria-label="Next slide"
          type="button"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default ProductCategoryCarousel

