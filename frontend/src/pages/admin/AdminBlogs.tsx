import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface Blog {
  id: number
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at?: string
  is_published: boolean
}

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    published_at: '',
    is_published: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const response = await adminAPI.blogs.getAll()
      setBlogs(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      await adminAPI.blogs.delete(id)
      fetchBlogs()
    } catch (error) {
      alert('Error deleting blog')
    }
  }

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog)
    adminAPI.blogs.getById(blog.id).then((response) => {
      const data = response.data
      setFormData({
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        published_at: data.published_at || '',
        is_published: data.is_published || false,
      })
      setShowModal(true)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('excerpt', formData.excerpt)
      submitData.append('content', formData.content)
      submitData.append('published_at', formData.published_at)
      submitData.append('is_published', formData.is_published.toString())
      if (imageFile) {
        submitData.append('featured_image', imageFile)
      }

      if (editingBlog) {
        await adminAPI.blogs.update(editingBlog.id, submitData)
      } else {
        await adminAPI.blogs.create(submitData)
      }

      setShowModal(false)
      setEditingBlog(null)
      setFormData({ title: '', excerpt: '', content: '', published_at: '', is_published: false })
      setImageFile(null)
      fetchBlogs()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving blog')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Blogs Management</h2>
        <button
          onClick={() => {
            setEditingBlog(null)
            setFormData({ title: '', excerpt: '', content: '', published_at: '', is_published: false })
            setImageFile(null)
            setShowModal(true)
          }}
          className="btn-primary px-4 py-2"
        >
          Add New Blog
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                  {blog.excerpt && <div className="text-sm text-gray-500">{blog.excerpt.substring(0, 100)}...</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${blog.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {blog.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
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
              {editingBlog ? 'Edit Blog' : 'Add New Blog'}
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
                <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Enter blog content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {editingBlog ? 'New Featured Image (optional)' : 'Featured Image'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required={!editingBlog}
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Published Date</label>
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="mr-2"
                  />
                  Published
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingBlog(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-md"
                >
                  {editingBlog ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBlogs
