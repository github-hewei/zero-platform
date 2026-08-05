import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Input, Space, Card, Form, Modal, Select, Tag, App } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
} from '@ant-design/icons'
import Permission from '@/components/Permission'
import {
  getPlatformUserList,
  createPlatformUser,
  updatePlatformUser,
  deletePlatformUser,
  resetPlatformUserPassword,
} from '@/services/platform-user'
import type { PlatformUser } from '@/types'

const roleMap: Record<number, { label: string; color: string }> = {
  0: { label: '超管', color: 'orange' },
  1: { label: '运营', color: 'blue' },
  2: { label: '审计', color: 'default' },
}

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: '启用', color: 'green' },
  0: { label: '禁用', color: 'red' },
}

export default function PlatformUserPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PlatformUser[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PlatformUser | null>(null)
  const [searchForm] = Form.useForm()
  const [form] = Form.useForm()
  const { message, modal } = App.useApp()

  const fetchData = useCallback(
    async (page?: number, limit?: number) => {
      setLoading(true)
      try {
        const searchValues = searchForm.getFieldsValue()
        const res = await getPlatformUserList({
          page: page ?? pagination.page,
          limit: limit ?? pagination.limit,
          username: searchValues.username || undefined,
          real_name: searchValues.real_name || undefined,
        })
        setData(res?.list || [])
        setTotal(res?.total || 0)
        setPagination((prev) => {
          const p = page ?? prev.page
          const l = limit ?? prev.limit
          return { page: p, limit: l }
        })
      } catch (err) {
        message.error(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    },
    [message, pagination.limit, pagination.page, searchForm],
  )

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = () => {
    fetchData(1, pagination.limit)
  }

  const handleReset = () => {
    searchForm.resetFields()
    fetchData(1, pagination.limit)
  }

  const handleCreate = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: PlatformUser) => {
    setEditing(record)
    form.setFieldsValue({
      username: record.username,
      real_name: record.real_name,
      role: record.role,
      status: record.status,
    })
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    const values = await form.validateFields().catch(() => null)
    if (!values) return
    try {
      if (editing) {
        await updatePlatformUser({ id: editing.id, ...values })
        message.success('更新成功')
      } else {
        await createPlatformUser(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败')
    }
  }

  const handleDelete = (record: PlatformUser) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除用户「${record.real_name || record.username}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deletePlatformUser(record.id)
          message.success('删除成功')
          fetchData()
        } catch (err) {
          message.error(err instanceof Error ? err.message : '删除失败')
        }
      },
    })
  }

  const handleResetPassword = (record: PlatformUser) => {
    modal.confirm({
      title: '重置密码',
      content: `确定要重置用户「${record.real_name || record.username}」的密码吗？系统将生成随机密码。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await resetPlatformUserPassword(record.id)
          message.success('密码已重置')
        } catch (err) {
          message.error(err instanceof Error ? err.message : '操作失败')
        }
      },
    })
  }

  const columns: ColumnsType<PlatformUser> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 140 },
    { title: '姓名', dataIndex: 'real_name', key: 'real_name', width: 120 },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 90,
      render: (role: number) => {
        const r = roleMap[role] || { label: String(role), color: 'default' }
        return <Tag color={r.color}>{r.label}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => {
        const s = statusMap[status] || { label: String(status), color: 'default' }
        return <Tag color={s.color}>{s.label}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Permission moduleKey="PlatformUser" actionMark="update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </Permission>
          <Permission moduleKey="PlatformUser" actionMark="resetpassword">
            <Button
              type="link"
              size="small"
              icon={<LockOutlined />}
              onClick={() => handleResetPassword(record)}
            >
              重置密码
            </Button>
          </Permission>
          <Permission moduleKey="PlatformUser" actionMark="delete">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </Permission>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Form.Item name="username">
            <Input placeholder="用户名" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="real_name">
            <Input placeholder="姓名" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="平台用户"
        extra={
          <Space>
            <Permission moduleKey="PlatformUser" actionMark="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                新建
              </Button>
            </Permission>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, limit) => fetchData(page, limit),
          }}
        />
      </Card>

      <Modal
        title={editing ? '编辑用户' : '新建用户'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 5, max: 64, message: '用户名长度 5-64' },
            ]}
          >
            <Input placeholder="请输入用户名" disabled={!!editing} />
          </Form.Item>

          {!editing && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, max: 20, message: '密码长度 6-20' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="real_name"
            label="姓名"
            rules={[
              { required: true, message: '请输入姓名' },
              { min: 2, max: 64, message: '姓名长度 2-64' },
            ]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              placeholder="请选择角色"
              options={[
                { value: 0, label: '超管' },
                { value: 1, label: '运营' },
                { value: 2, label: '审计' },
              ]}
            />
          </Form.Item>

          {editing && (
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { value: 1, label: '启用' },
                  { value: 0, label: '禁用' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  )
}
