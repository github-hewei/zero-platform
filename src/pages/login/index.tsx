import { useState, useRef, useCallback, useEffect } from 'react'
import { Button, Form, Input, App, Modal, Space } from 'antd'
import { UserOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, usePermissionStore } from '@/stores'
import { login as loginApi, getCaptcha } from '@/services/auth'
import { getPermissionsByRole } from '@/services/permissions'
import type { CaptchaResponse } from '@/types'
import { COLORS } from '@/styles/constants'

interface ClickPoint {
  x: number
  y: number
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [captchaOpen, setCaptchaOpen] = useState(false)
  const [captchaData, setCaptchaData] = useState<CaptchaResponse | null>(null)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [clickPoints, setClickPoints] = useState<ClickPoint[]>([])
  const [clickDisplays, setClickDisplays] = useState<{ left: string; top: string }[]>([])
  const captchaImgRef = useRef<HTMLImageElement>(null)

  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (token) {
      navigate('/home', { replace: true })
    }
  }, [token, navigate])

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    setClickPoints([])
    setClickDisplays([])
    try {
      const data = await getCaptcha()
      setCaptchaData(data)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取验证码失败')
    } finally {
      setCaptchaLoading(false)
    }
  }, [message])

  const openCaptcha = useCallback(async () => {
    try {
      await form.validateFields()
    } catch {
      return
    }
    setCaptchaOpen(true)
    fetchCaptcha()
  }, [form, fetchCaptcha])

  const handleCaptchaClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = captchaImgRef.current
    if (!img) return

    const rect = img.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const scaleX = img.naturalWidth / rect.width
    const scaleY = img.naturalHeight / rect.height

    setClickPoints((prev) => [
      ...prev,
      { x: Math.round(clickX * scaleX), y: Math.round(clickY * scaleY) },
    ])
    setClickDisplays((prev) => [
      ...prev,
      {
        left: `${(clickX / rect.width) * 100}%`,
        top: `${(clickY / rect.height) * 100}%`,
      },
    ])
  }

  const handleCaptchaConfirm = async () => {
    if (!captchaData) return
    if (clickPoints.length === 0) {
      message.warning('请点击验证码图片')
      return
    }

    const values = form.getFieldsValue()
    setCaptchaOpen(false)
    setLoading(true)

    try {
      const result = await loginApi({
        username: values.username,
        password: values.password,
        captcha_id: captchaData.captcha_id,
        captcha_code: JSON.stringify(clickPoints),
      })

      useAuthStore.getState().setAuth(result.token, result.user)
      message.success('登录成功')

      const perm = getPermissionsByRole(result.user.role)
      usePermissionStore.getState().setPermissions(perm.menus, perm.paths, perm.actions)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: COLORS.light.bg,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 780,
            minHeight: 440,
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
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
              background: COLORS.light.surface,
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
                  color: COLORS.light.textPrimary,
                  letterSpacing: 1,
                  margin: 0,
                }}
              >
                登录
              </h2>
              <p style={{ fontSize: 13, color: COLORS.light.textTertiary, marginTop: 4 }}>
                请输入平台管理员账号
              </p>
            </div>

            <Form form={form} size="large" layout="vertical">
              <Form.Item name="username" rules={[{ required: true, message: '请输入管理员账号' }]}>
                <Input
                  prefix={<UserOutlined style={{ color: COLORS.light.textTertiary }} />}
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
                  prefix={<LockOutlined style={{ color: COLORS.light.textTertiary }} />}
                  placeholder="密码"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={openCaptcha}
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

      <Modal
        title="安全验证"
        open={captchaOpen}
        onOk={handleCaptchaConfirm}
        onCancel={() => setCaptchaOpen(false)}
        okText="确认"
        cancelText="取消"
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          {captchaLoading || !captchaData ? (
            <div style={{ padding: 40, color: '#94A3B8' }}>加载中...</div>
          ) : (
            <>
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  cursor: 'pointer',
                  border: '1px solid #E5E7EB',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <img
                  ref={captchaImgRef}
                  src={captchaData.master_image}
                  alt="验证码"
                  onClick={handleCaptchaClick}
                  style={{ display: 'block', width: 300, height: 200, objectFit: 'cover' }}
                  draggable={false}
                />
                {clickDisplays.map((dot, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: dot.left,
                      top: dot.top,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'rgba(249, 115, 22, 0.7)',
                      border: '2px solid #F97316',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                    }}
                  />
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <Space>
                  <img
                    src={captchaData.thumb_image}
                    alt="参考图"
                    style={{
                      width: 160,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 2,
                      border: '1px solid #E5E7EB',
                    }}
                  />
                  <Button
                    icon={<ReloadOutlined />}
                    size="small"
                    onClick={fetchCaptcha}
                    loading={captchaLoading}
                  >
                    换一张
                  </Button>
                </Space>
              </div>
              <p style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>请依次点击图中文字</p>
            </>
          )}
        </div>
      </Modal>
    </>
  )
}
