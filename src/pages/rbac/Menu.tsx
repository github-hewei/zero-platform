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
  TreeSelect,
  Dropdown,
  Tag,
  Tree,
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
  ApiOutlined,
  KeyOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import Permission from '@/components/Permission'
import { usePermissionStore } from '@/stores'
import {
  getMenuList,
  createMenu,
  updateMenu,
  deleteMenu,
  syncMenu,
  getMenuApis,
  getApiList,
  saveMenuApis,
} from '@/services/rbac'
import type { RbacMenu, RbacApi, MenuImportItem, MenuSyncItem, MenuTreeNode } from '@/types'

export default function MenuPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RbacMenu[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [actionOpen, setActionOpen] = useState(false)
  const [editing, setEditing] = useState<RbacMenu | null>(null)
  const [parentId, setParentId] = useState<number | undefined>(undefined)
  const [menuForm] = Form.useForm()
  const [actionForm] = Form.useForm()
  const { message, modal } = App.useApp()

  const [apiOpen, setApiOpen] = useState(false)
  const [apiTarget, setApiTarget] = useState<RbacMenu | null>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [allApis, setAllApis] = useState<RbacApi[]>([])
  const [selectedApiIds, setSelectedApiIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const apiReqSeq = useRef(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getMenuList()
      const clean = (items: RbacMenu[]): RbacMenu[] =>
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
    if (menuOpen) {
      if (editing) {
        menuForm.setFieldsValue({
          name: editing.name,
          path: editing.path,
          parent_id: editing.parent_id || undefined,
          module_key: editing.module_key,
          sort: editing.sort,
        })
      } else {
        menuForm.resetFields()
        if (parentId) menuForm.setFieldValue('parent_id', parentId)
      }
    }
  }, [menuOpen, editing, parentId, menuForm])

  useEffect(() => {
    if (actionOpen) {
      if (editing) {
        actionForm.setFieldsValue({
          name: editing.name,
          parent_id: editing.parent_id || undefined,
          module_key: editing.module_key,
          action_mark: editing.action_mark,
          sort: editing.sort,
        })
      } else {
        actionForm.resetFields()
        if (parentId) actionForm.setFieldValue('parent_id', parentId)
      }
    }
  }, [actionOpen, editing, parentId, actionForm])

  const expandedKeys = useMemo(() => {
    const ids: number[] = []
    const walk = (items: RbacMenu[]) => {
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
    setParentId(0)
    setMenuOpen(true)
  }
  const handleEditMenu = (record: RbacMenu) => {
    setEditing(record)
    setParentId(0)
    setMenuOpen(true)
  }
  const handleAddAction = (record: RbacMenu) => {
    setEditing(null)
    setParentId(record.id)
    setActionOpen(true)
  }
  const handleEditAction = (record: RbacMenu) => {
    setEditing(record)
    setParentId(0)
    setActionOpen(true)
  }

  const handleManageApi = async (record: RbacMenu) => {
    const seq = ++apiReqSeq.current
    setApiTarget(record)
    setApiOpen(true)
    setApiLoading(true)
    try {
      const [all, bound] = await Promise.all([getApiList(), getMenuApis(record.id)])
      if (seq !== apiReqSeq.current) return
      setAllApis(all)
      setSelectedApiIds(bound.map((a) => a.id))
    } catch (err) {
      if (seq !== apiReqSeq.current) return
      message.error(err instanceof Error ? err.message : '加载接口权限失败')
    } finally {
      if (seq === apiReqSeq.current) setApiLoading(false)
    }
  }

  const handleApiSave = async () => {
    if (!apiTarget || submitting) return
    setSubmitting(true)
    try {
      const r = await saveMenuApis(apiTarget.id, selectedApiIds)
      message.success(r.message || '保存成功')
      setApiOpen(false)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMenuOk = async () => {
    const values = await menuForm.validateFields().catch(() => null)
    if (!values || submitting) return
    setSubmitting(true)
    try {
      const params = { ...values, type: 10, is_page: 1 }
      if (editing) {
        const r = await updateMenu({ id: editing.id, ...params })
        message.success(r.message || '更新成功')
      } else {
        const r = await createMenu(params)
        message.success(r.message || '创建成功')
      }
      setMenuOpen(false)
      fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleActionOk = async () => {
    const values = await actionForm.validateFields().catch(() => null)
    if (!values || submitting) return
    setSubmitting(true)
    try {
      const params = { ...values, type: 20, is_page: 0, path: '-' }
      if (editing) {
        const r = await updateMenu({ id: editing.id, ...params })
        message.success(r.message || '更新成功')
      } else {
        const r = await createMenu(params)
        message.success(r.message || '创建成功')
      }
      setActionOpen(false)
      fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (record: RbacMenu) => {
    const hasChildren = record.children && record.children.length > 0
    modal.confirm({
      title: '确认删除',
      content: `确定要删除「${record.name}」吗？${hasChildren ? '其下所有子菜单也将被删除。' : ''}`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const r = await deleteMenu(record.id)
          message.success(r.message || '删除成功')
          fetchData()
        } catch (err) {
          message.error(err instanceof Error ? err.message : '删除失败')
        }
      },
    })
  }

  const [importOpen, setImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<string | null>(null)
  const [importData, setImportData] = useState<MenuImportItem[] | null>(null)

  const allowedActions = usePermissionStore((s) => s.allowedActions)

  const walkImportValid = (items: unknown[]): boolean =>
    items.every((item) => {
      if (typeof item !== 'object' || item === null) return false
      const o = item as Record<string, unknown>
      if (typeof o.path !== 'string' || typeof o.title !== 'string') return false
      if (o.children === undefined) return true
      return Array.isArray(o.children) && walkImportValid(o.children as unknown[])
    })

  const handleFileSelect = async (file: File | null) => {
    setImportFile(file)
    if (!file) {
      setImportPreview(null)
      setImportData(null)
      return
    }
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      if (!Array.isArray(json) || !walkImportValid(json)) {
        setImportPreview('JSON 格式错误：根节点应为数组，每项需包含 path 和 title 字段')
        setImportData(null)
        return
      }
      const countRoot = json.length
      const countAll = (items: unknown[]): number => {
        let n = 0
        for (const item of items as Array<{ children?: unknown[] }>) {
          n++
          if (item.children?.length) n += countAll(item.children)
        }
        return n
      }
      setImportPreview(`检测到 ${countRoot} 个一级菜单，共 ${countAll(json)} 个节点`)
      setImportData(json as MenuImportItem[])
    } catch {
      setImportPreview('文件解析失败，请检查 JSON 格式')
      setImportData(null)
    }
  }

  const handleImport = async () => {
    if (!importData) return
    setImporting(true)
    try {
      const convert = (items: MenuImportItem[], parentId = 0): MenuSyncItem[] =>
        items.map((item) => ({
          name: item.title,
          type: 10,
          path: item.path,
          is_page: 1,
          module_key: item.module_key || '',
          sort: item.meta?.sort ?? 100,
          parent_id: parentId,
          children: item.children?.length ? convert(item.children, parentId) : undefined,
        }))

      const res = await syncMenu(convert(importData))
      message.success(res.message || '导入成功')
      setImportOpen(false)
      setImportFile(null)
      setImportPreview(null)
      setImportData(null)
      fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '导入失败')
    } finally {
      setImporting(false)
    }
  }

  const treeData = useMemo(() => {
    const build = (
      items: RbacMenu[],
    ): { title: string; value: number; children?: { title: string; value: number }[] }[] =>
      items.map((item) => ({
        title: item.name,
        value: item.id,
        children: item.children?.length ? build(item.children) : undefined,
      }))
    return [{ title: '顶级（无父级）', value: 0, children: build(data) }]
  }, [data])

  const apiTreeData = useMemo(() => {
    const build = (items: RbacApi[]): MenuTreeNode[] =>
      items.map((item) => ({
        title: (
          <span>
            {item.name} <span style={{ color: '#94A3B8', fontSize: 12 }}>{item.url}</span>
          </span>
        ),
        key: item.id,
        children: item.children?.length ? build(item.children) : undefined,
      }))
    return build(allApis)
  }, [allApis])

  const rowMoreItems = (record: RbacMenu): MenuProps['items'] => {
    const items: MenuProps['items'] = []
    if (allowedActions.includes('Menu:create')) {
      items.push({
        key: 'add-action',
        icon: <KeyOutlined />,
        label: '添加操作权限',
        onClick: () => handleAddAction(record),
      })
    }
    items.push({
      key: 'api',
      icon: <ApiOutlined />,
      label: '管理接口权限',
      onClick: () => handleManageApi(record),
    })
    if (allowedActions.includes('Menu:delete')) {
      items.push({ type: 'divider' as const })
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除菜单',
        danger: true,
        onClick: () => handleDelete(record),
      })
    }
    return items
  }

  const actionItems = (record: RbacMenu): MenuProps['items'] => {
    const items: MenuProps['items'] = []
    if (allowedActions.includes('Menu:update')) {
      items.push({
        key: 'edit-action',
        icon: <EditOutlined />,
        label: '编辑操作权限',
        onClick: () => handleEditAction(record),
      })
    }
    items.push({
      key: 'api-action',
      icon: <ApiOutlined />,
      label: '管理接口权限',
      onClick: () => handleManageApi(record),
    })
    if (allowedActions.includes('Menu:delete')) {
      items.push({ type: 'divider' as const })
      items.push({
        key: 'delete-action',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        onClick: () => handleDelete(record),
      })
    }
    return items
  }

  const columns: ColumnsType<RbacMenu> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 160 },
    { title: '菜单名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '路径', dataIndex: 'path', key: 'path', width: 200 },
    { title: '模块Key', dataIndex: 'module_key', key: 'module_key', width: 140 },
    {
      title: '操作权限',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        if (record.type === 10 && record.actions?.length) {
          return (
            <Space size={4} wrap>
              {record.actions.map((a) => (
                <Dropdown key={a.id} menu={{ items: actionItems(a) }} trigger={['hover']}>
                  <Tag color="blue" style={{ cursor: 'pointer' }}>
                    {a.name}
                  </Tag>
                </Dropdown>
              ))}
            </Space>
          )
        }
        return null
      },
    },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 70 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Permission moduleKey="Menu" actionMark="update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditMenu(record)}
            >
              编辑
            </Button>
          </Permission>
          <Dropdown menu={{ items: rowMoreItems(record) }} trigger={['hover']}>
            <Button type="link" size="small">
              更多
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card
        title="菜单管理"
        extra={
          <Space>
            <Permission moduleKey="Menu" actionMark="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                新增菜单
              </Button>
            </Permission>
            <Permission moduleKey="Menu" actionMark="create">
              <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
                导入
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
          scroll={{ x: 1100 }}
          pagination={false}
        />
      </Card>

      <Modal
        title={editing ? '编辑菜单' : '新增菜单'}
        open={menuOpen}
        onOk={handleMenuOk}
        onCancel={() => setMenuOpen(false)}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={menuForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="parent_id" label="父级菜单">
            <TreeSelect
              placeholder="不选则为顶级菜单"
              allowClear
              treeDefaultExpandAll
              treeData={treeData}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          <Form.Item name="path" label="路径" rules={[{ required: true, message: '请输入路径' }]}>
            <Input placeholder="如 /rbac/menu/list" />
          </Form.Item>
          <Form.Item name="module_key" label="模块Key">
            <Input placeholder="功能模块标识" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={100}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editing ? '编辑操作权限' : '新增操作权限'}
        open={actionOpen}
        onOk={handleActionOk}
        onCancel={() => setActionOpen(false)}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={actionForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="parent_id" label="所属菜单">
            <TreeSelect placeholder="请选择所属菜单" treeDefaultExpandAll treeData={treeData} />
          </Form.Item>
          <Form.Item
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="如 新增用户" />
          </Form.Item>
          <Form.Item name="module_key" label="模块Key">
            <Input placeholder="功能模块标识" />
          </Form.Item>
          <Form.Item
            name="action_mark"
            label="操作标识"
            rules={[{ required: true, message: '请输入操作标识' }]}
          >
            <Input placeholder="如 create, update, delete" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={100}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`管理接口权限 - ${apiTarget?.name || ''}`}
        open={apiOpen}
        onOk={handleApiSave}
        onCancel={() => setApiOpen(false)}
        width={600}
        confirmLoading={submitting}
        destroyOnHidden
      >
        {apiLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <Tree
            checkable
            defaultExpandAll
            checkedKeys={selectedApiIds}
            onCheck={(keys, e) =>
              setSelectedApiIds((keys as number[]).filter((k) => !e.halfCheckedKeys?.includes(k)))
            }
            treeData={apiTreeData}
          />
        )}
      </Modal>

      <Modal
        title="导入菜单"
        open={importOpen}
        onOk={handleImport}
        onCancel={() => {
          setImportOpen(false)
          setImportFile(null)
          setImportPreview(null)
          setImportData(null)
        }}
        okText="导入"
        confirmLoading={importing}
        destroyOnHidden
      >
        <div
          style={{
            border: '1px dashed #CBD5E1',
            borderRadius: 6,
            padding: '32px 16px',
            textAlign: 'center',
            marginTop: 16,
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('import-file-input')?.click()}
          onDrop={(e) => {
            e.preventDefault()
            handleFileSelect(e.dataTransfer.files?.[0] || null)
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {importFile ? (
            <div style={{ color: '#0F172A', fontWeight: 500 }}>{importFile.name}</div>
          ) : (
            <div style={{ color: '#94A3B8' }}>点击或拖拽上传 menus.json 文件</div>
          )}
        </div>
        {importPreview && (
          <div
            style={{
              marginTop: 12,
              padding: '8px 12px',
              background: importData ? '#F0FDF4' : '#FEF2F2',
              borderRadius: 4,
              fontSize: 13,
              color: importData ? '#16A34A' : '#DC2626',
            }}
          >
            {importPreview}
          </div>
        )}
        <input
          id="import-file-input"
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        />
      </Modal>
    </>
  )
}
