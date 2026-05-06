import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('dorm_auth')
      if (stored) {
        const { token } = JSON.parse(stored)
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {}
  }
  return config
})

export default api
