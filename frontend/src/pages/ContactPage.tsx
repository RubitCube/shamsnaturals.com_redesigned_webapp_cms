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
            <h3 className="text-xl font-semibold mb-4">Dubai Office</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Address:</strong> Dubai Address, Dubai, UAE
              </p>
              <p>
                <strong>Dubai Safezone:</strong> Dubai Safezone Address, Dubai, UAE
              </p>
              <p>
                <strong>Phone:</strong> +971 XX XXX XXXX
              </p>
              <p>
                <strong>Email:</strong> dubai@shamsnaturals.com
              </p>
            </div>
          </div>

          {/* Poland Office */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4">Poland Office</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Address:</strong> Poland Address, Poland
              </p>
              <p>
                <strong>Poland Safezone:</strong> Poland Safezone Address, Poland
              </p>
              <p>
                <strong>Phone:</strong> +48 XX XXX XXXX
              </p>
              <p>
                <strong>Email:</strong> poland@shamsnaturals.com
              </p>
            </div>
          </div>

          {/* Dealer Login Button */}
          <div className="card p-6 bg-primary-50">
            <h3 className="text-xl font-semibold mb-4">Dealer Portal</h3>
            <p className="text-gray-700 mb-4">
              Access your dealer account to manage orders and view exclusive content.
            </p>
            <button className="btn-primary w-full">
              Dealer Login
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default ContactPage

