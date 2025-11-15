import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/api'

const AdminCategoryCreate = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Category name is required.')
      return
    }
    if (!imageFile) {
      setError('Category image is required.')
      return
    }
    if (!bannerFile) {
      setError('Category banner is required.')
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('is_active', 'true')
      formData.append('order', '0')
      formData.append('image', imageFile)
      formData.append('banner', bannerFile)

      await adminAPI.categories.create(formData)
      navigate('/admin/categories')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <button className="text-[#2c7a4b]" onClick={() => navigate('/admin/categories')}>
          Category
        </button>
        <span>/</span>
        <span className="text-gray-400">Add Category</span>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Add Category</h1>
        <p className="text-gray-500 mt-1">Upload the display image and banner for your new category.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c7a4b]/50"
              placeholder="Type Category Name..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Category Image <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-[#e3f2ea] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1f4b2c]"
              />
            </div>
            <p className="text-xs text-gray-500">Image Size : 450px * 535px</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Category Banner <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-[#e3f2ea] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1f4b2c]"
              />
            </div>
            <p className="text-xs text-gray-500">Image Size : 1920px * 410px</p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0097b2] hover:bg-[#007f95] text-white font-semibold px-6 py-3 rounded-lg shadow disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Form'}
            </button>
            <button
              type="button"
              className="text-gray-500 font-semibold"
              onClick={() => navigate('/admin/categories')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminCategoryCreate


