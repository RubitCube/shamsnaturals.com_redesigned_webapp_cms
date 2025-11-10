import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  is_active: boolean
  order: number
  subcategories?: any[]
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: '0',
    is_active: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

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

      if (editingCategory) {
        await adminAPI.categories.update(editingCategory.id, submitData)
      } else {
        await adminAPI.categories.create(submitData)
      }

      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '', order: '0', is_active: true })
      setImageFile(null)
      fetchCategories()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving category')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Categories Management</h2>
        <button
          onClick={() => {
            setEditingCategory(null)
            setFormData({ name: '', description: '', order: '0', is_active: true })
            setImageFile(null)
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Add New Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subcategories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.subcategories?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
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
                    setEditingCategory(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
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
