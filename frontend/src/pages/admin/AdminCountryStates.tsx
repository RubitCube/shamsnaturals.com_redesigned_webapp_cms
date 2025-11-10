import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { adminAPI } from '../../services/api'

interface Country {
  id: number
  name: string
  is_active: boolean
}

interface StateItem {
  id: number
  name: string
  slug: string
  is_active: boolean
  country_id: number
}

interface Meta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const perPageOptions = [10, 25, 50, 100]

const AdminCountryStates = () => {
  const { countryId } = useParams<{ countryId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [country, setCountry] = useState<Country | null>(null)
  const [states, setStates] = useState<StateItem[]>([])
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
  const [editingState, setEditingState] = useState<StateItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    if (!countryId) return
    fetchStates()
  }, [countryId, page, perPage, debouncedSearch])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('mode') === 'add' && country) {
      openModal()
    }
  }, [location.search, country])

  const fetchStates = async () => {
    if (!countryId) return
    setLoading(true)
    try {
      const response = await adminAPI.states.getByCountry(Number(countryId), {
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
      })

      const { data, meta: metaData, country: countryInfo } = response.data
      setStates(data || [])
      setMeta({
        current_page: metaData.current_page,
        last_page: metaData.last_page,
        per_page: metaData.per_page,
        total: metaData.total,
      })
      setCountry(countryInfo)
    } catch (error) {
      console.error('Error fetching states:', error)
      alert('Unable to fetch states for this country.')
      navigate('/admin/countries')
    } finally {
      setLoading(false)
    }
  }

  const totalFrom = useMemo(() => {
    if (!states.length) return 0
    return (meta.current_page - 1) * meta.per_page + 1
  }, [states.length, meta.current_page, meta.per_page])

  const totalTo = useMemo(() => {
    return (meta.current_page - 1) * meta.per_page + states.length
  }, [states.length, meta.current_page, meta.per_page])

  const openModal = (stateItem?: StateItem) => {
    if (stateItem) {
      setEditingState(stateItem)
      setFormData({
        name: stateItem.name,
        is_active: stateItem.is_active,
      })
    } else {
      setEditingState(null)
      setFormData({
        name: '',
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingState(null)
    setFormData({ name: '', is_active: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!countryId || !country) return

    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        is_active: formData.is_active,
        country_id: country.id,
      }

      if (editingState) {
        await adminAPI.states.update(editingState.id, payload)
      } else {
        await adminAPI.states.create(Number(countryId), payload)
      }

      closeModal()
      fetchStates()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving state')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (stateItem: StateItem) => {
    try {
      const response = await adminAPI.states.toggleStatus(stateItem.id)
      setStates((prev) =>
        prev.map((item) => (item.id === stateItem.id ? response.data : item))
      )
    } catch (error) {
      alert('Failed to update status')
    }
  }

  if (loading && !country) {
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
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">
              States (Emirates){' '}
              {country ? (
                <span className="text-primary-600">— {country.name}</span>
              ) : null}
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            Manage states / emirates associated with the selected country (region).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/admin/countries"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm text-center"
          >
            ← Back to Countries
          </Link>
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
              placeholder="Search states..."
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
            + Add State (Emirate)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                State (Emirate) Name
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
            {states.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-500">
                  No states found for this country.
                </td>
              </tr>
            ) : (
              states.map((stateItem, index) => (
                <tr key={stateItem.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(meta.current_page - 1) * meta.per_page + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stateItem.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(stateItem)}
                      className="focus:outline-none"
                      title={stateItem.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <span
                        className={`text-2xl ${
                          stateItem.is_active ? 'text-green-500' : 'text-red-400'
                        }`}
                      >
                        💡
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => openModal(stateItem)}
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
          Showing {states.length ? `${totalFrom} to ${totalTo}` : '0'} of {meta.total} entries
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

      {showModal && country && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              {editingState ? 'Modify State (Emirate)' : 'Add State (Emirate)'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country (Region) Name
                </label>
                <input
                  type="text"
                  value={country.name}
                  disabled
                  className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State (Region) Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter state / emirate name"
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
                  {saving ? 'Saving...' : editingState ? 'Update State' : 'Create State'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCountryStates

