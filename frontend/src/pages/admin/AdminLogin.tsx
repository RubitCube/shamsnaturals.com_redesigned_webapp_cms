import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import logo from '../../assets/company_logo_image/shamsnaturals-logo.png'

const backgroundSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    overlay: 'from-[#0f172a]/70 via-[#0f172a]/60 to-black/70',
    caption: 'Secure CMS Access',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=1600&q=80',
    overlay: 'from-[#0f172a]/70 via-[#134e4a]/60 to-black/70',
    caption: 'Manage dealers worldwide',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    overlay: 'from-[#0f172a]/70 via-[#14532d]/60 to-black/70',
    caption: 'Analytics & insights',
  },
]

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % backgroundSlides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/admin/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background carousel */}
      {backgroundSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ${
            index === slideIndex ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={index !== slideIndex}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.overlay}`} />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm tracking-[0.25em] uppercase opacity-70">
            {slide.caption}
          </div>
        </div>
      ))}

      <div className="relative z-10 flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur rounded-2xl shadow-2xl border border-white/40 px-8 py-10">
        <div className="text-center">
          <a
            href="https://shamsnaturals.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Shams Naturals Website"
          >
            <img
              src={logo}
              alt="Shams Naturals"
              className="mx-auto h-20 w-auto object-contain drop-shadow"
              loading="lazy"
              width={200}
              height={60}
            />
          </a>
          <p className="mt-4 text-center text-2xl font-extrabold text-gray-900 tracking-wide">
            Shams Naturals CMS Admin Panel
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#9dbf93] focus:border-[#9dbf93] focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9dbf93] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

