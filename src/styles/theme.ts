import type { ThemeConfig } from 'antd'
import { theme } from 'antd'

const baseTokens = {
  colorPrimary: '#F97316',
  colorSuccess: '#16A34A',
  colorWarning: '#F59E0B',
  colorError: '#DC2626',
  colorInfo: '#0EA5E9',
  borderRadius: 4,
  borderRadiusLG: 6,
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyCode:
    "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  fontSize: 14,
  lineHeight: 1.5715,
  controlHeight: 36,
  controlHeightLG: 42,
  lineWidth: 1,
} as const

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...baseTokens,
    colorTextBase: '#F1F5F9',
    colorTextSecondary: '#94A3B8',
    colorTextTertiary: '#64748B',
    colorBgBase: '#0B1120',
    colorBgContainer: '#151D2E',
    colorBgElevated: '#1C2538',
    colorBgLayout: '#0B1120',
    colorBorder: '#1E293B',
    colorBorderSecondary: '#151D2E',
    boxShadow:
      '0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 1px 3px 1px rgba(0, 0, 0, 0.3)',
  },
  components: {
    Layout: {
      headerBg: '#0D1525',
      headerColor: '#F1F5F9',
      bodyBg: '#0B1120',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemColor: '#94A3B8',
      darkItemSelectedBg: 'rgba(249, 115, 22, 0.12)',
      darkItemSelectedColor: '#F97316',
      darkItemHoverBg: 'rgba(249, 115, 22, 0.06)',
      itemBorderRadius: 4,
      itemMarginBlock: 2,
      itemMarginInline: 4,
      itemHeight: 36,
      horizontalItemSelectedColor: '#F97316',
      horizontalItemHoverColor: '#F1F5F9',
      itemBg: '#151D2E',
      itemColor: '#94A3B8',
      itemSelectedColor: '#F97316',
      itemSelectedBg: 'rgba(249, 115, 22, 0.12)',
      itemHoverBg: 'rgba(249, 115, 22, 0.06)',
      subMenuItemBg: '#151D2E',
    },
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      fontWeight: 500,
    },
    Card: {
      paddingLG: 24,
      colorBgContainer: '#151D2E',
    },
    Table: {
      colorBgContainer: '#151D2E',
      headerBg: '#0D1525',
      headerColor: '#94A3B8',
      rowHoverBg: 'rgba(249, 115, 22, 0.04)',
      borderColor: '#1E293B',
    },
    Input: {
      colorBgContainer: '#0D1525',
      colorBorder: '#1E293B',
      activeBorderColor: '#F97316',
      hoverBorderColor: '#334155',
    },
    Select: {
      colorBgContainer: '#0D1525',
      colorBgElevated: '#1C2538',
      optionSelectedBg: 'rgba(249, 115, 22, 0.12)',
    },
    Modal: {
      colorBgElevated: '#1C2538',
      headerBg: '#1C2538',
      contentBg: '#1C2538',
    },
    Tag: {
      defaultBg: 'rgba(148, 163, 184, 0.1)',
      defaultColor: '#94A3B8',
    },
  },
}

export const lightTheme: ThemeConfig = {
  token: {
    ...baseTokens,
    colorTextBase: '#1E293B',
    colorTextSecondary: '#64748B',
    colorTextTertiary: '#94A3B8',
    colorBgBase: '#F0F2F5',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F0F2F5',
    colorBorder: '#E2E8F0',
    colorBorderSecondary: '#F1F5F9',
    boxShadow:
      '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.08)',
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      headerColor: '#1E293B',
      bodyBg: '#F0F2F5',
    },
    Menu: {
      horizontalItemSelectedColor: '#F97316',
      horizontalItemHoverColor: '#F97316',
      itemBg: '#FFFFFF',
      itemColor: '#64748B',
      itemSelectedColor: '#F97316',
      itemSelectedBg: 'rgba(249, 115, 22, 0.08)',
      itemHoverBg: 'rgba(249, 115, 22, 0.04)',
      subMenuItemBg: '#FFFFFF',
      itemBorderRadius: 4,
      itemMarginBlock: 2,
      itemMarginInline: 4,
      itemHeight: 36,
    },
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      fontWeight: 500,
    },
    Card: {
      paddingLG: 24,
      colorBgContainer: '#FFFFFF',
    },
    Table: {
      colorBgContainer: '#FFFFFF',
      headerBg: '#F8FAFC',
      headerColor: '#64748B',
      rowHoverBg: '#F8FAFC',
      borderColor: '#F1F5F9',
    },
    Input: {
      colorBgContainer: '#FFFFFF',
      colorBorder: '#D1D5DB',
      activeBorderColor: '#F97316',
      hoverBorderColor: '#9CA3AF',
    },
    Select: {
      colorBgContainer: '#FFFFFF',
      colorBgElevated: '#FFFFFF',
      optionSelectedBg: 'rgba(249, 115, 22, 0.06)',
    },
    Modal: {
      colorBgElevated: '#FFFFFF',
      headerBg: '#FFFFFF',
      contentBg: '#FFFFFF',
    },
    Tag: {
      defaultBg: '#F1F5F9',
      defaultColor: '#64748B',
    },
  },
}

export const CONTAINER_WIDTH = 1280
export const SIDEBAR_WIDTH = 200
