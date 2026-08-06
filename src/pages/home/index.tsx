import { useMemo } from 'react'
import { Table, Input, Select, Button, Tag, Space, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { useThemeStore } from '@/stores'
import { COLORS } from '@/styles/constants'
import './index.css'

interface TenantRecord {
  id: number
  name: string
  code: string
  status: 'normal' | 'warning' | 'suspended'
  users: number
  storageUsed: string
  plan: string
  createdAt: string
  contactPhone: string
}

function buildMockTenants(): TenantRecord[] {
  const statuses: TenantRecord['status'][] = [
    'normal',
    'normal',
    'normal',
    'normal',
    'normal',
    'warning',
    'suspended',
  ]
  return Array.from({ length: 50 }, (_, i) => {
    const idx = (i * 7 + 3) % statuses.length
    return {
      id: i + 1,
      name: `企业${String(i + 1).padStart(3, '0')}`,
      code: `T${String(i + 1).padStart(4, '0')}`,
      status: statuses[idx],
      users: ((i * 137 + 50) % 800) + 10,
      storageUsed: `${(((i * 73 + 20) % 200) + 1).toFixed(1)} GB`,
      plan: ['基础版', '专业版', '企业版'][i % 3],
      createdAt: `202${(i % 4) + 1}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      contactPhone: `138${String((i * 113 + 5000) % 100000000).padStart(8, '0')}`,
    }
  })
}

const mockTenants = buildMockTenants()

const statusMap: Record<TenantRecord['status'], { label: string; color: string }> = {
  normal: { label: '正常', color: 'green' },
  warning: { label: '预警', color: 'gold' },
  suspended: { label: '停用', color: 'red' },
}

const columns: ColumnsType<TenantRecord> = [
  {
    title: '编号',
    dataIndex: 'code',
    key: 'code',
    width: 100,
    render: (v: string) => (
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{v}</span>
    ),
  },
  {
    title: '企业名称',
    dataIndex: 'name',
    key: 'name',
    width: 160,
    render: (name: string, record) => (
      <Space>
        <span className={`status-dot ${record.status}`} />
        <span>{name}</span>
      </Space>
    ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (s: TenantRecord['status']) => {
      const m = statusMap[s]
      return <Tag color={m.color}>{m.label}</Tag>
    },
  },
  {
    title: '用户数',
    dataIndex: 'users',
    key: 'users',
    width: 90,
    sorter: (a, b) => a.users - b.users,
    render: (n: number) => n.toLocaleString(),
  },
  { title: '存储', dataIndex: 'storageUsed', key: 'storageUsed', width: 100 },
  { title: '套餐', dataIndex: 'plan', key: 'plan', width: 90 },
  { title: '电话', dataIndex: 'contactPhone', key: 'contactPhone', width: 130 },
  {
    title: '入驻时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 110,
    sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    fixed: 'right',
    render: () => (
      <Button type="link" size="small" icon={<EyeOutlined />}>
        查看
      </Button>
    ),
  },
]

const healthMetrics = [
  { label: 'CPU', value: 34, status: 'good' as const },
  { label: '内存', value: 58, status: 'good' as const },
  { label: '磁盘', value: 72, status: 'caution' as const },
  { label: '数据库连接', value: 28, status: 'good' as const },
  { label: '缓存命中率', value: 94, status: 'good' as const },
]

const recentLogs = [
  { time: '14:32', text: '修改了企业「企业015」的套餐配置', type: 'operate' as const },
  { time: '14:28', text: '租户 T-0089 SSL 证书将于 7 天后过期', type: 'alert' as const },
  { time: '14:15', text: '创建了新的平台角色「审计管理员」', type: 'operate' as const },
  { time: '13:58', text: '企业「企业042」存储用量已达配额 85%', type: 'alert' as const },
  { time: '13:45', text: '新企业「企业200」注册并通过审核', type: 'operate' as const },
  { time: '13:20', text: '账号 operator_03 密码已被重置', type: 'operate' as const },
]

export default function DashboardPage() {
  const isDark = useThemeStore((s) => s.mode === 'dark')

  const cardVars = useMemo(() => {
    if (isDark) {
      return {
        '--card-bg': COLORS.dark.surface,
        '--card-border': COLORS.dark.border,
        '--text-tertiary': COLORS.dark.textTertiary,
        '--text-secondary': COLORS.dark.textSecondary,
        '--divider': COLORS.dark.border,
        '--bar-bg': COLORS.dark.border,
      } as React.CSSProperties
    }
    return {
      '--card-bg': COLORS.light.surface,
      '--card-border': COLORS.light.border,
      '--text-tertiary': COLORS.light.textTertiary,
      '--text-secondary': COLORS.light.textSecondary,
      '--divider': '#F1F5F9',
      '--bar-bg': '#F1F5F9',
    } as React.CSSProperties
  }, [isDark])

  const stats = useMemo(() => {
    const total = mockTenants.length
    const normal = mockTenants.filter((t) => t.status === 'normal').length
    const warning = mockTenants.filter((t) => t.status === 'warning').length
    const suspended = mockTenants.filter((t) => t.status === 'suspended').length
    const totalUsers = mockTenants.reduce((s, t) => s + t.users, 0)
    return { total, normal, warning, suspended, totalUsers }
  }, [])

  return (
    <div className="dashboard" style={cardVars}>
      <div className="metric-strip">
        <div className="metric-card">
          <div className="metric-value">{stats.total.toLocaleString()}</div>
          <div className="metric-label">企业总数</div>
          <div className="metric-sub up">
            正常运营 <em>{stats.normal}</em> 家
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="metric-label">平台总用户</div>
          <div className="metric-sub up">
            较上月 <em>+8.3%</em>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{stats.warning + stats.suspended}</div>
          <div className="metric-label">需关注</div>
          <div className="metric-sub down">
            预警 <em>{stats.warning}</em> · 停用 <em>{stats.suspended}</em>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{stats.normal}</div>
          <div className="metric-label">健康运行</div>
          <div className="metric-sub up">
            占比 <em>{((stats.normal / stats.total) * 100).toFixed(1)}%</em>
          </div>
        </div>
      </div>

      <Card className="section-card" title={<span className="section-title">企业列表</span>}>
        <div className="table-toolbar">
          <Space>
            <Input
              placeholder="搜索企业名称或编号"
              prefix={<SearchOutlined />}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="状态筛选"
              style={{ width: 120 }}
              allowClear
              options={[
                { value: 'normal', label: '正常' },
                { value: 'warning', label: '预警' },
                { value: 'suspended', label: '停用' },
              ]}
            />
          </Space>
          <Button icon={<ReloadOutlined />}>刷新</Button>
        </div>
        <Table
          columns={columns}
          dataSource={mockTenants}
          rowKey="id"
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 家企业`,
            pageSizeOptions: ['20', '50', '100'],
            defaultPageSize: 20,
          }}
          scroll={{ x: 1050 }}
        />
      </Card>

      <div className="bottom-panels">
        <Card className="section-card" title={<span className="section-title">系统健康</span>}>
          {healthMetrics.map((m) => (
            <div className="health-item" key={m.label}>
              <span className="health-label">{m.label}</span>
              <Space size={8}>
                <div className="health-bar">
                  <div className={`health-bar-fill ${m.status}`} style={{ width: `${m.value}%` }} />
                </div>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {m.value}%
                </span>
              </Space>
            </div>
          ))}
        </Card>

        <Card className="section-card" title={<span className="section-title">最近操作</span>}>
          {recentLogs.map((log, i) => (
            <div className="log-item" key={i}>
              <span className="log-time">{log.time}</span>
              <span className="log-text">{log.text}</span>
              <span className={`log-tag ${log.type}`}>
                {log.type === 'alert' ? '告警' : '操作'}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
