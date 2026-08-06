import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useAuthStore, usePermissionStore } from '@/stores'
import { routeConfig } from './config'
import type { RouteObject } from 'react-router-dom'

function filterRoutes(
  routes: RouteObject[],
  allowedPaths: string[],
  parentPath = '',
): RouteObject[] {
  return routes
    .map((route) => {
      if (!route.path) return route

      if (route.path === '/login' || route.path === '*') {
        return route
      }

      if (route.path === '/') {
        const filteredChildren = filterRoutes(route.children || [], allowedPaths, '')
        return { ...route, children: filteredChildren }
      }

      if (route.children) {
        const childPath = parentPath ? `${parentPath}/${route.path}` : `/${route.path}`
        const filteredChildren = filterRoutes(route.children, allowedPaths, childPath)
        if (filteredChildren.length === 0) return null
        return { ...route, children: filteredChildren }
      }

      const fullPath = parentPath ? `${parentPath}/${route.path}` : `/${route.path}`
      if (allowedPaths.includes(fullPath)) {
        return route
      }
      return null
    })
    .filter(Boolean) as RouteObject[]
}

export default function AppRoutes() {
  const token = useAuthStore((s) => s.token)
  const allowedPaths = usePermissionStore((s) => s.allowedPaths)

  const router = useMemo(() => {
    if (!token) {
      return createBrowserRouter([
        { path: '/', element: <Navigate to="/login" replace /> },
        ...routeConfig.filter((r) => r.path === '/login' || r.path === '*'),
      ])
    }
    if (allowedPaths.length === 0) {
      return createBrowserRouter(routeConfig)
    }
    return createBrowserRouter(filterRoutes(routeConfig, allowedPaths))
  }, [token, allowedPaths])

  // 登录态/权限变化会重建 router 实例；key 强制 RouterProvider 以新实例完整重挂载，
  // 否则 react-router 会沿用旧 router 的 state.matches，渲染错误路由树导致页面空白
  const routerKey = `${token ? 'authed' : 'guest'}-${allowedPaths.length}`

  return <RouterProvider key={routerKey} router={router} />
}
