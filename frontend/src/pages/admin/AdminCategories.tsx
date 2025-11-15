import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/api'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  is_active: boolean
  order: number
  subcategories?: any[]
  image_url?: string
  banner_url?: string
  products_count?: number
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: '0',
    is_active: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.categories.getAll()
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await adminAPI.categories.delete(id)
      fetchCategories()
    } catch (error) {
      alert('Error deleting category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      description: category.description || '',
      order: category.order?.toString() || '0',
      is_active: category.is_active !== false,
    })
    setImageFile(null)
    setBannerFile(null)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('order', formData.order)
      submitData.append('is_active', formData.is_active.toString())
      if (imageFile) {
        submitData.append('image', imageFile)
      }
      if (bannerFile) {
        submitData.append('banner', bannerFile)
      }

      if (editingCategory) {
        await adminAPI.categories.update(editingCategory.id, submitData)
      } else {
        await adminAPI.categories.create(submitData)
      }

      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '', order: '0', is_active: true })
      setImageFile(null)
      setBannerFile(null)
      fetchCategories()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving category')
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  const getSubcategoryCount = (cat: Category) => cat.subcategories?.length ?? 0

  const getStatusStyles = (active: boolean) =>
    active
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-red-50 text-red-700 border border-red-200'

  const navigate = useNavigate()

  const handleViewProducts = (categoryId: number) => {
    navigate(`/admin/categories/${categoryId}/products`)
  }

  const handleAddProduct = (categoryId: number) => {
    navigate(`/admin/products/new?category=${categoryId}`)
  }

  const renderImage = (src?: string) => {
    if (!src) {
      return (
        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
          —
        </div>
      )
    }
    return (
      <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100">
        <img src={src} alt="" className="w-full h-full object-cover" />
      </div>
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 tracking-[0.35em] uppercase">
            Category
          </p>
          <h2 className="text-3xl font-semibold text-gray-900">Shams Category Library</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage the complete list of bag categories, sub-levels, and assets.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/admin/categories/priority')}
            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <span className="text-green-600">⇅</span> Set Priority
          </button>
          <button
            onClick={() => navigate('/admin/categories/new')}
            className="bg-[#2c7a4b] text-white font-semibold rounded-full px-5 py-2 shadow hover:bg-[#25633d]"
          >
            + Add Category
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">List of all category</h3>
            <p className="text-sm text-gray-500">
              Showing {filteredCategories.length} of {categories.length} entries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500">Show</label>
            <select className="border border-gray-200 rounded-md px-2 py-1 text-sm text-gray-700">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search category"
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[#2c7a4b]/50 focus:border-[#2c7a4b]"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sub Category Level 1+</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Banner</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredCategories.map((category, idx) => (
                <tr
                  key={category.id}
                  className={!category.is_active ? 'bg-red-50/40' : 'bg-white'}
                >
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700">{idx + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {renderImage(category.image_url)}
                      <div>
                        <p className="font-semibold text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500">Slug: {category.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {getSubcategoryCount(category) > 0 ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#2c7a4b]">
                        • {getSubcategoryCount(category)} active
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-base font-semibold text-gray-800">
                        {category.products_count ?? 0}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewProducts(category.id)}
                          className="px-3 py-1 text-xs font-semibold rounded-full border border-[#2c7a4b] text-[#2c7a4b] hover:bg-[#2c7a4b]/10"
                        >
                          View Products
                        </button>
                        <button
                          onClick={() => handleAddProduct(category.id)}
                          className="px-3 py-1 text-xs font-semibold rounded-full bg-[#2c7a4b] text-white hover:bg-[#25633d]"
                        >
                          Add Products
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">{renderImage(category.image_url)}</td>
                  <td className="px-4 py-4">{renderImage(category.banner_url)}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                      {category.order ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(category.is_active)}`}>
                      <span className="text-sm">{category.is_active ? '🟢' : '🔴'}</span>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-[#2563eb] hover:text-[#1e40af] text-sm font-semibold"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-[#dc2626] hover:text-[#b91c1c] text-sm font-semibold"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No categories match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
          <span>
            Showing 1 to {Math.min(filteredCategories.length, 10)} of {filteredCategories.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded-lg text-gray-500 hover:bg-gray-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 rounded-lg bg-[#2c7a4b] text-white">1</button>
            <button className="px-3 py-1 border rounded-lg text-gray-500 hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 border rounded-lg text-gray-500 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full"
                />
                <p className="text-xs text-gray-400 mt-1">Recommended 450px × 535px</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category Banner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full"
                />
                <p className="text-xs text-gray-400 mt-1">Recommended 1920px × 410px</p>
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
                    setEditingCategory(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-md"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategories
