import { Suspense } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Dropdown, Avatar, Space, Spin, App, Button } from 'antd'
import type { ItemType } from 'antd/es/menu/interface'
import {
  DashboardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  MenuOutlined as MenuIcon,
  ApiOutlined,
  KeyOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import { useAuthStore, useThemeStore } from '@/stores'
import { clearToken } from '@/services/token'
import { COLORS, LAYOUT } from '@/styles/constants'

const topNavItems: ItemType[] = [
  { key: '/home', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/rbac', icon: <SafetyCertificateOutlined />, label: '权限管理' },
  { key: '/users', icon: <TeamOutlined />, label: '平台用户' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
]

const subMenuMap: Record<string, ItemType[]> = {
  '/rbac': [
    { key: '/rbac/enterprise', icon: <ApartmentOutlined />, label: '企业管理' },
    { key: '/rbac/role', icon: <SolutionOutlined />, label: '角色管理' },
    { key: '/rbac/menu', icon: <MenuIcon />, label: '菜单管理' },
    { key: '/rbac/api', icon: <ApiOutlined />, label: 'API管理' },
    { key: '/rbac/account', icon: <KeyOutlined />, label: '账号管理' },
  ],
}

function resolveTopKey(pathname: string) {
  if (pathname === '/' || pathname.startsWith('/home')) return '/home'
  for (const prefix of ['/rbac', '/users', '/settings']) {
    if (pathname.startsWith(prefix)) return prefix
  }
  return '/home'
}

function resolveFirstChild(topKey: string) {
  const items = subMenuMap[topKey]
  if (items?.length && items[0]?.key) return items[0].key as string
  return topKey
}

export default function PlatformLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const { message } = App.useApp()
  const { mode, toggle: toggleTheme } = useThemeStore()

  const isDark = mode === 'dark'
  const activeTopKey = resolveTopKey(pathname)
  const subItems = subMenuMap[activeTopKey]
  const hasSubMenu = subItems != null

  const palette = isDark ? COLORS.dark : COLORS.light

  const userMenuItems: ItemType[] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ]

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      useAuthStore.getState().logout()
      clearToken()
      navigate('/login')
      message.success('已退出登录')
    }
  }

  const handleTopNavClick = ({ key }: { key: string }) => {
    navigate(resolveFirstChild(key))
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.bg }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: palette.headerBg,
          borderBottom: `1px solid ${palette.border}`,
          height: 56,
        }}
      >
        <Space size={32}>
          <span
            className="font-mono"
            style={{
              color: COLORS.primary,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 3,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/home')}
          >
            PLATFORM
          </span>
          <Menu
            mode="horizontal"
            theme={isDark ? 'dark' : 'light'}
            selectedKeys={[activeTopKey]}
            items={topNavItems}
            onClick={handleTopNavClick}
            style={{ borderBottom: 'none', background: 'transparent' }}
          />
        </Space>

        <Space>
          <Button
            type="text"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{ color: palette.textSecondary }}
          />
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                size={28}
                icon={<UserOutlined />}
                style={{ backgroundColor: COLORS.primary }}
              />
              <span style={{ color: palette.textSecondary, fontSize: 13 }}>
                {user?.real_name || user?.username || 'Admin'}
              </span>
            </Space>
          </Dropdown>
        </Space>
      </div>

      <div
        style={{
          maxWidth: LAYOUT.containerWidth,
          margin: '24px auto 0',
          padding: '0 24px',
          display: 'flex',
          gap: 24,
          minHeight: 'calc(100vh - 56px - 24px)',
        }}
      >
        {hasSubMenu && (
          <div style={{ width: LAYOUT.sidebarWidth, flexShrink: 0 }}>
            <Menu
              mode="inline"
              theme={isDark ? 'dark' : 'light'}
              selectedKeys={[pathname]}
              items={subItems}
              onClick={({ key }) => navigate(key)}
              style={{
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                borderRadius: 6,
                padding: '8px 0',
              }}
            />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0, paddingBottom: 24 }}>
          <Suspense
            fallback={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300,
                }}
              >
                <Spin size="large" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
