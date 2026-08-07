import type { ReactNode } from 'react'

export interface CommonResponse<T = unknown> {
  errcode: number
  message: string
  data: T
  cost: string
  traceId: string
}

export interface PaginatedRequest {
  page: number
  limit: number
}

export interface PaginatedData<T> {
  list: T[]
  total: number
}

export interface PlatformUser {
  id: number
  username: string
  real_name: string
  avatar_id: number
  role: number
  status: number
  last_login_time: number
  last_login_ip: string
  created_at: number
  updated_at: number
}

export interface LoginRequest {
  username: string
  password: string
  captcha_id: string
  captcha_code: string
}

export interface LoginResponse {
  token: string
  ttl: number
  user: PlatformUser
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

export interface CaptchaResponse {
  captcha_id: string
  master_image: string
  thumb_image: string
}

export interface RbacStore {
  id: number
  name: string
  short_name: string
  contact: string
  contact_phone: string
  description: string
  logo_image_id: number
  sort: number
  is_recycle: number
  created_at: number
  updated_at: number
}

export interface CreateStoreResponse {
  store_id: number
  username: string
  password: string
}

export interface RbacUser {
  id: number
  username: string
  real_name: string
  is_super: number
  sort: number
  store_id: number
  created_at: number
  updated_at: number
  rbac_user_role?: Array<{
    id: number
    user_id: number
    role_id: number
    store_id: number
    created_at: number
    rbac_role: RbacRole
  }>
}

export interface RbacMenu {
  id: number
  type: number
  name: string
  path: string
  is_page: number
  module_key: string
  action_mark: string
  parent_id: number
  sort: number
  created_at: number
  updated_at: number
  children?: RbacMenu[]
  actions?: RbacMenu[]
}

export interface RbacApi {
  id: number
  name: string
  url: string
  parent_id: number
  sort: number
  created_at: number
  updated_at: number
  children?: RbacApi[]
}

export interface RbacRole {
  id: number
  role_name: string
  parent_id: number
  sort: number
  is_super: number
  store_id: number
  created_at: number
  updated_at: number
  rbac_role_menu?: Array<{
    id: number
    role_id: number
    menu_id: number
    store_id: number
    created_at: number
    updated_at: number
    rbac_menu: RbacMenu
  }>
}

export interface SettingDefault {
  id: number
  setting_key: string
  setting_values: string
  description: string
  created_at: number
  updated_at: number
}

export interface UploadGroup {
  id: number
  name: string
  parent_id: number
  sort: number
  store_id: number
  created_at: number
  updated_at: number
  children?: UploadGroup[]
}

export interface UploadFile {
  id: number
  group_id: number
  channel: number
  storage: string
  domain: string
  file_type: number
  file_name: string
  file_path: string
  file_size: number
  file_ext: string
  cover: string
  uploader_id: number
  store_id: number
  created_at: number
  updated_at: number
}

export interface FormOption {
  label: string
  value: string
}

export interface FormField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'switch' | 'image' | 'file'
  required: boolean
  options: FormOption[] | null
}

export interface FormGroup {
  key: string
  label: string
  description: string
  only_platform: boolean
  fields: FormField[]
}

export interface MenuTreeNode {
  title: ReactNode
  key: number
  children?: MenuTreeNode[]
}

export interface MenuImportItem {
  path: string
  title: string
  module_key: string
  children?: MenuImportItem[]
  meta?: { sort?: number }
}

export interface MenuSyncItem {
  name: string
  type: number
  path: string
  is_page: number
  module_key: string
  sort: number
  parent_id: number
  children?: MenuSyncItem[]
}

export interface DailyCount {
  date: string
  count: number
}

export interface DashboardOverview {
  store_total: number
  store_monthly_new: number
  user_total: number
  user_monthly_new: number
  file_total: number
  file_total_size: number
}

export interface DashboardStats {
  overview: DashboardOverview
  trends: {
    store: DailyCount[]
    user: DailyCount[]
  }
}
