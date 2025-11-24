import { useEffect, useMemo, useState } from "react";
import { pagesAPI, bannersAPI } from "../services/api";
import BannerCarousel from "../components/BannerCarousel";
import SEOHead from "../components/SEOHead";

const AboutPage = () => {
  const [page, setPage] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Build BASE URL from env
  const BASE_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");

  /*const buildImageUrl = (img: string) => {
    if (!img) return "/placeholder-product.jpg";
    if (img.startsWith("http")) return img;
    return `${BASE_URL}/storage/${img}`;
  };*/

  const buildImageUrl = (img: string) => {
    if (!img) return "/placeholder-product.jpg";
    if (img.startsWith("http")) return img;
  
    // remove leading slash to avoid double slashes
    const cleanPath = img.replace(/^\/+/, "");
  
    return `${BASE_URL}/storage/pages/${cleanPath}`;
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pageResponse, bannersResponse] = await Promise.all([
          pagesAPI.getAbout(),
          bannersAPI.getByPage("about"),
        ]);
        // Page data should already include SEO from the API
        setPage(pageResponse.data.page || pageResponse.data);
        setBanners(bannersResponse.data || []);
      } catch (error: any) {
        console.error("Error fetching about page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const {
    mainImageSrc,
    decorativeImage1,
    decorativeImage2,
    contentWithoutImages,
    imageSeo,
  } = useMemo(() => {
    const result = {
      mainImageSrc: "",
      decorativeImage1: "",
      decorativeImage2: "",
      contentWithoutImages: "",
      imageSeo: {
        main_image: { alt: "", title: "" },
        decorative_image_1: { alt: "", title: "" },
        decorative_image_2: { alt: "", title: "" },
      },
    };

    // Get images from separate images field
    if (page?.images) {
      result.mainImageSrc = page.images.main_image || "";
      result.decorativeImage1 = page.images.decorative_image_1 || "";
      result.decorativeImage2 = page.images.decorative_image_2 || "";
    }

    // Get image SEO data
    if (page?.seo?.image_seo) {
      result.imageSeo = {
        main_image: page.seo.image_seo.main_image || { alt: "", title: "" },
        decorative_image_1: page.seo.image_seo.decorative_image_1 || {
          alt: "",
          title: "",
        },
        decorative_image_2: page.seo.image_seo.decorative_image_2 || {
          alt: "",
          title: "",
        },
      };
    }

    // Remove all images from content HTML
    if (page?.content) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(page.content, "text/html");
        const imgs = doc.querySelectorAll("img");
        imgs.forEach((img) => img.parentElement?.removeChild(img));
        result.contentWithoutImages = doc.body.innerHTML;
      } catch (e) {
        result.contentWithoutImages = page.content;
      }
    }

    return result;
  }, [page]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={page?.seo?.meta_title || "About Us - Shams Naturals"}
        description={
          page?.seo?.meta_description ||
          "Learn about Shams Naturals - Leading provider of eco-friendly bags and sustainable products in UAE"
        }
        keywords={
          page?.seo?.meta_keywords ||
          "about us, shams naturals, eco-friendly, sustainable products, UAE"
        }
        ogImage={page?.seo?.og_image || undefined}
        ogType="website"
      />
      <div>
        {/* Banner Carousel */}
        {banners && banners.length > 0 && <BannerCarousel banners={banners} />}

        <div className="w-full relative min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {page ? (
              <div className="relative pb-32">
                <div className="flex flex-wrap -mx-4 relative">
                  {/* Left Column - Content */}
                  <div className="w-full xl:w-7/12 2xl:w-6/12 px-4 my-auto py-5 lg:ps-0 xl:pe-4 2xl:pe-5 relative z-20">
                    <div className="float-right py-8 xl:py-4 animated animatedFadeInUp fadeInUp">
                      <div
                        className="about-content"
                        dangerouslySetInnerHTML={{
                          __html: contentWithoutImages || page.content,
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Column - Image (aligned with middle/lower portion of text) */}
                  {mainImageSrc && (
                    <div className="w-full xl:w-5/12 2xl:w-6/12 px-0 text-center hidden xl:block xl:absolute xl:right-0 xl:top-[40%] py-5 my-auto z-10">
                      <div className="aboutbg relative">
                        <img
                          src={buildImageUrl(mainImageSrc)}
                          className="w-full h-auto relative z-10"
                          alt={
                            imageSeo.main_image.alt ||
                            "Shams Naturals eco-friendly bags in UAE"
                          }
                          title={imageSeo.main_image.title || ""}
                          loading="lazy"
                          decoding="async"
                          onError={(e) =>
                            (e.currentTarget.src = "/placeholder-product.jpg")
                          }
                          
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Background Decorative Images - Bottom left area (behind content) */}
                {(decorativeImage1 || decorativeImage2) && (
                  <div
                    className="hidden 2xl:block absolute bottom-0 left-0 w-full pointer-events-none z-0"
                    style={{ height: "300px" }}
                  >
                    {/* about02 - Upper outline illustration (tote bag) */}
                    {decorativeImage1 && (
                      <img
                        src={buildImageUrl(decorativeImage1)}
                        className="aboutbgicon02 aboutimg absolute"
                        alt={imageSeo.decorative_image_1.alt || ""}
                        title={imageSeo.decorative_image_1.title || ""}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    {/* about03 - Lower outline illustration (drawstring bag) */}
                    {decorativeImage2 && (
                      <img
                        src={buildImageUrl(decorativeImage2)}
                        className="aboutbgicon03 aboutimg absolute"
                        alt={imageSeo.decorative_image_2.alt || ""}
                        title={imageSeo.decorative_image_2.title || ""}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  About Us
                </h1>
                <p className="text-gray-600 text-lg">
                  Content will be available soon. Please check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
