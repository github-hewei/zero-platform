import { useState, useMemo, useCallback } from 'react'
import { Upload, Image, Button, App } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { UploadFile, RcFile } from 'antd/es/upload/interface'
import { useUpload } from '@/hooks/useUpload'
import { useFileInfo, cacheFile } from '@/hooks/useFileInfo'

interface ImageUploadProps {
  value?: number
  onChange?: (id: number) => void
  maxCount?: number
  maxSize?: number
  disabled?: boolean
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024

export default function ImageUpload({
  value,
  onChange,
  maxCount = 1,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
}: ImageUploadProps) {
  const { message } = App.useApp()
  const { upload, uploading, progress } = useUpload()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const { url, loading: loadingFile } = useFileInfo(value)

  const fileList: UploadFile[] = useMemo(() => {
    if (value === undefined || value <= 0) return []
    return [
      { uid: `img-${value}`, name: `image-${value}`, status: 'done' as const, url: url || '' },
    ]
  }, [value, url])

  const handleChange = useCallback(
    async (info: { file: UploadFile }) => {
      const f = info.file as RcFile

      if (f.size && f.size > maxSize) {
        message.error(`文件大小不能超过 ${(maxSize / 1024 / 1024).toFixed(0)}MB`)
        return
      }

      try {
        const fileData = await upload(f)
        cacheFile(fileData)
        onChange?.(fileData.id)
      } catch (err) {
        message.error(err instanceof Error ? err.message : '上传失败，请重试')
      }
    },
    [upload, maxSize, onChange, message],
  )

  const handleRemove = () => {
    onChange?.(0)
  }

  const handlePreview = (file: UploadFile) => {
    setPreviewUrl(file.url || '')
    setPreviewOpen(true)
  }

  const uploadButton = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#94A3B8',
      }}
    >
      {uploading ? (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '3px solid #E2E8F0',
              borderTopColor: '#F97316',
              animation: 'image-upload-spin 0.8s linear infinite',
              margin: '0 auto 8px',
            }}
          />
          <span style={{ fontSize: 12 }}>{progress}%</span>
        </div>
      ) : (
        <>
          <PlusOutlined style={{ fontSize: 24, marginBottom: 8 }} />
          <span style={{ fontSize: 12 }}>上传图片</span>
        </>
      )}
    </div>
  )

  const itemRender = (_: unknown, file: UploadFile) => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 6,
      }}
    >
      {loadingFile ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F8F9FA',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '2px solid #E2E8F0',
              borderTopColor: '#F97316',
              animation: 'image-upload-spin 0.8s linear infinite',
            }}
          />
        </div>
      ) : file.url ? (
        <img
          src={file.url}
          alt={file.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F8F9FA',
            color: '#94A3B8',
            fontSize: 12,
          }}
        >
          暂无图片
        </div>
      )}
      {!disabled && !loadingFile && file.url && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            background: 'rgba(0,0,0,0)',
            opacity: 0,
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = 'rgba(0,0,0,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0'
            e.currentTarget.style.background = 'rgba(0,0,0,0)'
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined style={{ color: '#fff', fontSize: 16 }} />}
            onClick={(e) => {
              e.stopPropagation()
              handlePreview(file)
            }}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined style={{ color: '#fff', fontSize: 16 }} />}
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
          />
        </div>
      )}
    </div>
  )

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={() => false}
        accept="image/*"
        maxCount={maxCount}
        disabled={disabled}
        itemRender={itemRender}
      >
        {fileList.length < maxCount && !disabled ? uploadButton : null}
      </Upload>

      <Image
        style={{ display: 'none' }}
        src={previewUrl || undefined}
        preview={{
          open: previewOpen,
          onOpenChange: setPreviewOpen,
        }}
      />
    </>
  )
}
