import type { RbacMenu } from '@/types'

interface PermissionConfig {
  paths: string[]
  actions: string[]
}

const ALL_PATHS = [
  '/home',
  '/rbac/enterprise',
  '/rbac/user',
  '/rbac/role',
  '/rbac/menu',
  '/rbac/api',
  '/settings/general',
  '/settings/users',
]

const ALL_ACTIONS = [
  'PlatformUser:create',
  'PlatformUser:update',
  'PlatformUser:delete',
  'PlatformUser:resetpassword',
  'EnterpriseStore:create',
  'EnterpriseStore:update',
  'EnterpriseStore:delete',
  'EnterpriseStore:recycle',
  'EnterpriseStore:restore',
  'Api:create',
  'Api:update',
  'Api:delete',
]

const OPERATOR_ACTIONS = [
  'EnterpriseStore:create',
  'EnterpriseStore:update',
  'EnterpriseStore:delete',
  'EnterpriseStore:recycle',
  'EnterpriseStore:restore',
]

const OPERATOR_PATHS = ['/home', '/rbac/enterprise', '/rbac/user', '/settings/general']

const rolePermissionMap: Record<number, PermissionConfig> = {
  0: { paths: ALL_PATHS, actions: ALL_ACTIONS },
  1: { paths: OPERATOR_PATHS, actions: OPERATOR_ACTIONS },
  2: { paths: ['/home'], actions: [] },
}

export function getPermissionsByRole(role: number): {
  menus: RbacMenu[]
  paths: string[]
  actions: string[]
} {
  const config = rolePermissionMap[role] || rolePermissionMap[2]
  return { menus: [], paths: config.paths, actions: config.actions }
}
