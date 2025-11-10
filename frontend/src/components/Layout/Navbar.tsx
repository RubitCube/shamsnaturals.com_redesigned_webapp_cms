import { Link } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Shams Naturals
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
              Products
            </Link>
            <Link to="/new-arrivals" className="text-gray-700 hover:text-primary-600 transition-colors">
              New Arrivals
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              About Us
            </Link>
            <Link to="/dealers" className="text-gray-700 hover:text-primary-600 transition-colors">
              Dealers
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">
              Blog
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
            <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Home
            </Link>
            <Link to="/products" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Products
            </Link>
            <Link to="/new-arrivals" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              New Arrivals
            </Link>
            <Link to="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              About Us
            </Link>
            <Link to="/dealers" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Dealers
            </Link>
            <Link to="/blog" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Blog
            </Link>
            <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

