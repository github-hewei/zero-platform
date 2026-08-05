import { Suspense, useMemo } from 'react'
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
import { useAuthStore, useThemeStore, usePermissionStore } from '@/stores'
import { logout as logoutApi } from '@/services/auth'
import { COLORS, LAYOUT } from '@/styles/constants'

const allTopNavItems: ItemType[] = [
  { key: '/home', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/rbac', icon: <SafetyCertificateOutlined />, label: '权限管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
]

const allSubMenus: Record<string, ItemType[]> = {
  '/rbac': [
    { key: '/rbac/enterprise', icon: <ApartmentOutlined />, label: '企业管理' },
    { key: '/rbac/user', icon: <TeamOutlined />, label: '租户用户' },
    { key: '/rbac/role', icon: <SolutionOutlined />, label: '角色管理' },
    { key: '/rbac/menu', icon: <MenuIcon />, label: '菜单管理' },
    { key: '/rbac/api', icon: <ApiOutlined />, label: 'API管理' },
  ],
  '/settings': [
    { key: '/settings/general', icon: <SettingOutlined />, label: '默认系统设置' },
    { key: '/settings/users', icon: <KeyOutlined />, label: '平台用户管理' },
  ],
}

function resolveTopKey(pathname: string) {
  if (pathname === '/' || pathname.startsWith('/home')) return '/home'
  for (const prefix of ['/rbac', '/settings']) {
    if (pathname.startsWith(prefix)) return prefix
  }
  return '/home'
}

export default function PlatformLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const { message } = App.useApp()
  const { mode, toggle: toggleTheme } = useThemeStore()
  const allowedPaths = usePermissionStore((s) => s.allowedPaths)

  const isDark = mode === 'dark'
  const activeTopKey = resolveTopKey(pathname)
  const palette = isDark ? COLORS.dark : COLORS.light

  const topNavItems = useMemo(() => {
    return allTopNavItems.filter((item) => {
      if (item?.key === '/home') return true
      const children = allSubMenus[item?.key as string]
      if (!children) return true
      return children.some((child) => child?.key && allowedPaths.includes(child.key as string))
    })
  }, [allowedPaths])

  const subMenus = useMemo(() => {
    const filtered: Record<string, ItemType[]> = {}
    for (const [key, items] of Object.entries(allSubMenus)) {
      const filteredItems = items.filter(
        (item) => item?.key && allowedPaths.includes(item.key as string),
      )
      if (filteredItems.length > 0) {
        filtered[key] = filteredItems
      }
    }
    return filtered
  }, [allowedPaths])

  const subItems = subMenus[activeTopKey]
  const hasSubMenu = subItems != null

  const userMenuItems: ItemType[] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ]

  const handleUserMenuClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      try {
        await logoutApi()
      } catch {
        /* ignore */
      }
      useAuthStore.getState().logout()
      usePermissionStore.getState().clearPermissions()
      navigate('/login')
      message.success('已退出登录')
    }
  }

  const handleTopNavClick = ({ key }: { key: string }) => {
    const items = subMenus[key]
    if (items?.length && items[0]?.key) {
      navigate(String(items[0].key))
    } else {
      navigate(key)
    }
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
