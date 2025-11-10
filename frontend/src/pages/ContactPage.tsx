import { useState, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { contactAPI, bannersAPI } from '../services/api'
import BannerCarousel from '../components/BannerCarousel'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [banners, setBanners] = useState<any[]>([])
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannersAPI.getByPage('contact')
        setBanners(response.data)
      } catch (error) {
        console.error('Error fetching banners:', error)
      }
    }

    fetchBanners()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification')
      return
    }

    setLoading(true)

    try {
      await contactAPI.submit({
        ...formData,
        recaptcha_token: recaptchaToken,
      })
      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
      setRecaptchaToken(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit contact form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Banner Carousel */}
      {banners && banners.length > 0 && (
        <BannerCarousel banners={banners} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {recaptchaSiteKey && (
              <div>
                <ReCAPTCHA
                  sitekey={recaptchaSiteKey}
                  onChange={handleRecaptchaChange}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Contact Cards */}
        <div className="space-y-6">
          {/* Dubai Office */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-700 uppercase tracking-wide">
              Dubai Address:
            </h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <p className="font-semibold text-gray-900 uppercase">
                  Shams Bag Industries LLC
                </p>
                <p>Warehouse No. 1,</p>
                <p>Al Qusais Industrial Area 4,</p>
                <p>Dubai, UAE.</p>
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-2">
                  <span aria-hidden="true">📞</span>
                  <span>+971 42 673449</span>
                </p>
                <p className="flex items-center gap-2">
                  <span aria-hidden="true">📞</span>
                  <span>+971 55 1906177</span>
                </p>
              </div>
              <hr className="border-gray-200 my-4" />
              <div className="space-y-1">
                <p className="font-semibold text-primary-700 uppercase tracking-wide">
                  Warehouse Address:
                </p>
                <p className="font-semibold text-gray-900 uppercase">Saifzone Sharjah</p>
                <p className="font-semibold text-gray-900 uppercase">Shams Bag Industries LLC</p>
                <p>Q4-003, Saif Zone,</p>
                <p>Sharjah, UAE</p>
              </div>
            </div>
          </div>

          {/* Poland Office */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-700 uppercase tracking-wide">
              Poland Address:
            </h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <p className="font-semibold text-gray-900 uppercase">
                  Shams Naturals Sp. z.o.o
                </p>
                <p>Marcina Kasprzaka 31, Room 119,</p>
                <p>Warsaw, Post Code 00-123,</p>
                <p>Poland</p>
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-2">
                  <span aria-hidden="true">📞</span>
                  <span>+48 578 625 210</span>
                </p>
                <p className="flex items-center gap-2">
                  <span aria-hidden="true">📞</span>
                  <span>+48 795 876 741</span>
                </p>
              </div>
              <hr className="border-gray-200 my-4" />
              <div className="space-y-1">
                <p className="font-semibold text-primary-700 uppercase tracking-wide">
                  Warehouse Address:
                </p>
                <p className="font-semibold text-gray-900 uppercase">Poland</p>
                <p>Lodz, 93-231, at 3B Dostawcza Street.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      </div>
    </div>
  )
}

export default ContactPage

