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

  return <RouterProvider router={router} />
}
