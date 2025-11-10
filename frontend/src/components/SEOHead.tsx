import { useEffect } from 'react'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
}

const SEOHead = ({ title, description, keywords, ogImage }: SEOHeadProps) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Shams Naturals`
    }

    // Update meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    if (description) {
      updateMetaTag('description', description)
      updateMetaTag('og:description', description, 'property')
    }

    if (keywords) {
      updateMetaTag('keywords', keywords)
    }

    if (ogImage) {
      updateMetaTag('og:image', ogImage, 'property')
    }

    if (title) {
      updateMetaTag('og:title', title, 'property')
    }
  }, [title, description, keywords, ogImage])

  return null
}

export default SEOHead

