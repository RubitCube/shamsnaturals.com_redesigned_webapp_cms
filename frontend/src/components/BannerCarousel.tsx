import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Banner {
  id: number;
  title?: string;
  description?: string;
  image_path: string;
  link?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
}

const BannerCarousel = ({ banners }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Parse text into lines (split by newline, |, or use title/description)
  const parseBannerText = (banner: Banner) => {
    // First, try splitting by newline
    if (banner.title && banner.title.includes('\n')) {
      const lines = banner.title.split('\n').filter(p => p.trim());
      if (lines.length >= 4) return lines.slice(0, 4);
      if (lines.length > 0) {
        // Pad to 4 lines if needed
        while (lines.length < 4) lines.push('');
        return lines;
      }
    }
    
    // Try splitting by pipe separator
    if (banner.title && banner.title.includes('|')) {
      const lines = banner.title.split('|').map(p => p.trim()).filter(p => p);
      if (lines.length >= 4) return lines.slice(0, 4);
      if (lines.length > 0) {
        // Pad to 4 lines if needed
        while (lines.length < 4) lines.push('');
        return lines;
      }
    }
    
    // If both title and description exist, use them
    if (banner.title && banner.description) {
      const titleWords = banner.title.split(/\s+/);
      const descWords = banner.description.split(/\s+/);
      
      // Split title into 2 lines (prefer splitting at natural breaks)
      let line1 = '', line2 = '';
      if (titleWords.length <= 2) {
        line1 = titleWords[0] || '';
        line2 = titleWords[1] || '';
      } else {
        const mid = Math.ceil(titleWords.length / 2);
        line1 = titleWords.slice(0, mid).join(' ');
        line2 = titleWords.slice(mid).join(' ');
      }
      
      // Split description into 2 lines
      let line3 = '', line4 = '';
      if (descWords.length <= 2) {
        line3 = descWords[0] || '';
        line4 = descWords[1] || '';
      } else {
        const mid = Math.ceil(descWords.length / 2);
        line3 = descWords.slice(0, mid).join(' ');
        line4 = descWords.slice(mid).join(' ');
      }
      
      return [line1, line2, line3, line4];
    }
    
    // If only title exists, try to split intelligently
    if (banner.title) {
      const words = banner.title.split(/\s+/);
      if (words.length <= 4) {
        // Pad to 4 lines
        const result = [...words];
        while (result.length < 4) result.push('');
        return result;
      } else {
        // Split into 4 roughly equal parts
        const chunkSize = Math.ceil(words.length / 4);
        return [
          words.slice(0, chunkSize).join(' '),
          words.slice(chunkSize, chunkSize * 2).join(' '),
          words.slice(chunkSize * 2, chunkSize * 3).join(' '),
          words.slice(chunkSize * 3).join(' ')
        ];
      }
    }
    
    // If only description exists, use it
    if (banner.description) {
      const words = banner.description.split(/\s+/);
      if (words.length <= 4) {
        const result = [...words];
        while (result.length < 4) result.push('');
        return result;
      } else {
        const chunkSize = Math.ceil(words.length / 4);
        return [
          words.slice(0, chunkSize).join(' '),
          words.slice(chunkSize, chunkSize * 2).join(' '),
          words.slice(chunkSize * 2, chunkSize * 3).join(' '),
          words.slice(chunkSize * 3).join(' ')
        ];
      }
    }
    
    return [];
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl h-[240px] sm:h-[320px] md:h-[400px] lg:h-[520px] max-w-full">
      {banners.map((banner, index) => {
        const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
        const bannerImageUrl = banner.image_path.startsWith("http")
          ? banner.image_path
          : `${apiUrl}/storage/${banner.image_path.replace(/^storage\//, '')}`;
        
        const isActive = index === currentIndex;
        const textLines = parseBannerText(banner);
        const hasText = textLines.length > 0 && textLines.some(line => line.trim().length > 0);

        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {banner.link ? (
              <Link to={banner.link} className="block w-full h-full">
                <img
                  src={bannerImageUrl}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover animated"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, 1200px"
                />
              </Link>
            ) : (
              <img
                src={bannerImageUrl}
                alt={banner.title || "Banner"}
                className="w-full h-full object-cover animated"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                sizes="(max-width: 640px) 100vw, 1200px"
              />
            )}
            
            {/* Animated Text Overlay */}
            {isActive && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Determine which carousel class set to use based on index */}
                {/* Index 0: carousel4 (Perfect Natural Bag Solution) */}
                {index === 0 && hasText && (
                  <>
                    {textLines[0] && textLines[0].trim() && (
                      <div className="carousel4head fadeInLeft animated" style={{ animationDelay: '0.1s' }}>
                        <h1>{textLines[0]}</h1>
                      </div>
                    )}
                    {textLines[1] && textLines[1].trim() && (
                      <div className="carousel4subhead01 fadeInLeft animated" style={{ animationDelay: '0.1s' }}>
                        <h1>{textLines[1]}</h1>
                      </div>
                    )}
                    {textLines[2] && textLines[2].trim() && (
                      <div className="carousel4subhead fadeInLeft animated" style={{ animationDelay: '0.5s' }}>
                        <h1>{textLines[2]}</h1>
                      </div>
                    )}
                    {textLines[3] && textLines[3].trim() && (
                      <div className="carousel4subhead02 fadeInLeft animated" style={{ animationDelay: '0.5s' }}>
                        <h1>{textLines[3]}</h1>
                      </div>
                    )}
                  </>
                )}
                {/* Index 1: carousel3 (Perfect Natural Bag Solution - variant) */}
                {index === 1 && hasText && (
                  <>
                    {textLines[0] && textLines[0].trim() && (
                      <div className="carousel3head fadeInLeft animated" style={{ animationDelay: '0.1s' }}>
                        <h1>{textLines[0]}</h1>
                      </div>
                    )}
                    {textLines[1] && textLines[1].trim() && (
                      <div className="carousel3subhead01 fadeInLeft animated" style={{ animationDelay: '0.1s' }}>
                        <h1>{textLines[1]}</h1>
                      </div>
                    )}
                    {textLines[2] && textLines[2].trim() && (
                      <div className="carousel3subhead fadeInLeft animated" style={{ animationDelay: '0.5s' }}>
                        <h1>{textLines[2]}</h1>
                      </div>
                    )}
                    {textLines[3] && textLines[3].trim() && (
                      <div className="carousel3subhead02 fadeInLeft animated" style={{ animationDelay: '0.5s' }}>
                        <h1>{textLines[3]}</h1>
                      </div>
                    )}
                  </>
                )}
                {/* Index 2: carousel (Perfect Natural Bag Solution - variant) */}
                {index === 2 && hasText && (
                  <>
                    {textLines[0] && textLines[0].trim() && (
                      <div className="carouselhead fadeInLeft animated" style={{ animationDelay: '0.1s' }}>
                        <h1>{textLines[0]}</h1>
                      </div>
                    )}
                    {textLines[1] && textLines[1].trim() && (
                      <div className="carouselsubhead01 fadeInLeft animated" style={{ animationDelay: '0.1s' }}>
                        <h1>{textLines[1]}</h1>
                      </div>
                    )}
                    {textLines[2] && textLines[2].trim() && (
                      <div className="carouselsubhead fadeInLeft animated" style={{ animationDelay: '0.5s' }}>
                        <h1>{textLines[2]}</h1>
                      </div>
                    )}
                    {textLines[3] && textLines[3].trim() && (
                      <div className="carouselsubhead02 fadeInLeft animated" style={{ animationDelay: '0.5s' }}>
                        <h1>{textLines[3]}</h1>
                      </div>
                    )}
                  </>
                )}
                {/* Index 3+: carousel2 (Global Recognition) */}
                {index >= 3 && hasText && (
                  <>
                    {textLines[0] && textLines[0].trim() && (
                      <div className="carousel2head fadeInLeft animated" style={{ animationDelay: '0.1s' }}>
                        <h1>{textLines[0]}</h1>
                      </div>
                    )}
                    {textLines[1] && textLines[1].trim() && (
                      <div className="carousel2subhead01 fadeInLeft animated" style={{ animationDelay: '0.1s' }}>
                        <h1>{textLines[1]}</h1>
                      </div>
                    )}
                    {textLines[2] && textLines[2].trim() && (
                      <div className="carousel2subhead fadeInLeft animated" style={{ animationDelay: '0.5s' }}>
                        <h1>{textLines[2]}</h1>
                      </div>
                    )}
                    {textLines[3] && textLines[3].trim() && (
                      <div className="carousel2subhead02 fadeInLeft animated" style={{ animationDelay: '0.5s' }}>
                        <h1>{textLines[3]}</h1>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Navigation Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 1000);
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
