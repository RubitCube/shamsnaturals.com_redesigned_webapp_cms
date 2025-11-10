import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Banner {
  id: number
  title?: string
  description?: string
  image_path: string
  link?: string
}

interface BannerCarouselProps {
  banners: Banner[]
}

const BannerCarousel = ({ banners }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length])

  if (!banners || banners.length === 0) return null

  const currentBanner = banners[currentIndex]
  const imageUrl = currentBanner.image_path.startsWith('http')
    ? currentBanner.image_path
    : `http://localhost:8000/storage/${currentBanner.image_path}`

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      {banners.map((banner, index) => {
        const bannerImageUrl = banner.image_path.startsWith('http')
          ? banner.image_path
          : `http://localhost:8000/storage/${banner.image_path}`
        
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {banner.link ? (
              <Link to={banner.link}>
                <img
                  src={bannerImageUrl}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <img
                src={bannerImageUrl}
                alt={banner.title || 'Banner'}
                className="w-full h-full object-cover"
              />
            )}
            {(banner.title || banner.description) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <div className="text-center text-white px-4">
                  {banner.title && (
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">
                      {banner.title}
                    </h2>
                  )}
                  {banner.description && (
                    <p className="text-xl md:text-2xl">{banner.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Navigation Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BannerCarousel

