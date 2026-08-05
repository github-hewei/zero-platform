import { useState, useRef } from 'react'
import { Button, App } from 'antd'
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons'
import { useUpload } from '@/hooks/useUpload'
import { useFileInfo, cacheFile } from '@/hooks/useFileInfo'

interface FileUploadProps {
  value?: number
  onChange?: (id: number) => void
  maxSize?: number
  disabled?: boolean
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024

export default function FileUpload({
  value,
  onChange,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
}: FileUploadProps) {
  const { message } = App.useApp()
  const { upload, uploading, progress } = useUpload()
  const [hover, setHover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { file, loading } = useFileInfo(value)

  const hasFile = value !== undefined && value > 0
  const displayName = file?.file_name || '文件'

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileItem = e.target.files?.[0]
    if (!fileItem) return
    if (fileItem.size > maxSize) {
      message.error(`文件大小不能超过 ${(maxSize / 1024 / 1024).toFixed(0)}MB`)
      return
    }
    try {
      const fileData = await upload(fileItem)
      cacheFile(fileData)
      onChange?.(fileData.id)
      message.success('上传成功')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '上传失败，请重试')
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleRemove = () => {
    onChange?.(0)
  }

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const fileItem = e.dataTransfer.files?.[0]
    if (!fileItem || disabled) return
    if (fileItem.size > maxSize) {
      message.error(`文件大小不能超过 ${(maxSize / 1024 / 1024).toFixed(0)}MB`)
      return
    }
    upload(fileItem)
      .then((fileData) => {
        cacheFile(fileData)
        onChange?.(fileData.id)
        message.success('上传成功')
      })
      .catch((err) => message.error(err instanceof Error ? err.message : '上传失败，请重试'))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  if (disabled) {
    return (
      <>
        <div
          style={{
            border: '1px solid #E2E8F0',
            borderRadius: 6,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#F8F9FA',
            opacity: 0.6,
          }}
        >
          <FileOutlined style={{ fontSize: 20, color: '#94A3B8' }} />
          <span style={{ color: '#64748B', flex: 1 }}>{hasFile ? displayName : '无文件'}</span>
        </div>
        <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
      </>
    )
  }

  if (hasFile) {
    return (
      <>
        <div
          style={{
            border: '1px solid #E2E8F0',
            borderRadius: 6,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: hover ? '#F1F5F9' : '#FFFFFF',
            transition: 'background 0.2s',
            position: 'relative',
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div
            onClick={handleClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flex: 1,
              cursor: 'pointer',
              minWidth: 0,
            }}
          >
            {loading ? (
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '2px solid #E2E8F0',
                  borderTopColor: '#F97316',
                  animation: 'image-upload-spin 0.8s linear infinite',
                  flexShrink: 0,
                }}
              />
            ) : (
              <FileOutlined style={{ fontSize: 24, color: '#F97316', flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 500,
                  color: '#0F172A',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>点击可替换文件</div>
            </div>
          </div>
          <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={handleRemove}>
            移除
          </Button>
        </div>
        <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
      </>
    )
  }

  return (
    <>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '1px dashed #CBD5E1',
          borderRadius: 6,
          padding: '24px 16px',
          textAlign: 'center',
          background: hover ? '#F8F9FA' : '#FFFFFF',
          transition: 'border-color 0.2s, background 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {uploading ? (
          <div>
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
            <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A', marginBottom: 4 }}>
              上传中
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>{progress}%</div>
          </div>
        ) : (
          <div>
            <UploadOutlined style={{ fontSize: 24, color: '#94A3B8', marginBottom: 8 }} />
            <div style={{ fontSize: 14, color: '#64748B' }}>点击或拖拽文件上传</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
    </>
  )
}
