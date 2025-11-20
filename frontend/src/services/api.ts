import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api

export const homepageAPI = {
  get: () => api.get('/homepage'),
}

export const productsAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getBest: () => api.get('/products/best'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
  getBySubcategory: (category: string, subcategory: string) => 
    api.get(`/products/category/${category}/subcategory/${subcategory}`),
}

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
}

export const bannersAPI = {
  getAll: (page?: string) => api.get('/banners', { params: page ? { page } : {} }),
  getByPage: (page: string) => {
    console.log('Calling banners API with page:', page)
    return api.get('/banners', { params: { page } })
  },
}

export const dealersAPI = {
  getAll: () => api.get('/dealers'),
  getByCountry: (country: string) => api.get(`/dealers/country/${country}`),
  getByState: (country: string, state: string) => 
    api.get(`/dealers/country/${country}/state/${state}`),
}

export const pagesAPI = {
  getAbout: () => api.get('/pages/about'),
  getBySlug: (slug: string) => api.get(`/pages/${slug}`),
}

export const blogsAPI = {
  getAll: (params?: any) => api.get('/blogs', { params }),
  getBySlug: (slug: string) => api.get(`/blogs/${slug}`),
}

export const eventsAPI = {
  getAll: (params?: any) => api.get('/events', { params }),
  getBySlug: (slug: string) => api.get(`/events/${slug}`),
}

export const contactAPI = {
  submit: (data: any) => api.post('/contact', data),
}

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getUser: () => api.get('/auth/user'),
  changePassword: (data: { current_password: string; new_password: string; new_password_confirmation: string }) =>
    api.post('/auth/change-password', data),
}

export const analyticsAPI = {
  logVisit: (data: any) => api.post('/analytics/visit', data),
  logEvent: (data: any) => api.post('/analytics/event', data),
  getSummary: () => api.get('/analytics/summary'),
}

export const adminAPI = {
  analytics: {
    getSummary: () => api.get('/admin/analytics/summary'),
  },
  products: {
    getAll: (params?: any) => api.get('/admin/products', { params }),
    getById: (id: number) => api.get(`/admin/products/${id}`),
    create: (data: any) => api.post('/admin/products', data),
    update: (id: number, data: any) => api.put(`/admin/products/${id}`, data),
    delete: (id: number) => api.delete(`/admin/products/${id}`),
    uploadImage: (id: number, formData: FormData) => api.post(`/admin/products/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    reorderImages: (id: number, orders: { id: number; order: number }[]) =>
      api.post(`/admin/products/${id}/images/reorder`, { orders }),
  },
  categories: {
    getAll: () => api.get('/admin/categories'),
    getById: (id: number) => api.get(`/admin/categories/${id}`),
    reorder: (orders: { id: number; order: number }[]) =>
      api.post('/admin/categories/reorder', { orders }),
    create: (data: FormData | any) => {
      if (data instanceof FormData) {
        return api.post('/admin/categories', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      return api.post('/admin/categories', data)
    },
    update: (id: number, data: FormData | any) => {
      if (data instanceof FormData) {
        data.delete('_method')
        data.append('_method', 'PUT')
        return api.post(`/admin/categories/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      return api.put(`/admin/categories/${id}`, data)
    },
    delete: (id: number) => api.delete(`/admin/categories/${id}`),
  },
  banners: {
    getAll: () => api.get('/admin/banners'),
    getById: (id: number) => api.get(`/admin/banners/${id}`),
    create: (data: FormData | any) => {
      if (data instanceof FormData) {
        return api.post('/admin/banners', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      return api.post('/admin/banners', data)
    },
    update: (id: number, data: FormData | any) => {
      if (data instanceof FormData) {
        return api.put(`/admin/banners/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      return api.put(`/admin/banners/${id}`, data)
    },
    delete: (id: number) => api.delete(`/admin/banners/${id}`),
    uploadImage: (id: number, formData: FormData) => api.post(`/admin/banners/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  },
  dealers: {
    getAll: () => api.get('/admin/dealers'),
    getById: (id: number) => api.get(`/admin/dealers/${id}`),
    create: (data: any) => api.post('/admin/dealers', data),
    update: (id: number, data: any) => api.put(`/admin/dealers/${id}`, data),
    delete: (id: number) => api.delete(`/admin/dealers/${id}`),
  },
  blogs: {
    getAll: (params?: any) => api.get('/admin/blogs', { params }),
    getById: (id: number) => api.get(`/admin/blogs/${id}`),
    create: (data: FormData | any) => {
      if (data instanceof FormData) {
        return api.post('/admin/blogs', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      return api.post('/admin/blogs', data)
    },
    update: (id: number, data: FormData | any) => {
      if (data instanceof FormData) {
        return api.put(`/admin/blogs/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      return api.put(`/admin/blogs/${id}`, data)
    },
    delete: (id: number) => api.delete(`/admin/blogs/${id}`),
  },
  events: {
    getAll: (params?: any) => api.get('/admin/events', { params }),
    getById: (id: number) => api.get(`/admin/events/${id}`),
    create: (data: FormData | any) => {
      if (data instanceof FormData) {
        return api.post('/admin/events', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      return api.post('/admin/events', data)
    },
    update: (id: number, data: FormData | any) => {
      if (data instanceof FormData) {
        return api.put(`/admin/events/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      return api.put(`/admin/events/${id}`, data)
    },
    delete: (id: number) => api.delete(`/admin/events/${id}`),
  },
  pages: {
    getAll: () => api.get('/admin/pages'),
    getById: (id: number) => api.get(`/admin/pages/${id}`),
    create: (data: any) => api.post('/admin/pages', data),
    update: (id: number, data: any) => api.put(`/admin/pages/${id}`, data),
    delete: (id: number) => api.delete(`/admin/pages/${id}`),
    uploadImage: (id: number, formData: FormData) => api.post(`/admin/pages/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    removeImage: (id: number, imageType: string) => api.post(`/admin/pages/${id}/remove-image`, { image_type: imageType }),
  },
  seo: {
    getAll: () => api.get('/admin/seo'),
    get: (type: string, id: number) => api.get(`/admin/seo/${type}/${id}`),
    update: (type: string, id: number, data: any) => api.put(`/admin/seo/${type}/${id}`, data),
  },
  countries: {
    getAll: (params?: any) => api.get('/admin/countries', { params }),
    getById: (id: number) => api.get(`/admin/countries/${id}`),
    create: (data: any) => api.post('/admin/countries', data),
    update: (id: number, data: any) => api.put(`/admin/countries/${id}`, data),
    delete: (id: number) => api.delete(`/admin/countries/${id}`),
    toggleStatus: (id: number) => api.patch(`/admin/countries/${id}/toggle-status`),
  },
  states: {
    getByCountry: (countryId: number, params?: any) =>
      api.get(`/admin/countries/${countryId}/states`, { params }),
    getById: (stateId: number) => api.get(`/admin/states/${stateId}`),
    create: (countryId: number, data: any) => api.post(`/admin/countries/${countryId}/states`, data),
    update: (stateId: number, data: any) => api.put(`/admin/states/${stateId}`, data),
    delete: (stateId: number) => api.delete(`/admin/states/${stateId}`),
    toggleStatus: (stateId: number) => api.patch(`/admin/states/${stateId}/toggle-status`),
  },
}

