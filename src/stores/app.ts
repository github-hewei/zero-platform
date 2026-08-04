import { create } from 'zustand'

interface AppState {
  systemName: string
  setSystemName: (name: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  systemName: 'Zero Platform',
  setSystemName: (name) => set({ systemName: name }),
}))
