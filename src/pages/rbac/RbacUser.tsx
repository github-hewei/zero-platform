import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Table,
  Button,
  Space,
  Card,
  Form,
  Modal,
  InputNumber,
  Input,
  Select,
  Dropdown,
  Tag,
  App,
  Spin,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  KeyOutlined,
} from '@ant-design/icons'
import Permission from '@/components/Permission'
import { usePermissionStore } from '@/stores'
import {
  getRbacUserList,
  createRbacUser,
  updateRbacUser,
  deleteRbacUser,
  resetRbacUserPassword,
  setRbacUserRoles,
  getStoreList,
  getRoleList,
} from '@/services/rbac'
import type { RbacUser, RbacStore, RbacRole } from '@/types'

export default function RbacUserPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RbacUser[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })
  const [stores, setStores] = useState<RbacStore[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RbacUser | null>(null)
  const [roleOpen, setRoleOpen] = useState(false)
  const [roleTarget, setRoleTarget] = useState<RbacUser | null>(null)
  const [roleList, setRoleList] = useState<RbacRole[]>([])
  const [roleLoading, setRoleLoading] = useState(false)
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const roleReqSeq = useRef(0)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const { message, modal } = App.useApp()
  const allowedActions = usePermissionStore((s) => s.allowedActions)

  const fetchData = useCallback(
    async (page?: number, limit?: number) => {
      setLoading(true)
      try {
        const values = searchForm.getFieldsValue()
        const res = await getRbacUserList({
          store_id: values.store_id || undefined,
          username: values.username || undefined,
          real_name: values.real_name || undefined,
          page: page ?? pagination.page,
          limit: limit ?? pagination.limit,
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

  const fetchStores = useCallback(async () => {
    try {
      const res = await getStoreList({ page: 1, limit: 1000, is_recycle: 0 })
      setStores(res?.list || [])
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载企业列表失败')
    }
  }, [message])

  useEffect(() => {
    fetchData()
    fetchStores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        form.setFieldsValue({
          username: editing.username,
          real_name: editing.real_name,
          store_id: editing.store_id,
          sort: editing.sort,
        })
      } else {
        form.resetFields()
      }
    }
  }, [modalOpen, editing, form])

  const storeNameMap = useMemo(() => {
    const map: Record<number, string> = {}
    stores.forEach((s) => {
      map[s.id] = s.name
    })
    return map
  }, [stores])

  const handleCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const handleEdit = (record: RbacUser) => {
    setEditing(record)
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    const values = await form.validateFields().catch(() => null)
    if (!values || submitting) return
    setSubmitting(true)
    try {
      if (editing) {
        const r = await updateRbacUser({ id: editing.id, ...values })
        message.success(r.message || '更新成功')
      } else {
        const r = await createRbacUser(values)
        message.success(r.message || '创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (record: RbacUser) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除用户「${record.real_name || record.username}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const r = await deleteRbacUser(record.id, record.store_id)
          message.success(r.message || '删除成功')
          if (data.length === 1 && pagination.page > 1) {
            fetchData(pagination.page - 1)
          } else {
            fetchData()
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : '删除失败')
        }
      },
    })
  }

  const handleResetPassword = (record: RbacUser) => {
    modal.confirm({
      title: '重置密码',
      content: `确定要重置「${record.real_name || record.username}」的密码吗？系统将生成随机密码。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const r = await resetRbacUserPassword(record.id, record.store_id)
          message.success(r.message || '密码已重置')
        } catch (err) {
          message.error(err instanceof Error ? err.message : '操作失败')
        }
      },
    })
  }

  const handleManageRole = async (record: RbacUser) => {
    const seq = ++roleReqSeq.current
    setRoleTarget(record)
    setRoleOpen(true)
    setRoleLoading(true)
    try {
      const roles = await getRoleList({ store_id: record.store_id, page: 1, limit: 100 })
      if (seq !== roleReqSeq.current) return
      setRoleList(roles?.list || [])
      setSelectedRoleIds(record.rbac_user_role?.map((r) => r.role_id) || [])
    } catch (err) {
      if (seq !== roleReqSeq.current) return
      message.error(err instanceof Error ? err.message : '加载角色失败')
    } finally {
      if (seq === roleReqSeq.current) setRoleLoading(false)
    }
  }

  const handleRoleSave = async () => {
    if (!roleTarget || submitting) return
    setSubmitting(true)
    try {
      const r = await setRbacUserRoles(roleTarget.id, selectedRoleIds, roleTarget.store_id)
      message.success(r.message || '保存成功')
      setRoleOpen(false)
      fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const rowActions = (record: RbacUser): MenuProps['items'] => {
    const items: MenuProps['items'] = []
    if (allowedActions.includes('RbacUser:roles')) {
      items.push({
        key: 'roles',
        icon: <KeyOutlined />,
        label: '设置角色',
        onClick: () => handleManageRole(record),
      })
    }
    if (allowedActions.includes('RbacUser:resetpassword')) {
      items.push({
        key: 'reset',
        icon: <LockOutlined />,
        label: '重置密码',
        onClick: () => handleResetPassword(record),
      })
    }
    if (allowedActions.includes('RbacUser:delete')) {
      items.push({ type: 'divider' as const })
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        onClick: () => handleDelete(record),
      })
    }
    return items
  }

  const columns: ColumnsType<RbacUser> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 140 },
    { title: '姓名', dataIndex: 'real_name', key: 'real_name', width: 120 },
    {
      title: '所属企业',
      key: 'store',
      width: 200,
      render: (_, r) => storeNameMap[r.store_id] || `企业${r.store_id}`,
    },
    {
      title: '角色',
      key: 'roles',
      width: 180,
      render: (_, r) => (
        <Space size={4} wrap>
          {r.rbac_user_role?.map((ur) => (
            <Tag key={ur.id} color="blue">
              {ur.rbac_role?.role_name || `角色${ur.role_id}`}
            </Tag>
          ))}
        </Space>
      ),
    },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 70 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Permission moduleKey="RbacUser" actionMark="update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </Permission>
          {allowedActions.includes('RbacUser:roles') ||
          allowedActions.includes('RbacUser:resetpassword') ||
          allowedActions.includes('RbacUser:delete') ? (
            <Dropdown menu={{ items: rowActions(record) }} trigger={['hover']}>
              <Button type="link" size="small">
                更多
              </Button>
            </Dropdown>
          ) : null}
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Form.Item name="store_id">
            <Select
              placeholder="所属企业"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: 200 }}
              options={stores.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item name="username">
            <Input placeholder="用户名" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="real_name">
            <Input placeholder="姓名" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={() => fetchData(1, pagination.limit)}>
                搜索
              </Button>
              <Button
                onClick={() => {
                  searchForm.resetFields()
                  fetchData(1, pagination.limit)
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="租户用户"
        extra={
          <Space>
            <Permission moduleKey="RbacUser" actionMark="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                新建用户
              </Button>
            </Permission>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchData()
                fetchStores()
              }}
            >
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
          scroll={{ x: 1050 }}
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
        confirmLoading={submitting}
        destroyOnHidden
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="store_id"
            label="所属企业"
            rules={[{ required: true, message: '请选择所属企业' }]}
          >
            <Select
              placeholder="请选择所属企业"
              showSearch
              optionFilterProp="label"
              options={stores.map((s) => ({ value: s.id, label: s.name }))}
              disabled={!!editing}
            />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 5, max: 20, message: '用户名长度 5-20' },
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
              { min: 2, max: 20, message: '姓名长度 2-20' },
            ]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={100}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`设置角色 - ${roleTarget?.real_name || roleTarget?.username || ''}`}
        open={roleOpen}
        onOk={handleRoleSave}
        onCancel={() => setRoleOpen(false)}
        confirmLoading={submitting}
        destroyOnHidden
        width={400}
      >
        {roleLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Spin />
          </div>
        ) : (
          <Select
            mode="multiple"
            value={selectedRoleIds}
            onChange={(vals) => setSelectedRoleIds(vals as number[])}
            placeholder="请选择角色"
            style={{ width: '100%', marginTop: 16 }}
            options={roleList.map((r) => ({ value: r.id, label: r.role_name }))}
          />
        )}
        {!roleLoading && roleList.length === 0 && (
          <div style={{ color: '#94A3B8', padding: 8, textAlign: 'center' }}>该企业暂无角色</div>
        )}
      </Modal>
    </>
  )
}
