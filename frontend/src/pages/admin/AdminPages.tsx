import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import RichTextEditor from '../../components/admin/RichTextEditor'
import ImageUpload from '../../components/admin/ImageUpload'

interface Page {
  id: number
  title: string
  slug: string
  images?: {
    main_image?: string
    decorative_image_1?: string
    decorative_image_2?: string
  }
  is_active: boolean
}

const AdminPages = () => {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true,
  })
  const [imageFiles, setImageFiles] = useState<{
    main_image: File | null
    decorative_image_1: File | null
    decorative_image_2: File | null
  }>({
    main_image: null,
    decorative_image_1: null,
    decorative_image_2: null,
  })
  const [uploadingImages, setUploadingImages] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await adminAPI.pages.getAll()
      setPages(response.data)
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      await adminAPI.pages.delete(id)
      fetchPages()
    } catch (error) {
      alert('Error deleting page')
    }
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    adminAPI.pages.getById(page.id).then((response) => {
      const data = response.data
      setFormData({
        title: data.title || '',
        content: data.content || '',
        is_active: data.is_active !== false,
      })
      setImageFiles({
        main_image: null,
        decorative_image_1: null,
        decorative_image_2: null,
      })
      setShowModal(true)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setUploadingImages(true)
      let pageId: number

      if (editingPage) {
        await adminAPI.pages.update(editingPage.id, formData)
        pageId = editingPage.id
      } else {
        const response = await adminAPI.pages.create(formData)
        pageId = response.data.id
      }

      // Upload images
      const uploadPromises = []
      if (imageFiles.main_image) {
        const formData = new FormData()
        formData.append('image', imageFiles.main_image)
        formData.append('image_type', 'main_image')
        uploadPromises.push(adminAPI.pages.uploadImage(pageId, formData))
      }
      if (imageFiles.decorative_image_1) {
        const formData = new FormData()
        formData.append('image', imageFiles.decorative_image_1)
        formData.append('image_type', 'decorative_image_1')
        uploadPromises.push(adminAPI.pages.uploadImage(pageId, formData))
      }
      if (imageFiles.decorative_image_2) {
        const formData = new FormData()
        formData.append('image', imageFiles.decorative_image_2)
        formData.append('image_type', 'decorative_image_2')
        uploadPromises.push(adminAPI.pages.uploadImage(pageId, formData))
      }

      await Promise.all(uploadPromises)

      setShowModal(false)
      setEditingPage(null)
      setFormData({ title: '', content: '', is_active: true })
      setImageFiles({
        main_image: null,
        decorative_image_1: null,
        decorative_image_2: null,
      })
      fetchPages()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving page')
    } finally {
      setUploadingImages(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Pages Management</h2>
        <button
          onClick={() => {
            setEditingPage(null)
            setFormData({ title: '', content: '', is_active: true })
            setImageFiles({
              main_image: null,
              decorative_image_1: null,
              decorative_image_2: null,
            })
            setShowModal(true)
          }}
          className="btn-primary px-4 py-2"
        >
          Add New Page
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${page.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {page.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(page)}
                    className="text-[#1f4b2b] hover:text-[#0b2f19]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
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
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingPage ? 'Edit Page' : 'Add New Page'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Enter page content..."
                />
              </div>

              {/* Image Upload Section */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-lg font-semibold mb-4">Page Images</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ImageUpload
                    label="Main Image (Right Column)"
                    value={editingPage?.images?.main_image || null}
                    onChange={(file) => setImageFiles({ ...imageFiles, main_image: file })}
                    onRemove={editingPage ? async () => {
                      try {
                        await adminAPI.pages.removeImage(editingPage.id, 'main_image')
                        fetchPages()
                        const response = await adminAPI.pages.getById(editingPage.id)
                        setEditingPage({ ...editingPage, images: response.data.images })
                      } catch (error) {
                        alert('Error removing image')
                      }
                    } : undefined}
                    placeholder="Upload main product image"
                  />
                  <ImageUpload
                    label="Decorative Image 1 (about02)"
                    value={editingPage?.images?.decorative_image_1 || null}
                    onChange={(file) => setImageFiles({ ...imageFiles, decorative_image_1: file })}
                    onRemove={editingPage ? async () => {
                      try {
                        await adminAPI.pages.removeImage(editingPage.id, 'decorative_image_1')
                        fetchPages()
                        const response = await adminAPI.pages.getById(editingPage.id)
                        setEditingPage({ ...editingPage, images: response.data.images })
                      } catch (error) {
                        alert('Error removing image')
                      }
                    } : undefined}
                    placeholder="Upload decorative image 1"
                  />
                  <ImageUpload
                    label="Decorative Image 2 (about03)"
                    value={editingPage?.images?.decorative_image_2 || null}
                    onChange={(file) => setImageFiles({ ...imageFiles, decorative_image_2: file })}
                    onRemove={editingPage ? async () => {
                      try {
                        await adminAPI.pages.removeImage(editingPage.id, 'decorative_image_2')
                        fetchPages()
                        const response = await adminAPI.pages.getById(editingPage.id)
                        setEditingPage({ ...editingPage, images: response.data.images })
                      } catch (error) {
                        alert('Error removing image')
                      }
                    } : undefined}
                    placeholder="Upload decorative image 2"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Main Image: Displays in the right column. Decorative Images: Background illustrations (about02 & about03).
                </p>
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
                    setEditingPage(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImages}
                  className="btn-primary px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImages ? 'Saving...' : editingPage ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPages
