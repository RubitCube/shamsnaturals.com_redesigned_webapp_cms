import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'

interface Banner {
  id: number
  title?: string
  description?: string
  image_path: string
  link?: string
  page?: string
  order: number
  is_active: boolean
}

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    page: 'homepage',
    order: '0',
    is_active: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await adminAPI.banners.getAll()
      setBanners(response.data)
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      await adminAPI.banners.delete(id)
      fetchBanners()
    } catch (error) {
      alert('Error deleting banner')
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    const bannerPage = (banner as any).page || 'homepage'
    console.log('Editing banner:', banner, 'Page:', bannerPage)
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      link: banner.link || '',
      page: bannerPage,
      order: banner.order?.toString() || '0',
      is_active: banner.is_active !== false,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('link', formData.link)
      submitData.append('page', formData.page)
      submitData.append('order', formData.order)
      submitData.append('is_active', formData.is_active ? '1' : '0')
      if (imageFile) {
        submitData.append('image', imageFile)
      }

      if (editingBanner) {
        const response = await adminAPI.banners.update(editingBanner.id, submitData)
        console.log('Banner updated:', response.data)
      } else {
        const response = await adminAPI.banners.create(submitData)
        console.log('Banner created:', response.data)
      }

      setShowModal(false)
      setEditingBanner(null)
      setFormData({ title: '', description: '', link: '', page: 'homepage', order: '0', is_active: true })
      setImageFile(null)
      fetchBanners()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving banner')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Banners Management</h2>
        <button
          onClick={() => {
            setEditingBanner(null)
            setFormData({ title: '', description: '', link: '', page: 'homepage', order: '0', is_active: true })
            setImageFile(null)
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Add New Banner
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Page</label>
        <select
          onChange={(e) => {
            const page = e.target.value
            if (page === 'all') {
              fetchBanners()
            } else {
              adminAPI.banners.getAll().then((response) => {
                const allBanners = response.data
                const filtered = page === '' 
                  ? allBanners.filter((b: any) => !b.page || b.page === 'homepage')
                  : allBanners.filter((b: any) => b.page === page)
                setBanners(filtered)
              })
            }
          }}
          className="block w-full max-w-xs border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">All Banners</option>
          <option value="">Homepage (default)</option>
          <option value="about">About Us</option>
          <option value="new-arrivals">New Arrivals</option>
          <option value="dealers">Dealers</option>
          <option value="contact">Contact</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => {
          const imageUrl = banner.image_path.startsWith('http')
            ? banner.image_path
            : `http://localhost:8000/storage/${banner.image_path}`
          return (
            <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden">
              <img src={imageUrl} alt={banner.title || 'Banner'} className="w-full h-48 object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{banner.title || 'No Title'}</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {(banner as any).page || 'homepage'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{banner.description}</p>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="text-primary-600 hover:text-primary-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingBanner ? 'Edit Banner' : 'Add New Banner'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700">Link URL</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Page *</label>
                <select
                  required
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="homepage">Homepage</option>
                  <option value="about">About Us</option>
                  <option value="new-arrivals">New Arrivals</option>
                  <option value="dealers">Dealers</option>
                  <option value="contact">Contact</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {editingBanner ? 'New Image (optional)' : 'Image *'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required={!editingBanner}
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
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
                    setEditingBanner(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {editingBanner ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBanners
