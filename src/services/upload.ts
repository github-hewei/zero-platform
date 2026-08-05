import http from './http'
import type { CommonResponse, UploadFile } from '@/types'

export async function getFileDetail(id: number) {
  const res = await http.post<CommonResponse<UploadFile>>('/upload/file/detail', { id })
  return res.data.data
}
