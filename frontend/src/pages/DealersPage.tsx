import { useEffect, useState, useRef, useMemo } from 'react'
import { dealersAPI, bannersAPI } from '../services/api'
import BannerCarousel from '../components/BannerCarousel'
import L from 'leaflet'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'
import butterflyMarker from '../assets/map marker image/buterrfly_map_marker.png'

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
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const highlightRef = useRef<L.Circle[]>([])
  const lastDealerCountRef = useRef<number>(0)

  useEffect(() => {
    // Configure brand logo marker icon for all dealers using provided PNG asset
    const BrandLogoIcon = L.icon({
      iconUrl: butterflyMarker,
      iconRetinaUrl: butterflyMarker,
      iconSize: [46, 46],
      iconAnchor: [23, 40],
      popupAnchor: [0, -38],
      className: 'dealer-brand-marker',
    })

    L.Marker.prototype.options.icon = BrandLogoIcon
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

  // Show all dealers without filtering
  const filteredDealers = useMemo(() => dealers, [dealers])

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
            <div style="background: #dcecd5; padding: 12px 16px; border-radius: 8px 8px 0 0; color: #0f3b1e;">
              <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0; line-height: 1.3;">${dealer.company_name}</h3>
              <p style="font-size: 12px; opacity: 0.9; margin: 0; color: #1f5b30;">${dealer.contact_person || 'N/A'}</p>
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
            Find our authorized dealers worldwide. Click on map markers to view complete dealer details and contact information.
          </p>
        </div>

      {/* Full Width Map */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-[700px] rounded-lg border border-gray-300 shadow-lg relative z-0" 
          style={{ position: 'relative' }}
        />
      </div>
      </div>
    </div>
  )
}

export default DealersPage

