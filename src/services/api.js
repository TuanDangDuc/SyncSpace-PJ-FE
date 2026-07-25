import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Tăng lên 60s để tránh lỗi timeout 15s khi upload hình ảnh nặng lên Cloudinary
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor: refresh token on 401 ───────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const url = originalRequest?.url || ''

    // Không retry cho các auth endpoints — tránh vòng lặp vô hạn
    const isAuthUrl = url.includes('/login') || url.includes('/register') || url.includes('/refresh')

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isAuthUrl) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const { user } = useAuthStore.getState()

      if (!user?.id) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      try {
        // POST /api/user/refresh
        // The backend reads the refreshToken from the HttpOnly cookie automatically
        const { data } = await axios.post(`${API_BASE_URL}/api/user/refresh`, null, {
          params: { userId: user.id },
          withCredentials: true
        })
        const raw = data
        const newAccessToken = typeof raw === 'string' ? raw : raw?.accessToken
        useAuthStore.getState().setTokens(newAccessToken)
        processQueue(null, newAccessToken)
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
