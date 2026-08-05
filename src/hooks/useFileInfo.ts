import { useState, useEffect, useRef } from 'react'
import { getFileDetail } from '@/services/upload'
import type { UploadFile } from '@/types'

const cache = new Map<number, UploadFile>()
const pending = new Map<number, Promise<UploadFile>>()

export function fileUrl(file: UploadFile): string {
  return (file.domain || '') + file.file_path
}

export function cacheFile(file: UploadFile) {
  cache.set(file.id, file)
}

export function getFileInfo(id: number): UploadFile | undefined {
  return cache.get(id)
}

export function useFileInfo(id: number | undefined) {
  const [file, setFile] = useState<UploadFile | null>(null)
  const [loading, setLoading] = useState(false)
  const versionRef = useRef(0)

  useEffect(() => {
    if (id === undefined || id <= 0) {
      setFile(null)
      setLoading(false)
      return
    }

    const cached = cache.get(id)
    if (cached) {
      setFile(cached)
      return
    }

    if (!pending.has(id)) {
      pending.set(
        id,
        getFileDetail(id).then((data) => {
          cache.set(data.id, data)
          pending.delete(id)
          return data
        }),
      )
    }

    const version = ++versionRef.current
    setLoading(true)

    pending.get(id)!.then((data) => {
      if (version === versionRef.current) {
        setFile(data)
        setLoading(false)
      }
    })
  }, [id])

  const url = file ? fileUrl(file) : ''

  return { file, url, loading }
}
