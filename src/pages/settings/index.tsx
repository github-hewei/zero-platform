import { Card } from 'antd'

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: 1200 }}>
      <Card title={<span className="font-serif">系统设置</span>}>
        <p style={{ color: '#9CA3AF', fontSize: 13 }}>平台默认参数、全局配置、系统偏好设置（功能开发中）</p>
      </Card>
    </div>
  )
}
