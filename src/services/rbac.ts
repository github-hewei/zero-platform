import http from './http'
import type {
  CommonResponse,
  PaginatedData,
  PaginatedRequest,
  RbacStore,
  RbacApi,
  RbacRole,
  RbacMenu,
} from '@/types'

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

export async function getRoleList(
  params: { role_name?: string; store_id?: number } & PaginatedRequest,
) {
  const res = await http.post<CommonResponse<PaginatedData<RbacRole>>>('/rbac/role/list', params)
  return res.data.data
}

export async function createRole(data: { role_name: string; store_id: number; sort?: number }) {
  const res = await http.post<CommonResponse>('/rbac/role/create', data)
  return res.data
}

export async function updateRole(data: Partial<RbacRole> & { id: number; store_id: number }) {
  const res = await http.post<CommonResponse>('/rbac/role/update', data)
  return res.data
}

export async function deleteRole(id: number, storeId: number) {
  const res = await http.post<CommonResponse>('/rbac/role/delete', { id, store_id: storeId })
  return res.data
}

export async function setRoleMenus(roleId: number, menuIds: number[], storeId: number) {
  const res = await http.post<CommonResponse>('/rbac/role/set-menus', {
    role_id: roleId,
    menu_ids: menuIds,
    store_id: storeId,
  })
  return res.data
}

export async function getMenuList() {
  const res = await http.post<CommonResponse<RbacMenu[]>>('/rbac/menu/list', {})
  return res.data.data || []
}
