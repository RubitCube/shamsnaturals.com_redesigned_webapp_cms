import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import logo from '../../assets/company_logo_image/shamsnaturals-logo.png'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/categories', label: 'Categories', icon: '📁' },
    { path: '/admin/banners', label: 'Banners', icon: '🖼️' },
    { path: '/admin/dealers', label: 'Dealers', icon: '📍' },
    { path: '/admin/blogs', label: 'Blogs', icon: '📝' },
    { path: '/admin/events', label: 'Events', icon: '📅' },
    { path: '/admin/pages', label: 'Pages', icon: '📄' },
    { path: '/admin/countries', label: 'Countries (Region)', icon: '🌍' },
    { path: '/admin/seo', label: 'SEO Management', icon: '🔍' },
    { path: '/admin/change-password', label: 'Change Password', icon: '🔐' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`w-64 bg-gray-800 text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col items-center text-center">
          <Link to="/admin/dashboard" className="inline-flex items-center justify-center mb-2" aria-label="Shams Naturals Admin">
            <img
              src={logo}
              alt="Shams Naturals"
              className="h-16 w-auto object-contain drop-shadow-lg"
              loading="lazy"
              width={160}
              height={48}
            />
          </Link>
          <p className="text-sm font-semibold tracking-wide text-[#dcecd5] uppercase">Admin Panel</p>
        </div>
        
        <nav className="mt-8 flex-1 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path)
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#dcecd5] text-[#0f3b1e] font-semibold shadow-sm'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="mr-3 text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="mb-3">
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-primary w-full px-4 py-2 text-center"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        } ml-0 relative z-20`}
      >
        {/* Header */}
        <header className="bg-white shadow sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex items-center justify-center text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a7c28] rounded-lg border border-gray-200 p-2 bg-white shadow-sm"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            {/* Back Button - Show on all pages except dashboard */}
            {location.pathname !== '/admin/dashboard' && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a7c28] rounded-lg border border-gray-200 p-2 bg-white shadow-sm transition-colors"
                aria-label="Go back"
                title="Go back"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-semibold text-gray-900">
              {menuItems.find(item => location.pathname.startsWith(item.path))?.label || 'Admin Panel'}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
        <footer className="bg-gray-50 border-t border-gray-200 px-6 py-4 text-xs text-gray-500 text-center">
          <p>&copy; {new Date().getFullYear()} Shams Naturals. Secure CMS.</p>
          <p className="mt-1">
            Designed &amp; Developed by{' '}
            <a
              href="https://rubitcube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#14532d] hover:text-[#4a7c28] underline-offset-2 hover:underline transition-colors"
            >
              RubitCube
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default AdminLayout

