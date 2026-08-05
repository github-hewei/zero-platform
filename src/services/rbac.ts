import http from './http'
import type { CommonResponse, PaginatedData, PaginatedRequest, RbacStore, RbacApi } from '@/types'

export async function getStoreList(
  params: PaginatedRequest & { name?: string; is_recycle?: number },
) {
  const res = await http.post<CommonResponse<PaginatedData<RbacStore>>>('/rbac/store/list', params)
  return res.data.data
}

export async function createStore(data: Partial<RbacStore>) {
  const res = await http.post<CommonResponse>('/rbac/store/create', data)
  return res.data
}

export async function updateStore(data: Partial<RbacStore> & { id: number }) {
  const res = await http.post<CommonResponse>('/rbac/store/update', data)
  return res.data
}

export async function deleteStore(id: number) {
  const res = await http.post<CommonResponse>('/rbac/store/delete', { id })
  return res.data
}

export async function recycleStore(id: number) {
  const res = await http.post<CommonResponse>('/rbac/store/recycle', { id })
  return res.data
}

export async function restoreStore(id: number) {
  const res = await http.post<CommonResponse>('/rbac/store/restore', { id })
  return res.data
}

export async function getApiList() {
  const res = await http.post<CommonResponse<RbacApi[]>>('/rbac/api/list', {})
  return res.data.data || []
}

export async function createApi(data: Partial<RbacApi>) {
  await http.post('/rbac/api/create', data)
}

export async function updateApi(data: Partial<RbacApi> & { id: number }) {
  await http.post('/rbac/api/update', data)
}

export async function deleteApi(id: number) {
  await http.post('/rbac/api/delete', { id })
}
