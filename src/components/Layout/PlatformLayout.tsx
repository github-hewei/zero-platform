import { useMemo, Suspense } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Dropdown, Avatar, Space, Spin, App, Button } from 'antd'
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
import type { MenuProps } from 'antd'
import { useAuthStore, useThemeStore } from '@/stores'
import { CONTAINER_WIDTH, SIDEBAR_WIDTH } from '@/styles/theme'

const topNavItems: NonNullable<MenuProps['items']> = [
  { key: '/home', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/rbac', icon: <SafetyCertificateOutlined />, label: '权限管理' },
  { key: '/users', icon: <TeamOutlined />, label: '平台用户' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
]

const subMenuMap: Record<string, NonNullable<MenuProps['items']>> = {
  '/rbac': [
    { key: '/rbac/enterprise', icon: <ApartmentOutlined />, label: '企业管理' },
    { key: '/rbac/role', icon: <SolutionOutlined />, label: '角色管理' },
    { key: '/rbac/menu', icon: <MenuIcon />, label: '菜单管理' },
    { key: '/rbac/api', icon: <ApiOutlined />, label: 'API管理' },
    { key: '/rbac/account', icon: <KeyOutlined />, label: '账号管理' },
  ],
}

export default function PlatformLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { message } = App.useApp()
  const { mode, toggle: toggleTheme } = useThemeStore()
  const isDark = mode === 'dark'

  const activeTopKey = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/home') || path === '/') return '/home'
    if (path.startsWith('/rbac')) return '/rbac'
    if (path.startsWith('/users')) return '/users'
    if (path.startsWith('/settings')) return '/settings'
    return '/home'
  }, [location.pathname])

  const subItems = subMenuMap[activeTopKey] || null
  const showSidebar = subItems !== null

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ]

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      useAuthStore.getState().logout()
      localStorage.removeItem('platform_token')
      navigate('/login')
      message.success('已退出登录')
    }
  }

  const handleTopNavClick = (info: { key: string }) => {
    if (info.key === '/home') {
      navigate('/home')
    } else if (subMenuMap[info.key]?.length) {
      navigate(subMenuMap[info.key]![0]!.key as string)
    } else {
      navigate(info.key)
    }
  }

  const headerBg = isDark ? '#0D1525' : '#FFFFFF'
  const headerBorder = isDark ? '#1E293B' : '#E5E7EB'
  const outerBg = isDark ? '#0B1120' : '#F0F2F5'
  const sidebarBg = isDark ? '#151D2E' : '#FFFFFF'
  const sidebarBorder = isDark ? '#1E293B' : '#E5E7EB'

  return (
    <div style={{ minHeight: '100vh', background: outerBg }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
          height: 56,
        }}
      >
        <Space size={32}>
          <span
            className="font-mono"
            style={{
              color: '#F97316',
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
            style={{
              borderBottom: 'none',
              background: 'transparent',
            }}
          />
        </Space>

        <Space>
          <Button
            type="text"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          />
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                size={28}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#F97316' }}
              />
              <span style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 13 }}>
                {user?.real_name || user?.username || 'Admin'}
              </span>
            </Space>
          </Dropdown>
        </Space>
      </div>

      <div
        style={{
          maxWidth: CONTAINER_WIDTH,
          margin: '24px auto 0',
          padding: '0 24px',
          display: 'flex',
          gap: 24,
          minHeight: 'calc(100vh - 56px - 24px)',
        }}
      >
        {showSidebar && (
          <div style={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
            <Menu
              mode="inline"
              theme={isDark ? 'dark' : 'light'}
              selectedKeys={[location.pathname]}
              items={subItems}
              onClick={({ key }) => navigate(key)}
              style={{
                background: sidebarBg,
                border: `1px solid ${sidebarBorder}`,
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
