import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { darkTheme, lightTheme } from '@/styles/theme'
import { useThemeStore } from '@/stores'
import ErrorBoundary from '@/components/ErrorBoundary'
import AppRoutes from '@/router/AppRoutes'

export default function App() {
  const mode = useThemeStore((s) => s.mode)
  const themeConfig = mode === 'dark' ? darkTheme : lightTheme

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
