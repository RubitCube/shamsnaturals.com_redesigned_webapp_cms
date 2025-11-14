import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsAPI } from '../services/api'

const EventsPage = () => {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsAPI.getAll()
        setEvents(response.data.data || response.data)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Events</h1>
        <p className="text-lg text-gray-600">
          Stay updated with our latest exhibitions and events
        </p>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const imageUrl = event.featured_image
              ? event.featured_image.startsWith('http')
                ? event.featured_image
                : `http://localhost:8000/storage/${event.featured_image}`
              : null

            return (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {imageUrl && (
                  <div className="h-64 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                  )}
                  <div className="flex flex-col gap-2 mb-4 text-sm text-gray-500">
                    {event.event_date && (
                      <div className="flex items-center">
                        <span className="mr-2">📅</span>
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        {event.location}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/events/${event.slug}`}
                    className="inline-block btn-primary px-6 py-2"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No events available at the moment.</p>
        </div>
      )}
    </div>
  )
}

export default EventsPage

