import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/api'

interface Country {
  id: number
  name: string
  code?: string
  slug: string
  is_active: boolean
  states_count: number
}

interface Meta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const perPageOptions = [10, 25, 50, 100]

const AdminCountries = () => {
  const [countries, setCountries] = useState<Country[]>([])
  const [meta, setMeta] = useState<Meta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    fetchCountries()
  }, [page, perPage, debouncedSearch])

  const fetchCountries = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.countries.getAll({
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
      })
      const data = response.data
      setCountries(data.data || [])
      setMeta({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
      })
    } catch (error) {
      console.error('Error fetching countries:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalFrom = useMemo(() => {
    if (!countries.length) return 0
    return (meta.current_page - 1) * meta.per_page + 1
  }, [countries.length, meta.current_page, meta.per_page])

  const totalTo = useMemo(() => {
    return (meta.current_page - 1) * meta.per_page + countries.length
  }, [countries.length, meta.current_page, meta.per_page])

  const openModal = (country?: Country) => {
    if (country) {
      setEditingCountry(country)
      setFormData({
        name: country.name,
        code: country.code || '',
        is_active: country.is_active,
      })
    } else {
      setEditingCountry(null)
      setFormData({
        name: '',
        code: '',
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCountry(null)
    setFormData({ name: '', code: '', is_active: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        is_active: formData.is_active,
      }

      if (editingCountry) {
        await adminAPI.countries.update(editingCountry.id, payload)
      } else {
        await adminAPI.countries.create(payload)
      }

      closeModal()
      fetchCountries()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving country')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (country: Country) => {
    try {
      const response = await adminAPI.countries.toggleStatus(country.id)
      setCountries((prev) =>
        prev.map((item) => (item.id === country.id ? response.data : item))
      )
    } catch (error) {
      alert('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Countries (Regions)</h2>
          <p className="text-sm text-gray-600">
            Manage countries/regions and their states (emirates)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show</label>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search countries..."
              className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-64"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 whitespace-nowrap"
          >
            + Add Country (Region)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Country (Region)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                States (Emirates)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {countries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                  No countries found.
                </td>
              </tr>
            ) : (
              countries.map((country, index) => (
                <tr key={country.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(meta.current_page - 1) * meta.per_page + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{country.name}</div>
                    {country.code && (
                      <div className="text-xs text-gray-500 uppercase">Code: {country.code}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="font-semibold">{country.states_count}</span>
                      <button
                        onClick={() => navigate(`/admin/countries/${country.id}/states`)}
                        className="text-primary-600 hover:text-primary-800 text-xs font-semibold"
                      >
                        View States
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() =>
                          navigate(`/admin/countries/${country.id}/states?mode=add`)
                        }
                        className="text-primary-600 hover:text-primary-800 text-xs font-semibold"
                      >
                        + Add State
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(country)}
                      className="focus:outline-none"
                      title={country.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <span
                        className={`text-2xl ${
                          country.is_active ? 'text-green-500' : 'text-red-400'
                        }`}
                      >
                        💡
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => openModal(country)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 text-sm text-gray-600">
        <div>
          Showing {countries.length ? `${totalFrom} to ${totalTo}` : '0'} of {meta.total} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={meta.current_page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span>
            Page {meta.current_page} of {meta.last_page}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, meta.last_page))}
            disabled={meta.current_page === meta.last_page}
            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              {editingCountry ? 'Modify Country (Region)' : 'Add Country (Region)'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country (Region) Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter country / region name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
                  placeholder="e.g., AE"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editingCountry ? 'Update Country' : 'Create Country'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCountries

