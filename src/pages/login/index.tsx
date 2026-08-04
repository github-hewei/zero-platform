import { useState } from 'react'
import { Button, Card, Form, Input, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '@/stores'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { message } = App.useApp()
  const isDark = useThemeStore((s) => s.mode === 'dark')

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      useAuthStore.getState().setAuth('mock-token', {
        id: 1,
        username: values.username,
        real_name: '超级管理员',
      })
      localStorage.setItem('platform_token', 'mock-token')
      message.success('登录成功')
      navigate('/home')
    } catch {
      message.error('登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? '#0B1120' : '#F0F2F5',
      }}
    >
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1
          className="font-mono"
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#F97316',
            letterSpacing: 6,
            margin: 0,
          }}
        >
          PLATFORM
        </h1>
        <p style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 12, letterSpacing: 3, marginTop: 8 }}>
          ZERO PLATFORM
        </p>
      </div>
      <Card style={{ width: 380 }}>
        <Form onFinish={onFinish} size="large" layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="账号" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <p style={{ color: isDark ? '#334155' : '#D1D5DB', fontSize: 12, marginTop: 24 }}>
        Zero Platform · 平台管理系统
      </p>
    </div>
  )
}
