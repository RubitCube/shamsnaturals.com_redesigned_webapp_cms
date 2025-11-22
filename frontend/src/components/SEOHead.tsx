import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product' | 'event'
  canonicalUrl?: string
  structuredData?: object
  noindex?: boolean
  nofollow?: boolean
}

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogType = 'website',
  canonicalUrl,
  structuredData,
  noindex = false,
  nofollow = false
}: SEOHeadProps) => {
  const location = useLocation()
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://shamsnaturals.com'
  const currentUrl = canonicalUrl || `${baseUrl}${location.pathname}`

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | Shams Naturals`
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Helper function to update or create link tags
    const updateLinkTag = (rel: string, href: string, attributes?: Record<string, string>) => {
      let element = document.querySelector(`link[rel="${rel}"]`)
      if (!element) {
        element = document.createElement('link')
        element.setAttribute('rel', rel)
        document.head.appendChild(element)
      }
      element.setAttribute('href', href)
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value)
        })
      }
    }

    // Basic Meta Tags
    if (description) {
      updateMetaTag('description', description)
    }

    if (keywords) {
      updateMetaTag('keywords', keywords)
    }

    // Robots meta tag
    const robotsContent = [
      noindex ? 'noindex' : 'index',
      nofollow ? 'nofollow' : 'follow'
    ].join(', ')
    updateMetaTag('robots', robotsContent)

    // Open Graph Tags
    if (title) {
      updateMetaTag('og:title', title, 'property')
    }
    if (description) {
      updateMetaTag('og:description', description, 'property')
    }
    if (ogImage) {
      const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`
      updateMetaTag('og:image', fullOgImage, 'property')
      updateMetaTag('og:image:secure_url', fullOgImage, 'property')
      updateMetaTag('og:image:type', 'image/jpeg', 'property')
    }
    updateMetaTag('og:type', ogType, 'property')
    updateMetaTag('og:url', currentUrl, 'property')
    updateMetaTag('og:site_name', 'Shams Naturals', 'property')
    updateMetaTag('og:locale', 'en_US', 'property')

    // Twitter Card Tags
    if (title) {
      updateMetaTag('twitter:card', 'summary_large_image')
      updateMetaTag('twitter:title', title)
    }
    if (description) {
      updateMetaTag('twitter:description', description)
    }
    if (ogImage) {
      const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`
      updateMetaTag('twitter:image', fullOgImage)
    }
    updateMetaTag('twitter:site', '@shamsnaturals')

    // Canonical URL
    updateLinkTag('canonical', currentUrl)

    // Structured Data (JSON-LD)
    if (structuredData) {
      // Remove existing structured data script
      const existingScript = document.querySelector('script[type="application/ld+json"]')
      if (existingScript) {
        existingScript.remove()
      }

      // Add new structured data
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(structuredData)
      script.id = 'structured-data'
      document.head.appendChild(script)
    }

    // Cleanup function
    return () => {
      // Don't remove meta tags on cleanup as they should persist
      // Only remove structured data if component unmounts
      const script = document.querySelector('script#structured-data')
      if (script) {
        script.remove()
      }
    }
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, structuredData, noindex, nofollow, currentUrl, baseUrl, location.pathname])

  return null
}

export default SEOHead

