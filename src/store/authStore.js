import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import authService from '@/services/authService'
import { API_BASE_URL } from '@/utils/constants'

// Global activity tracker
let lastActivityTime = Date.now()
if (typeof window !== 'undefined') {
  const updateActivity = () => { lastActivityTime = Date.now() }
  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
  events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }))
}


export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isSessionExpiring: false,
      setSessionExpiring: (val) => set({ isSessionExpiring: val }),

      /**
       * Called on app mount to re-hydrate user info from stored token.
       * Uses stored username to call GET /api/user/get-info/{username}.
       */
      initAuth: async () => {
        const { accessToken, user } = get()
        if (!accessToken || !user?.username) return
        try {
          const userData = await authService.getMe(user.username)
          set({ user: userData, isAuthenticated: true })
          get().setupTokenRefresh()
        } catch {
          get().logout()
        }
      },

      /**
       * Login flow:
       * 1. POST /api/user/login → { accessToken, refreshToken }
       * 2. Temporarily store username from credentials
       * 3. GET /api/user/get-info/{username} → full user object
       */
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const tokenData = await authService.login(credentials)
          // BE trả về plain string là access token (không phải object)
          const accessToken = typeof tokenData === 'string'
            ? tokenData
            : tokenData?.accessToken

          if (!accessToken) throw new Error('NO_TOKEN')

          // Lưu token + user tạm (username) để getMe có thể chạy
          set({
            accessToken,
            user: { username: credentials.username },
            isAuthenticated: true,
            isLoading: false,
          })

          // Lấy full profile
          const userData = await authService.getMe(credentials.username)
          set({ user: userData })
          get().setupTokenRefresh()

          return { success: true }
        } catch (err) {
          set({ isLoading: false, isAuthenticated: false, accessToken: null, user: null })
          const msg = err.response?.data?.message
            || err.response?.data?.error
            || (err.message !== 'NO_TOKEN' ? err.message : 'Đăng nhập thất bại')
          return { success: false, message: msg || 'Đăng nhập thất bại' }
        }
      },

      /**
       * Register flow: POST /api/user/register
       * Does NOT auto-login after registration.
       */
      register: async (payload) => {
        set({ isLoading: true })
        try {
          await authService.register(payload)
          set({ isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return {
            success: false,
            message: err.response?.data?.message || 'Đăng ký thất bại',
          }
        }
      },

      /**
       * Logout: no backend endpoint, just clear local state.
       */
      logout: () => {
        if (window.tokenRefreshInterval) clearInterval(window.tokenRefreshInterval)
        set({ user: null, accessToken: null, isAuthenticated: false, isSessionExpiring: false })
      },

      /** Update user object in store (after profile edit) */
      updateUser: (user) => set({ user }),

      /** Called by refresh token interceptor in api.js */
      setTokens: (accessToken) => set({ accessToken }),

      /** Proactively refresh token */
      refreshNow: async () => {
        const { user, setTokens, logout } = get()
        if (!user?.id) return null
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/user/refresh`, null, {
            params: { userId: user.id },
            withCredentials: true
          })
          const raw = data
          const newAccessToken = typeof raw === 'string' ? raw : raw?.accessToken
          set({ accessToken: newAccessToken })
          return newAccessToken
        } catch (error) {
          logout()
          throw error
        }
      },

      /** Start interval to check token expiry */
      setupTokenRefresh: () => {
        if (window.tokenRefreshInterval) clearInterval(window.tokenRefreshInterval)
        
        // Check every 10 seconds to accurately prompt the user
        window.tokenRefreshInterval = setInterval(() => {
          const { accessToken, logout, isSessionExpiring, setSessionExpiring } = get()
          if (!accessToken) return

          // If idle for more than 30 minutes, stop refreshing and log out
          const idleTime = Date.now() - lastActivityTime
          if (idleTime > 30 * 60 * 1000) {
            console.log('User idle for too long, logging out.')
            logout()
            return
          }

          try {
            const decoded = jwtDecode(accessToken)
            const currentTime = Date.now() / 1000
            const timeLeft = decoded.exp - currentTime

            if (timeLeft <= 0) {
              // Token completely expired, user ignored the prompt
              setSessionExpiring(false)
              logout()
            } else if (timeLeft < 120) {
              // Less than 2 minutes remaining, prompt the user
              if (!isSessionExpiring) {
                setSessionExpiring(true)
              }
            } else {
              // If we just got a new token, clear the prompt
              if (isSessionExpiring) {
                setSessionExpiring(false)
              }
            }
          } catch (e) {
            console.error('Failed to decode token', e)
          }
        }, 10 * 1000)
      }
    }),
    {
      name: 'syncspace-auth',
      // Only persist tokens and minimal user info (username needed for initAuth)
      partialize: (state) => ({
        accessToken:  state.accessToken,
        user:         state.user ? { username: state.user.username, id: state.user.id } : null,
      }),
    },
  ),
)
