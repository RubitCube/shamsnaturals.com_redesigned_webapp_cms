import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { homepageAPI, dealersAPI } from '../services/api'
import BannerCarousel from '../components/BannerCarousel'
import ProductCard from '../components/ProductCard'
import EventsGallery from '../components/EventsGallery'
import WorldMap from '../components/WorldMap'

interface HomePageData {
  banners: any[]
  best_products: any[]
  new_arrivals: any[]
  events: any[]
}

const HomePage = () => {
  const [data, setData] = useState<HomePageData | null>(null)
  const [dealers, setDealers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homepageResponse, dealersResponse] = await Promise.all([
          homepageAPI.get(),
          dealersAPI.getAll().catch(() => ({ data: [] })), // Fetch dealers for map, but don't fail if it errors
        ])
        setData(homepageResponse.data)
        setDealers(dealersResponse.data || [])
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

  return (
    <div>
      {/* Banner Carousel */}
      {data?.banners && data.banners.length > 0 && (
        <BannerCarousel banners={data.banners} />
      )}

      {/* Best Products Section */}
      {data?.best_products && data.best_products.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Best Eco-Friendly Bags
              </h2>
              <p className="text-lg text-gray-600">
                Discover our top-rated sustainable bag collection
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
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                New Arrivals
              </h2>
              <p className="text-lg text-gray-600">
                Check out our latest eco-friendly bag designs
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.new_arrivals.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/new-arrivals"
                className="btn-primary inline-block"
              >
                View All New Arrivals
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

