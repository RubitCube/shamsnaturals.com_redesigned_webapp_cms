import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminAPI } from '../../services/api'
import { translateCategoryName } from '../../utils/categoryTranslations'

interface Category {
  id: number
  name: string
  order: number
  image_url?: string
  banner_url?: string
}

const AdminCategoryPriority = () => {
  const { t } = useTranslation("translation");
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.categories.getAll()
      setCategories(response.data)
    } catch (error) {
      setMessage({ type: 'error', text: 'Unable to load categories.' })
    } finally {
      setLoading(false)
    }
  }

  const fixImageUrl = (src?: string) => {
    if (!src) return src;
    
    // Check if it's an absolute URL that needs fixing
    if (src.startsWith("http")) {
      const siteUrl = import.meta.env.VITE_SITE_URL || "http://localhost:8000";
      // Fix category images
      if (src.includes("/storage/categories/") && !src.includes("/backend/public/")) {
        const filename = src.split("/storage/categories/")[1];
        return `${siteUrl}/backend/public/storage/categories/${filename}`;
      }
      // Fix banners
      if (src.includes("/storage/banners/") && !src.includes("/backend/public/")) {
        const filename = src.split("/storage/banners/")[1];
        return `${siteUrl}/backend/public/storage/banners/${filename}`;
      }
    }
    return src;
  };

  const reorderList = (list: Category[], startIndex: number, endIndex: number) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  const handleDragStart = (index: number) => {
    setDraggingIndex(index)
  }

  const handleDragEnter = (index: number) => {
    if (draggingIndex === null || draggingIndex === index) return
    setCategories((prev) => reorderList(prev, draggingIndex, index))
    setDraggingIndex(index)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = categories.map((category, index) => ({
        id: category.id,
        order: index, // Start from 0
      }))
      await adminAPI.categories.reorder(payload)
      setMessage({ type: 'success', text: 'Category priorities updated successfully.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save ordering. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <button className="text-[#2c7a4b]" onClick={() => navigate('/admin/categories')}>
          Category
        </button>
        <span>/</span>
        <span className="text-gray-400">Set Priority Category</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Set Priority Category</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'SAVE REORDERING'}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Drag and Drop Priority Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="grid gap-6 grid-cols-3">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`rounded-2xl border px-4 py-4 bg-gray-50 shadow-sm cursor-move transition ${
                    draggingIndex === index ? 'border-[#2c7a4b] bg-white shadow-lg' : 'border-gray-200'
                  }`}
                >
                  {category.image_url && (
                    <div className="aspect-square overflow-hidden rounded-xl bg-white mb-3">
                      <img
                        src={fixImageUrl(category.image_url)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-400 tracking-[0.2em] uppercase">
                    Category
                  </p>
                  <h4 className="text-lg font-semibold text-gray-900 mt-1">{translateCategoryName(category.name, t)}</h4>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Priority:{' '}
                    <span className="text-[#d9534f] font-bold">
                      {index}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600">1.</span>
              <span>Drag Category to reorder.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600">2.</span>
              <span>Click 'Save Reordering' when finished.</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default AdminCategoryPriority


