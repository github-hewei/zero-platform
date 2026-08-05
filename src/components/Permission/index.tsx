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
  const hasAction = usePermissionStore((s) => s.hasAction)
  const actionKey = `${moduleKey}:${actionMark}`

  if (hasAction(actionKey)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
