import type { ReactNode } from 'react'
import {
  ApiOutlined,
  ApartmentOutlined,
  DashboardOutlined,
  KeyOutlined,
  MenuOutlined as MenuIcon,
  SafetyCertificateOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
} from '@ant-design/icons'

export interface NavItem {
  path: string
  title: string
  icon?: ReactNode
  children?: NavItem[]
}

export const navItems: NavItem[] = [
  { path: '/home', title: '仪表盘', icon: <DashboardOutlined /> },
  {
    path: '/rbac',
    title: '权限管理',
    icon: <SafetyCertificateOutlined />,
    children: [
      { path: '/rbac/enterprise', title: '企业管理', icon: <ApartmentOutlined /> },
      { path: '/rbac/user', title: '租户用户', icon: <TeamOutlined /> },
      { path: '/rbac/role', title: '角色管理', icon: <SolutionOutlined /> },
      { path: '/rbac/menu', title: '菜单管理', icon: <MenuIcon /> },
      { path: '/rbac/api', title: '接口管理', icon: <ApiOutlined /> },
    ],
  },
  {
    path: '/settings',
    title: '系统设置',
    icon: <SettingOutlined />,
    children: [
      { path: '/settings/general', title: '默认系统设置', icon: <SettingOutlined /> },
      { path: '/settings/users', title: '平台用户管理', icon: <KeyOutlined /> },
    ],
  },
]

export function collectPaths(items: NavItem[]): string[] {
  return items.flatMap((item) => [item.path, ...(item.children ? collectPaths(item.children) : [])])
}

export const allPaths = collectPaths(navItems)
