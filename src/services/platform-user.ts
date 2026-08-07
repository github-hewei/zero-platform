import http from './http'
import type {
  CommonResponse,
  PaginatedData,
  PaginatedRequest,
  PlatformUser,
  CreatePlatformUserRequest,
  UpdatePlatformUserRequest,
  ResetPasswordResponse,
} from '@/types'

export async function getPlatformUserList(
  params: PaginatedRequest & { username?: string; real_name?: string },
) {
  const res = await http.post<CommonResponse<PaginatedData<PlatformUser>>>(
    '/platform/user/list',
    params,
  )
  return res.data.data
}

export async function createPlatformUser(data: CreatePlatformUserRequest) {
  const res = await http.post<CommonResponse>('/platform/user/create', data)
  return res.data
}

export async function updatePlatformUser(data: UpdatePlatformUserRequest) {
  const res = await http.post<CommonResponse>('/platform/user/update', data)
  return res.data
}

export async function deletePlatformUser(id: number) {
  const res = await http.post<CommonResponse>('/platform/user/delete', { id })
  return res.data
}

export async function resetPlatformUserPassword(id: number) {
  const res = await http.post<CommonResponse<ResetPasswordResponse>>(
    '/platform/user/reset-password',
    { id },
  )
  return res.data
}
