import { useState, useCallback } from 'react'
import http from '@/services/http'
import type { CommonResponse, UploadFile } from '@/types'

interface UploadOptions {
  onProgress?: (percent: number) => void
  onSuccess?: (file: UploadFile) => void
  onError?: (err: Error) => void
}

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(async (file: File, options?: UploadOptions) => {
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await http.post<CommonResponse<UploadFile>>('/upload/file/upload', formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setProgress(pct)
            options?.onProgress?.(pct)
          }
        },
      })

      const fileData = res.data.data
      options?.onSuccess?.(fileData)
      return fileData
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed')
      options?.onError?.(error)
      throw error
    } finally {
      setUploading(false)
    }
  }, [])

  return { upload, uploading, progress }
}
