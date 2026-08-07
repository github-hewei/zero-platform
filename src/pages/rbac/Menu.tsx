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
  theme,
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
  const { token } = theme.useToken()
  const importInputRef = useRef<HTMLInputElement>(null)

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
      setSelectedApiIds(bound)
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

  const validateImport = (items: unknown[], seenPaths: Set<string>): string | null => {
    for (let i = 0; i < items.length; i++) {
      const label = `第 ${i + 1} 项`
      const item = items[i]
      if (typeof item !== 'object' || item === null) return `${label}：不是有效对象`
      const o = item as Record<string, unknown>

      if (typeof o.path !== 'string' || o.path.trim() === '' || !o.path.startsWith('/')) {
        return `${label}：path 必须为以 / 开头的非空字符串`
      }
      if (seenPaths.has(o.path)) return `${label}：path「${o.path}」与其他菜单重复`
      seenPaths.add(o.path)

      if (typeof o.title !== 'string' || o.title.trim() === '') {
        return `${label}：title 不能为空`
      }

      if (o.actions !== undefined) {
        if (!Array.isArray(o.actions)) return `${label}：actions 必须是数组`
        const seenMarks = new Set<string>()
        for (let j = 0; j < o.actions.length; j++) {
          const actLabel = `${label} 第 ${j + 1} 个操作`
          const a = o.actions[j]
          if (typeof a !== 'object' || a === null) return `${actLabel}：不是有效对象`
          const act = a as Record<string, unknown>
          if (typeof act.title !== 'string' || act.title.trim() === '') {
            return `${actLabel}：title 不能为空`
          }
          if (typeof act.action_mark !== 'string' || act.action_mark.trim() === '') {
            return `${actLabel}：action_mark 不能为空`
          }
          if (seenMarks.has(act.action_mark)) {
            return `${actLabel}：action_mark「${act.action_mark}」重复`
          }
          seenMarks.add(act.action_mark)
        }
      }

      if (o.children !== undefined) {
        if (!Array.isArray(o.children)) return `${label}：children 必须是数组`
        const err = validateImport(o.children, seenPaths)
        if (err) return `${o.title} > ${err}`
      }
    }
    return null
  }

  const handleFileSelect = async (file: File | null) => {
    setImportFile(file)
    if (!file) {
      setImportPreview(null)
      setImportData(null)
      return
    }
    if (!file.name.toLowerCase().endsWith('.json')) {
      setImportPreview('请选择 .json 格式的菜单文件')
      setImportData(null)
      return
    }
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      if (!Array.isArray(json)) {
        setImportPreview('JSON 格式错误：根节点应为数组')
        setImportData(null)
        return
      }
      const err = validateImport(json, new Set())
      if (err) {
        setImportPreview(`JSON 校验失败：${err}`)
        setImportData(null)
        return
      }
      const countAll = (items: unknown[]): { pages: number; actions: number } => {
        let pages = 0
        let actions = 0
        const walk = (nodes: unknown[]) => {
          for (const node of nodes as Array<{
            children?: unknown[]
            actions?: Array<{ action_mark?: string }>
          }>) {
            pages++
            if (node.actions?.length) actions += node.actions.length
            if (node.children?.length) walk(node.children)
          }
        }
        walk(items)
        return { pages, actions }
      }
      const { pages, actions } = countAll(json)
      setImportPreview(`检测到 ${pages} 个页面、${actions} 个操作权限`)
      setImportData(json as MenuImportItem[])
    } catch {
      setImportPreview('文件解析失败，请检查 JSON 格式')
      setImportData(null)
    }
  }

  const handleImport = async () => {
    if (!importData || importing) return
    modal.confirm({
      title: '确认全量同步',
      content:
        '将以数据源为准进行全量对账：已存在的菜单按 path 匹配更新，新增写入，数据源中未包含的存量菜单将被删除。确定继续？',
      okText: '开始同步',
      cancelText: '取消',
      onOk: async () => {
        setImporting(true)
        try {
          const convert = (items: MenuImportItem[]): MenuSyncItem[] =>
            items.map((item) => ({
              name: item.title,
              path: item.path,
              module_key: item.module_key,
              sort: item.meta?.sort,
              children: item.children?.length ? convert(item.children) : undefined,
              actions: item.actions?.length
                ? item.actions.map((a) => ({ name: a.title, action_mark: a.action_mark }))
                : undefined,
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
      },
    })
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
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: 6,
            padding: '32px 16px',
            textAlign: 'center',
            marginTop: 16,
            cursor: 'pointer',
          }}
          onClick={() => importInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault()
            handleFileSelect(e.dataTransfer.files?.[0] || null)
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {importFile ? (
            <div style={{ color: token.colorText, fontWeight: 500 }}>{importFile.name}</div>
          ) : (
            <div style={{ color: token.colorTextSecondary }}>点击或拖拽上传 menus.json 文件</div>
          )}
        </div>
        {importPreview && (
          <div
            style={{
              marginTop: 12,
              padding: '8px 12px',
              background: importData ? token.colorSuccessBg : token.colorErrorBg,
              borderRadius: 4,
              fontSize: 13,
              color: importData ? token.colorSuccess : token.colorError,
            }}
          >
            {importPreview}
          </div>
        )}
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={(e) => {
            handleFileSelect(e.target.files?.[0] || null)
            e.target.value = ''
          }}
        />
      </Modal>
    </>
  )
}
