import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Event {
  id: number
  title: string
  description?: string
  featured_image?: string
  event_date?: string
  location?: string
  slug: string
}

interface EventsGalleryProps {
  events: Event[]
  autoSlideInterval?: number // in milliseconds
}

const EventsGallery = ({ events, autoSlideInterval = 5000 }: EventsGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (events.length === 0 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [events.length, autoSlideInterval, isPaused])

  if (!events || events.length === 0) {
    return null
  }

  const currentEvent = events[currentIndex]
  const imageUrl = currentEvent.featured_image
    ? currentEvent.featured_image.startsWith('http')
      ? currentEvent.featured_image
      : `http://localhost:8000/storage/${currentEvent.featured_image}`
    : null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Events</h2>
        </div>

        <div
          className="relative bg-gray-100 rounded-lg overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Events Gallery */}
          <div className="relative h-96 md:h-[500px]">
            {events.map((event, index) => {
              const eventImageUrl = event.featured_image
                ? event.featured_image.startsWith('http')
                  ? event.featured_image
                  : `http://localhost:8000/storage/${event.featured_image}`
                : null

              return (
                <div
                  key={event.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  {eventImageUrl ? (
                    <img
                      src={eventImageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-3xl font-bold mb-2">{event.title}</h3>
                        {event.location && (
                          <p className="text-xl">{event.location}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay with event info */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                    <div className="w-full p-6 md:p-8 text-white">
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h3>
                      {event.description && (
                        <p className="text-lg mb-2 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mb-4 text-sm">
                        {event.event_date && (
                          <span className="flex items-center">
                            📅 {new Date(event.event_date).toLocaleDateString()}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center">
                            📍 {event.location}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/events/${event.slug}`}
                        className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation Dots */}
          {events.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white w-8'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                  aria-label={`Go to event ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Navigation Arrows */}
          {events.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev - 1 + events.length) % events.length)
                }
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full transition-all"
                aria-label="Previous event"
              >
                <svg
                  className="w-6 h-6"
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
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % events.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full transition-all"
                aria-label="Next event"
              >
                <svg
                  className="w-6 h-6"
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
            </>
          )}

          {/* Explore All Link */}
          <div className="absolute top-4 right-4 z-20">
            <Link
              to="/events"
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-primary-600 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              Explore All
              <svg
                className="w-5 h-5"
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
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EventsGallery

