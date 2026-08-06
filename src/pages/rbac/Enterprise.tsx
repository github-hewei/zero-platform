import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Input, Space, Card, Form, Modal, App, InputNumber } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  RestOutlined,
} from '@ant-design/icons'
import Permission from '@/components/Permission'
import {
  getStoreList,
  createStore,
  updateStore,
  deleteStore,
  recycleStore,
  restoreStore,
} from '@/services/rbac'
import type { RbacStore } from '@/types'

export default function EnterprisePage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RbacStore[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RbacStore | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchForm] = Form.useForm()
  const [form] = Form.useForm()
  const { message, modal } = App.useApp()

  const [recycleOpen, setRecycleOpen] = useState(false)
  const [recycleData, setRecycleData] = useState<RbacStore[]>([])
  const [recycleLoading, setRecycleLoading] = useState(false)
  const [recycleTotal, setRecycleTotal] = useState(0)
  const [recyclePage, setRecyclePage] = useState({ page: 1, limit: 20 })

  const fetchData = useCallback(
    async (page?: number, limit?: number) => {
      setLoading(true)
      try {
        const searchValues = searchForm.getFieldsValue()
        const res = await getStoreList({
          page: page ?? pagination.page,
          limit: limit ?? pagination.limit,
          name: searchValues.name || undefined,
          is_recycle: 0,
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

  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        form.setFieldsValue({
          name: editing.name,
          short_name: editing.short_name,
          contact: editing.contact,
          contact_phone: editing.contact_phone,
          description: editing.description,
          logo_image_id: editing.logo_image_id,
          sort: editing.sort,
        })
      } else {
        form.resetFields()
      }
    }
  }, [modalOpen, editing, form])

  const fetchRecycle = useCallback(
    async (page?: number, limit?: number) => {
      setRecycleLoading(true)
      try {
        const res = await getStoreList({
          page: page ?? recyclePage.page,
          limit: limit ?? recyclePage.limit,
          is_recycle: 1,
        })
        setRecycleData(res?.list || [])
        setRecycleTotal(res?.total || 0)
        setRecyclePage((prev) => {
          const p = page ?? prev.page
          const l = limit ?? prev.limit
          return { page: p, limit: l }
        })
      } catch (err) {
        message.error(err instanceof Error ? err.message : '加载失败')
      } finally {
        setRecycleLoading(false)
      }
    },
    [message, recyclePage.limit, recyclePage.page],
  )

  const handleSearch = () => {
    fetchData(1, pagination.limit)
  }

  const handleReset = () => {
    searchForm.resetFields()
    fetchData(1, pagination.limit)
  }

  const handleCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const handleEdit = (record: RbacStore) => {
    setEditing(record)
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    const values = await form.validateFields().catch(() => null)
    if (!values || submitting) return
    setSubmitting(true)
    try {
      if (editing) {
        const r = await updateStore({ id: editing.id, ...values })
        message.success(r.message || '更新成功')
      } else {
        const r = await createStore(values)
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

  const handleRecycle = (record: RbacStore) => {
    modal.confirm({
      title: '确认回收',
      content: `确定要回收企业「${record.name}」吗？回收后该企业下所有用户将无法登录。`,
      okText: '回收',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const r = await recycleStore(record.id)
          message.success(r.message || '已回收')
          if (data.length === 1 && pagination.page > 1) {
            fetchData(pagination.page - 1)
          } else {
            fetchData()
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : '操作失败')
        }
      },
    })
  }

  const handleRestore = (record: RbacStore) => {
    modal.confirm({
      title: '确认恢复',
      content: `确定要恢复企业「${record.name}」吗？`,
      okText: '恢复',
      cancelText: '取消',
      onOk: async () => {
        try {
          const r = await restoreStore(record.id)
          message.success(r.message || '已恢复')
          if (recycleData.length === 1 && recyclePage.page > 1) {
            fetchRecycle(recyclePage.page - 1, recyclePage.limit)
          } else {
            fetchRecycle(recyclePage.page, recyclePage.limit)
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : '操作失败')
        }
      },
    })
  }

  const handleDelete = (record: RbacStore) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要永久删除企业「${record.name}」吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const r = await deleteStore(record.id)
          message.success(r.message || '已删除')
          if (recycleData.length === 1 && recyclePage.page > 1) {
            fetchRecycle(recyclePage.page - 1, recyclePage.limit)
          } else {
            fetchRecycle(recyclePage.page, recyclePage.limit)
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : '删除失败')
        }
      },
    })
  }

  const columns: ColumnsType<RbacStore> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '企业名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '简称', dataIndex: 'short_name', key: 'short_name', width: 120 },
    { title: '联系人', dataIndex: 'contact', key: 'contact', width: 100 },
    { title: '电话', dataIndex: 'contact_phone', key: 'contact_phone', width: 130 },
    {
      title: '入驻时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (v: number) => {
        if (!v) return '-'
        const d = new Date(v * 1000)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Permission moduleKey="EnterpriseStore" actionMark="update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </Permission>
          <Permission moduleKey="EnterpriseStore" actionMark="recycle">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRecycle(record)}
            >
              删除
            </Button>
          </Permission>
        </Space>
      ),
    },
  ]

  const recycleColumns: ColumnsType<RbacStore> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '企业名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '简称', dataIndex: 'short_name', key: 'short_name', width: 120 },
    { title: '联系人', dataIndex: 'contact', key: 'contact', width: 100 },
    { title: '电话', dataIndex: 'contact_phone', key: 'contact_phone', width: 130 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Permission moduleKey="EnterpriseStore" actionMark="restore">
            <Button
              type="link"
              size="small"
              icon={<UndoOutlined />}
              onClick={() => handleRestore(record)}
            >
              恢复
            </Button>
          </Permission>
          <Permission moduleKey="EnterpriseStore" actionMark="delete">
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
          <Form.Item name="name">
            <Input placeholder="企业名称" allowClear style={{ width: 180 }} />
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
        title="企业管理"
        extra={
          <Space>
            <Permission moduleKey="EnterpriseStore" actionMark="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                新建企业
              </Button>
            </Permission>
            <Button
              icon={<RestOutlined />}
              onClick={() => {
                setRecycleOpen(true)
                fetchRecycle(1, recyclePage.limit)
              }}
            >
              回收站
            </Button>
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
        title={editing ? '编辑企业' : '新建企业'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnHidden
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="企业名称"
            rules={[{ required: true, message: '请输入企业名称' }]}
          >
            <Input placeholder="请输入企业名称" />
          </Form.Item>
          <Form.Item
            name="short_name"
            label="企业简称"
            rules={[{ required: true, message: '请输入企业简称' }]}
          >
            <Input placeholder="请输入企业简称" />
          </Form.Item>
          <Form.Item
            name="contact"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item
            name="contact_phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea rows={3} placeholder="请输入企业简介" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="回收站"
        open={recycleOpen}
        onCancel={() => setRecycleOpen(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <Table
          columns={recycleColumns}
          dataSource={recycleData}
          rowKey="id"
          loading={recycleLoading}
          scroll={{ x: 700 }}
          pagination={{
            current: recyclePage.page,
            pageSize: recyclePage.limit,
            total: recycleTotal,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, limit) => fetchRecycle(page, limit),
          }}
        />
      </Modal>
    </>
  )
}
