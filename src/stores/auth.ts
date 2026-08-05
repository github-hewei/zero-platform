import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlatformUser } from '@/types'

interface AuthState {
  token: string | null
  user: PlatformUser | null
  setAuth: (token: string, user: PlatformUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'zero-platform-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
