import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Spin } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { useThemeStore } from '@/stores'
import { COLORS } from '@/styles/constants'
import { getDashboardStats } from '@/services/dashboard'
import type { DashboardStats, DailyCount } from '@/types'
import './index.css'

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`
}

function buildTrendOption(store: DailyCount[], user: DailyCount[], isDark: boolean): EChartsOption {
  const palette = isDark ? COLORS.dark : COLORS.light
  const dates = [...new Set([...store.map((d) => d.date), ...user.map((d) => d.date)])].sort()
  const storeMap = new Map(store.map((d) => [d.date, d.count]))
  const userMap = new Map(user.map((d) => [d.date, d.count]))

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: palette.elevated,
      borderColor: palette.border,
      textStyle: { color: palette.textPrimary, fontSize: 12 },
    },
    legend: {
      top: 0,
      right: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: palette.textSecondary, fontSize: 12 },
      data: ['企业新增', '用户新增'],
    },
    grid: { top: 36, left: 8, right: 8, bottom: 0, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates.map((d) => d.slice(5)),
      axisLine: { lineStyle: { color: palette.border } },
      axisTick: { show: false },
      axisLabel: {
        color: palette.textTertiary,
        fontSize: 11,
        formatter: (v: string) => v.replace('-', '/'),
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: palette.border } },
      axisLabel: { color: palette.textTertiary, fontSize: 11 },
    },
    series: [
      {
        name: '企业新增',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: dates.map((d) => storeMap.get(d) ?? 0),
        lineStyle: { width: 2, color: COLORS.primary },
        itemStyle: { color: COLORS.primary },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: isDark ? 'rgba(249, 115, 22, 0.25)' : 'rgba(249, 115, 22, 0.14)',
              },
              { offset: 1, color: 'rgba(249, 115, 22, 0)' },
            ],
          },
        },
      },
      {
        name: '用户新增',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: dates.map((d) => userMap.get(d) ?? 0),
        lineStyle: { width: 2, color: COLORS.info },
        itemStyle: { color: COLORS.info },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: isDark ? 'rgba(14, 165, 233, 0.22)' : 'rgba(14, 165, 233, 0.12)',
              },
              { offset: 1, color: 'rgba(14, 165, 233, 0)' },
            ],
          },
        },
      },
    ],
  }
}

export default function DashboardPage() {
  const isDark = useThemeStore((s) => s.mode === 'dark')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const cardVars = useMemo(() => {
    if (isDark) {
      return {
        '--card-bg': COLORS.dark.surface,
        '--card-border': COLORS.dark.border,
        '--text-tertiary': COLORS.dark.textTertiary,
        '--text-secondary': COLORS.dark.textSecondary,
      } as React.CSSProperties
    }
    return {
      '--card-bg': COLORS.light.surface,
      '--card-border': COLORS.light.border,
      '--text-tertiary': COLORS.light.textTertiary,
      '--text-secondary': COLORS.light.textSecondary,
    } as React.CSSProperties
  }, [isDark])

  const metrics = useMemo(() => {
    if (!stats) return []
    const { overview } = stats
    return [
      { label: '企业总数', value: overview.store_total.toLocaleString(), accent: false },
      { label: '租户用户', value: overview.user_total.toLocaleString(), accent: false },
      { label: '文件总数', value: overview.file_total.toLocaleString(), accent: false },
      { label: '存储占用', value: formatBytes(overview.file_total_size), accent: false },
      { label: '本月新增企业', value: `+${overview.store_monthly_new}`, accent: true },
      { label: '本月新增用户', value: `+${overview.user_monthly_new}`, accent: true },
    ]
  }, [stats])

  const trendOption = useMemo(() => {
    if (!stats) return null
    return buildTrendOption(stats.trends.store, stats.trends.user, isDark)
  }, [stats, isDark])

  const hasTrendData = useMemo(
    () => !!trendOption && (stats?.trends.store.length ?? 0) + (stats?.trends.user.length ?? 0) > 0,
    [trendOption, stats],
  )

  return (
    <div className="dashboard" style={cardVars}>
      {error ? (
        <div className="dash-error">
          <div className="dash-error-text">加载失败：{error}</div>
          <Button type="primary" onClick={load}>
            重试
          </Button>
        </div>
      ) : (
        <>
          <div className="metric-strip">
            {metrics.map((m) => (
              <div className={`metric-card${m.accent ? ' accent' : ''}`} key={m.label}>
                <div className="metric-value">{loading ? '—' : m.value}</div>
                <div className="metric-label">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="chart-card">
            <div className="chart-head">
              <span className="section-title">近30天新增趋势</span>
              <span className="chart-hint">企业 / 用户每日新增数量</span>
            </div>
            {loading ? (
              <div className="chart-loading">
                <Spin />
              </div>
            ) : hasTrendData ? (
              <ReactECharts option={trendOption} style={{ height: 300 }} notMerge />
            ) : (
              <div className="chart-empty">暂无数据</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
