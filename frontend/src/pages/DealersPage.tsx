import { useEffect, useState, useRef } from 'react'
import { dealersAPI, bannersAPI } from '../services/api'
import BannerCarousel from '../components/BannerCarousel'

interface Dealer {
  id: number
  company_name: string
  contact_person: string
  email: string
  phone?: string
  address: string
  city: string
  state: string
  country: string
  latitude?: number
  longitude?: number
  description?: string
}

const DealersPage = () => {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [expandedDealer, setExpandedDealer] = useState<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealersResponse, bannersResponse] = await Promise.all([
          dealersAPI.getAll(),
          bannersAPI.getByPage('dealers')
        ])
        setDealers(dealersResponse.data)
        setBanners(bannersResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (mapRef.current && dealers.length > 0) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.warn('Google Maps API key not found')
        return
      }

      // Load Google Maps script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true

      script.onload = () => {
        if (!mapRef.current || !(window as any).google) return

        const google = (window as any).google
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 20, lng: 0 },
          zoom: 2,
        })

        mapInstanceRef.current = map

        // Clear existing markers
        markersRef.current.forEach((marker: any) => marker.setMap(null))
        markersRef.current = []

        // Add markers for dealers with coordinates
        dealers
          .filter((dealer) => dealer.latitude && dealer.longitude)
          .forEach((dealer) => {
            const marker = new google.maps.Marker({
              position: {
                lat: dealer.latitude!,
                lng: dealer.longitude!,
              },
              map,
              title: dealer.company_name,
            })

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <h3 class="font-bold">${dealer.company_name}</h3>
                  <p>${dealer.address}, ${dealer.city}</p>
                  <p>${dealer.state}, ${dealer.country}</p>
                  ${dealer.phone ? `<p>Phone: ${dealer.phone}</p>` : ''}
                </div>
              `,
            })

            marker.addListener('click', () => {
              infoWindow.open(map, marker)
            })

            markersRef.current.push(marker)
          })

        // Fit bounds to show all markers
        if (markersRef.current.length > 0) {
          const bounds = new google.maps.LatLngBounds()
          markersRef.current.forEach((marker: any) => {
            const position = marker.getPosition()
            if (position) bounds.extend(position)
          })
          map.fitBounds(bounds)
        }
      }

      document.head.appendChild(script)

      return () => {
        // Cleanup
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }
  }, [dealers])

  const countries = Array.from(new Set(dealers.map((d) => d.country))).sort()

  const filteredDealers = selectedCountry
    ? dealers.filter((d) => d.country === selectedCountry)
    : dealers

  const dealersByCountry = filteredDealers.reduce((acc, dealer) => {
    if (!acc[dealer.country]) {
      acc[dealer.country] = []
    }
    acc[dealer.country].push(dealer)
    return acc
  }, {} as Record<string, Dealer[]>)

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
      {banners && banners.length > 0 && (
        <BannerCarousel banners={banners} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Dealer Network</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dealers List */}
        <div>
          {/* Country Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Country
            </label>
            <select
              value={selectedCountry || ''}
              onChange={(e) => setSelectedCountry(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Dealers Accordion */}
          <div className="space-y-4">
            {Object.entries(dealersByCountry).map(([country, countryDealers]) => (
              <div key={country} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() =>
                    setExpandedDealer(
                      expandedDealer === countryDealers[0].id ? null : countryDealers[0].id
                    )
                  }
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-semibold text-lg">{country}</span>
                  <span className="text-gray-500">
                    {expandedDealer === countryDealers[0].id ? '−' : '+'}
                  </span>
                </button>
                {expandedDealer === countryDealers[0].id && (
                  <div className="px-6 pb-4 space-y-4">
                    {countryDealers.map((dealer) => (
                      <div key={dealer.id} className="border-t pt-4">
                        <h3 className="font-semibold text-lg mb-2">{dealer.company_name}</h3>
                        <p className="text-gray-600 mb-2">
                          <strong>Contact:</strong> {dealer.contact_person}
                        </p>
                        <p className="text-gray-600 mb-2">
                          <strong>Address:</strong> {dealer.address}, {dealer.city}, {dealer.state}
                        </p>
                        {dealer.phone && (
                          <p className="text-gray-600 mb-2">
                            <strong>Phone:</strong> {dealer.phone}
                          </p>
                        )}
                        <p className="text-gray-600 mb-2">
                          <strong>Email:</strong>{' '}
                          <a
                            href={`mailto:${dealer.email}`}
                            className="text-primary-600 hover:underline"
                          >
                            {dealer.email}
                          </a>
                        </p>
                        {dealer.description && (
                          <p className="text-gray-600 mt-2">{dealer.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Google Map */}
        <div>
          <div ref={mapRef} className="w-full h-[600px] rounded-lg border border-gray-300" />
        </div>
      </div>
      </div>
    </div>
  )
}

export default DealersPage

