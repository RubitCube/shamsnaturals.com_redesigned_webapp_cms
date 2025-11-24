import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminAPI } from '../../services/api'

interface ProductImage {
  id: number
  image_path: string
  alt_text?: string
  image_url?: string
}

interface Product {
  id: number
  name: string
  sku?: string
  price: number
  description?: string
  short_description?: string
  is_new_arrival: boolean
  is_active: boolean
  images?: ProductImage[]
}

const BASE_URL = import.meta.env.VITE_SITE_URL
  ? `${import.meta.env.VITE_SITE_URL}/backend`
  : 'http://localhost:8000/backend'

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number') return '—'
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(value)
}

const AdminCategoryProducts = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [categoryName, setCategoryName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get product ID from query params
  const urlParams = new URLSearchParams(window.location.search)
  const productIdFromQuery = urlParams.get('product')

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!categoryId) return
        const [categoryResp, productsResp] = await Promise.all([
          adminAPI.categories.getById(Number(categoryId)),
          adminAPI.products.getAll({ category_id: categoryId, per_page: 100 }),
        ])

        setCategoryName(categoryResp.data.name)

        const data = productsResp.data.data || productsResp.data
        setProducts(data)
        
        // If product ID is in query params, use it if it exists in the data
        if (productIdFromQuery && data.length) {
          const productId = Number(productIdFromQuery)
          const exists = data.find((p: Product) => p.id === productId)
          if (exists) {
            // Backend already includes images, but if they're missing, fetch full details
            if (!exists.images || exists.images.length === 0) {
              try {
                const fullProductResp = await adminAPI.products.getById(productId)
                const fullProduct = fullProductResp.data
                const updatedData = data.map((p: Product) => 
                  p.id === productId ? { ...p, images: fullProduct.images || [] } : p
                )
                setProducts(updatedData)
              } catch (err) {
                console.error('Failed to load full product details:', err)
              }
            }
            setSelectedProductId(productId)
          } else {
            setSelectedProductId(data[0].id)
          }
        } else if (data.length) {
          // For first product, also fetch full details to ensure images are loaded
          const firstProductId = data[0].id
          try {
            const fullProductResp = await adminAPI.products.getById(firstProductId)
            const fullProduct = fullProductResp.data
            const updatedData = data.map((p: Product) => 
              p.id === firstProductId ? { ...p, images: fullProduct.images || [] } : p
            )
            setProducts(updatedData)
          } catch (err) {
            console.error('Failed to load full product details:', err)
          }
          setSelectedProductId(firstProductId)
        }
      } catch (err) {
        setError('Unable to load products for this category.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [categoryId])

  const selectedProduct = useMemo(
    () => {
      const product = products.find((product) => product.id === selectedProductId)
      if (!product) return null
      
      // If product doesn't have images loaded, fetch them
      if (product && (!product.images || product.images.length === 0)) {
        adminAPI.products.getById(product.id).then((resp) => {
          const fullProduct = resp.data
          setProducts((prev) => 
            prev.map((p) => p.id === product.id ? { ...p, images: fullProduct.images || [] } : p)
          )
        }).catch(console.error)
      }
      
      return product
    },
    [products, selectedProductId]
  )

  const shortDetails = useMemo(() => {
    if (!selectedProduct?.short_description) return []
    return selectedProduct.short_description.split('|').map((item) => item.trim())
  }, [selectedProduct])

  const resolveImageUrl = (path?: string) => {
    if (!path) return ''
    
    // Check if it's an absolute URL
    if (path.startsWith('http')) {
      // Fix incorrect backend URLs that are missing /backend/public/
      const siteUrl = import.meta.env.VITE_SITE_URL || "http://localhost:8000";
      if (path.includes("/storage/products/") && !path.includes("/backend/public/")) {
        const filename = path.split("/storage/products/")[1];
        return `${siteUrl}/backend/public/storage/products/${filename}`;
      }
      return path;
    }

    let normalized = path.startsWith('storage/') ? path.substring(8) : path
    normalized = normalized.startsWith('/') ? normalized.substring(1) : normalized
    // Remove 'products/' if it exists (backend already includes it in path)
    normalized = normalized.replace(/^products\//, "");

    return `${BASE_URL}/public/storage/products/${normalized}`
  }

  // Helper to get the correct image URL from an image object
  const getImageUrl = (image: any) => {
    const path = image.image_url || image.image_path;
    return resolveImageUrl(path);
  }

  const handleModify = () => {
    if (!selectedProduct) return
    navigate(`/admin/products?edit=${selectedProduct.id}`)
  }

  const goBack = () => navigate('/admin/categories')

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error}</p>
        <button className="btn-primary px-4 py-2" onClick={goBack}>
          Back to Categories
        </button>
      </div>
    )
  }

  if (!selectedProduct) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">No products found under this category yet.</p>
        <div className="flex gap-3">
          <button className="btn-primary px-4 py-2" onClick={() => navigate(`/admin/products/new?category=${categoryId}`)}>
            Add Product
          </button>
          <button className="px-4 py-2 rounded-lg border" onClick={goBack}>
            Back to Categories
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <button className="text-[#2c7a4b]" onClick={goBack}>
          Category
        </button>
        <span>/</span>
        <span className="text-gray-400">View Product Details</span>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            View Product Details : {categoryName}
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
              setSelectedProductId(productId)
              
              // Fetch full product details with images
              try {
                const fullProductResp = await adminAPI.products.getById(productId)
                const fullProduct = fullProductResp.data
                setProducts((prev) => 
                  prev.map((p) => p.id === productId ? { ...p, images: fullProduct.images || [] } : p)
                )
              } catch (err) {
                console.error('Failed to load product images:', err)
              }
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
        </div>
      </div>

      <div className="space-y-6">
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

          <dl className="grid gap-y-4 grid-cols-2">
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
                onClick={() => navigate(`/admin/products?edit=${selectedProduct.id}&tab=photos`)}
                className="text-sm font-semibold text-[#2c7a4b] flex items-center gap-1"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-3">
            {selectedProduct.images && selectedProduct.images.length > 0 ? (
              selectedProduct.images.map((image) => {
                const imageSrc = getImageUrl(image);
                console.log('Product image:', { 
                  id: image.id, 
                  image_url: image.image_url, 
                  image_path: image.image_path,
                  final_src: imageSrc 
                })
                return (
                <div key={image.id} className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                  <div className="aspect-square overflow-hidden rounded-xl bg-white shadow-sm">
                    <img
                      src={imageSrc}
                      alt={image.alt_text || selectedProduct.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        console.error('Image failed to load:', { 
                          image_url: image.image_url, 
                          image_path: image.image_path, 
                          resolved: imageSrc,
                          baseUrl: BASE_URL
                        })
                        // Don't set placeholder, just hide the broken image
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
  )
}

export default AdminCategoryProducts


