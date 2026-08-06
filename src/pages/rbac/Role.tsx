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
  Tree,
  App,
  Spin,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
} from '@ant-design/icons'
import Permission from '@/components/Permission'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  setRoleMenus,
  getStoreList,
  getMenuList,
} from '@/services/rbac'
import type { RbacRole, RbacStore, RbacMenu, MenuTreeNode } from '@/types'

export default function RolePage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RbacRole[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })
  const [stores, setStores] = useState<RbacStore[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RbacRole | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuTarget, setMenuTarget] = useState<RbacRole | null>(null)
  const [menuData, setMenuData] = useState<RbacMenu[]>([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const menuReqSeq = useRef(0)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const { message, modal } = App.useApp()

  const fetchData = useCallback(
    async (page?: number, limit?: number) => {
      setLoading(true)
      try {
        const values = searchForm.getFieldsValue()
        const res = await getRoleList({
          role_name: values.role_name || undefined,
          store_id: values.store_id || undefined,
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
          role_name: editing.role_name,
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
  const handleEdit = (record: RbacRole) => {
    setEditing(record)
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    const values = await form.validateFields().catch(() => null)
    if (!values || submitting) return
    setSubmitting(true)
    try {
      if (editing) {
        const r = await updateRole({ id: editing.id, ...values })
        message.success(r.message || '更新成功')
      } else {
        const r = await createRole(values)
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

  const handleDelete = (record: RbacRole) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除角色「${record.role_name}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const r = await deleteRole(record.id, record.store_id)
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

  const handleManageMenu = async (record: RbacRole) => {
    const seq = ++menuReqSeq.current
    setMenuTarget(record)
    setMenuOpen(true)
    setMenuLoading(true)
    try {
      const menus = await getMenuList()
      if (seq !== menuReqSeq.current) return
      const clean = (items: RbacMenu[]): RbacMenu[] =>
        items.map((item) => ({
          ...item,
          children: item.children?.length ? clean(item.children) : undefined,
        }))
      setMenuData(clean(menus))
      setSelectedMenuIds(record.rbac_role_menu?.map((m) => m.menu_id) || [])
    } catch (err) {
      if (seq !== menuReqSeq.current) return
      message.error(err instanceof Error ? err.message : '加载菜单失败')
    } finally {
      if (seq === menuReqSeq.current) setMenuLoading(false)
    }
  }

  const handleMenuSave = async () => {
    if (!menuTarget || submitting) return
    setSubmitting(true)
    try {
      const r = await setRoleMenus(menuTarget.id, selectedMenuIds, menuTarget.store_id)
      message.success(r.message || '保存成功')
      setMenuOpen(false)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const menuTreeData = useMemo(() => {
    const build = (items: RbacMenu[]): MenuTreeNode[] =>
      items.map((item) => ({
        title: item.name,
        key: item.id,
        children: item.children?.length ? build(item.children) : undefined,
      }))
    return build(menuData)
  }, [menuData])

  const columns: ColumnsType<RbacRole> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '角色名称', dataIndex: 'role_name', key: 'role_name', width: 180 },
    {
      title: '所属企业',
      key: 'store',
      width: 200,
      render: (_, r) => storeNameMap[r.store_id] || `企业${r.store_id}`,
    },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 70 },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Permission moduleKey="Role" actionMark="update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </Permission>
          <Permission moduleKey="Role" actionMark="menus">
            <Button
              type="link"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => handleManageMenu(record)}
            >
              设置菜单权限
            </Button>
          </Permission>
          <Permission moduleKey="Role" actionMark="delete">
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
          <Form.Item name="role_name">
            <Input placeholder="角色名称" allowClear style={{ width: 160 }} />
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
        title="角色管理"
        extra={
          <Space>
            <Permission moduleKey="Role" actionMark="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                新建角色
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
        title={editing ? '编辑角色' : '新建角色'}
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
            name="role_name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={100}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`设置菜单权限 - ${menuTarget?.role_name || ''}`}
        open={menuOpen}
        onOk={handleMenuSave}
        onCancel={() => setMenuOpen(false)}
        width={480}
        confirmLoading={submitting}
        destroyOnHidden
      >
        {menuLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <Tree
            checkable
            defaultExpandAll
            checkedKeys={selectedMenuIds}
            onCheck={(keys, e) =>
              setSelectedMenuIds((keys as number[]).filter((k) => !e.halfCheckedKeys?.includes(k)))
            }
            treeData={menuTreeData}
          />
        )}
      </Modal>
    </>
  )
}
