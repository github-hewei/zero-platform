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
      },
      {
        path: 'rbac',
        children: [
          {
            path: 'enterprise',
            element: LazyLoad(() => import('@/pages/rbac/Enterprise')),
          },
          {
            path: 'role',
            element: LazyLoad(() => import('@/pages/rbac/Role')),
          },
          {
            path: 'menu',
            element: LazyLoad(() => import('@/pages/rbac/Menu')),
          },
          {
            path: 'api',
            element: LazyLoad(() => import('@/pages/rbac/Api')),
          },
          {
            path: 'user',
            element: LazyLoad(() => import('@/pages/rbac/RbacUser')),
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            path: 'general',
            element: LazyLoad(() => import('@/pages/settings/General')),
          },
          {
            path: 'users',
            element: LazyLoad(() => import('@/pages/settings/PlatformUser')),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: LazyLoad(() => import('@/pages/error/NotFound')),
  },
]
