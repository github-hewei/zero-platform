import { useState, useCallback } from 'react'
import http from '@/services/http'
import type { CommonResponse } from '@/types'

interface UploadOptions {
  onProgress?: (percent: number) => void
  onSuccess?: (url: string) => void
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

      const res = await http.post<CommonResponse<{ url: string }>>(
        '/upload/file/upload',
        formData,
        {
          onUploadProgress: (e) => {
            if (e.total) {
              const pct = Math.round((e.loaded / e.total) * 100)
              setProgress(pct)
              options?.onProgress?.(pct)
            }
          },
        },
      )

      const url = res.data.data.url
      options?.onSuccess?.(url)
      return url
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
