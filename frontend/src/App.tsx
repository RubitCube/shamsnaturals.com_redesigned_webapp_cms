import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import SocialIcons from './components/Layout/SocialIcons'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import NewArrivalsPage from './pages/NewArrivalsPage'
import AboutPage from './pages/AboutPage'
import DealersPage from './pages/DealersPage'
import ContactPage from './pages/ContactPage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductCreate from './pages/admin/AdminProductCreate'
import AdminCategoryProducts from './pages/admin/AdminCategoryProducts'
import AdminCategoryProductGallery from './pages/admin/AdminCategoryProductGallery'
import AdminCategoryProductPriority from './pages/admin/AdminCategoryProductPriority'
import AdminCategories from './pages/admin/AdminCategories'
import AdminCategoryCreate from './pages/admin/AdminCategoryCreate'
import AdminCategoryPriority from './pages/admin/AdminCategoryPriority'
import AdminProductImagePriority from './pages/admin/AdminProductImagePriority'
import AdminBanners from './pages/admin/AdminBanners'
import AdminDealers from './pages/admin/AdminDealers'
import AdminBlogs from './pages/admin/AdminBlogs'
import AdminEvents from './pages/admin/AdminEvents'
import AdminPages from './pages/admin/AdminPages'
import AdminSEO from './pages/admin/AdminSEO'
import AdminCountries from './pages/admin/AdminCountries'
import AdminCountryStates from './pages/admin/AdminCountryStates'
import AdminChangePassword from './pages/admin/AdminChangePassword'
import AnalyticsTracker from './components/AnalyticsTracker'

// Component to handle /admin redirect
const AdminRedirect = () => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
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
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
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
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Public Routes (with Navbar/Footer) */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
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

