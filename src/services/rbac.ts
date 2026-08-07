import http from './http'
import type {
  CommonResponse,
  PaginatedData,
  PaginatedRequest,
  RbacStore,
  RbacApi,
  RbacRole,
  RbacMenu,
  RbacUser,
  MenuSyncItem,
  CreateStoreResponse,
  ApiSyncItem,
  MenuApiBindings,
  ResetPasswordResponse,
  CreateStoreRequest,
  UpdateStoreRequest,
  CreateMenuRequest,
  UpdateMenuRequest,
  CreateApiRequest,
  UpdateApiRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreateRbacUserRequest,
  UpdateRbacUserRequest,
} from '@/types'

export async function getStoreList(
  params: PaginatedRequest & { name?: string; is_recycle?: number },
) {
  const res = await http.post<CommonResponse<PaginatedData<RbacStore>>>('/rbac/store/list', params)
  return res.data.data
}

export async function createStore(data: CreateStoreRequest) {
  const res = await http.post<CommonResponse<CreateStoreResponse>>('/rbac/store/create', data)
  return res.data
}

export async function updateStore(data: UpdateStoreRequest) {
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

export async function createApi(data: CreateApiRequest) {
  const res = await http.post<CommonResponse>('/rbac/api/create', data)
  return res.data
}

export async function updateApi(data: UpdateApiRequest) {
  const res = await http.post<CommonResponse>('/rbac/api/update', data)
  return res.data
}

export async function deleteApi(id: number) {
  const res = await http.post<CommonResponse>('/rbac/api/delete', { id })
  return res.data
}

export async function getRoleList(
  params: { role_name?: string; store_id?: number } & PaginatedRequest,
) {
  const res = await http.post<CommonResponse<PaginatedData<RbacRole>>>('/rbac/role/list', params)
  return res.data.data
}

export async function createRole(data: CreateRoleRequest) {
  const res = await http.post<CommonResponse>('/rbac/role/create', data)
  return res.data
}

export async function updateRole(data: UpdateRoleRequest) {
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

export async function createMenu(data: CreateMenuRequest) {
  const res = await http.post<CommonResponse>('/rbac/menu/create', data)
  return res.data
}

export async function updateMenu(data: UpdateMenuRequest) {
  const res = await http.post<CommonResponse>('/rbac/menu/update', data)
  return res.data
}

export async function deleteMenu(id: number) {
  const res = await http.post<CommonResponse>('/rbac/menu/delete', { id })
  return res.data
}

export async function syncMenu(data: MenuSyncItem[]) {
  const res = await http.post<CommonResponse>('/rbac/menu/sync', data)
  return res.data
}

export async function syncApi(data: ApiSyncItem[]) {
  const res = await http.post<CommonResponse>('/rbac/api/sync', data)
  return res.data
}

export async function getMenuApis(menuId: number) {
  const res = await http.post<CommonResponse<MenuApiBindings>>('/rbac/menu/api/list', {
    menu_id: menuId,
  })
  return res.data.data.api_ids || []
}

export async function saveMenuApis(menuId: number, apiIds: number[]) {
  const res = await http.post<CommonResponse>('/rbac/menu/api/save', {
    menu_id: menuId,
    api_ids: apiIds,
  })
  return res.data
}

export async function getRbacUserList(
  params: PaginatedRequest & { store_id?: number; username?: string; real_name?: string },
) {
  const res = await http.post<CommonResponse<PaginatedData<RbacUser>>>('/rbac/user/list', params)
  return res.data.data
}

export async function createRbacUser(data: CreateRbacUserRequest) {
  const res = await http.post<CommonResponse>('/rbac/user/create', data)
  return res.data
}

export async function updateRbacUser(data: UpdateRbacUserRequest) {
  const res = await http.post<CommonResponse>('/rbac/user/update', data)
  return res.data
}

export async function deleteRbacUser(id: number, storeId: number) {
  const res = await http.post<CommonResponse>('/rbac/user/delete', { id, store_id: storeId })
  return res.data
}

export async function resetRbacUserPassword(id: number, storeId: number) {
  const res = await http.post<CommonResponse<ResetPasswordResponse>>('/rbac/user/reset-password', {
    id,
    store_id: storeId,
  })
  return res.data
}

export async function setRbacUserRoles(userId: number, roleIds: number[], storeId: number) {
  const res = await http.post<CommonResponse>('/rbac/user/set-roles', {
    user_id: userId,
    role_ids: roleIds,
    store_id: storeId,
  })
  return res.data
}
