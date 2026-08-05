import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type { CommonResponse, LoginResponse, PlatformUser } from '@/types'

interface AuthProvider {
  getToken: () => string | null
  getUser: () => PlatformUser | null
  setAuth: (token: string, user: PlatformUser) => void
  logout: () => void
}

let authProvider: AuthProvider | null = null

export function setAuthProvider(provider: AuthProvider) {
  authProvider = provider
}

const http = axios.create({
  baseURL: 'http://127.0.0.1:8097/api',
  timeout: 30000,
  withCredentials: true,
})

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (err: Error) => void
}> = []

function processQueue(token: string | null, error: Error | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  refreshQueue = []
}

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authProvider?.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

http.interceptors.response.use(
  async (response: AxiosResponse<CommonResponse>) => {
    const res = response.data
    const config = response.config

    if (res.errcode !== 401001) {
      if (res.errcode !== 0) {
        return Promise.reject(new Error(res.message || 'Request failed'))
      }
      return response
    }

    if (config.url?.includes('/refresh-token')) {
      return Promise.reject(new Error(res.message || 'Refresh token expired'))
    }

    if (isRefreshing) {
      try {
        const newToken = await new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        })
        config.headers.Authorization = `Bearer ${newToken}`
        return http(config)
      } catch {
        return Promise.reject(new Error(res.message || 'Auth failed'))
      }
    }

    isRefreshing = true

    try {
      const refreshRes = await http.post<CommonResponse<LoginResponse>>('/refresh-token')
      const newToken = refreshRes.data.data.token
      const user = authProvider?.getUser()

      if (user) {
        authProvider?.setAuth(newToken, user)
      }

      processQueue(newToken, null)
      config.headers.Authorization = `Bearer ${newToken}`
      return http(config)
    } catch {
      processQueue(null, new Error('Refresh failed'))
      authProvider?.logout()
      window.location.href = '/login'
      return Promise.reject(new Error(res.message || 'Auth failed'))
    } finally {
      isRefreshing = false
    }
  },
  (error: AxiosError<CommonResponse>) => {
    const message = error.response?.data?.message || error.message || 'Network error'
    return Promise.reject(new Error(message))
  },
)

export default http
