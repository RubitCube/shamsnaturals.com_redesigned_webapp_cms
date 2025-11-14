import { useEffect, useState, useRef, useMemo } from 'react'
import { dealersAPI, bannersAPI } from '../services/api'
import BannerCarousel from '../components/BannerCarousel'
import L from 'leaflet'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'

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
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedDealer, setExpandedDealer] = useState<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const highlightRef = useRef<L.Circle[]>([])
  const lastDealerCountRef = useRef<number>(0)

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
        
        const newDealers = dealersResponse.data
        
        // Check if new dealer was added
        if (lastDealerCountRef.current > 0 && newDealers.length > lastDealerCountRef.current) {
          // Find the newest dealer (last one in the list with coordinates)
          const newestDealer = newDealers
            .filter(d => d.latitude && d.longitude)
            .sort((a, b) => b.id - a.id)[0]
          
          if (newestDealer && mapInstanceRef.current) {
            const lat = typeof newestDealer.latitude === 'string' 
              ? parseFloat(newestDealer.latitude) 
              : newestDealer.latitude
            const lng = typeof newestDealer.longitude === 'string' 
              ? parseFloat(newestDealer.longitude) 
              : newestDealer.longitude
            
            if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
              // Automatically fly to the new dealer location
              setTimeout(() => {
                mapInstanceRef.current?.flyTo([lat, lng], 12, {
                  animate: true,
                  duration: 2,
                })
                
                // Open the popup for the new dealer after animation
                setTimeout(() => {
                  const marker = markersRef.current.find((m) => {
                    const markerPos = m.getLatLng()
                    return Math.abs(markerPos.lat - lat) < 0.001 && Math.abs(markerPos.lng - lng) < 0.001
                  })
                  
                  if (marker) {
                    marker.openPopup()
                  }
                }, 2000)
              }, 500)
              
              setSelectedCountry(newestDealer.country)
              setExpandedDealer(newestDealer.id)
            }
          }
        }
        
        lastDealerCountRef.current = newDealers.length
        setDealers(newDealers)
        setBanners(bannersResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Poll for new dealers every 10 seconds
    const interval = setInterval(fetchData, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const countries = useMemo(
    () => Array.from(new Set(dealers.map((d) => d.country))).sort(),
    [dealers]
  )

  const filteredDealers = useMemo(() => {
    let filtered = dealers

    // Filter by country
    if (selectedCountry) {
      filtered = filtered.filter((d) => d.country === selectedCountry)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((dealer) => {
        return (
          dealer.company_name.toLowerCase().includes(query) ||
          dealer.contact_person.toLowerCase().includes(query) ||
          dealer.city.toLowerCase().includes(query) ||
          dealer.state.toLowerCase().includes(query) ||
          dealer.country.toLowerCase().includes(query) ||
          dealer.address.toLowerCase().includes(query) ||
          dealer.email.toLowerCase().includes(query)
        )
      })
    }

    return filtered
  }, [dealers, selectedCountry, searchQuery])

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

      // Add FREE location search control (powered by OpenStreetMap)
      const provider = new OpenStreetMapProvider()
      const searchControl = new (GeoSearchControl as any)({
        provider,
        style: 'bar',
        showMarker: true,
        showPopup: false,
        marker: {
          icon: new L.Icon.Default(),
          draggable: false,
        },
        popupFormat: ({ query, result }: any) => result.label,
        maxMarkers: 1,
        retainZoomLevel: false,
        animateZoom: true,
        autoClose: true,
        searchLabel: 'Search for any location on map...',
        keepResult: true,
      })

      mapInstanceRef.current.addControl(searchControl)
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
        const { embedHtml } = extractLocationInfo(location)
        const phoneNumbers = parseDealerPhones(dealer.phone)

        const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current!)
        
        // Create compact dealer card popup with embedded map
        const popupHtml = `
          <div class="dealer-card-popup" style="width: 320px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 12px 16px; border-radius: 8px 8px 0 0; color: white;">
              <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0; line-height: 1.3;">${dealer.company_name}</h3>
              <p style="font-size: 12px; opacity: 0.95; margin: 0;">${dealer.contact_person || 'N/A'}</p>
            </div>
            
            <div style="padding: 12px 16px; background: white; max-height: 400px; overflow-y: auto;">
              <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
                <p style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 4px 0;">Address</p>
                <p style="font-size: 12px; color: #374151; line-height: 1.5; margin: 0;">
                  ${dealer.address}${dealer.city ? `, ${dealer.city}` : ''}<br/>
                  ${dealer.state}, ${dealer.country}
                </p>
              </div>
              
              ${phoneNumbers.length ? `
                <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
                  <p style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 6px 0;">Phone</p>
                  ${phoneNumbers.slice(0, 2).map((phone) => `
                    <a href="tel:${phone.replace(/[^0-9+]/g, '')}" 
                       style="display: block; font-size: 12px; color: #16a34a; text-decoration: none; margin-bottom: 3px; font-weight: 500;"
                       onmouseover="this.style.textDecoration='underline'" 
                       onmouseout="this.style.textDecoration='none'">
                      📞 ${phone}
                    </a>
                  `).join('')}
                  ${phoneNumbers.length > 2 ? `<p style="font-size: 11px; color: #6b7280; margin: 4px 0 0 0;">+${phoneNumbers.length - 2} more</p>` : ''}
                </div>
              ` : ''}
              
              ${dealer.email ? `
                <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
                  <p style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 6px 0;">Email</p>
                  <a href="mailto:${dealer.email}" 
                     style="font-size: 12px; color: #16a34a; text-decoration: none; font-weight: 500; word-break: break-all;"
                     onmouseover="this.style.textDecoration='underline'" 
                     onmouseout="this.style.textDecoration='none'">
                    ✉️ ${dealer.email}
                  </a>
                </div>
              ` : ''}
              
              ${website ? `
                <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
                  <p style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 6px 0;">Website</p>
                  <a href="${website}" target="_blank" rel="noopener noreferrer" 
                     style="font-size: 12px; color: #16a34a; text-decoration: none; font-weight: 500; word-break: break-all;"
                     onmouseover="this.style.textDecoration='underline'" 
                     onmouseout="this.style.textDecoration='none'">
                    🌐 ${website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              ` : ''}
              
              ${embedHtml ? `
                <div>
                  <p style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 8px 0;">📍 Location Map</p>
                  <div style="border-radius: 6px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                    ${embedHtml.replace('height="220"', 'height="160"').replace('height="450"', 'height="160"').replace('width="600"', 'width="100%"').replace('width="100%"', 'width="100%"')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `
        
        marker.bindPopup(popupHtml, { 
          className: 'dealer-card-popup-container',
          maxWidth: 340,
          minWidth: 320,
          maxHeight: 500,
          closeButton: true,
          autoPan: true,
          autoPanPadding: [80, 80],
          keepInView: true
        })

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
          // Fly to marker location with smooth animation
          mapInstanceRef.current?.flyTo([lat, lng], 10, {
            animate: true,
            duration: 1.5,
          })
          
          // Update UI state
          setSelectedCountry(dealer.country)
          setExpandedDealer(dealer.id)
          
          // Scroll to dealer card in sidebar
          setTimeout(() => {
            const cardElement = document.getElementById(`dealer-card-${dealer.id}`)
            if (cardElement) {
              cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 500)
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Dealer Network</h1>
          <p className="text-gray-600">
            Find our authorized dealers worldwide. Click on dealer names or map markers to view location details.
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dealers List */}
        <div>
          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Dealers
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by company, location, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

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

          {/* Results count */}
          {(searchQuery || selectedCountry) && (
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredDealers.length} of {dealers.length} dealer{filteredDealers.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* No Results Message */}
          {filteredDealers.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No dealers found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : selectedCountry
                  ? `No dealers found in ${selectedCountry}.`
                  : 'No dealers available at this time.'}
              </p>
              {(searchQuery || selectedCountry) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCountry(null)
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Dealers Accordion */}
          {filteredDealers.length > 0 && (
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
                      {countryDealers.map((dealer) => {
                        const hasCoordinates = dealer.latitude && dealer.longitude
                        
                        return (
                        <div
                          key={dealer.id}
                          id={`dealer-card-${dealer.id}`}
                          className={`border-t pt-4 ${
                            expandedDealer === dealer.id
                              ? 'bg-green-50 border-green-200 rounded-lg px-4 py-3 mt-2'
                              : ''
                          }`}
                        >
                        <div className="flex items-start justify-between gap-4">
                          <h3 
                            className={`font-semibold text-lg mb-2 ${
                              hasCoordinates 
                                ? 'text-primary-600 hover:text-primary-700 cursor-pointer hover:underline' 
                                : 'text-gray-900'
                            }`}
                            onClick={() => {
                              if (hasCoordinates) {
                                const lat = typeof dealer.latitude === 'string' 
                                  ? parseFloat(dealer.latitude) 
                                  : dealer.latitude!
                                const lng = typeof dealer.longitude === 'string' 
                                  ? parseFloat(dealer.longitude) 
                                  : dealer.longitude!
                                
                                if (mapInstanceRef.current && !isNaN(lat) && !isNaN(lng)) {
                                  // Fly to location with smooth animation
                                  mapInstanceRef.current.flyTo([lat, lng], 12, {
                                    animate: true,
                                    duration: 1.5,
                                  })
                                  
                                  // Find and open the marker popup
                                  setTimeout(() => {
                                    const marker = markersRef.current.find((m) => {
                                      const markerPos = m.getLatLng()
                                      return Math.abs(markerPos.lat - lat) < 0.001 && Math.abs(markerPos.lng - lng) < 0.001
                                    })
                                    
                                    if (marker) {
                                      marker.openPopup()
                                    }
                                  }, 1000)
                                  
                                  setExpandedDealer(dealer.id)
                                }
                              }
                            }}
                          >
                            {dealer.company_name}
                            {hasCoordinates && (
                              <span className="ml-2 text-xs text-gray-500 font-normal">📍 View on map</span>
                            )}
                          </h3>
                        </div>
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
                      )
                    })}
                  </div>
                )}
              </div>
            )
            })}
          </div>
          )}
        </div>

        {/* Google Map */}
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-[600px] rounded-lg border border-gray-300 shadow-md relative z-0" 
            style={{ position: 'relative' }}
          />
        </div>
      </div>
      </div>
    </div>
  )
}

export default DealersPage

