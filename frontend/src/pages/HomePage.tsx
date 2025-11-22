import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { homepageAPI, dealersAPI, categoriesAPI } from '../services/api'
import BannerCarousel from '../components/BannerCarousel'
import ProductCard from '../components/ProductCard'
import EventsGallery from '../components/EventsGallery'
import WorldMap from '../components/WorldMap'
import ProductCategoriesSidebar from '../components/ProductCategoriesSidebar'
import SEOHead from '../components/SEOHead'

interface HomePageData {
  banners: any[]
  best_products: any[]
  new_arrivals: any[]
  events: any[]
}

const HomePage = () => {
  const { t } = useTranslation()
  const [data, setData] = useState<HomePageData | null>(null)
  const [dealers, setDealers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newArrivalsIndex, setNewArrivalsIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homepageResponse, dealersResponse, categoriesResponse] = await Promise.all([
          homepageAPI.get(),
          dealersAPI.getAll().catch(() => ({ data: [] })), // Fetch dealers for map, but don't fail if it errors
          categoriesAPI.getAll().catch(() => ({ data: [] })), // Fetch categories for catalogue
        ])
        setData(homepageResponse.data)
        setDealers(dealersResponse.data || [])
        setCategories(categoriesResponse.data || [])
      } catch (error) {
        console.error('Error fetching homepage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Generate structured data for homepage
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shams Naturals',
    url: 'https://shamsnaturals.com',
    logo: 'https://shamsnaturals.com/assets/company_logo_image/shamsnaturals-logo.png',
    description: 'Eco-friendly bags and sustainable products in UAE',
    sameAs: [
      'https://www.facebook.com/shams.naturals',
      'https://www.instagram.com/shams_naturals7',
      'https://www.youtube.com/@SHAMSNATURALS'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+971-55-190-6177',
      contactType: 'Customer Service',
      email: 'info@shamsnaturals.com'
    }
  }

  return (
    <div>
      <SEOHead
        title="Eco-Friendly Bags & Sustainable Products in UAE"
        description="Discover premium eco-friendly bags and sustainable products at Shams Naturals. Leading supplier of jute bags, cotton bags, and eco-conscious solutions in UAE."
        keywords="eco-friendly bags, sustainable products, jute bags, cotton bags, UAE, eco-conscious, green products, biodegradable bags"
        ogImage="/assets/company_logo_image/shamsnaturals-logo.png"
        ogType="website"
        structuredData={structuredData}
      />
      {/* Banner Carousel */}
      {data?.banners && data.banners.length > 0 && (
        <BannerCarousel banners={data.banners} />
      )}

      {/* Product Categories Sidebar & Catalogue Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product Categories Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <ProductCategoriesSidebar />
            </div>

            {/* All Category Catalogue */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('home.allCategoryCatalogue')}
                </h1>
                <p className="text-gray-600">
                  {t('home.browseCollection')}
                </p>
              </div>
              
              {/* Categories Grid */}
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => {
                    const categoryImageUrl = category.image_url || 
                      (category.image 
                        ? (category.image.startsWith('http')
                            ? category.image
                            : `http://localhost:8000/storage/${category.image}`)
                        : '/placeholder-category.jpg')

                    return (
                      <Link
                        key={category.id}
                        to={`/products/category/${category.slug}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                      >
                        <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={categoryImageUrl}
                            alt={category.name}
                            className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-category.jpg'
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-[#4a7c28] transition-colors">
                            {category.name}
                          </h3>
                          <span className="inline-block text-[#4a7c28] font-medium text-sm group-hover:underline">
                            {t('products.viewMoreArrow')}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">{t('home.noCategories')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Best Products Section */}
      {data?.best_products && data.best_products.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('home.bestEcoFriendlyBags')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('home.discoverTopRated')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {data.best_products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {data?.new_arrivals && data.new_arrivals.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('home.newArrivals')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('home.checkOutLatest')}
              </p>
            </div>
            <div className="relative">
              {/* Previous Button */}
              {data.new_arrivals.length > 5 && (
                <button
                  onClick={() => {
                    setNewArrivalsIndex((prev) => 
                      prev === 0 ? data.new_arrivals.length - 5 : prev - 5
                    )
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                  aria-label="Previous products"
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

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {data.new_arrivals
                  .slice(newArrivalsIndex, newArrivalsIndex + 5)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{ ...product, is_new_arrival: true }}
                      imageFit="contain"
                    />
                  ))}
              </div>

              {/* Next Button */}
              {data.new_arrivals.length > 5 && (
                <button
                  onClick={() => {
                    setNewArrivalsIndex((prev) => 
                      prev + 5 >= data.new_arrivals.length ? 0 : prev + 5
                    )
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                  aria-label="Next products"
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
            <div className="text-center mt-8">
              <Link
                to="/new-arrivals"
                className="btn-primary inline-block px-6 py-3"
              >
                {t('home.viewMore')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Events Gallery Section */}
      {data?.events && data.events.length > 0 && (
        <EventsGallery events={data.events} autoSlideInterval={5000} />
      )}

      {/* Dealers World Map Section */}
      <WorldMap dealers={dealers} />
    </div>
  )
}

export default HomePage

