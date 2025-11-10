import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'

interface Dealer {
  id: number
  company_name: string
  contact_person: string
  email: string
  phone?: string
  address: string
  city: string
  state: string
  country: string
  postal_code?: string
  latitude?: number
  longitude?: number
  is_active: boolean
}

const AdminDealers = () => {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null)
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    description: '',
    is_active: true,
  })

  useEffect(() => {
    fetchDealers()
  }, [])

  const fetchDealers = async () => {
    try {
      const response = await adminAPI.dealers.getAll()
      setDealers(response.data)
    } catch (error) {
      console.error('Error fetching dealers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dealer?')) return

    try {
      await adminAPI.dealers.delete(id)
      fetchDealers()
    } catch (error) {
      alert('Error deleting dealer')
    }
  }

  const handleEdit = (dealer: Dealer) => {
    setEditingDealer(dealer)
    setFormData({
      company_name: dealer.company_name || '',
      contact_person: dealer.contact_person || '',
      email: dealer.email || '',
      phone: dealer.phone || '',
      address: dealer.address || '',
      city: dealer.city || '',
      state: dealer.state || '',
      country: dealer.country || '',
      postal_code: dealer.postal_code || '',
      description: '',
      is_active: dealer.is_active !== false,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingDealer) {
        await adminAPI.dealers.update(editingDealer.id, formData)
      } else {
        await adminAPI.dealers.create(formData)
      }

      setShowModal(false)
      setEditingDealer(null)
      setFormData({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        description: '',
        is_active: true,
      })
      fetchDealers()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving dealer')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Dealers Management</h2>
        <button
          onClick={() => {
            setEditingDealer(null)
            setFormData({
              company_name: '',
              contact_person: '',
              email: '',
              phone: '',
              address: '',
              city: '',
              state: '',
              country: '',
              postal_code: '',
              description: '',
              is_active: true,
            })
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Add New Dealer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dealers.map((dealer) => (
              <tr key={dealer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{dealer.company_name}</div>
                  <div className="text-sm text-gray-500">{dealer.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{dealer.contact_person}</div>
                  {dealer.phone && <div className="text-sm text-gray-500">{dealer.phone}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{dealer.city}, {dealer.state}</div>
                  <div className="text-sm text-gray-500">{dealer.country}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${dealer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {dealer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(dealer)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dealer.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingDealer ? 'Edit Dealer' : 'Add New Dealer'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingDealer(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {editingDealer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDealers
