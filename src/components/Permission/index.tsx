import type { ReactNode } from 'react'
import { usePermissionStore } from '@/stores'

interface PermissionProps {
  moduleKey: string
  actionMark: string
  children: ReactNode
  fallback?: ReactNode
}

export default function Permission({
  moduleKey,
  actionMark,
  children,
  fallback = null,
}: PermissionProps) {
  const allowedActions = usePermissionStore((s) => s.allowedActions)
  const actionKey = `${moduleKey}:${actionMark}`

  if (allowedActions.includes(actionKey)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
