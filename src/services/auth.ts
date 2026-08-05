import http from './http'
import type {
  CommonResponse,
  LoginResponse,
  LoginRequest,
  CaptchaResponse,
  ChangePasswordRequest,
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
