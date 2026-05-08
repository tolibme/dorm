import axios from 'axios'

const STORAGE_KEY = 'dorm_auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { token } = JSON.parse(stored)
        if (token) config.headers.Authorization = `Bearer ${token}`
      }
    } catch {}
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (typeof window !== 'undefined' && err?.response?.status === 401) {
      const onLogin = window.location.pathname === '/login'
      if (!onLogin) {
        localStorage.removeItem(STORAGE_KEY)
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
    }
    return Promise.reject(err)
  }
)

export default api
