import { useEffect } from 'react'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { darkTheme, lightTheme } from '@/styles/theme'
import { setAuthProvider } from '@/services/http'
import { useAuthStore, useThemeStore } from '@/stores'
import { COLORS } from '@/styles/constants'
import ErrorBoundary from '@/components/ErrorBoundary'
import AppRoutes from '@/router/AppRoutes'

export default function App() {
  const mode = useThemeStore((s) => s.mode)
  const themeConfig = mode === 'dark' ? darkTheme : lightTheme

  useEffect(() => {
    document.body.style.background = mode === 'dark' ? COLORS.dark.bg : COLORS.light.bg
  }, [mode])

  useEffect(() => {
    setAuthProvider({
      getToken: () => useAuthStore.getState().token,
      getUser: () => useAuthStore.getState().user,
      setAuth: (token, user) => useAuthStore.getState().setAuth(token, user),
      logout: () => useAuthStore.getState().logout(),
    })
  }, [])

  return (
    <ErrorBoundary>
      <ConfigProvider theme={themeConfig} locale={zhCN}>
        <AntApp>
          <AppRoutes />
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  )
}
