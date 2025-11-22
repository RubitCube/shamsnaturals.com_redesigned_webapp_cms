import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { blogsAPI } from '../services/api'
import SEOHead from '../components/SEOHead'

const BlogDetailPage = () => {
  const { slug } = useParams()
  const [blog, setBlog] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await blogsAPI.getBySlug(slug!)
        setBlog(response.data)
      } catch (error) {
        console.error('Error fetching blog:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchBlog()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Blog post not found.</p>
      </div>
    )
  }

  const imageUrl = blog.featured_image
    ? (blog.featured_image.startsWith('http')
        ? blog.featured_image
        : `http://localhost:8000/storage/${blog.featured_image}`)
    : null

  // Generate structured data for blog article
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt || blog.description || '',
    image: imageUrl ? [imageUrl] : [],
    datePublished: blog.published_at || blog.created_at,
    dateModified: blog.updated_at || blog.published_at || blog.created_at,
    author: {
      '@type': 'Organization',
      name: 'Shams Naturals'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Shams Naturals',
      logo: {
        '@type': 'ImageObject',
        url: `${import.meta.env.VITE_SITE_URL || 'https://shamsnaturals.com'}/assets/company_logo_image/shamsnaturals-logo.png`
      }
    }
  }

  return (
    <>
      <SEOHead
        title={blog.seo?.meta_title || blog.title}
        description={blog.seo?.meta_description || blog.excerpt || blog.description || `Read ${blog.title} on Shams Naturals blog`}
        keywords={blog.seo?.meta_keywords || `${blog.title}, eco-friendly, sustainable, blog`}
        ogImage={blog.seo?.og_image || imageUrl || undefined}
        ogType="article"
        structuredData={articleStructuredData}
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={blog.title}
          className="w-full h-96 object-cover rounded-lg mb-8"
          loading="lazy"
          decoding="async"
        />
      )}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
      {blog.published_at && (
        <p className="text-gray-600 mb-8">
          Published on {new Date(blog.published_at).toLocaleDateString()}
        </p>
      )}
      {blog.excerpt && (
        <p className="text-xl text-gray-700 mb-8 italic">{blog.excerpt}</p>
      )}
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </article>
    </>
  )
}

export default BlogDetailPage

