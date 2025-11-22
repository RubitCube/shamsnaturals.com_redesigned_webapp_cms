import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import butterflyMarker from '../assets/map marker image/buterrfly_map_marker.png'

const BrandMarkerIcon = L.icon({
  iconUrl: butterflyMarker,
  iconRetinaUrl: butterflyMarker,
  iconSize: [46, 46],
  iconAnchor: [23, 40],
  popupAnchor: [0, -38],
  className: 'dealer-brand-marker',
})

L.Marker.prototype.options.icon = BrandMarkerIcon

const parsePhoneNumbers = (value?: string) => {
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

interface WorldMapProps {
  dealers?: Array<{
    id: number
    company_name: string
    latitude?: number | string
    longitude?: number | string
    country?: string
    state?: string
    phone?: string
  }>
}

const WorldMap = ({ dealers = [] }: WorldMapProps) => {
  const { t } = useTranslation()
  const mapRef = useRef<L.Map | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const initMap = () => {
      if (!mapRef.current) {
        // Initialize map with a more zoomed-in world view
        // Center at a point that shows most of the world well (slightly north to show more land)
        mapRef.current = L.map('world-map', {
          center: [25, 20], // Centered to show Europe, Africa, Middle East, and parts of Asia/Americas
          zoom: 3, // More zoomed in than before (was 2) to show more detail
          minZoom: 2,
          maxZoom: 10,
        })

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current)

        // Make map clickable to redirect to dealers page
        mapRef.current.on('click', () => {
          navigate('/dealers')
        })

        // Add cursor pointer style
        const mapContainer = document.getElementById('world-map')
        if (mapContainer) {
          mapContainer.style.cursor = 'pointer'
        }
      }

      // Clear existing markers before adding new ones
      if (mapRef.current) {
        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            mapRef.current!.removeLayer(layer)
          }
        })
      }

      // Add dealer markers if provided
      const validDealers: Array<{ lat: number; lng: number }> = []
      
      if (dealers.length > 0 && mapRef.current) {
        dealers.forEach((dealer) => {
          const lat = typeof dealer.latitude === 'string' ? parseFloat(dealer.latitude) : dealer.latitude
          const lng = typeof dealer.longitude === 'string' ? parseFloat(dealer.longitude) : dealer.longitude
          
          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            validDealers.push({ lat, lng })
            
            const marker = L.marker([lat, lng]).addTo(mapRef.current!)

            const phoneNumbers = parsePhoneNumbers(dealer.phone as any)
            const phoneHtml = phoneNumbers.length
              ? `<div class="text-xs text-gray-600"><strong>Phone:</strong> ${phoneNumbers
                  .map((phone) => `<span class="mr-1">${phone}</span>`)
                  .join(', ')}</div>`
              : ''

            marker.bindPopup(
              `<b>${dealer.company_name}</b><br/>${dealer.country || ''}${dealer.state ? ', ' + dealer.state : ''}${phoneHtml ? `<br/>${phoneHtml}` : ''}`
            )

            marker.on('click', () => {
              navigate('/dealers')
            })
          }
        })

        // If we have valid dealers, fit the map to show all of them with some padding
        // Otherwise, keep the default zoomed view
        if (validDealers.length > 0 && mapRef.current) {
          const bounds = L.latLngBounds(validDealers.map(d => [d.lat, d.lng]))
          // Fit bounds with padding, but ensure minimum zoom level
          mapRef.current.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 5, // Don't zoom in too much, keep a world view
          })
        }
      }
    }

    // Initialize map after a short delay to ensure DOM is ready
    const timer = setTimeout(initMap, 100)

    return () => {
      clearTimeout(timer)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [dealers, navigate])

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('dealers.worldMap')}</h2>
          <p className="text-lg text-gray-600">
            {t('dealers.clickToExplore')}
          </p>
        </div>
        <div
          id="world-map"
          className="w-full h-96 md:h-[500px] rounded-lg shadow-lg border-2 border-gray-200"
          style={{ zIndex: 1 }}
        />
      </div>
    </section>
  )
}

export default WorldMap

