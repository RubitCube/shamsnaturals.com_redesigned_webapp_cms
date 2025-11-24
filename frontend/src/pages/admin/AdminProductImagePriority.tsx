import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminAPI } from "../../services/api";
import { translateCategoryName } from "../../utils/categoryTranslations";

const BASE_URL = import.meta.env.VITE_SITE_URL
  ? import.meta.env.VITE_SITE_URL + "/backend"
  : "http://localhost:8000/backend";

interface ProductImage {
  id: number;
  image_path: string;
  image_url?: string;
  alt_text?: string;
  order: number;
  is_primary: boolean;
}

interface Product {
  id: number;
  name: string;
  category?: { id: number; name: string };
}

const resolveImageUrl = (path?: string) => {
  if (!path) return "";

  // Check if it's an absolute URL
  if (path.startsWith("http")) {
    // Fix incorrect backend URLs that are missing /backend/public/
    const siteUrl = import.meta.env.VITE_SITE_URL || "http://localhost:8000";
    if (
      path.includes("/storage/products/") &&
      !path.includes("/backend/public/")
    ) {
      const filename = path.split("/storage/products/")[1];
      return `${siteUrl}/backend/public/storage/products/${filename}`;
    }
    return path;
  }

  let normalized = path.startsWith("storage/") ? path.substring(8) : path;
  normalized = normalized.startsWith("/")
    ? normalized.substring(1)
    : normalized;
  // Remove 'products/' if it exists (backend already includes it in path)
  normalized = normalized.replace(/^products\//, "");

  return `${BASE_URL}/public/storage/products/${normalized}`;
};

const AdminProductImagePriority = () => {
  const { t } = useTranslation("translation");
  const navigate = useNavigate();
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const productIdFromQuery = searchParams.get("product");

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const id = productId || productIdFromQuery;
    if (id) {
      fetchProductAndImages(Number(id));
    }
  }, [productId, productIdFromQuery]);

  const fetchProductAndImages = async (id: number) => {
    try {
      setLoading(true);
      const response = await adminAPI.products.getById(id);
      const data = response.data;

      setProduct({
        id: data.id,
        name: data.name,
        category: data.category,
      });

      // Sort images by order
      const sortedImages = (data.images || []).sort(
        (a: ProductImage, b: ProductImage) => (a.order || 0) - (b.order || 0)
      );
      setImages(sortedImages);
      setCurrentImageIndex(0); // Reset to first image
    } catch (error) {
      setMessage({ type: "error", text: "Unable to load product images." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      setSaving(true);
      const payload = images.map((image, index) => ({
        id: image.id,
        order: index, // Start from 0
      }));

      await adminAPI.products.reorderImages(product.id, payload);
      setMessage({
        type: "success",
        text: "Product image priorities updated successfully.",
      });

      // Refresh images to get updated order
      setTimeout(() => {
        fetchProductAndImages(product.id);
        setCurrentImageIndex(0); // Reset to first image
      }, 1000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save ordering. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const moveImageUp = () => {
    if (currentImageIndex === 0) return;
    const newImages = [...images];
    const temp = newImages[currentImageIndex];
    newImages[currentImageIndex] = newImages[currentImageIndex - 1];
    newImages[currentImageIndex - 1] = temp;
    setImages(newImages);
    setCurrentImageIndex(currentImageIndex - 1);
  };

  const moveImageDown = () => {
    if (currentImageIndex === images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[currentImageIndex];
    newImages[currentImageIndex] = newImages[currentImageIndex + 1];
    newImages[currentImageIndex + 1] = temp;
    setImages(newImages);
    setCurrentImageIndex(currentImageIndex + 1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Product not found.</p>
        <button
          className="btn-primary px-4 py-2"
          onClick={() => navigate("/admin/products")}
        >
          Back to Products
        </button>
      </div>
    );
  }

  const categoryName = product.category?.name
    ? translateCategoryName(product.category.name, t)
    : "Unknown Category";

  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <button
          className="text-[#2c7a4b]"
          onClick={() => navigate("/admin/categories")}
        >
          Category
        </button>
        <span>/</span>
        <button
          className="text-[#2c7a4b]"
          onClick={() =>
            navigate(
              `/admin/categories/${
                product.category?.id ?? ""
              }/products?product=${product.id}`
            )
          }
        >
          Products
        </button>
        <span>/</span>
        <span className="text-gray-400">Set Priority Product Images</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Set Priority Product Images : {categoryName}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "SAVE REORDERING"}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Single Product Image Gallery Card */}
          {images.length > 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl border px-4 py-4 bg-gray-50 shadow-sm border-gray-200">
                  <div className="aspect-square overflow-hidden rounded-xl bg-white mb-3 relative">
                    {(() => {
                      const currentImage = images[currentImageIndex];
                      const imageSrc =
                        currentImage?.image_url ||
                        resolveImageUrl(currentImage?.image_path);

                      return (
                        <>
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={currentImage?.alt_text || product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}

                          {/* Previous/Next Navigation Buttons */}
                          {images.length > 1 && (
                            <>
                              <button
                                onClick={handlePreviousImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-sm transition-colors z-10"
                                title="Previous Image"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-700"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-sm transition-colors z-10"
                                title="Next Image"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-700"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            </>
                          )}

                          {/* Image Counter */}
                          {images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              {currentImageIndex + 1} / {images.length}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Priority:{" "}
                      <span className="text-red-600 font-bold">
                        {currentImageIndex}
                      </span>
                    </p>

                    {/* Priority Change Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={moveImageUp}
                        disabled={currentImageIndex === 0}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move Priority Up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={moveImageDown}
                        disabled={currentImageIndex === images.length - 1}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move Priority Down"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <p className="text-gray-500 text-center">
                No product images found.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600">1.</span>
              <span>
                Use Previous/Next buttons to navigate through product images.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600">2.</span>
              <span>
                Use ↑ and ↓ buttons to change the priority of the current image.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600">3.</span>
              <span>Click 'Save Reordering' when finished.</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminProductImagePriority;
