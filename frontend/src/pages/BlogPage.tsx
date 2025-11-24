import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { blogsAPI } from "../services/api";
import SEOHead from "../components/SEOHead";

const BlogPage = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await blogsAPI.getAll();
        setBlogs(response.data.data || response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Generate structured data for Blog listing page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog - Shams Naturals",
    description:
      "Read the latest articles about eco-friendly bags, sustainable products, and environmental consciousness from Shams Naturals.",
    url: "https://shamsnaturals.com/blog",
    blogPost: blogs.slice(0, 10).map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.excerpt || blog.description,
      url: `https://shamsnaturals.com/blog/${blog.slug}`,
      datePublished: blog.published_at,
      image: blog.featured_image
        ? blog.featured_image.startsWith("http")
          ? blog.featured_image
          : `https://shamsnaturals.com/storage/${blog.featured_image}`
        : undefined,
    })),
  };

  return (
    <>
      <SEOHead
        title="Blog - Eco-Friendly Bags & Sustainability Articles | Shams Naturals"
        description="Read the latest articles about eco-friendly bags, sustainable products, and environmental consciousness from Shams Naturals."
        keywords="eco-friendly blog, sustainable products blog, eco bags articles, environmental blog, green products blog, sustainability articles"
        ogType="website"
        canonicalUrl="/blog"
        structuredData={structuredData}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-3 gap-8">
            {blogs.map((blog) => {
              const imageUrl = blog.featured_image
                ? blog.featured_image.startsWith("http")
                  ? blog.featured_image
                  : `http://localhost:8000/storage/${blog.featured_image}`
                : "/placeholder-blog.jpg";

              return (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.slug}`}
                  className="card hover:shadow-xl transition-shadow duration-200"
                >
                  {blog.featured_image && (
                    <img
                      src={imageUrl}
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
                    {blog.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}
                    {blog.published_at && (
                      <p className="text-sm text-gray-500">
                        {new Date(blog.published_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts available.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogPage;
