import { useState, useEffect, useCallback, useMemo } from 'react'
import { Table, Button, Space, Card, Form, Modal, InputNumber, Input, TreeSelect, App } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import Permission from '@/components/Permission'
import { getApiList, createApi, updateApi, deleteApi } from '@/services/rbac'
import type { RbacApi } from '@/types'

export default function ApiPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RbacApi[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RbacApi | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const { message, modal } = App.useApp()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getApiList()
      const clean = (items: RbacApi[]): RbacApi[] =>
        items.map((item) => ({
          ...item,
          children: item.children?.length ? clean(item.children) : undefined,
        }))
      setData(clean(list))
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        form.setFieldsValue({
          name: editing.name,
          url: editing.url,
          parent_id: editing.parent_id,
          sort: editing.sort,
        })
      } else {
        form.resetFields()
      }
    }
  }, [modalOpen, editing, form])

  const expandedKeys = useMemo(() => {
    const ids: number[] = []
    const walk = (items: RbacApi[]) => {
      for (const item of items) {
        if (item.children?.length) {
          ids.push(item.id)
          walk(item.children)
        }
      }
    }
    walk(data)
    return ids
  }, [data])

  const [expanded, setExpanded] = useState<number[]>([])
  const [initialExpanded, setInitialExpanded] = useState(false)

  useEffect(() => {
    if (data.length > 0 && !initialExpanded) {
      setExpanded(expandedKeys)
      setInitialExpanded(true)
    }
  }, [data, expandedKeys, initialExpanded])

  const handleCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const handleEdit = (record: RbacApi) => {
    setEditing(record)
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    const values = await form.validateFields().catch(() => null)
    if (!values || submitting) return
    setSubmitting(true)
    try {
      if (editing) {
        const r = await updateApi({ id: editing.id, ...values })
        message.success(r.message || '更新成功')
      } else {
        const r = await createApi(values)
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

  const handleDelete = (record: RbacApi) => {
    const hasChildren = record.children && record.children.length > 0
    modal.confirm({
      title: '确认删除',
      content: `确定要删除接口「${record.name}」吗？${hasChildren ? '其下所有子接口也将被删除。' : ''}`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const r = await deleteApi(record.id)
          message.success(r.message || '删除成功')
          fetchData()
        } catch (err) {
          message.error(err instanceof Error ? err.message : '删除失败')
        }
      },
    })
  }

  const disabledApiIds = useMemo(() => {
    const set = new Set<number>()
    if (!editing) return set
    const walk = (items: RbacApi[]) => {
      for (const item of items) {
        set.add(item.id)
        if (item.children?.length) walk(item.children)
      }
    }
    const find = (items: RbacApi[]): boolean => {
      for (const item of items) {
        if (item.id === editing.id) {
          walk([item])
          return true
        }
        if (item.children?.length && find(item.children)) return true
      }
      return false
    }
    find(data)
    return set
  }, [editing, data])

  const apiTreeData = useMemo(() => {
    interface TreeNode {
      title: string
      value: number
      disabled?: boolean
      children?: TreeNode[]
    }
    const build = (items: RbacApi[]): TreeNode[] =>
      items.map((item) => ({
        title: item.name,
        value: item.id,
        disabled: disabledApiIds.has(item.id),
        children: item.children?.length ? build(item.children) : undefined,
      }))
    return [{ title: '顶级（无父级）', value: 0, children: build(data) }]
  }, [data, disabledApiIds])

  const columns: ColumnsType<RbacApi> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '接口名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '接口路径', dataIndex: 'url', key: 'url', width: 280 },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 70 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Permission moduleKey="Api" actionMark="update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </Permission>
          <Permission moduleKey="Api" actionMark="delete">
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
      <Card
        title="接口管理"
        extra={
          <Space>
            <Permission moduleKey="Api" actionMark="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate()}>
                新增接口
              </Button>
            </Permission>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
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
          expandedRowKeys={expanded}
          onExpand={(exp, record) => {
            setExpanded((prev) =>
              exp ? [...prev, record.id] : prev.filter((id) => id !== record.id),
            )
          }}
          expandable={{ rowExpandable: (r) => (r.children?.length ?? 0) > 0 }}
          scroll={{ x: 800 }}
          pagination={false}
        />
      </Card>

      <Modal
        title={editing ? '编辑接口' : '新建接口'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="parent_id" label="父级接口">
            <TreeSelect
              placeholder="不选则为顶级接口"
              allowClear
              treeDefaultExpandAll
              treeData={apiTreeData}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="接口名称"
            rules={[{ required: true, message: '请输入接口名称' }]}
          >
            <Input placeholder="请输入接口名称" />
          </Form.Item>
          <Form.Item
            name="url"
            label="接口路径"
            rules={[{ required: true, message: '请输入接口路径' }]}
          >
            <Input placeholder="如 /api/user/list" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
