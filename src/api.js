// src/api.js
import axios from 'axios'

/**
 * 统一的 Axios 实例：
 * - baseURL: 走 Vite 代理（/api → http://localhost:8080 之类）
 * - 请求自动附带 token（sessionStorage.token）
 * - 响应错误统一打印；401 自动跳登录（可按项目需要调整）
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: false, // 若后端需要跨域携带Cookie，这里改为 true
})

// 请求拦截：自动加 Authorization
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      // 常见写法：Bearer <token>
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截：统一错误处理
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // 这里可根据后端返回结构定制
    const status = error?.response?.status
    if (status === 401) {
      // 登录过期：清理并跳转
      sessionStorage.clear()
      // 防止死循环：只在非登录页跳转
      if (location.pathname !== '/login') {
        location.href = '/login'
      }
    }
    console.error('[API ERROR]', status, error?.response?.data || error?.message)
    return Promise.reject(error)
  }
)

export default api
