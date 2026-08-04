import type { ThemeConfig } from 'antd'
import { theme } from 'antd'
import { COLORS } from './constants'

function rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const baseTokens = {
  colorPrimary: COLORS.primary,
  colorSuccess: COLORS.success,
  colorWarning: COLORS.warning,
  colorError: COLORS.error,
  colorInfo: COLORS.info,
  borderRadius: 4,
  borderRadiusLG: 6,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyCode: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  fontSize: 14,
  lineHeight: 1.5715,
  controlHeight: 36,
  controlHeightLG: 42,
  lineWidth: 1,
}

const sharedComponents = {
  Button: {
    primaryShadow: 'none',
    defaultShadow: 'none',
    fontWeight: 500,
  },
  Card: {
    paddingLG: 24,
  },
} satisfies Partial<ThemeConfig['components']>

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...baseTokens,
    colorTextBase: COLORS.dark.textPrimary,
    colorTextSecondary: COLORS.dark.textSecondary,
    colorTextTertiary: COLORS.dark.textTertiary,
    colorBgBase: COLORS.dark.bg,
    colorBgContainer: COLORS.dark.surface,
    colorBgElevated: COLORS.dark.elevated,
    colorBgLayout: COLORS.dark.bg,
    colorBorder: COLORS.dark.border,
    colorBorderSecondary: COLORS.dark.surface,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 1px 3px 1px rgba(0, 0, 0, 0.3)',
  },
  components: {
    ...sharedComponents,
    Layout: {
      headerBg: COLORS.dark.headerBg,
      headerColor: COLORS.dark.textPrimary,
      bodyBg: COLORS.dark.bg,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemColor: COLORS.dark.textSecondary,
      darkItemSelectedBg: rgba(COLORS.primary, 0.12),
      darkItemSelectedColor: COLORS.primary,
      darkItemHoverBg: rgba(COLORS.primary, 0.06),
      itemBorderRadius: 4,
      itemMarginBlock: 2,
      itemMarginInline: 4,
      itemHeight: 36,
      horizontalItemSelectedColor: COLORS.primary,
      horizontalItemHoverColor: COLORS.dark.textPrimary,
      itemBg: COLORS.dark.surface,
      itemColor: COLORS.dark.textSecondary,
      itemSelectedColor: COLORS.primary,
      itemSelectedBg: rgba(COLORS.primary, 0.12),
      itemHoverBg: rgba(COLORS.primary, 0.06),
      subMenuItemBg: COLORS.dark.surface,
    },
    Table: {
      colorBgContainer: COLORS.dark.surface,
      headerBg: COLORS.dark.headerBg,
      headerColor: COLORS.dark.textSecondary,
      rowHoverBg: rgba(COLORS.primary, 0.04),
      borderColor: COLORS.dark.border,
    },
    Input: {
      colorBgContainer: COLORS.dark.headerBg,
      colorBorder: COLORS.dark.border,
      activeBorderColor: COLORS.primary,
      hoverBorderColor: '#334155',
    },
    Select: {
      colorBgContainer: COLORS.dark.headerBg,
      colorBgElevated: COLORS.dark.elevated,
      optionSelectedBg: rgba(COLORS.primary, 0.12),
    },
    Modal: {
      colorBgElevated: COLORS.dark.elevated,
      headerBg: COLORS.dark.elevated,
      contentBg: COLORS.dark.elevated,
    },
    Tag: {
      defaultBg: rgba(COLORS.dark.textSecondary, 0.1),
      defaultColor: COLORS.dark.textSecondary,
    },
  },
}

export const lightTheme: ThemeConfig = {
  token: {
    ...baseTokens,
    colorTextBase: COLORS.light.textPrimary,
    colorTextSecondary: COLORS.light.textSecondary,
    colorTextTertiary: COLORS.light.textTertiary,
    colorBgBase: COLORS.light.bg,
    colorBgContainer: COLORS.light.surface,
    colorBgElevated: COLORS.light.surface,
    colorBgLayout: COLORS.light.bg,
    colorBorder: COLORS.light.border,
    colorBorderSecondary: '#F1F5F9',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.08)',
  },
  components: {
    ...sharedComponents,
    Layout: {
      headerBg: COLORS.light.headerBg,
      headerColor: COLORS.light.textPrimary,
      bodyBg: COLORS.light.bg,
    },
    Menu: {
      horizontalItemSelectedColor: COLORS.primary,
      horizontalItemHoverColor: COLORS.primary,
      itemBg: COLORS.light.surface,
      itemColor: COLORS.light.textSecondary,
      itemSelectedColor: COLORS.primary,
      itemSelectedBg: rgba(COLORS.primary, 0.08),
      itemHoverBg: rgba(COLORS.primary, 0.04),
      subMenuItemBg: COLORS.light.surface,
      itemBorderRadius: 4,
      itemMarginBlock: 2,
      itemMarginInline: 4,
      itemHeight: 36,
    },
    Table: {
      colorBgContainer: COLORS.light.surface,
      headerBg: '#F8FAFC',
      headerColor: COLORS.light.textSecondary,
      rowHoverBg: '#F8FAFC',
      borderColor: '#F1F5F9',
    },
    Input: {
      colorBgContainer: COLORS.light.surface,
      colorBorder: '#D1D5DB',
      activeBorderColor: COLORS.primary,
      hoverBorderColor: '#9CA3AF',
    },
    Select: {
      colorBgContainer: COLORS.light.surface,
      colorBgElevated: COLORS.light.surface,
      optionSelectedBg: rgba(COLORS.primary, 0.06),
    },
    Modal: {
      colorBgElevated: COLORS.light.surface,
      headerBg: COLORS.light.surface,
      contentBg: COLORS.light.surface,
    },
    Tag: {
      defaultBg: '#F1F5F9',
      defaultColor: COLORS.light.textSecondary,
    },
  },
}
