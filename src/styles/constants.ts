export const COLORS = {
  primary: '#F97316',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#0EA5E9',

  dark: {
    bg: '#0B1120',
    headerBg: '#0D1525',
    surface: '#151D2E',
    elevated: '#1C2538',
    border: '#1E293B',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
  },

  light: {
    bg: '#F0F2F5',
    headerBg: '#FFFFFF',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
  },
} as const

export const LAYOUT = {
  containerWidth: 1280,
  sidebarWidth: 200,
} as const
