import { Suspense, lazy } from 'react'
import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { Spin } from 'antd'
import PlatformLayout from '@/components/Layout/PlatformLayout'

// eslint-disable-next-line react-refresh/only-export-components
function LazyLoad(importFn: () => Promise<{ default: React.ComponentType }>) {
  const Comp = lazy(importFn)
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: 300,
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      <Comp />
    </Suspense>
  )
}

export const routeConfig: RouteObject[] = [
  {
    path: '/login',
    element: LazyLoad(() => import('@/pages/login')),
  },
  {
    path: '/',
    element: <PlatformLayout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      {
        path: 'home',
        element: LazyLoad(() => import('@/pages/home')),
        handle: { title: '仪表盘' },
      },
      {
        path: 'rbac',
        handle: { title: '权限管理' },
        children: [
          {
            path: 'enterprise',
            element: LazyLoad(() => import('@/pages/rbac/Enterprise')),
            handle: { title: '企业管理' },
          },
          {
            path: 'role',
            element: LazyLoad(() => import('@/pages/rbac/Role')),
            handle: { title: '角色管理' },
          },
          {
            path: 'menu',
            element: LazyLoad(() => import('@/pages/rbac/Menu')),
            handle: { title: '菜单管理' },
          },
          {
            path: 'api',
            element: LazyLoad(() => import('@/pages/rbac/Api')),
            handle: { title: 'API管理' },
          },
          {
            path: 'account',
            element: LazyLoad(() => import('@/pages/rbac/Account')),
            handle: { title: '账号管理' },
          },
        ],
      },
      {
        path: 'users',
        element: LazyLoad(() => import('@/pages/users')),
        handle: { title: '平台用户' },
      },
      {
        path: 'settings',
        element: LazyLoad(() => import('@/pages/settings')),
        handle: { title: '系统设置' },
      },
    ],
  },
  {
    path: '*',
    element: LazyLoad(() => import('@/pages/error/NotFound')),
  },
]
