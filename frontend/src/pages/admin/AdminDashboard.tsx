import { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '../../services/api'

type AnalyticsSummary = {
  totals: {
    visits: number
    visits_today: number
    link_clicks: number
  }
  cms_stats: {
    products: number
    categories: number
    dealers: number
    countries: number
    events: number
    blogs: number
  }
  visits_per_day: Array<{ day: string; total: number }>
  top_pages: Array<{ path: string; total: number }>
  top_links: Array<{ label: string; total: number }>
}

const AdminDashboard = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchSummary = async () => {
      try {
        const response = await adminAPI.analytics.getSummary()
        if (!isMounted) return
        setSummary(response.data)
        setError(null)
      } catch (err) {
        if (!isMounted) return
        setError('Unable to load analytics. Please try again later.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSummary()
    const interval = setInterval(fetchSummary, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const chartData = useMemo(() => {
    if (!summary || !summary.visits_per_day.length) {
      return { bars: [], max: 0 }
    }

    const max = Math.max(...summary.visits_per_day.map((item) => item.total)) || 1
    const bars = summary.visits_per_day.map((item) => ({
      day: new Date(item.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: item.total,
      height: Math.round((item.total / max) * 100),
    }))

    return { bars, max }
  }, [summary])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
        <span className="text-sm text-gray-500">Auto-refreshes every 30 seconds</span>
      </div>

      {summary && (
        <>
          {/* CMS Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">CMS Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatsCard
                title="Products"
                value={summary.cms_stats.products}
                icon="📦"
                color="bg-blue-50 border-blue-200"
                textColor="text-blue-700"
              />
              <StatsCard
                title="Categories"
                value={summary.cms_stats.categories}
                icon="📂"
                color="bg-purple-50 border-purple-200"
                textColor="text-purple-700"
              />
              <StatsCard
                title="Dealers"
                value={summary.cms_stats.dealers}
                icon="🏢"
                color="bg-green-50 border-green-200"
                textColor="text-green-700"
              />
              <StatsCard
                title="Countries"
                value={summary.cms_stats.countries}
                icon="🌍"
                color="bg-indigo-50 border-indigo-200"
                textColor="text-indigo-700"
              />
              <StatsCard
                title="Events"
                value={summary.cms_stats.events}
                icon="📅"
                color="bg-pink-50 border-pink-200"
                textColor="text-pink-700"
              />
              <StatsCard
                title="Blogs"
                value={summary.cms_stats.blogs}
                icon="✍️"
                color="bg-orange-50 border-orange-200"
                textColor="text-orange-700"
              />
            </div>
          </div>

          {/* Live Analytics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Site Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnalyticsCard
                title="Total Visits"
                value={summary.totals.visits}
                subtitle="All-time"
                accent="bg-primary-100 text-primary-700"
              />
              <AnalyticsCard
                title="Visits Today"
                value={summary.totals.visits_today}
                subtitle="Last 24 hours"
                accent="bg-emerald-100 text-emerald-700"
              />
              <AnalyticsCard
                title="Link Clicks"
                value={summary.totals.link_clicks}
                subtitle="All-time"
                accent="bg-amber-100 text-amber-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Visits (Last 7 Days)</h3>
                <span className="text-xs text-gray-500">{chartData.max} max / day</span>
              </div>
              {chartData.bars.length ? (
                <div className="h-56 flex items-end gap-4">
                  {chartData.bars.map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-2">{bar.value}</div>
                      <div
                        className="w-full max-w-[32px] bg-gradient-to-t from-primary-500 via-primary-400 to-primary-300 rounded-t"
                        style={{ height: `${Math.max(bar.height, 8)}%` }}
                        title={`${bar.day}: ${bar.value} visits`}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2 text-center">{bar.day}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Not enough data yet.</div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Visited Pages</h3>
              {summary.top_pages.length ? (
                <ul className="space-y-3">
                  {summary.top_pages.map((item) => (
                    <li key={item.path} className="flex justify-between items-center text-sm">
                      <span className="truncate pr-4 text-gray-700">{item.path || '/'}</span>
                      <span className="text-gray-500">{item.total.toLocaleString()} visits</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No page traffic recorded yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Link Clicks</h3>
            {summary.top_links.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Link / Label
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {summary.top_links.map((item, idx) => (
                      <tr key={`${item.label}-${idx}`}>
                        <td className="px-4 py-2 text-gray-700 truncate max-w-[320px]">
                          {item.label || '—'}
                        </td>
                        <td className="px-4 py-2 text-gray-500">{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No link click data recorded yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const AnalyticsCard = ({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string
  value: number
  subtitle: string
  accent: string
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <p className="text-sm text-gray-500 uppercase tracking-wide">{title}</p>
    <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
    <span className={`inline-flex mt-4 px-3 py-1 text-xs font-semibold rounded-full ${accent}`}>
      {subtitle}
    </span>
  </div>
)

const StatsCard = ({
  title,
  value,
  icon,
  color,
  textColor,
}: {
  title: string
  value: number
  icon: string
  color: string
  textColor: string
}) => (
  <div className={`rounded-lg border-2 p-4 ${color}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      <span className={`text-2xl font-bold ${textColor}`}>{value}</span>
    </div>
    <p className={`text-sm font-medium ${textColor}`}>{title}</p>
  </div>
)

export default AdminDashboard

