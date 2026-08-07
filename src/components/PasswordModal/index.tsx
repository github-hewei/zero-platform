import { Button, Modal } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { App } from 'antd'

interface PasswordModalProps {
  open: boolean
  title: string
  username?: string
  password: string
  onClose: () => void
}

export default function PasswordModal({
  open,
  title,
  username,
  password,
  onClose,
}: PasswordModalProps) {
  const { message } = App.useApp()

  const handleCopy = () => {
    const text = username ? `账号：${username}\n密码：${password}` : `新密码：${password}`
    navigator.clipboard
      .writeText(text)
      .then(() => message.success('已复制'))
      .catch(() => message.error('复制失败，请手动复制'))
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose} block>
          我已保存，关闭
        </Button>
      }
      maskClosable={false}
      width={440}
      destroyOnHidden
    >
      <div style={{ paddingTop: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '14px 16px',
            border: '1px dashed #F97316',
            borderRadius: 6,
            background: 'rgba(249, 115, 22, 0.06)',
          }}
        >
          <div>
            {username && (
              <div style={{ fontSize: 12, color: '#64748B' }}>
                账号：
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: '#1E293B',
                  }}
                >
                  {username}
                </span>
              </div>
            )}
            <div style={{ fontSize: 12, color: '#64748B', marginTop: username ? 6 : 0 }}>
              {username ? '密码：' : '新密码：'}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1E293B',
                }}
              >
                {password}
              </span>
            </div>
          </div>
          <Button type="default" icon={<CopyOutlined />} onClick={handleCopy}>
            复制
          </Button>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
          密码仅显示一次，关闭后将无法再次查看。请妥善保管。
        </div>
      </div>
    </Modal>
  )
}
