import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  flagImage: string; // Country code for flag image
  country: string;
}

const languages: Language[] = [
  { code: 'en-US', name: 'English', flagImage: 'us', country: 'USA' },
  { code: 'en-GB', name: 'English', flagImage: 'gb', country: 'UK' },
  { code: 'it', name: 'Italiano', flagImage: 'it', country: 'Italy' },
  { code: 'ar', name: 'العربية', flagImage: 'ae', country: 'UAE' },
  { code: 'hi', name: 'हिन्दी', flagImage: 'in', country: 'India' },
];

// Helper function to get flag image URL
const getFlagImageUrl = (countryCode: string) => {
  return `https://flagcdn.com/w40/${countryCode}.png`;
};

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center space-x-2 px-3 py-2 text-gray-700 hover:text-[#4a7c28] transition-colors rounded-md hover:bg-gray-50"
        aria-label={`Select Language - ${currentLanguage.country}`}
        type="button"
      >
        <img
          src={getFlagImageUrl(currentLanguage.flagImage)}
          alt={currentLanguage.country}
          className="w-6 h-4 object-cover rounded-sm border border-gray-200 shadow-sm"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            // Fallback to a placeholder if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 transition-colors ${
                  i18n.language === language.code ? 'bg-[#f0f6ec] text-[#4a7c28] font-semibold' : 'text-gray-700'
                }`}
                type="button"
              >
                <img
                  src={getFlagImageUrl(language.flagImage)}
                  alt={language.country}
                  className="w-8 h-6 object-cover rounded-sm border border-gray-200 shadow-sm flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{language.name}</span>
                  <span className="text-xs text-gray-500 truncate">{language.country}</span>
                </div>
                {i18n.language === language.code && (
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-[#4a7c28]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

