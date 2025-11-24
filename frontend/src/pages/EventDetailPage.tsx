import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { eventsAPI } from "../services/api";
import SEOHead from "../components/SEOHead";

const EventDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Build BASE URL from env
  const BASE_URL = import.meta.env.VITE_API_URL.replace('/api/v1', '')

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;

      try {
        const response = await eventsAPI.getBySlug(slug);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Event Not Found
        </h1>
        <Link to="/events" className="text-primary-600 hover:text-primary-700">
          {t("events.backToEvents")}
        </Link>
      </div>
    );
  }

  const imageUrl = event.featured_image
    ? event.featured_image.startsWith("http")
      ? event.featured_image
      : //: `http://localhost:8000/storage/${event.featured_image}`
        `${BASE_URL}/storage/${event.featured_image}`
    : null;

  // Generate structured data for event
  const eventStructuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || event.content || "",
    image: imageUrl ? [imageUrl] : [],
    startDate: event.event_date,
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
        }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: "Shams Naturals",
      url: "https://shamsnaturals.com",
    },
  };

  return (
    <>
      <SEOHead
        title={event.seo?.meta_title || event.title}
        description={
          event.seo?.meta_description ||
          event.description ||
          `Join us for ${event.title} - Shams Naturals event`
        }
        keywords={
          event.seo?.meta_keywords ||
          `${event.title}, event, eco-friendly, ${event.location || ""}`
        }
        ogImage={event.seo?.og_image || imageUrl || undefined}
        ogType="event"
        structuredData={eventStructuredData}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/events"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
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
          {t("events.backToEvents")}
        </Link>

        {imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img
              src={imageUrl}
              alt={event.title}
              className="w-full h-auto max-h-96 object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        <article>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
            {event.event_date && (
              <div className="flex items-center">
                <span className="mr-2">📅</span>
                <span>
                  {new Date(event.event_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    // Backend automatically sends dates in UAE timezone with timezone info
                  })}
                </span>
                <span className="mx-2">•</span>
                <span className="mr-2">🕐</span>
                <span>
                  {new Date(event.event_date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    // Backend automatically sends dates in UAE timezone with timezone info
                  })}
                </span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              {event.description}
            </p>
          )}

          {event.content && (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: event.content }}
            />
          )}
        </article>
      </div>
    </>
  );
};

export default EventDetailPage;
