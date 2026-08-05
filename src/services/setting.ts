import http from './http'
import type { CommonResponse, PaginatedData, SettingDefault } from '@/types'

export async function getSettingDefaultList(params: {
  page: number
  limit: number
  setting_key?: string
}) {
  const res = await http.post<CommonResponse<PaginatedData<SettingDefault>>>(
    '/setting/default/list',
    params,
  )
  return res.data.data
}

export async function createSettingDefault(data: Partial<SettingDefault>) {
  const res = await http.post<CommonResponse>('/setting/default/create', data)
  return res.data
}

export async function updateSettingDefault(data: Partial<SettingDefault> & { id: number }) {
  const res = await http.post<CommonResponse>('/setting/default/update', data)
  return res.data
}

export async function deleteSettingDefault(id: number) {
  const res = await http.post<CommonResponse>('/setting/default/delete', { id })
  return res.data
}

export async function getFormConfigs(params?: { only_platform?: boolean }) {
  const res = await http.post<CommonResponse>('/setting/form-configs', params || {})
  return res.data
}

export async function getQiniuToken() {
  const res =
    await http.post<CommonResponse<{ token: string; domain: string; upload_url: string }>>(
      '/setting/qiniu-token',
    )
  return res.data
}
