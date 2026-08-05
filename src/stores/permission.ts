import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RbacMenu } from '@/types'

interface PermissionState {
  rawMenus: RbacMenu[]
  allowedPaths: string[]
  allowedActions: string[]
  setPermissions: (rawMenus: RbacMenu[], allowedPaths: string[], allowedActions: string[]) => void
  hasPath: (path: string) => boolean
  hasAction: (actionMark: string) => boolean
  clearPermissions: () => void
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      rawMenus: [],
      allowedPaths: [],
      allowedActions: [],

      setPermissions: (rawMenus, allowedPaths, allowedActions) =>
        set({ rawMenus, allowedPaths, allowedActions }),

      hasPath: (path) => get().allowedPaths.includes(path),

      hasAction: (actionMark) => get().allowedActions.includes(actionMark),

      clearPermissions: () => set({ rawMenus: [], allowedPaths: [], allowedActions: [] }),
    }),
    {
      name: 'zero-platform-permissions',
      partialize: (state) => ({
        rawMenus: state.rawMenus,
        allowedPaths: state.allowedPaths,
        allowedActions: state.allowedActions,
      }),
    },
  ),
)
