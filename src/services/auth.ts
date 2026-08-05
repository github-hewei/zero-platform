import http from './http'
import type {
  CommonResponse,
  LoginResponse,
  LoginRequest,
  CaptchaResponse,
  ChangePasswordRequest,
  RbacMenu,
} from '@/types'

export async function login(data: LoginRequest) {
  const res = await http.post<CommonResponse<LoginResponse>>('/login', data)
  return res.data.data
}

export async function logout() {
  const res = await http.post<CommonResponse>('/logout')
  return res.data
}

export async function changePassword(data: ChangePasswordRequest) {
  const res = await http.post<CommonResponse>('/change-password', data)
  return res.data
}

export async function getCaptcha() {
  const res = await http.post<CommonResponse<CaptchaResponse>>('/captcha/generate')
  return res.data.data
}

function extractPathsAndActions(menus: RbacMenu[]): { paths: string[]; actions: string[] } {
  const paths: string[] = []
  const actions: string[] = []

  function walk(items: RbacMenu[]) {
    for (const item of items) {
      if (item.path && item.path !== '/' && item.path !== '/login') {
        paths.push(item.path)
      }
      if (item.action_mark) {
        const prefix = item.module_key ? `${item.module_key}:` : ''
        actions.push(`${prefix}${item.action_mark}`)
      }
      if (item.children) walk(item.children)
      if (item.actions) walk(item.actions)
    }
  }

  walk(menus)
  return { paths, actions }
}

export async function getPermissions() {
  const res = await http.post<CommonResponse<RbacMenu[]>>('/permissions', { is_tree: true })
  const menus = res.data.data || []
  const { paths, actions } = extractPathsAndActions(menus)
  return { menus, paths, actions }
}
