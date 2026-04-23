import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      
      // Hanya tendang ke login jika sebelumnya adalah Admin
      if (user.role === 'admin') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
