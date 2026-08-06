import { useState, useEffect } from 'react'
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
import type { SettingDefault, FormField, FormGroup } from '@/types'

export default function GeneralSettingsPage() {
  const [groups, setGroups] = useState<FormGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [settingIds, setSettingIds] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<string>('')
  const [form] = Form.useForm()
  const { message } = App.useApp()

  useEffect(() => {
    const load = async () => {
      try {
        const configs = await getFormConfigs()
        setGroups(configs)
        if (configs.length > 0) setActiveTab(configs[0].key)

        const listRes = await getSettingDefaultList({ page: 1, limit: 100 })
        const ids: Record<string, number> = {}
        const savedValues: Record<string, unknown> = {}

        for (const item of listRes?.list || []) {
          ids[item.setting_key] = item.id
          try {
            const parsed = JSON.parse(item.setting_values)
            const group = configs.find((g: FormGroup) => g.key === item.setting_key)
            if (group) {
              for (const field of group.fields) {
                savedValues[`${item.setting_key}.${field.key}`] = parsed[field.key] ?? undefined
              }
            }
          } catch {
            /* ignore parse error */
          }
        }

        setSettingIds(ids)
        form.setFieldsValue(savedValues)
      } catch {
        message.error('加载配置失败')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [message, form])

  const handleSave = async (group: FormGroup) => {
    const fieldValues: Record<string, unknown> = {}
    for (const field of group.fields) {
      fieldValues[field.key] = form.getFieldValue(`${group.key}.${field.key}`)
    }

    setSaving((prev) => ({ ...prev, [group.key]: true }))
    try {
      const jsonValues = JSON.stringify(fieldValues)
      const existingId = settingIds[group.key]

      if (existingId) {
        await updateSettingDefault({
          id: existingId,
          setting_key: group.key,
          setting_values: jsonValues,
        })
      } else {
        await createSettingDefault({
          setting_key: group.key,
          setting_values: jsonValues,
        })
        const fresh = await getSettingDefaultList({ page: 1, limit: 100 })
        const newItem = (fresh?.list || []).find((s: SettingDefault) => s.setting_key === group.key)
        if (newItem) {
          setSettingIds((prev) => ({ ...prev, [group.key]: newItem.id }))
        }
      }
      message.success(`${group.label} 保存成功`)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving((prev) => ({ ...prev, [group.key]: false }))
    }
  }

  const renderField = (field: FormField, groupKey: string) => {
    const name = `${groupKey}.${field.key}`

    switch (field.type) {
      case 'textarea':
        return (
          <Form.Item
            key={field.key}
            name={name}
            label={field.label}
            rules={[{ required: field.required }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        )
      case 'select':
        return (
          <Form.Item
            key={field.key}
            name={name}
            label={field.label}
            rules={[{ required: field.required }]}
          >
            <Select options={field.options || []} placeholder={`请选择${field.label}`} />
          </Form.Item>
        )
      case 'checkbox':
        return (
          <Form.Item
            key={field.key}
            name={name}
            label={field.label}
            rules={[{ required: field.required }]}
          >
            <Checkbox.Group options={field.options || []} />
          </Form.Item>
        )
      case 'switch':
        return (
          <Form.Item key={field.key} name={name} label={field.label} valuePropName="checked">
            <Switch />
          </Form.Item>
        )
      case 'image':
        return (
          <Form.Item
            key={field.key}
            name={name}
            label={field.label}
            rules={
              field.required
                ? [
                    {
                      validator: (_, value) =>
                        value > 0
                          ? Promise.resolve()
                          : Promise.reject(new Error(`请上传${field.label}`)),
                    },
                  ]
                : undefined
            }
          >
            <ImageUpload />
          </Form.Item>
        )
      case 'file':
        return (
          <Form.Item
            key={field.key}
            name={name}
            label={field.label}
            rules={
              field.required
                ? [
                    {
                      validator: (_, value) =>
                        value > 0
                          ? Promise.resolve()
                          : Promise.reject(new Error(`请上传${field.label}`)),
                    },
                  ]
                : undefined
            }
          >
            <FileUpload />
          </Form.Item>
        )
      default:
        return (
          <Form.Item
            key={field.key}
            name={name}
            label={field.label}
            rules={[{ required: field.required }]}
          >
            <Input />
          </Form.Item>
        )
    }
  }

  return (
    <Form form={form} layout="vertical">
      {loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        </Card>
      ) : groups.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>暂无设置项</div>
        </Card>
      ) : (
        <Card title="默认系统设置">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={groups.map((group) => ({
              key: group.key,
              label: group.label,
              children: (
                <div style={{ maxWidth: 600 }}>
                  {group.description && (
                    <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 24 }}>
                      {group.description}
                    </p>
                  )}
                  {group.fields.map((field) => renderField(field, group.key))}
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving[group.key]}
                    onClick={() => handleSave(group)}
                    style={{ marginTop: 16 }}
                  >
                    保存
                  </Button>
                </div>
              ),
            }))}
          />
        </Card>
      )}
    </Form>
  )
}
