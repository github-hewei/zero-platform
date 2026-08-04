import { create } from 'zustand'

type ThemeMode = 'dark' | 'light'

interface ThemeState {
  mode: ThemeMode
  toggle: () => void
  setMode: (mode: ThemeMode) => void
}

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem('platform_theme')
  if (stored === 'dark' || stored === 'light') return stored
  return 'dark'
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: getInitialMode(),
  toggle: () =>
    set((state) => {
      const next = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('platform_theme', next)
      return { mode: next }
    }),
  setMode: (mode) => {
    localStorage.setItem('platform_theme', mode)
    set({ mode })
  },
}))
