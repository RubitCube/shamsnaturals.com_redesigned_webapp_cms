import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

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
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
        <div className="p-4">
          <Link to="/admin/dashboard" className="text-2xl font-bold text-white">
            Shams Naturals
          </Link>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
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
                        ? 'bg-primary-600 text-white'
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
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {menuItems.find(item => location.pathname.startsWith(item.path))?.label || 'Admin Panel'}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

