import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI, bannersAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import BannerCarousel from '../components/BannerCarousel'
import SEOHead from '../components/SEOHead'

const NewArrivalsPage = () => {
  const [products, setProducts] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, bannersResponse] = await Promise.all([
          productsAPI.getNewArrivals(),
          bannersAPI.getByPage('new-arrivals')
        ])
        setProducts(productsResponse.data)
        setBanners(bannersResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
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

  // Generate structured data for New Arrivals page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'New Arrivals - Shams Naturals',
    description: 'Discover our latest collection of eco-friendly bags and sustainable products. New arrivals featuring premium jute bags, cotton bags, and eco-conscious solutions.',
    url: 'https://shamsnaturals.com/new-arrivals',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          url: `https://shamsnaturals.com/products/${product.slug}`
        }
      }))
    }
  }

  return (
    <>
      <SEOHead
        title="New Arrivals - Latest Eco-Friendly Bags | Shams Naturals"
        description="Discover our latest collection of eco-friendly bags and sustainable products. New arrivals featuring premium jute bags, cotton bags, and eco-conscious solutions in UAE."
        keywords="new arrivals, latest eco-friendly bags, new sustainable products, eco bags UAE, new jute bags, new cotton bags"
        ogType="website"
        canonicalUrl="/new-arrivals"
        structuredData={structuredData}
      />
      <div>
        {/* Banner Carousel */}
        {banners && banners.length > 0 && (
          <BannerCarousel banners={banners} />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">New Arrivals</h1>
          <p className="text-lg text-gray-600">
            Discover our latest eco-friendly bag collection
          </p>
        </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={{ ...product, is_new_arrival: true }} imageFit="contain" />
              <div className="mt-4 text-center">
                <Link
                  to={`/products/${product.slug}`}
                  className="btn-primary inline-block px-4 py-2 text-sm"
                >
                  View More
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No new arrivals at the moment.</p>
        </div>
      )}
        </div>
      </div>
    </>
  )
}

export default NewArrivalsPage

