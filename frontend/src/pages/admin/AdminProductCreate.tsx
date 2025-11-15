import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { adminAPI } from '../../services/api'

interface CategoryOption {
  id: number
  name: string
  subcategories?: { id: number; name: string }[]
}

const photoSlotCount = 6

const AdminProductCreate = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [productCode, setProductCode] = useState('')
  const [price, setPrice] = useState('')
  const [dimension, setDimension] = useState('')
  const [color, setColor] = useState('')
  const [materials, setMaterials] = useState('')
  const [description, setDescription] = useState('')
  const [newArrival, setNewArrival] = useState<'yes' | 'no'>('no')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [photos, setPhotos] = useState<(File | null)[]>(Array(photoSlotCount).fill(null))
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminAPI.categories.getAll()
        setCategories(response.data)
      } catch (error) {
        setFeedback({
          type: 'error',
          text: 'Unable to load categories. Please refresh.',
        })
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fromQuery = searchParams.get('category')
    if (fromQuery && categories.length) {
      const exists = categories.find((cat) => cat.id.toString() === fromQuery)
      if (exists) {
        setCategoryId(fromQuery)
      }
    }
  }, [searchParams, categories])

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id.toString() === categoryId),
    [categories, categoryId]
  )

  const availableSubcategories = selectedCategory?.subcategories ?? []

  const handlePhotoChange = (index: number, file: File | null) => {
    setPhotos((prev) => {
      const copy = [...prev]
      copy[index] = file
      return copy
    })
  }

  const composedShortDescription = useMemo(() => {
    const parts = []
    if (dimension) parts.push(`Dimension: ${dimension}`)
    if (color) parts.push(`Color: ${color}`)
    if (materials) parts.push(`Materials: ${materials}`)
    return parts.join(' | ')
  }, [dimension, color, materials])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    if (!categoryId) {
      setFeedback({ type: 'error', text: 'Please select a category.' })
      return
    }
    if (!productCode.trim()) {
      setFeedback({ type: 'error', text: 'Product code is required.' })
      return
    }
    if (!price) {
      setFeedback({ type: 'error', text: 'Product price is required.' })
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        name: productCode.trim(),
        sku: productCode.trim(),
        category_id: Number(categoryId),
        subcategory_id: subcategoryId ? Number(subcategoryId) : null,
        price: parseFloat(price),
        sale_price: null,
        description: description,
        short_description: composedShortDescription,
        stock_quantity: 0,
        is_best_seller: false,
        is_featured: false,
        is_new_arrival: newArrival === 'yes',
        is_active: status === 'active',
        order: 0,
      }

      const productResponse = await adminAPI.products.create(payload)
      const createdProduct = productResponse.data

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        if (file) {
          const formData = new FormData()
          formData.append('image', file)
          formData.append('alt_text', `${productCode} photo ${i + 1}`)
          if (i === 0) {
            formData.append('is_primary', 'true')
          }
          await adminAPI.products.uploadImage(createdProduct.id, formData)
        }
      }

      setFeedback({ type: 'success', text: 'Product created successfully.' })
      setTimeout(() => navigate('/admin/products'), 1200)
    } catch (error: any) {
      setFeedback({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save product.',
      })
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
        <button className="text-[#2c7a4b]" onClick={() => navigate('/admin/products')}>
          Products
        </button>
        <span>/</span>
        <span className="text-gray-400">Add Product</span>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Add Product : {selectedCategory?.name || 'Select Category'}
        </h1>
        <p className="text-gray-500 mt-1">
          Provide product specifications, description and upload photos to publish it on the website.
        </p>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-semibold border ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
            <p className="text-sm text-gray-500">Please provide the product details.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Select Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                  setSubcategoryId('')
                }}
                className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c7a4b]/40"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Sub Category</label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                disabled={!availableSubcategories.length}
                className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c7a4b]/40 disabled:bg-gray-50"
              >
                <option value="">{availableSubcategories.length ? 'Select Sub Category' : 'No sub categories'}</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Product Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="Type Product Code..."
                className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c7a4b]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Product Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Type Product Price..."
                className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c7a4b]/40"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">New Arrivals</label>
              <div className="flex items-center gap-6 text-sm text-gray-700">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="new-arrival"
                    value="no"
                    checked={newArrival === 'no'}
                    onChange={() => setNewArrival('no')}
                  />
                  No
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="new-arrival"
                    value="yes"
                    checked={newArrival === 'yes'}
                    onChange={() => setNewArrival('yes')}
                  />
                  Yes
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Product Dimension</label>
              <input
                type="text"
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
                placeholder="Type Product Dimension..."
                className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c7a4b]/40"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Product Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Type Product Color..."
                className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c7a4b]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Product Materials</label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="Type Product Materials..."
                className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c7a4b]/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="inactive"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                />
                Inactive
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Product Description</h2>
            <p className="text-sm text-gray-500">Please provide the product description.</p>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c7a4b]/40"
            placeholder="Type text here..."
          />
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Product Photos</h2>
            <p className="text-sm text-gray-500">Please provide the product photos.</p>
          </div>
          <div className="grid gap-4">
            {Array.from({ length: photoSlotCount }).map((_, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-dashed border-gray-200 rounded-2xl p-4">
                <div className="text-sm font-semibold text-gray-600">
                  Upload Photos <span className="text-xs font-normal text-gray-400">(Image Size: 1000px * 800px)</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(index, e.target.files?.[0] || null)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-[#e3f2ea] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1f4b2c]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0097b2] hover:bg-[#007f95] text-white font-semibold px-8 py-3 rounded-lg shadow disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="text-gray-500 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminProductCreate


