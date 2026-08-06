import { useState, useCallback } from 'react'
import { uploadFile } from '@/services/upload'
import type { UploadFile } from '@/types'

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
      const fileData = await uploadFile(file, (pct) => {
        setProgress(pct)
        options?.onProgress?.(pct)
      })
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
