import http from './http'
import type { CommonResponse, DashboardStats } from '@/types'

export async function getDashboardStats() {
  const res = await http.post<CommonResponse<DashboardStats>>('/dashboard/stats', {})
  return res.data.data
}
