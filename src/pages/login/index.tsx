import { useState } from 'react'
import { Button, Form, Input, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '@/stores'
import { setToken } from '@/services/token'
import { COLORS } from '@/styles/constants'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { message } = App.useApp()
  const isDark = useThemeStore((s) => s.mode === 'dark')

  const palette = isDark ? COLORS.dark : COLORS.light

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      setToken('mock-token')
      useAuthStore.getState().setAuth('mock-token', {
        id: 1,
        username: values.username,
        real_name: '超级管理员',
      })
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
        alignItems: 'center',
        justifyContent: 'center',
        background: palette.bg,
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 780,
          minHeight: 440,
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            width: 280,
            background: 'linear-gradient(160deg, #E0680B 0%, #C2410C 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 32,
              right: 24,
              width: 120,
              height: 1,
              background: 'rgba(255,255,255,0.12)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 40,
              right: 24,
              width: 1,
              height: 40,
              background: 'rgba(255,255,255,0.08)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, color: '#FFFFFF' }}>
            <div
              className="font-mono"
              style={{ fontSize: 13, fontWeight: 500, letterSpacing: 4, opacity: 0.6 }}
            >
              ZERO
            </div>

            <div
              className="font-mono"
              style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, marginTop: 6 }}
            >
              PLATFORM
            </div>

            <div
              style={{
                width: 32,
                height: 1,
                background: 'rgba(255,255,255,0.25)',
                marginTop: 20,
                marginBottom: 20,
              }}
            />

            <p style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.8, margin: 0 }}>
              多租户平台
              <br />
              统一管理中心
            </p>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: palette.surface,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 56,
          }}
        >
          <div style={{ marginBottom: 36 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: isDark ? COLORS.dark.textPrimary : COLORS.light.textPrimary,
                letterSpacing: 1,
                margin: 0,
              }}
            >
              登录
            </h2>
            <p style={{ fontSize: 13, color: palette.textTertiary, marginTop: 4 }}>
              请输入平台管理员账号
            </p>
          </div>

          <Form onFinish={onFinish} size="large" layout="vertical">
            <Form.Item name="username" rules={[{ required: true, message: '请输入管理员账号' }]}>
              <Input
                prefix={<UserOutlined style={{ color: palette.textTertiary }} />}
                placeholder="管理员账号"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
              style={{ marginBottom: 28 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: palette.textTertiary }} />}
                placeholder="密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 42, fontSize: 14, fontWeight: 500 }}
              >
                登 录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  )
}
