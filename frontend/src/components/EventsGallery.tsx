import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Event {
  id: number;
  title: string;
  description?: string;
  featured_image?: string;
  event_date?: string;
  location?: string;
  slug: string;
}

interface EventsGalleryProps {
  events: Event[];
  autoSlideInterval?: number; // in milliseconds
}

const EventsGallery = ({
  events,
  autoSlideInterval = 5000,
}: EventsGalleryProps) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Build BASE URL from env
  const BASE_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");

  useEffect(() => {
    if (events.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [events.length, autoSlideInterval, isPaused]);

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("events.title")}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Previous Button */}
          {events.length > 1 && (
            <button
              onClick={() =>
                setCurrentIndex(
                  (prev) => (prev - 1 + events.length) % events.length
                )
              }
              className="flex-shrink-0 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200 cursor-pointer z-20"
              aria-label="Previous event"
              type="button"
            >
              <svg
                className="w-6 h-6 text-gray-800"
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

          <div
            className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Events Gallery */}
            <div className="relative h-96 md:h-[500px]">
              {events.map((event, index) => {
                const eventImageUrl = event.featured_image
                  ? event.featured_image.startsWith("http")
                    ? event.featured_image
                    : //: `http://localhost:8000/storage/${event.featured_image}`
                      `${BASE_URL}/storage/${event.featured_image}`
                  : null;

                return (
                  <div
                    key={event.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentIndex
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0"
                    }`}
                  >
                    {eventImageUrl ? (
                      <img
                        src={eventImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-3xl font-bold mb-2">
                            {event.title}
                          </h3>
                          {event.location && (
                            <p className="text-xl">{event.location}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Overlay with event info */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                      <div className="w-full p-6 md:p-8 text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-lg mb-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 mb-4 text-sm">
                          {event.event_date && (
                            <span className="flex items-center">
                              📅{" "}
                              {new Date(event.event_date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  // Backend automatically sends dates in UAE timezone with timezone info
                                }
                              )}
                              <span className="mx-2">•</span>
                              🕐{" "}
                              {new Date(event.event_date).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                  // Backend automatically sends dates in UAE timezone with timezone info
                                }
                              )}
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
                          className="inline-block btn-primary px-6 py-3"
                        >
                          {t("events.readMore")}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
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
                        ? "bg-white w-8"
                        : "bg-white bg-opacity-50 hover:bg-opacity-75"
                    }`}
                    aria-label={`Go to event ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Explore All Link */}
            <div className="absolute top-4 right-4 z-20">
              <Link
                to="/events"
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-primary-600 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                {t("events.exploreAll")}
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

          {/* Next Button */}
          {events.length > 1 && (
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % events.length)
              }
              className="flex-shrink-0 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200 cursor-pointer z-20"
              aria-label="Next event"
              type="button"
            >
              <svg
                className="w-6 h-6 text-gray-800"
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
      </div>
    </section>
  );
};

export default EventsGallery;
