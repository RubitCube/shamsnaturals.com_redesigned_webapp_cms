import { useEffect, useState, useMemo } from 'react'
import { adminAPI } from '../../services/api'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

interface ProductImage {
  id: number
  image_path: string
  alt_text?: string
  image_url?: string
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  sale_price?: number
  category?: { name: string; id?: number }
  subcategory?: { name: string }
  is_active: boolean
  is_best_seller: boolean
  is_new_arrival: boolean
  sku?: string
  description?: string
  short_description?: string
  images?: ProductImage[]
}

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number') return '—'
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(value)
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    subcategory_id: '',
    description: '',
    short_description: '',
    price: '',
    sale_price: '',
    sku: '',
    stock_quantity: '',
    is_best_seller: false,
    is_new_arrival: false,
    is_featured: false,
    is_active: true,
    order: '0',
  })
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  const [pendingEditId, setPendingEditId] = useState<number | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    const editId = searchParams.get('edit')
    const viewId = searchParams.get('view')
    if (editId) {
      setPendingEditId(Number(editId))
    }
    if (viewId) {
      setSelectedProductId(Number(viewId))
      setShowDetails(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (pendingEditId) {
      handleEditById(pendingEditId)
    }
  }, [pendingEditId])

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.products.getAll()
      const data = response.data.data || response.data
      
      // Fetch full product details with images for each product
      const productsWithImages = await Promise.all(
        data.map(async (product: Product) => {
          try {
            const fullProductResp = await adminAPI.products.getById(product.id)
            return { ...product, images: fullProductResp.data.images || [] }
          } catch {
            return product
          }
        })
      )
      
      setProducts(productsWithImages)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.categories.getAll()
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await adminAPI.products.delete(id)
      fetchProducts()
    } catch (error) {
      alert('Error deleting product')
    }
  }

  const handleEditById = async (id: number) => {
    try {
      const response = await adminAPI.products.getById(id)
      const data = response.data
      setEditingProduct(data)
      setFormData({
        name: data.name || '',
        category_id: data.category_id?.toString() || '',
        subcategory_id: data.subcategory_id?.toString() || '',
        description: data.description || '',
        short_description: data.short_description || '',
        price: data.price?.toString() || '',
        sale_price: data.sale_price?.toString() || '',
        sku: data.sku || '',
        stock_quantity: data.stock_quantity?.toString() || '',
        is_best_seller: data.is_best_seller || false,
        is_new_arrival: data.is_new_arrival || false,
        is_featured: data.is_featured || false,
        is_active: data.is_active !== false,
        order: data.order?.toString() || '0',
      })
      setShowModal(true)
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        params.delete('edit')
        return params
      })
      setPendingEditId(null)
    } catch (error) {
      console.error('Unable to load product for editing.')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    handleEditById(product.id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        order: parseInt(formData.order) || 0,
        category_id: parseInt(formData.category_id),
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
      }

      if (editingProduct) {
        await adminAPI.products.update(editingProduct.id, submitData)
      } else {
        await adminAPI.products.create(submitData)
      }

      setShowModal(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        category_id: '',
        subcategory_id: '',
        description: '',
        short_description: '',
        price: '',
        sale_price: '',
        sku: '',
        stock_quantity: '',
        is_best_seller: false,
        is_new_arrival: false,
        is_featured: false,
        is_active: true,
        order: '0',
      })
      fetchProducts()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving product')
    }
  }

  const navigate = useNavigate()

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null
    return products.find((p) => p.id === selectedProductId) || null
  }, [products, selectedProductId])

  const shortDetails = useMemo(() => {
    if (!selectedProduct?.short_description) return []
    return selectedProduct.short_description.split('|').map((item) => item.trim())
  }, [selectedProduct])

  const resolveImageUrl = (path?: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    const backendOrigin = apiUrl.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8000'

    let normalized = path.startsWith('storage/') ? path.substring(8) : path
    normalized = normalized.startsWith('/') ? normalized.substring(1) : normalized
    
    return `${backendOrigin}/storage/${normalized}`
  }

  const handleView = async (productId: number) => {
    setSelectedProductId(productId)
    setShowDetails(true)
    
    // Fetch full product details with images
    try {
      const fullProductResp = await adminAPI.products.getById(productId)
      const fullProduct = fullProductResp.data
      setProducts((prev) => 
        prev.map((p) => p.id === productId ? { ...p, ...fullProduct } : p)
      )
    } catch (err) {
      console.error('Failed to load product details:', err)
    }
  }

  const handleModify = () => {
    if (!selectedProduct) return
    navigate(`/admin/products/new?edit=${selectedProduct.id}`)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Products Management</h2>
        <button onClick={() => navigate('/admin/products/new')} className="btn-primary px-4 py-2">
          Add New Product
        </button>
      </div>

      {/* Product Details View */}
      {showDetails && selectedProduct && (
        <div className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                View Product Details : {selectedProduct.category?.name || 'All Products'}
              </h1>
              <p className="text-gray-500 mt-1">
                Select a product to review its specifications, description, and photo assets.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedProductId ?? ''}
                onChange={async (e) => {
                  const productId = Number(e.target.value)
                  await handleView(productId)
                }}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.sku || product.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleModify}
                className="inline-flex items-center gap-2 rounded-full border border-[#d5335a]/40 text-[#d5335a] px-4 py-2 text-sm font-semibold"
              >
                ✏ Modify
              </button>
              <button
                onClick={() => {
                  setShowDetails(false)
                  setSelectedProductId(null)
                }}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Product Details Section */}
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                  <p className="text-sm text-gray-500">Please provide the Product Details...</p>
                </div>
                <button onClick={handleModify} className="text-[#d5335a] text-sm font-semibold">
                  ✏ Modify
                </button>
              </div>

              <dl className="grid gap-y-4 md:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Product Code</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-1">{selectedProduct.sku || selectedProduct.name}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Product Dimension</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-1">{shortDetails[0] || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Product Color</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-1">{shortDetails[1] || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">New Arrivals</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedProduct.is_new_arrival ? 'Yes' : 'No'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Product Materials</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-1">{shortDetails[2] || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Status</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedProduct.is_active ? 'Active' : 'Inactive'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Price</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-1">
                    {formatCurrency(selectedProduct.price)}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Product Description Section */}
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Product Description</h3>
                  <p className="text-sm text-gray-500">Please provide the Product Description...</p>
                </div>
                <button onClick={handleModify} className="text-[#d5335a] text-sm font-semibold">
                  ✏ Modify
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedProduct.description || '—'}
              </p>
            </section>

            {/* Product Photos Section */}
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Product Photos</h3>
                  <p className="text-sm text-gray-500">Please provide the Product Photos...</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(`/admin/products/${selectedProduct.id}/images/priority`)}
                    className="text-sm font-semibold text-[#2c7a4b] flex items-center gap-1"
                  >
                    ⇅ Set Priority
                  </button>
                  <button
                    onClick={() => navigate(`/admin/products/new?edit=${selectedProduct.id}&tab=photos`)}
                    className="text-sm font-semibold text-[#2c7a4b] flex items-center gap-1"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  selectedProduct.images.map((image) => {
                    let imageSrc = image.image_url
                    if (!imageSrc && image.image_path) {
                      imageSrc = resolveImageUrl(image.image_path)
                    }
                    return (
                      <div key={image.id} className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                        <div className="aspect-square overflow-hidden rounded-xl bg-white shadow-sm">
                          <img
                            src={imageSrc}
                            alt={image.alt_text || selectedProduct.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-gray-500">No photos uploaded yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Products Table */}
      {!showDetails && (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Code/Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Color</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Dimension</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Arrivals</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Materials</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Photos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const shortDetails = product.short_description ? product.short_description.split('|').map((item) => item.trim()) : []
                const dimension = shortDetails[0] || '—'
                const color = shortDetails[1] || '—'
                const materials = shortDetails[2] || '—'
                const description = product.description ? (product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description) : '—'
                
                return (
                  <tr key={product.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.sku || product.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{color}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{dimension}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.is_new_arrival ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">{materials}</td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">{description}</td>
                    <td className="px-4 py-4">
                      {product.images && product.images.length > 0 ? (
                        <div className="flex gap-1">
                          {product.images.slice(0, 3).map((image) => {
                            const imageSrc = image.image_url || resolveImageUrl(image.image_path)
                            return (
                              <div key={image.id} className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-gray-50">
                                <img
                                  src={imageSrc}
                                  alt={image.alt_text || product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            )
                          })}
                          {product.images.length > 3 && (
                            <div className="w-10 h-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                              +{product.images.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No photos</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category?.name} {product.subcategory && `/ ${product.subcategory.name}`}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleView(product.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/admin/products/new?edit=${product.id}`)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => {
                      setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })
                      // Fetch subcategories
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                  <select
                    value={formData.subcategory_id}
                    onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Subcategory</option>
                    {categories
                      .find((c) => c.id.toString() === formData.category_id)
                      ?.subcategories?.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <textarea
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={2}
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_best_seller}
                    onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                    className="mr-2"
                  />
                  Best Seller
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                    className="mr-2"
                  />
                  New Arrival
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="mr-2"
                  />
                  Featured
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingProduct(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-md"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
