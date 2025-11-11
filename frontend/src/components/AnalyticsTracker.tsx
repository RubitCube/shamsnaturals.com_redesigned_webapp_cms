import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analyticsAPI } from '../services/api'

const AnalyticsTracker = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      return
    }

    const payload = {
      path: location.pathname + location.search,
      title: document.title,
      referrer: document.referrer || undefined,
    }

    const sendVisit = async () => {
      try {
        if (navigator.sendBeacon) {
          const url = `${analyticsAPIEndpoint('/analytics/visit')}`
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
          navigator.sendBeacon(url, blob)
        } else {
          await analyticsAPI.logVisit(payload)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.debug('Analytics visit logging failed', error)
      }
    }

    sendVisit()
  }, [location])

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const anchor = target.closest('a')
      if (!(anchor instanceof HTMLAnchorElement)) return

      const href = anchor.getAttribute('href')
      if (!href) return

      analyticsAPI.logEvent({
        event_type: 'link_click',
        path: location.pathname,
        label: href,
        referrer: document.location.href,
      }).catch(() => {
        // Ignore analytics error
      })
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [location.pathname])

  return null
}

const analyticsAPIEndpoint = (path: string) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
  return `${baseURL}${path}`
}

export default AnalyticsTracker


