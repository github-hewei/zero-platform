import { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Card, Form, Input, Select, Checkbox, Switch, Tabs, App, Spin } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import {
  getFormConfigs,
  getSettingDefaultList,
  createSettingDefault,
  updateSettingDefault,
} from '@/services/setting'
import ImageUpload from '@/components/ImageUpload'
import FileUpload from '@/components/FileUpload'
import type { SettingDefault } from '@/types'

interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'switch' | 'image' | 'file'
  required: boolean
  options: { label: string; value: string }[] | null
}

interface GroupConfig {
  key: string
  label: string
  description: string
  only_platform: boolean
  fields: FieldConfig[]
}

const formRegistry = new Map<string, ReturnType<typeof Form.useForm>[0]>()

export default function GeneralSettingsPage() {
  const [groups, setGroups] = useState<GroupConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settingIds, setSettingIds] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<string>('')
  const { message } = App.useApp()

  useEffect(() => {
    const init = async () => {
      try {
        const formConfigs = await getFormConfigs()
        const configData = formConfigs.data as unknown as GroupConfig[]
        const configs = configData || []
        setGroups(configs)
        if (configs.length > 0) {
          setActiveTab(configs[0].key)
        }

        const res = await getSettingDefaultList({ page: 1, limit: 100 })
        const ids: Record<string, number> = {}
        if (res?.list) {
          for (const item of res.list) {
            ids[item.setting_key] = item.id
          }
        }
        setSettingIds(ids)
      } catch {
        message.error('加载配置失败')
      } finally {
        setLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadValues = useCallback(async (groupKey: string) => {
    const res = await getSettingDefaultList({ page: 1, limit: 100, setting_key: groupKey })
    const item = res?.list?.find((s: SettingDefault) => s.setting_key === groupKey)
    if (item) {
      try {
        const values = JSON.parse(item.setting_values)
        const form = formRegistry.get(groupKey)
        if (form) {
          form.setFieldsValue(values)
        }
      } catch {
        /* ignore parse error */
      }
    }
  }, [])

  const handleSave = async (groupKey: string) => {
    const form = formRegistry.get(groupKey)
    if (!form) return
    const values = await form.validateFields().catch(() => null)
    if (!values) return

    setSaving(true)
    try {
      const id = settingIds[groupKey]
      if (id) {
        await updateSettingDefault({
          id,
          setting_key: groupKey,
          setting_values: JSON.stringify(values),
        })
      } else {
        await createSettingDefault({
          setting_key: groupKey,
          setting_values: JSON.stringify(values),
        })
      }
      const res = await getSettingDefaultList({ page: 1, limit: 100, setting_key: groupKey })
      const ids = { ...settingIds }
      const item = res?.list?.find((s: SettingDefault) => s.setting_key === groupKey)
      if (item) {
        ids[groupKey] = item.id
      }
      setSettingIds(ids)
      message.success('保存成功')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (groups.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>暂无设置项</div>
      </Card>
    )
  }

  return (
    <Card
      title="默认系统设置"
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={() => handleSave(activeTab)}
        >
          保存
        </Button>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key)
          loadValues(key)
        }}
        items={groups.map((group) => ({
          key: group.key,
          label: group.label,
          children: <SettingGroup key={group.key} group={group} />,
        }))}
      />
    </Card>
  )
}

function SettingGroup({ group }: { group: GroupConfig }) {
  const [form] = Form.useForm()
  const registeredRef = useRef(false)

  useEffect(() => {
    formRegistry.set(group.key, form)
    registeredRef.current = true
    return () => {
      if (registeredRef.current) {
        formRegistry.delete(group.key)
      }
    }
  }, [form, group.key])

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
      {group.description && (
        <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 24 }}>{group.description}</p>
      )}
      {group.fields.map((field) => (
        <Form.Item
          key={field.key}
          name={field.key}
          label={field.label}
          rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined}
          valuePropName={
            field.type === 'switch' || field.type === 'checkbox' ? 'checked' : undefined
          }
        >
          {renderField(field)}
        </Form.Item>
      ))}
    </Form>
  )
}

function renderField(field: FieldConfig) {
  switch (field.type) {
    case 'textarea':
      return <Input.TextArea rows={4} />
    case 'select':
      return (
        <Select
          placeholder={`请选择${field.label}`}
          options={field.options?.map((o) => ({ label: o.label, value: o.value })) || []}
        />
      )
    case 'switch':
      return <Switch />
    case 'checkbox':
      return (
        <Checkbox.Group
          options={field.options?.map((o) => ({ label: o.label, value: o.value })) || []}
        />
      )
    case 'image':
      return <ImageUpload />
    case 'file':
      return <FileUpload />
    default:
      return <Input placeholder={`请输入${field.label}`} />
  }
}
