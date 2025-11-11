import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { analyticsAPI } from '../../services/api'

const Footer = () => {
  const [totalVisits, setTotalVisits] = useState<number | null>(null)
  const [todayVisits, setTodayVisits] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchSummary = async () => {
      try {
        const response = await analyticsAPI.getSummary()
        if (!isMounted) return
        setTotalVisits(response.data.total_visits)
        setTodayVisits(response.data.today_visits)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.debug('Unable to fetch analytics summary', error)
      }
    }

    fetchSummary()
    const interval = setInterval(fetchSummary, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Shams Naturals</h3>
            <p className="text-sm">
              Leading provider of eco-friendly bags and sustainable products.
            </p>
            <div className="mt-4 text-sm text-primary-300">
              <p className="font-semibold">Live Visitor Count</p>
              <p>Total Visits: {totalVisits !== null ? totalVisits.toLocaleString() : '—'}</p>
              <p>Today: {todayVisits !== null ? todayVisits.toLocaleString() : '—'}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary-400 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="hover:text-primary-400 transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-white font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dealers" className="hover:text-primary-400 transition-colors">
                  Dealer Network
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: info@shamsnaturals.com</li>
              <li>Phone: +971 XX XXX XXXX</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Shams Naturals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

