import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ProductImage {
  id: number;
  image_path: string;
  alt_text?: string;
  is_primary: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  images?: ProductImage[];
  primaryImage?: ProductImage;
  short_description?: string;
  is_new_arrival?: boolean;
}

interface ProductCardProps {
  product: Product;
  imageFit?: "cover" | "contain";
}

const ProductCard = memo(
  ({ product, imageFit = "cover" }: ProductCardProps) => {
    const { t } = useTranslation();
    const image = product.primaryImage || product.images?.[0];

    const imageUrl = useMemo(() => {
      const BASE_URL = import.meta.env.VITE_SITE_URL
        ? import.meta.env.VITE_SITE_URL + "/backend"
        : "http://localhost:8000/backend";

      if (!image?.image_path) return `${BASE_URL}/public/storage/products/placeholder-product.jpg`;
      
      // Check if it's an absolute URL
      if (image.image_path.startsWith("http")) {
        // Fix incorrect backend URLs that are missing /backend/public/
        const siteUrl = import.meta.env.VITE_SITE_URL || "http://localhost:8000";
        if (image.image_path.includes("/storage/products/") && !image.image_path.includes("/backend/public/")) {
          const filename = image.image_path.split("/storage/products/")[1];
          return `${siteUrl}/backend/public/storage/products/${filename}`;
        }
        return image.image_path;
      }

      let normalized = image.image_path;
      // Remove leading 'storage/' or '/'
      normalized = normalized.replace(/^storage\//, "").replace(/^\//, "");
      // Remove 'products/' if it exists (backend already includes it in path)
      normalized = normalized.replace(/^products\//, "");

      return `${BASE_URL}/public/storage/products/${normalized}`;
    }, [image?.image_path]);

    const imageClass = useMemo(
      () =>
        imageFit === "contain"
          ? "w-full h-80 object-contain p-4 mix-blend-multiply bg-white"
          : "w-full h-80 object-cover",
      [imageFit]
    );

    const containerClass = useMemo(
      () =>
        imageFit === "cover"
          ? "relative bg-gray-100 overflow-hidden"
          : "relative",
      [imageFit]
    );

    return (
      <Link
        to={`/products/${product.slug}`}
        className="card hover:shadow-xl transition-shadow duration-200"
      >
        <div className={containerClass}>
          <img
            src={imageUrl}
            alt={image?.alt_text || product.name}
            className={imageClass}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const BASE_URL = import.meta.env.VITE_SITE_URL
                ? import.meta.env.VITE_SITE_URL + "/backend"
                : "http://localhost:8000/backend";
              e.currentTarget.src = `${BASE_URL}/public/storage/products/placeholder-product.jpg`;
              e.currentTarget.className =
                "w-full h-80 object-contain p-4 bg-white";
            }}
          />
          {product.is_new_arrival && (
            <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {t('products.newBadge')}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-xl mb-2 line-clamp-2">
            {product.name}
          </h3>
          {product.short_description && (
            <p className="text-gray-600 text-base line-clamp-2">
              {product.short_description}
            </p>
          )}
        </div>
      </Link>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
