import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/company_logo_image/shamsnaturals-logo.png";
import { categoriesAPI, productsAPI } from "../../services/api";
import LanguageSelector from "../LanguageSelector";

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<number | null>(
    null
  );
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuData = async () => {
      setMenuLoading(true);
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll(),
        ]);
        setCategories(categoriesRes.data || []);
        const productPayload = productsRes.data?.data || productsRes.data || [];
        setProducts(productPayload);
      } catch (error) {
        console.error("Unable to load menu data", error);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  useEffect(() => {
    if (!activeCategoryId && categories.length) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return (
      categories.find((cat) => cat.id === activeCategoryId) || categories[0]
    );
  }, [categories, activeCategoryId]);

  useEffect(() => {
    if (activeCategory?.subcategories?.length) {
      if (
        !activeSubcategoryId ||
        !activeCategory.subcategories.some(
          (s: any) => s.id === activeSubcategoryId
        )
      ) {
        setActiveSubcategoryId(activeCategory.subcategories[0].id);
      }
    } else {
      setActiveSubcategoryId(null);
    }
  }, [activeCategory, activeSubcategoryId]);

  const activeSubcategory = useMemo(() => {
    if (!activeCategory || !activeCategory.subcategories) return null;
    return (
      activeCategory.subcategories.find(
        (sub: any) => sub.id === activeSubcategoryId
      ) ||
      activeCategory.subcategories[0] ||
      null
    );
  }, [activeCategory, activeSubcategoryId]);

  const categoryProducts = useMemo(() => {
    if (!activeCategory) return [];
    return products
      .filter(
        (product) => Number(product.category_id) === Number(activeCategory.id)
      )
      .slice(0, 8);
  }, [products, activeCategory]);

  const subcategoryProducts = useMemo(() => {
    if (!activeSubcategory) return [];
    return products
      .filter(
        (product) =>
          Number(product.subcategory_id) === Number(activeSubcategory.id)
      )
      .slice(0, 8);
  }, [products, activeSubcategory]);

  const displayedProducts = subcategoryProducts.length
    ? subcategoryProducts
    : categoryProducts;

  return (
    <nav className="bg-white shadow-lg sticky top-2 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a
              href="https://shamsnaturals.com/"
              className="flex items-center space-x-3"
              aria-label="Shams Naturals Home"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={logo}
                alt="Shams Naturals"
                className="h-16 w-auto object-contain transition-transform duration-200 hover:scale-105"
                loading="lazy"
                width={160}
                height={48}
              />
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-[#4a7c28] transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-[#4a7c28] transition-colors"
            >
              {t('nav.about')}
            </Link>
            <div
              className="relative"
              onMouseEnter={() => {
                // Clear any pending timeout
                if (dropdownTimeout) {
                  clearTimeout(dropdownTimeout);
                  setDropdownTimeout(null);
                }
                setShowProductsDropdown(true);
              }}
              onMouseLeave={() => {
                // Add a small delay before closing to allow smooth mouse movement
                const timeout = setTimeout(() => {
                  setShowProductsDropdown(false);
                }, 150);
                setDropdownTimeout(timeout);
              }}
            >
              <button
                className="text-gray-700 hover:text-[#4a7c28] transition-colors flex items-center gap-1"
                type="button"
                aria-haspopup="true"
                aria-expanded={showProductsDropdown}
              >
                {t('nav.products')}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="text-sm"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                </svg>
              </button>
              {showProductsDropdown && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[900px] bg-[#f0f6ec] border border-[#d3e3cc] rounded-2xl shadow-2xl p-6 z-50"
                  onMouseEnter={() => {
                    // Clear any pending timeout when mouse enters dropdown
                    if (dropdownTimeout) {
                      clearTimeout(dropdownTimeout);
                      setDropdownTimeout(null);
                    }
                    setShowProductsDropdown(true);
                  }}
                  onMouseLeave={() => {
                    // Close when mouse leaves dropdown
                    setShowProductsDropdown(false);
                  }}
                >
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
                          Categories
                        </p>
                        {menuLoading && (
                          <span className="text-[10px] text-gray-400">
                            Loading...
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              activeCategory?.id === category.id
                                ? "bg-[#dcecd5] text-[#0f3b1e] font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onMouseEnter={() =>
                              setActiveCategoryId(category.id)
                            }
                            onClick={() => {
                              setActiveCategoryId(category.id);
                              setShowProductsDropdown(false);
                              navigate(`/products/${category.slug}`);
                            }}
                          >
                            {category.name}
                          </button>
                        ))}
                        {!categories.length && !menuLoading && (
                          <p className="text-sm text-gray-500">
                            No categories available.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-3 border-l border-gray-100 pl-4">
                      <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-2">
                        Sub-categories
                      </p>
                      <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                        {activeCategory?.subcategories?.length ? (
                          activeCategory.subcategories.map(
                            (subcategory: any) => (
                              <button
                                key={subcategory.id}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                  activeSubcategory?.id === subcategory.id
                                    ? "bg-[#f0f6ec] text-[#0f3b1e] font-semibold"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                                onMouseEnter={() =>
                                  setActiveSubcategoryId(subcategory.id)
                                }
                                onClick={() => {
                                  setActiveSubcategoryId(subcategory.id);
                                  setShowProductsDropdown(false);
                                  navigate(
                                    `/products/${activeCategory?.slug}/${subcategory.slug}`
                                  );
                                }}
                              >
                                {subcategory.name}
                              </button>
                            )
                          )
                        ) : (
                          <p className="text-sm text-gray-500">
                            No sub-categories.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-5 border-l border-gray-100 pl-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs uppercase text-gray-500 tracking-wide">
                            {activeSubcategory
                              ? `Products in ${activeSubcategory.name}`
                              : `Top ${activeCategory?.name} products`}
                          </p>
                          <p className="text-sm text-gray-700">
                            {displayedProducts.length} item
                            {displayedProducts.length === 1 ? "" : "s"} listed
                          </p>
                        </div>
                        {activeCategory && (
                          <Link
                            to={
                              activeSubcategory
                                ? `/products/${activeCategory.slug}/${activeSubcategory.slug}`
                                : `/products/${activeCategory.slug}`
                            }
                            className="text-xs font-semibold text-[#4a7c28] hover:underline"
                          >
                            View all
                          </Link>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                        {displayedProducts.length ? (
                          displayedProducts.map((product) => (
                            <Link
                              key={product.id}
                              to={`/products/${product.slug || product.id}`}
                              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              onClick={() => setShowProductsDropdown(false)}
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {product.category?.name ||
                                    activeCategory?.name}
                                  {product.subcategory?.name
                                    ? ` • ${product.subcategory.name}`
                                    : ""}
                                </p>
                              </div>
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </Link>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No products in this selection.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Link
              to="/new-arrivals"
              className="text-gray-700 hover:text-[#4a7c28] transition-colors"
            >
              {t('nav.newArrivals')}
            </Link>
            <Link
              to="/dealers"
              className="text-gray-700 hover:text-[#4a7c28] transition-colors"
            >
              {t('nav.dealers')}
            </Link>
            <Link
              to="/events"
              className="text-gray-700 hover:text-[#4a7c28] transition-colors"
            >
              {t('nav.events')}
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-[#4a7c28] transition-colors"
            >
              {t('nav.contact')}
            </Link>
            <LanguageSelector />
            <a
              href="https://shamsnatural.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-4 py-2 text-sm font-semibold"
            >
              {t('nav.dealerLogin')}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              {t('nav.about')}
            </Link>
            <div className="border border-gray-200 rounded-lg">
              <button
                className="w-full px-3 py-2 text-left flex items-center justify-between text-gray-700"
                onClick={() => setMobileProductsOpen((prev) => !prev)}
              >
                <span>Products</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    mobileProductsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {mobileProductsOpen && (
                <div className="px-3 pb-3 space-y-3 bg-gray-50">
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">
                      Categories
                    </p>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/products/${category.slug}`}
                          className="block px-2 py-1 rounded text-sm text-gray-700 hover:bg-white"
                          onClick={() => {
                            setIsOpen(false);
                            setMobileProductsOpen(false);
                          }}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  {activeCategory?.subcategories?.length ? (
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">
                        Sub-categories
                      </p>
                      <div className="space-y-1">
                        {activeCategory.subcategories.map(
                          (subcategory: any) => (
                            <Link
                              key={subcategory.id}
                              to={`/products/${activeCategory.slug}/${subcategory.slug}`}
                              className="block px-2 py-1 rounded text-sm text-gray-700 hover:bg-white"
                              onClick={() => {
                                setIsOpen(false);
                                setMobileProductsOpen(false);
                              }}
                            >
                              {subcategory.name}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            <Link
              to="/new-arrivals"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              {t('nav.newArrivals')}
            </Link>
            <Link
              to="/dealers"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              {t('nav.dealers')}
            </Link>
            <Link
              to="/events"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              {t('nav.events')}
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              {t('nav.contact')}
            </Link>
            <div className="px-3 py-2">
              <LanguageSelector />
            </div>
            <a
              href="https://shamsnatural.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary block px-3 py-2 text-center"
            >
              Dealer Login
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
