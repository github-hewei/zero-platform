import { useState, useMemo } from 'react'
import { Upload, Image, Button, App } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { UploadFile, RcFile } from 'antd/es/upload/interface'
import { useUpload } from '@/hooks/useUpload'

interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
  maxCount?: number
  maxSize?: number
  disabled?: boolean
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024

export default function ImageUpload({
  value = '',
  onChange,
  maxCount = 1,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
}: ImageUploadProps) {
  const { message } = App.useApp()
  const { upload, uploading, progress } = useUpload()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  const urls = useMemo(() => (value ? [value] : []), [value])

  const fileList: UploadFile[] = useMemo(
    () =>
      urls.map((url, i) => ({
        uid: `img-${i}-${url.slice(-8)}`,
        name: `image-${i}`,
        status: 'done' as const,
        url,
      })),
    [urls],
  )

  const handleChange = async (info: { file: UploadFile }) => {
    const file = info.file as RcFile

    if (file.size && file.size > maxSize) {
      message.error(`文件大小不能超过 ${(maxSize / 1024 / 1024).toFixed(0)}MB`)
      return
    }

    try {
      const url = await upload(file)
      onChange?.(url)
    } catch {
      message.error('上传失败，请重试')
    }
  }

  const handleRemove = (uid: string) => {
    const idx = fileList.findIndex((f) => f.uid === uid)
    if (idx === -1) return
    onChange?.('')
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
      <img
        src={file.url}
        alt={file.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {!disabled && (
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
              handleRemove(file.uid)
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
