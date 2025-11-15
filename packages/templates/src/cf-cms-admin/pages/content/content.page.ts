/**
 * CF-CMS.js Content Management Page
 * 
 * Content list, create, edit, and management interfaces
 */

import { renderTable } from '../../components/tables/table.component'
import { renderButton } from '../../components/forms/button.component'
import { renderForm } from '../../components/forms/form.component'

export function renderContentList(props: {
  contentType: string
  items: any[]
  columns: any[]
  pagination?: any
  filters?: any
  search?: any
  onCreate?: string
  onEdit?: string
  onDelete?: string
}): string {
  const {
    contentType,
    items,
    columns,
    pagination,
    filters,
    search,
    onCreate,
    onEdit,
    onDelete
  } = props

  const tableActions = [
    ...(onEdit ? [{
      key: 'edit',
      label: 'Edit',
      icon: 'edit',
      variant: 'ghost' as const,
      onClick: onEdit
    }] : []),
    ...(onDelete ? [{
      key: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'danger' as const,
      onClick: onDelete
    }] : [])
  ]

  return `
    <div class="cf-cms-content-list">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 capitalize">${contentType}</h1>
            <p class="mt-1 text-sm text-gray-600">Manage your ${contentType} items</p>
          </div>
          ${onCreate ? renderButton({
            label: `Create ${contentType.slice(0, -1)}`,
            icon: 'plus',
            variant: 'primary',
            onClick: onCreate
          }) : ''}
        </div>
      </div>

      <!-- Content Table -->
      ${renderTable({
        title: `${items.length} ${contentType}`,
        columns,
        data: items,
        actions: tableActions,
        pagination,
        filtering: filters,
        search,
        empty: `No ${contentType} found. Create your first ${contentType.slice(0, -1)} to get started.`
      })}
    </div>
  `
}

export function renderContentForm(props: {
  contentType: string
  mode: 'create' | 'edit'
  item?: any
  fields: any[]
  onSubmit: string
  onCancel: string
}): string {
  const {
    contentType,
    mode,
    item,
    fields,
    onSubmit,
    onCancel
  } = props

  const title = mode === 'create' ? `Create ${contentType.slice(0, -1)}` : `Edit ${contentType.slice(0, -1)}`
  const submitText = mode === 'create' ? `Create ${contentType.slice(0, -1)}` : 'Save Changes'

  return `
    <div class="cf-cms-content-form">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">${title}</h1>
            <p class="mt-1 text-sm text-gray-600">
              ${mode === 'create' ? 'Fill in the details below to create a new item.' : 'Update the information below.'}
            </p>
          </div>
          ${renderButton({
            label: 'Cancel',
            variant: 'outline',
            onClick: onCancel
          })}
        </div>
      </div>

      <!-- Content Form -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6">
          ${renderForm({
            fields,
            action: '#',
            method: 'POST',
            submitText,
            cancelText: 'Cancel',
            validation: 'client',
            onSubmit
          })}
        </div>
      </div>
    </div>
  `
}

export function renderContentPreview(props: {
  item: any
  contentType: string
  onEdit?: string
  onDelete?: string
  onPublish?: string
  onUnpublish?: string
}): string {
  const {
    item,
    contentType,
    onEdit,
    onDelete,
    onPublish,
    onUnpublish
  } = props

  return `
    <div class="cf-cms-content-preview">
      <!-- Preview Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">${item.title || item.name}</h1>
              <p class="mt-1 text-sm text-gray-600">
                ${contentType} • ${item.status || 'Draft'} • Last updated ${formatDate(item.updated_at)}
              </p>
            </div>
            <div class="flex items-center space-x-3">
              ${item.status !== 'published' && onPublish ? renderButton({
                label: 'Publish',
                variant: 'primary',
                onClick: onPublish
              }) : ''}
              ${item.status === 'published' && onUnpublish ? renderButton({
                label: 'Unpublish',
                variant: 'outline',
                onClick: onUnpublish
              }) : ''}
              ${onEdit ? renderButton({
                label: 'Edit',
                icon: 'edit',
                variant: 'outline',
                onClick: onEdit
              }) : ''}
              ${onDelete ? renderButton({
                label: 'Delete',
                icon: 'trash',
                variant: 'danger',
                onClick: onDelete
              }) : ''}
            </div>
          </div>
        </div>
        
        <!-- Content Metadata -->
        <div class="p-6">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Status</dt>
              <dd class="mt-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'published' ? 'bg-green-100 text-green-800' :
                  item.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }">
                  ${item.status || 'Draft'}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Created</dt>
              <dd class="mt-1 text-sm text-gray-900">${formatDate(item.created_at)}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd class="mt-1 text-sm text-gray-900">${formatDate(item.updated_at)}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Author</dt>
              <dd class="mt-1 text-sm text-gray-900">${item.author || 'Unknown'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Content Preview -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Content Preview</h2>
          <div class="prose max-w-none">
            ${renderContentFields(item)}
          </div>
        </div>
      </div>
    </div>
  `
}

function renderContentFields(item: any): string {
  if (!item.data) return '<p class="text-gray-500">No content to preview</p>'

  const fields = Object.entries(item.data)
    .filter(([key, value]) => key !== 'id' && value !== null && value !== undefined)
    .map(([key, value]) => {
      if (typeof value === 'string' && value.length > 200) {
        return `
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">${formatFieldName(key)}</h3>
            <div class="prose max-w-none">
              ${value.includes('<') ? value : `<p>${value}</p>`}
            </div>
          </div>
        `
      } else if (Array.isArray(value)) {
        return `
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">${formatFieldName(key)}</h3>
            <ul class="list-disc list-inside space-y-1">
              ${value.map(item => `<li class="text-sm text-gray-900">${item}</li>`).join('')}
            </ul>
          </div>
        `
      } else if (typeof value === 'object') {
        return `
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">${formatFieldName(key)}</h3>
            <pre class="bg-gray-50 p-3 rounded text-xs text-gray-700 overflow-x-auto">${JSON.stringify(value, null, 2)}</pre>
          </div>
        `
      } else {
        return `
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">${formatFieldName(key)}</h3>
            <p class="text-sm text-gray-900">${value}</p>
          </div>
        `
      }
    })

  return fields.join('')
}

function formatFieldName(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}