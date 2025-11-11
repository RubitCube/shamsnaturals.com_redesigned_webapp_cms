import { useEffect, useState, useRef, useMemo } from 'react'
import { dealersAPI, bannersAPI } from '../services/api'
import BannerCarousel from '../components/BannerCarousel'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

const parseDealerMeta = (description?: string) => {
  if (!description) {
    return { location: '', website: '' }
  }

  try {
    const parsed = JSON.parse(description)
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        location: typeof parsed.location === 'string' ? parsed.location : '',
        website: typeof parsed.website === 'string' ? parsed.website : '',
      }
    }
  } catch (_error) {
    return { location: description, website: '' }
  }

  return { location: '', website: '' }
}

const parseDealerPhones = (value?: string) => {
  if (!value) return [] as string[]

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === 'string' ? item : ''))
        .filter(Boolean)
    }
  } catch (_error) {
    if (typeof value === 'string' && value.trim()) {
      return [value.trim()]
    }
  }

  return []
}

const GOOGLE_MAPS_EMBED_BASE = 'https://www.google.com/maps/embed'

const buildGoogleEmbedIframe = (src: string) =>
  `<iframe src="${src}" width="100%" height="220" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`

const extractLocationInfo = (raw: string) => {
  if (!raw) {
    return { embedHtml: '', text: '' }
  }

  const trimmed = raw.trim()

  const iframeMatch = trimmed.match(/<iframe[^>]*src=("|')(.*?)(\1)[^>]*><\/iframe>/i)
  if (iframeMatch) {
    const src = iframeMatch[2]
    if (src.startsWith(GOOGLE_MAPS_EMBED_BASE)) {
      return { embedHtml: buildGoogleEmbedIframe(src), text: '' }
    }
  }

  const urlMatch = trimmed.match(/https:\/\/www\.google\.com\/maps\/embed[^"'\s>]*/i)
  if (urlMatch) {
    return { embedHtml: buildGoogleEmbedIframe(urlMatch[0]), text: '' }
  }

  return { embedHtml: '', text: trimmed }
}

const DealersPage = () => {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [expandedDealer, setExpandedDealer] = useState<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const highlightRef = useRef<L.Circle[]>([])

  useEffect(() => {
    // Configure default marker icons via CDN, similar to homepage map
    const ButterflyIcon = L.divIcon({
      className: '',
      html: `
        <svg width="38" height="34" viewBox="0 0 38 34" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <path d="M19 17c-1.1-5.3-5.4-9-10.5-9C3.8 8 .2 12 .2 17s3.6 9 8.3 9c3.3 0 6.2-2 7.5-5 0 0 1.5 3 2.9 3s2.9-3 2.9-3c1.3 3 4.2 5 7.5 5 4.6 0 8.3-4 8.3-9s-3.6-9-8.3-9c-5.1 0-9.4 3.7-10.5 9Z" fill="#16a34a" fill-opacity=".75"/>
            <circle cx="19" cy="17" r="3.3" fill="#166534"/>
            <path d="M19 3.5c.7 0 1.3.6 1.3 1.3v5.4c0 .7-.6 1.3-1.3 1.3-.7 0-1.3-.6-1.3-1.3V4.8c0-.7.6-1.3 1.3-1.3Zm0-3.5c1 0 1.8.8 1.8 1.8v1.2c0 1-.8 1.8-1.8 1.8-1 0-1.8-.8-1.8-1.8V1.8C17.2.8 18 .0 19 0Z" fill="#14532d"/>
          </g>
        </svg>
      `,
      iconSize: [38, 34],
      iconAnchor: [19, 17],
      popupAnchor: [0, -18],
    })

    L.Marker.prototype.options.icon = ButterflyIcon
  }, [])

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

  const countries = useMemo(
    () => Array.from(new Set(dealers.map((d) => d.country))).sort(),
    [dealers]
  )

  const filteredDealers = useMemo(() => {
    return selectedCountry ? dealers.filter((d) => d.country === selectedCountry) : dealers
  }, [dealers, selectedCountry])

  useEffect(() => {
    if (!mapRef.current) return

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

    // Clear previous markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current?.removeLayer(marker)
    })
    markersRef.current = []
    highlightRef.current.forEach((circle) => {
      mapInstanceRef.current?.removeLayer(circle)
    })
    highlightRef.current = []

    filteredDealers
      .filter((dealer) => dealer.latitude && dealer.longitude)
      .forEach((dealer) => {
        const lat =
          typeof dealer.latitude === 'string' ? parseFloat(dealer.latitude) : dealer.latitude
        const lng =
          typeof dealer.longitude === 'string' ? parseFloat(dealer.longitude) : dealer.longitude

        if (!lat || !lng || Number.isNaN(lat) || Number.isNaN(lng)) {
          return
        }

        const { location, website } = parseDealerMeta(dealer.description)
        const phoneNumbers = parseDealerPhones(dealer.phone)

        const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current!)
        const popupHtml = `
          <div class="dealer-popup">
            <h3 class="font-semibold text-sm mb-1">${dealer.company_name}</h3>
            <p class="text-xs text-gray-600">${dealer.address}${dealer.city ? `, ${dealer.city}` : ''}</p>
            <p class="text-xs text-gray-600">${dealer.state}, ${dealer.country}</p>
            ${dealer.contact_person ? `<p class="text-xs text-gray-600"><strong>Contact:</strong> ${dealer.contact_person}</p>` : ''}
            ${phoneNumbers.length ? `<div class="text-xs text-gray-600"><strong>Phone:</strong> ${phoneNumbers
              .map((phone) => `<a href="tel:${phone.replace(/[^0-9+]/g, '')}" class="text-primary-600 underline">${phone}</a>`)
              .join(', ')}</div>` : ''}
            ${dealer.email ? `<p class="text-xs text-gray-600"><strong>Email:</strong> ${dealer.email}</p>` : ''}
            ${website ? `<p class="text-xs text-gray-600"><strong>Website:</strong> <a href="${website}" target="_blank" rel="noopener" class="text-primary-600 underline">Visit site</a></p>` : ''}
            ${location ? `<p class="text-xs text-gray-600 mt-1">${location}</p>` : ''}
          </div>
        `
        marker.bindPopup(popupHtml, { className: 'dealer-popup-container' })

        const radius = 50000
        const circle = L.circle([lat, lng], {
          radius,
          color: '#22c55e',
          weight: 1,
          fillColor: '#22c55e',
          fillOpacity: 0.15,
          interactive: false,
        }).addTo(mapInstanceRef.current!)

        markersRef.current.push(marker)
        highlightRef.current.push(circle)

        marker.on('click', () => {
          setSelectedCountry(dealer.country)
          setExpandedDealer(dealer.id)
          const cardElement = document.getElementById(`dealer-card-${dealer.id}`)
          if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        })

        marker.on('popupopen', () => {
          setSelectedCountry(dealer.country)
          setExpandedDealer(dealer.id)
        })
      })

    if (markersRef.current.length > 0) {
      const bounds = L.latLngBounds(markersRef.current.map((marker) => marker.getLatLng()))
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] })
    } else {
      mapInstanceRef.current.setView([20, 0], 2)
    }

    // Invalidate size in case container resized
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize()
    }, 200)

    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current && filteredDealers.length === 0) {
        mapInstanceRef.current.setView([20, 0], 2)
      }
    }
  }, [filteredDealers])

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

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
            {Object.entries(dealersByCountry).map(([country, countryDealers]) => {
              const isCountryExpanded = countryDealers.some((dealer) => dealer.id === expandedDealer)

              return (
                <div key={country} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() =>
                      setExpandedDealer(isCountryExpanded ? null : countryDealers[0].id)
                    }
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                  >
                    <span className="font-semibold text-lg">{country}</span>
                    <span className="text-gray-500">{isCountryExpanded ? '−' : '+'}</span>
                  </button>
                  {isCountryExpanded && (
                    <div className="px-6 pb-4 space-y-4">
                      {countryDealers.map((dealer) => (
                        <div
                          key={dealer.id}
                          id={`dealer-card-${dealer.id}`}
                          className={`border-t pt-4 ${
                            expandedDealer === dealer.id
                              ? 'bg-green-50 border-green-200 rounded-lg px-4 py-3 mt-2'
                              : ''
                          }`}
                        >
                        <h3 className="font-semibold text-lg mb-2">{dealer.company_name}</h3>
                        <p className="text-gray-600 mb-2">
                          <strong>Contact:</strong> {dealer.contact_person}
                        </p>
                        <p className="text-gray-600 mb-2">
                          <strong>Address:</strong> {dealer.address}, {dealer.city}, {dealer.state}
                        </p>
                        {(() => {
                          const numbers = parseDealerPhones(dealer.phone)
                          if (!numbers.length) return null
                          return (
                            <p className="text-gray-600 mb-2 space-y-1">
                              <strong>Phone:</strong>{' '}
                              {numbers.map((phone, idx) => (
                                <span key={idx} className="inline-flex items-center mr-2">
                                  <a
                                    href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                                    className="text-primary-600 hover:underline"
                                  >
                                    {phone}
                                  </a>
                                  {idx < numbers.length - 1 ? ',' : ''}
                                </span>
                              ))}
                            </p>
                          )
                        })()}
                        <p className="text-gray-600 mb-2">
                          <strong>Email:</strong>{' '}
                          <a
                            href={`mailto:${dealer.email}`}
                            className="text-primary-600 hover:underline"
                          >
                            {dealer.email}
                          </a>
                        </p>
                        {(() => {
                          const { location, website } = parseDealerMeta(dealer.description)
                          const { embedHtml, text } = extractLocationInfo(location)

                          return (
                            <>
                              {website && (
                                <p className="text-gray-600 mb-2">
                                  <strong>Website:</strong>{' '}
                                  <a
                                    href={website}
                                    target="_blank"
                                    rel="noopener"
                                    className="text-primary-600 hover:underline"
                                  >
                                    {website}
                                  </a>
                                </p>
                              )}
                              {embedHtml ? (
                                <div
                                  className="mt-4 overflow-hidden rounded-lg border border-gray-200"
                                  dangerouslySetInnerHTML={{ __html: embedHtml }}
                                />
                              ) : text ? (
                                <p className="text-gray-600 mt-2">{text}</p>
                              ) : null}
                            </>
                          )
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
            })}
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

