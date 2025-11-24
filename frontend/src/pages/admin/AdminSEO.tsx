import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'

interface PageItem {
  id: number
  title: string
  slug: string
  type: 'page' | 'product' | 'category' | 'blog' | 'event'
  type_label: string
  seo?: {
    id?: number
    meta_title?: string
    meta_description?: string
    meta_keywords?: string
    og_image?: string
    image_seo?: {
      main_image?: { alt?: string; title?: string }
      decorative_image_1?: { alt?: string; title?: string }
      decorative_image_2?: { alt?: string; title?: string }
    }
  }
  images?: {
    main_image?: string
    decorative_image_1?: string
    decorative_image_2?: string
  } | null
  is_active?: boolean
}

const AdminSEO = () => {
  const [pages, setPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<PageItem | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [formData, setFormData] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: '',
    image_seo: {
      main_image: { alt: '', title: '' },
      decorative_image_1: { alt: '', title: '' },
      decorative_image_2: { alt: '', title: '' },
    },
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.seo.getAll()
      console.log('SEO API Response:', response.data)
      console.log('Total items:', response.data?.length)
      console.log('Items by type:', {
        pages: response.data?.filter((item: PageItem) => item.type === 'page').length,
        products: response.data?.filter((item: PageItem) => item.type === 'product').length,
        categories: response.data?.filter((item: PageItem) => item.type === 'category').length,
        blogs: response.data?.filter((item: PageItem) => item.type === 'blog').length,
        events: response.data?.filter((item: PageItem) => item.type === 'event').length,
      })
      setPages(response.data || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
      alert('Error fetching pages')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (page: PageItem) => {
    setEditingPage(page)
    const seo = page.seo || {}
    setFormData({
      meta_title: seo.meta_title || '',
      meta_description: seo.meta_description || '',
      meta_keywords: seo.meta_keywords || '',
      og_image: seo.og_image || '',
      image_seo: {
        main_image: {
          alt: seo.image_seo?.main_image?.alt || '',
          title: seo.image_seo?.main_image?.title || '',
        },
        decorative_image_1: {
          alt: seo.image_seo?.decorative_image_1?.alt || '',
          title: seo.image_seo?.decorative_image_1?.title || '',
        },
        decorative_image_2: {
          alt: seo.image_seo?.decorative_image_2?.alt || '',
          title: seo.image_seo?.decorative_image_2?.title || '',
        },
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPage) return

    try {
      setSaving(true)
      await adminAPI.seo.update(editingPage.type, editingPage.id, formData)
      alert('SEO settings saved successfully!')
      fetchPages()
      setEditingPage(null)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving SEO settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dcecd5]"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">SEO Management</h2>
          <p className="text-sm text-gray-600">Manage meta tags, descriptions, and image SEO for all pages</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="page">Pages</option>
            <option value="product">Products</option>
            <option value="category">Categories</option>
            <option value="blog">Blogs</option>
            <option value="event">Events</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pages List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">
              All Pages ({pages.filter((page) => filterType === 'all' || page.type === filterType).length})
            </h3>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {pages
              .filter((page) => filterType === 'all' || page.type === filterType)
              .map((page) => (
                <div
                  key={`${page.type}-${page.id}`}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    editingPage?.id === page.id && editingPage?.type === page.type
                      ? 'bg-[#f5f9f4] border-l-4 border-[#dcecd5]'
                      : ''
                  }`}
                  onClick={() => handleEdit(page)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                          {page.type_label}
                        </span>
                        {!page.is_active && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900">{page.title}</h4>
                      <p className="text-sm text-gray-500">/{page.slug}</p>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      {page.seo ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          SEO Configured
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          No SEO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            {pages.filter((page) => filterType === 'all' || page.type === filterType).length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No items found for this filter</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Editor */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">
              {editingPage ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                      {editingPage.type_label}
                    </span>
                  </div>
                  <span>Edit SEO: {editingPage.title}</span>
                </div>
              ) : (
                'Select an item to edit SEO'
              )}
            </h3>
          </div>

          {editingPage && (
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
              {/* Meta Tags */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Meta Tags</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={255}
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Page title for search engines (max 255 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.meta_title.length}/255 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    maxLength={500}
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Page description for search engines (max 500 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.meta_description.length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    maxLength={500}
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Comma-separated keywords (e.g., eco bags, jute bags, UAE)"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.meta_keywords.length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OG Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.og_image}
                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Image URL for social media sharing</p>
                </div>
              </div>

              {/* Image SEO - Only for Pages */}
              {editingPage.type === 'page' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Image SEO (Alt Text & Titles)</h4>
                  
                  {editingPage.images?.main_image && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Image (Right Column)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Alt Text</label>
                        <input
                          type="text"
                          maxLength={255}
                          value={formData.image_seo.main_image.alt}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              image_seo: {
                                ...formData.image_seo,
                                main_image: { ...formData.image_seo.main_image, alt: e.target.value },
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Descriptive alt text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Title</label>
                        <input
                          type="text"
                          maxLength={255}
                          value={formData.image_seo.main_image.title}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              image_seo: {
                                ...formData.image_seo,
                                main_image: { ...formData.image_seo.main_image, title: e.target.value },
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Image title"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingPage.images?.decorative_image_1 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decorative Image 1 (about02)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Alt Text</label>
                        <input
                          type="text"
                          maxLength={255}
                          value={formData.image_seo.decorative_image_1.alt}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              image_seo: {
                                ...formData.image_seo,
                                decorative_image_1: { ...formData.image_seo.decorative_image_1, alt: e.target.value },
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Descriptive alt text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Title</label>
                        <input
                          type="text"
                          maxLength={255}
                          value={formData.image_seo.decorative_image_1.title}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              image_seo: {
                                ...formData.image_seo,
                                decorative_image_1: { ...formData.image_seo.decorative_image_1, title: e.target.value },
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Image title"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingPage.images?.decorative_image_2 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decorative Image 2 (about03)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Alt Text</label>
                        <input
                          type="text"
                          maxLength={255}
                          value={formData.image_seo.decorative_image_2.alt}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              image_seo: {
                                ...formData.image_seo,
                                decorative_image_2: { ...formData.image_seo.decorative_image_2, alt: e.target.value },
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Descriptive alt text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Title</label>
                        <input
                          type="text"
                          maxLength={255}
                          value={formData.image_seo.decorative_image_2.title}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              image_seo: {
                                ...formData.image_seo,
                                decorative_image_2: { ...formData.image_seo.decorative_image_2, title: e.target.value },
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Image title"
                        />
                      </div>
                    </div>
                  </div>
                )}

                  {!editingPage.images?.main_image && !editingPage.images?.decorative_image_1 && !editingPage.images?.decorative_image_2 && (
                    <p className="text-sm text-gray-500 italic">No images uploaded for this page. Upload images in Pages Management to add image SEO.</p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save SEO Settings'}
                </button>
              </div>
            </form>
          )}

          {!editingPage && (
            <div className="p-8 text-center text-gray-500">
              <p>Select an item from the list to manage its SEO settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSEO

