import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { productsAPI } from "../services/api";
import SEOHead from "../components/SEOHead";
import { translateCategoryName } from "../utils/categoryTranslations";

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // BASE URL FIXED — CORRECT BACKEND ROOT
  const BASE_URL = import.meta.env.VITE_SITE_URL
    ? import.meta.env.VITE_SITE_URL + "/backend"
    : "http://localhost:8000/backend";

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setLoading(false);
        setError("Product slug is required");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await productsAPI.getBySlug(slug);
        setProduct(response.data);
        if (response.data.images && response.data.images.length > 0) {
          const primaryImage =
            response.data.images.find((img: any) => img.is_primary) ||
            response.data.images[0];
          // Use image_url if available (from backend), otherwise use image_path
          const imagePath = primaryImage.image_url || primaryImage.image_path;
          setSelectedImage(imagePath);
        }
      } catch (error: any) {
        console.error("Error fetching product:", error);
        setError(
          error.response?.data?.message ||
            "Failed to load product. Please try again."
        );
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const resolveImageUrl = (image: any) => {
    if (!image) {
      return `${BASE_URL}/public/storage/products/placeholder-product.jpg`;
    }

    // Use image_url if available (from backend ProductImage model)
    const imagePath = image.image_url || image.image_path;
    if (!imagePath) {
      return `${BASE_URL}/public/storage/products/placeholder-product.jpg`;
    }

    // Check if it's an absolute URL
    if (imagePath.startsWith("http")) {
      // Fix incorrect backend URLs that are missing /backend/public/
      // Convert: https://ecobags.rubitcubedev.com/storage/products/...
      // To: https://ecobags.rubitcubedev.com/backend/public/storage/products/...
      const siteUrl =
        import.meta.env.VITE_SITE_URL || "https://shamsnaturals.com";
      if (
        imagePath.includes("/storage/products/") &&
        !imagePath.includes("/backend/public/")
      ) {
        const filename = imagePath.split("/storage/products/")[1];
        return `${siteUrl}/backend/public/storage/products/${filename}`;
      }

      return imagePath;
    }

    // Remove leading storage/ or slash
    let path = imagePath.replace(/^storage\//, "").replace(/^\//, "");
    // Remove 'products/' if it exists (backend already includes it in path)
    path = path.replace(/^products\//, "");

    return `${BASE_URL}/public/storage/products/${path}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("products.loadingProduct")}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("products.productNotFound")}
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            {error || t("common.noData")}
          </p>
          <a
            href="/products"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            {t("common.backToHome")}
          </a>
        </div>
      </div>
    );
  }

  // Generate structured data for product
  const primaryImage =
    product.images?.find((img: any) => img.is_primary) || product.images?.[0];
  const productImageUrl = primaryImage
    ? primaryImage.image_url || primaryImage.image_path
    : null;
  const fullImageUrl = productImageUrl
    ? productImageUrl.startsWith("http")
      ? productImageUrl
      : `${BASE_URL}/public/storage/products/${productImageUrl
          .replace(/^storage\//, "")
          .replace(/^\//, "")}`
    : null;

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.short_description || "",
    image: fullImageUrl ? [fullImageUrl] : [],
    sku: product.sku || product.slug,
    category: product.category?.name || "",
    brand: {
      "@type": "Brand",
      name: "Shams Naturals",
    },
    offers: {
      "@type": "Offer",
      availability: product.is_active
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${
        import.meta.env.VITE_SITE_URL || "https://shamsnaturals.com"
      }/products/${product.slug}`,
    },
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${
          import.meta.env.VITE_SITE_URL || "https://shamsnaturals.com"
        }/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${
          import.meta.env.VITE_SITE_URL || "https://shamsnaturals.com"
        }/products`,
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: translateCategoryName(product.category.name, t),
              item: `${
                import.meta.env.VITE_SITE_URL || "https://shamsnaturals.com"
              }/products/category/${product.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.name,
        item: `${
          import.meta.env.VITE_SITE_URL || "https://shamsnaturals.com"
        }/products/${product.slug}`,
      },
    ],
  };

  // Find the selected image or fall back to primary/first image
  const getMainImage = () => {
    if (!product.images || product.images.length === 0) {
      return null;
    }

    // Try to find by selectedImage path
    if (selectedImage) {
      const found = product.images.find(
        (img: any) =>
          img.image_path === selectedImage ||
          img.image_url === selectedImage ||
          img.image_path?.includes(selectedImage) ||
          selectedImage.includes(img.image_path)
      );
      if (found) {
        return found;
      }
    }

    // Fall back to primary image or first image
    return (
      product.images.find((img: any) => img.is_primary) || product.images[0]
    );
  };

  const mainImageUrl = resolveImageUrl(getMainImage());

  return (
    <>
      <SEOHead
        title={product.seo?.meta_title || product.name}
        description={
          product.seo?.meta_description ||
          product.short_description ||
          product.description ||
          `Discover ${product.name} - Premium eco-friendly product from Shams Naturals`
        }
        keywords={
          product.seo?.meta_keywords ||
          `${product.name}, eco-friendly, sustainable, ${
            product.category?.name || ""
          }`
        }
        ogImage={product.seo?.og_image || fullImageUrl}
        ogType="product"
        structuredData={[productStructuredData, breadcrumbStructuredData]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <img
                src={mainImageUrl}
                alt={product.name || "Product image"}
                className="w-full h-96 object-contain rounded-lg bg-gray-100"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = `${BASE_URL}/public/storage/products/placeholder-product.jpg`;
                }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image: any) => {
                  const imageUrl = resolveImageUrl(image);
                  const imagePath = image.image_url || image.image_path;
                  return (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(imagePath)}
                      className={`border-2 rounded-lg overflow-hidden ${
                        selectedImage === imagePath
                          ? "border-primary-600"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={image.alt_text || product.name}
                        className="w-full h-24 object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = `${BASE_URL}/public/storage/products/placeholder-product.jpg`;
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {product.name || "Product"}
            </h1>

            {product.category && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">
                  {translateCategoryName(product.category.name, t)}
                  {product.subcategory &&
                    ` / ${translateCategoryName(product.subcategory.name, t)}`}
                </span>
              </div>
            )}

            {product.short_description && (
              <p className="text-lg text-gray-700 mb-6">
                {product.short_description}
              </p>
            )}

            {product.description && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {t("products.description")}
                </h2>
                <div
                  className="text-gray-700 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {product.sku && (
              <p className="text-sm text-gray-600 mb-4">
                {t("products.sku")}: {product.sku}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
