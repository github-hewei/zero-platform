import http from './http'
import type { CommonResponse, UploadFile } from '@/types'

export async function getFileDetail(id: number) {
  const res = await http.post<CommonResponse<UploadFile>>('/upload/file/detail', { id })
  return res.data.data
}

export async function uploadFile(file: File, onUploadProgress?: (percent: number) => void) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await http.post<CommonResponse<UploadFile>>('/upload/file/upload', formData, {
    onUploadProgress: (e) => {
      if (e.total) {
        const pct = Math.round((e.loaded / e.total) * 100)
        onUploadProgress?.(pct)
      }
    },
  })
  return res.data.data
}
