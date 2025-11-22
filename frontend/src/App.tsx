import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import SocialIcons from './components/Layout/SocialIcons'
import AccessibilityToolbar from './components/AccessibilityToolbar'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import AnalyticsTracker from './components/AnalyticsTracker'

// Lazy load public pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const DealersPage = lazy(() => import('./pages/DealersPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'))

// Lazy load admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminProductCreate = lazy(() => import('./pages/admin/AdminProductCreate'))
const AdminCategoryProducts = lazy(() => import('./pages/admin/AdminCategoryProducts'))
const AdminCategoryProductGallery = lazy(() => import('./pages/admin/AdminCategoryProductGallery'))
const AdminCategoryProductPriority = lazy(() => import('./pages/admin/AdminCategoryProductPriority'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminCategoryCreate = lazy(() => import('./pages/admin/AdminCategoryCreate'))
const AdminCategoryPriority = lazy(() => import('./pages/admin/AdminCategoryPriority'))
const AdminProductImagePriority = lazy(() => import('./pages/admin/AdminProductImagePriority'))
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'))
const AdminDealers = lazy(() => import('./pages/admin/AdminDealers'))
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'))
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'))
const AdminPages = lazy(() => import('./pages/admin/AdminPages'))
const AdminSEO = lazy(() => import('./pages/admin/AdminSEO'))
const AdminCountries = lazy(() => import('./pages/admin/AdminCountries'))
const AdminCountryStates = lazy(() => import('./pages/admin/AdminCountryStates'))
const AdminChangePassword = lazy(() => import('./pages/admin/AdminChangePassword'))

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
)

// Component to handle /admin redirect
const AdminRedirect = () => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <PageLoader />
  }
  
  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/admin/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AnalyticsTracker />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="products/new" element={<AdminProductCreate />} />
                      <Route path="products/:productId/images/priority" element={<AdminProductImagePriority />} />
                      <Route path="categories/:categoryId/products" element={<AdminCategoryProducts />} />
                      <Route path="categories/:categoryId/products/gallery" element={<AdminCategoryProductGallery />} />
                      <Route path="categories/:categoryId/products/priority" element={<AdminCategoryProductPriority />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="categories/new" element={<AdminCategoryCreate />} />
                      <Route path="categories/priority" element={<AdminCategoryPriority />} />
                      <Route path="banners" element={<AdminBanners />} />
                      <Route path="dealers" element={<AdminDealers />} />
                      <Route path="blogs" element={<AdminBlogs />} />
                      <Route path="events" element={<AdminEvents />} />
                      <Route path="pages" element={<AdminPages />} />
                      <Route path="seo" element={<AdminSEO />} />
                      <Route path="countries" element={<AdminCountries />} />
                      <Route path="countries/:countryId/states" element={<AdminCountryStates />} />
                      <Route path="change-password" element={<AdminChangePassword />} />
                    </Routes>
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Public Routes (with Navbar/Footer) */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen flex flex-col">
                <AccessibilityToolbar />
                <Navbar />
                <main id="main-content" className="flex-grow" tabIndex={-1}>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:slug" element={<ProductDetailPage />} />
                      <Route path="/products/category/:category" element={<ProductsPage />} />
                      <Route path="/products/category/:category/subcategory/:subcategory" element={<ProductsPage />} />
                      <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/dealers" element={<DealersPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:slug" element={<BlogDetailPage />} />
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/events/:slug" element={<EventDetailPage />} />
                    </Routes>
                  </Suspense>
                </main>
                <SocialIcons />
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

