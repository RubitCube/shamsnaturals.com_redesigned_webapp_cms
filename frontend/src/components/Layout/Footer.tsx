import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { analyticsAPI } from '../../services/api'
import logo from '../../assets/company_logo_image/shamsnaturals-logo.png'

const Footer = () => {
  const { t } = useTranslation()
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
    <footer className="bg-[#f3eadc] text-[#1f2d1c] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <a
              href="https://shamsnaturals.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Shams Naturals Website"
              className="inline-flex"
            >
              <img
                src={logo}
                alt="Shams Naturals"
                className="h-16 w-auto object-contain mb-4"
                loading="lazy"
                width={160}
                height={48}
              />
            </a>
            <p className="text-sm">
              {t('footer.companyDescription')}
            </p>
            <div className="mt-4 text-sm text-[#4a7c28]">
              <p className="font-semibold">{t('footer.liveVisitorCount')}</p>
              <p>{t('footer.totalVisits')}: {totalVisits !== null ? totalVisits.toLocaleString() : '—'}</p>
              <p>{t('footer.today')}: {todayVisits !== null ? todayVisits.toLocaleString() : '—'}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#1a4a2a] font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="transition-colors hover:text-[#6ea766]">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="transition-colors hover:text-[#6ea766]">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="transition-colors hover:text-[#6ea766]">
                  {t('nav.newArrivals')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-[#6ea766]">
                  {t('nav.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-[#1a4a2a] font-semibold mb-4">{t('footer.information')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dealers" className="transition-colors hover:text-[#6ea766]">
                  {t('footer.dealerNetwork')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition-colors hover:text-[#6ea766]">
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-[#6ea766]">
                  {t('footer.contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[#1a4a2a] font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                {t('footer.email')}:{' '}
                <a
                  href="mailto:info@shamsnaturals.com"
                  className="text-[#1a4a2a] hover:text-[#4a7c28] transition-colors underline-offset-2 hover:underline"
                >
                  info@shamsnaturals.com
                </a>
              </li>
              <li>
                {t('footer.phone')}:{' '}
                <a
                  href="tel:+971551906177"
                  className="text-[#1a4a2a] hover:text-[#4a7c28] transition-colors"
                >
                  +971 55 190 6177
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#d7ccb9] mt-8 pt-8 text-center text-sm space-y-2">
          <p>&copy; {new Date().getFullYear()} Shams Naturals. {t('footer.allRightsReserved')}</p>
          <p className="text-xs text-gray-600">
            {t('footer.websiteDesignedBy')}{' '}
            <a
              href="https://rubitcube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1a4a2a] hover:text-[#4a7c28] underline-offset-2 hover:underline transition-colors"
            >
              RubitCube
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

