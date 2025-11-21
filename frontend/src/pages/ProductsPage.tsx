import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productsAPI, categoriesAPI } from '../services/api'

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

const ProductsPage = () => {
  const { category, subcategory } = useParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [currentCategory, setCurrentCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

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

        const productsData = productsRes.data.data || productsRes.data || []
        setProducts(productsData)
        setCategories(categoriesRes.data || [])

        // Fetch full category details to get banner
        if (category) {
          try {
            const categoryRes = await categoriesAPI.getBySlug(category)
            setCurrentCategory(categoryRes.data)
          } catch (error) {
            // Fallback to finding from list if getBySlug fails
            const cat = categoriesRes.data?.find((c: any) => c.slug === category)
            setCurrentCategory(cat)
          }
        } else {
          setCurrentCategory(null)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [category, subcategory])

  const resolveImageUrl = (image?: ProductImage) => {
    if (!image?.image_path) return '/placeholder-product.jpg'
    if (image.image_path.startsWith('http')) return image.image_path
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    const backendOrigin = apiUrl.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8000'
    
    let normalized = image.image_path.startsWith('storage/') ? image.image_path.substring(8) : image.image_path
    normalized = normalized.startsWith('/') ? normalized.substring(1) : normalized
    
    return `${backendOrigin}/storage/${normalized}`
  }

  const productsPerSlide = 4
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dcecd5]"></div>
      </div>
    )
  }

  const resolveBannerUrl = (bannerPath?: string) => {
    if (!bannerPath) return null
    if (bannerPath.startsWith('http')) return bannerPath
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    const backendOrigin = apiUrl.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8000'
    
    let normalized = bannerPath.startsWith('storage/') ? bannerPath.substring(8) : bannerPath
    normalized = normalized.startsWith('/') ? normalized.substring(1) : normalized
    
    return `${backendOrigin}/storage/${normalized}`
  }

  const categoryBannerUrl = currentCategory?.banner_url || resolveBannerUrl(currentCategory?.banner)

  return (
    <div>
      {/* Category Banner */}
      {categoryBannerUrl && (
        <div className="w-full mb-8">
          <div className="relative w-full overflow-hidden rounded-lg h-[240px] sm:h-[320px] md:h-[400px] lg:h-[520px] max-w-full">
            <img
              src={categoryBannerUrl}
              alt={currentCategory?.name || 'Category banner'}
              className="w-full h-full object-cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {currentCategory ? currentCategory.name : 'Product Category Catalogue'}
          </h1>
          <p className="text-lg text-gray-600">
            {currentCategory 
              ? `Browse through our extensive collection of ${currentCategory.name.toLowerCase()}`
              : 'Browse through our extensive collection of eco-friendly bags'}
          </p>
        </div>

      {/* Products Carousel */}
      {products.length > 0 ? (
        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => {
                const startIndex = slideIndex * productsPerSlide
                const slideProducts = products.slice(startIndex, startIndex + productsPerSlide)

                return (
                  <div key={slideIndex} className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                    {slideProducts.map((product) => {
                      const image = product.primaryImage || product.images?.[0]
                      const imageUrl = resolveImageUrl(image)

                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                        >
                          <Link to={`/products/${product.slug}`} className="block">
                            <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                              <img
                                src={imageUrl}
                                alt={image?.alt_text || product.name}
                                className="w-full h-full object-contain p-4 mix-blend-multiply"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.jpg'
                                }}
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {product.name}
                              </h3>
                              {product.sku && (
                                <p className="text-sm text-gray-500 mb-2">Code: {product.sku}</p>
                              )}
                              {product.category && (
                                <p className="text-xs text-gray-400 uppercase">
                                  {product.category.name}
                                </p>
                              )}
                            </div>
                          </Link>
                          <div className="px-4 pb-4">
                            <Link
                              to={`/products/${product.slug}`}
                              className="block w-full text-center bg-[#dcecd5] hover:bg-[#c5d9b8] text-[#0f3b1e] font-semibold py-2 rounded-lg transition-colors"
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

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
                aria-label="Next slide"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

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
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found in this category.</p>
        </div>
      )}
      </div>
    </div>
  )
}

export default ProductsPage

