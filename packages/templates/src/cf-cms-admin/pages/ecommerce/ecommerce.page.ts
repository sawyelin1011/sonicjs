/**
 * CF-CMS.js E-commerce Pages
 * 
 * Product management, orders, customers, and store settings
 */

import { renderTable } from '../../components/tables/table.component'
import { renderButton } from '../../components/forms/button.component'
import { renderForm } from '../../components/forms/form.component'

export function renderProductList(props: {
  products: any[]
  categories: any[]
  pagination?: any
  filters?: any
  onCreate?: string
  onEdit?: string
  onDelete?: string
}): string {
  const { products, categories, pagination, filters, onCreate, onEdit, onDelete } = props

  const columns = [
    {
      key: 'image',
      label: 'Image',
      type: 'image' as const,
      width: '80px'
    },
    {
      key: 'name',
      label: 'Product',
      sortable: true
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number' as const,
      sortable: true,
      format: (value: any) => `$${Number(value).toFixed(2)}`
    },
    {
      key: 'stock',
      label: 'Stock',
      type: 'number' as const,
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge' as const,
      format: (value: any) => {
        const colors = {
          active: 'bg-green-100 text-green-800',
          draft: 'bg-gray-100 text-gray-800',
          archived: 'bg-red-100 text-red-800'
        }
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value] || colors.draft}">${value}</span>`
      }
    }
  ]

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
    <div class="cf-cms-product-list">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Products</h1>
            <p class="mt-1 text-sm text-gray-600">Manage your product catalog and inventory</p>
          </div>
          <div class="flex items-center space-x-3">
            ${renderButton({
              label: 'Import',
              variant: 'outline',
              icon: 'upload'
            })}
            ${renderButton({
              label: 'Export',
              variant: 'outline',
              icon: 'download'
            })}
            ${onCreate ? renderButton({
              label: 'Add Product',
              icon: 'plus',
              variant: 'primary',
              onClick: onCreate
            }) : ''}
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        ${renderProductStats(products)}
      </div>

      <!-- Products Table -->
      ${renderTable({
        title: `${products.length} Products`,
        columns,
        data: products.map(product => ({
          id: product.id,
          data: product
        })),
        actions: tableActions,
        pagination,
        filtering: filters,
        search: {
          placeholder: 'Search products...',
          debounce: 300
        },
        empty: 'No products found. Add your first product to get started.'
      })}
    </div>
  `
}

export function renderProductForm(props: {
  mode: 'create' | 'edit'
  product?: any
  categories: any[]
  onSubmit: string
  onCancel: string
}): string {
  const { mode, product, categories, onSubmit, onCancel } = props

  const fields = [
    {
      name: 'name',
      type: 'text' as const,
      label: 'Product Name',
      required: true,
      value: product?.name || ''
    },
    {
      name: 'description',
      type: 'textarea' as const,
      label: 'Description',
      required: true,
      value: product?.description || '',
      customProps: { rows: 4 }
    },
    {
      name: 'category_id',
      type: 'select' as const,
      label: 'Category',
      required: true,
      value: product?.category_id || '',
      options: [
        { value: '', label: 'Select a category' },
        ...categories.map(cat => ({ value: cat.id, label: cat.name }))
      ]
    },
    {
      name: 'price',
      type: 'number' as const,
      label: 'Price',
      required: true,
      value: product?.price || '',
      customProps: { step: '0.01', min: '0' }
    },
    {
      name: 'compare_price',
      type: 'number' as const,
      label: 'Compare Price',
      value: product?.compare_price || '',
      customProps: { step: '0.01', min: '0' }
    },
    {
      name: 'sku',
      type: 'text' as const,
      label: 'SKU',
      required: true,
      value: product?.sku || ''
    },
    {
      name: 'stock',
      type: 'number' as const,
      label: 'Stock Quantity',
      required: true,
      value: product?.stock || '0',
      customProps: { min: '0' }
    },
    {
      name: 'track_quantity',
      type: 'checkbox' as const,
      label: 'Track quantity',
      value: product?.track_quantity !== false
    },
    {
      name: 'status',
      type: 'select' as const,
      label: 'Status',
      required: true,
      value: product?.status || 'draft',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' }
      ]
    }
  ]

  const title = mode === 'create' ? 'Add New Product' : 'Edit Product'
  const submitText = mode === 'create' ? 'Create Product' : 'Update Product'

  return `
    <div class="cf-cms-product-form">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">${title}</h1>
            <p class="mt-1 text-sm text-gray-600">
              ${mode === 'create' ? 'Add a new product to your catalog.' : 'Update product information.'}
            </p>
          </div>
          ${renderButton({
            label: 'Cancel',
            variant: 'outline',
            onClick: onCancel
          })}
        </div>
      </div>

      <!-- Product Form -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Form -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              ${renderForm({
                fields,
                action: '#',
                method: 'POST',
                submitText,
                validation: 'client',
                onSubmit
              })}
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Product Images -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
              <div class="space-y-4">
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <!-- SEO Settings -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input type="text" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea rows="3" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

export function renderOrderList(props: {
  orders: any[]
  pagination?: any
  filters?: any
  onView?: string
  onRefund?: string
}): string {
  const { orders, pagination, filters, onView, onRefund } = props

  const columns = [
    {
      key: 'order_number',
      label: 'Order #',
      sortable: true
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date' as const,
      sortable: true
    },
    {
      key: 'total',
      label: 'Total',
      type: 'number' as const,
      sortable: true,
      format: (value: any) => `$${Number(value).toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge' as const,
      format: (value: any) => {
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          processing: 'bg-blue-100 text-blue-800',
          shipped: 'bg-purple-100 text-purple-800',
          delivered: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
          refunded: 'bg-gray-100 text-gray-800'
        }
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value] || colors.pending}">${value}</span>`
      }
    }
  ]

  const tableActions = [
    ...(onView ? [{
      key: 'view',
      label: 'View',
      icon: 'eye',
      variant: 'ghost' as const,
      onClick: onView
    }] : []),
    ...(onRefund ? [{
      key: 'refund',
      label: 'Refund',
      icon: 'refresh',
      variant: 'outline' as const,
      onClick: onRefund
    }] : [])
  ]

  return `
    <div class="cf-cms-order-list">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
            <p class="mt-1 text-sm text-gray-600">Manage customer orders and fulfillments</p>
          </div>
          <div class="flex items-center space-x-3">
            ${renderButton({
              label: 'Export Orders',
              variant: 'outline',
              icon: 'download'
            })}
          </div>
        </div>
      </div>

      <!-- Order Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        ${renderOrderStats(orders)}
      </div>

      <!-- Orders Table -->
      ${renderTable({
        title: `${orders.length} Orders`,
        columns,
        data: orders.map(order => ({
          id: order.id,
          data: order
        })),
        actions: tableActions,
        pagination,
        filtering: filters,
        search: {
          placeholder: 'Search orders...',
          debounce: 300
        },
        empty: 'No orders found.'
      })}
    </div>
  `
}

export function renderCustomerList(props: {
  customers: any[]
  pagination?: any
  filters?: any
  onView?: string
  onEdit?: string
}): string {
  const { customers, pagination, filters, onView, onEdit } = props

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'orders_count',
      label: 'Orders',
      type: 'number' as const,
      sortable: true
    },
    {
      key: 'total_spent',
      label: 'Total Spent',
      type: 'number' as const,
      sortable: true,
      format: (value: any) => `$${Number(value).toFixed(2)}`
    },
    {
      key: 'last_order',
      label: 'Last Order',
      type: 'date' as const,
      sortable: true
    }
  ]

  const tableActions = [
    ...(onView ? [{
      key: 'view',
      label: 'View',
      icon: 'eye',
      variant: 'ghost' as const,
      onClick: onView
    }] : []),
    ...(onEdit ? [{
      key: 'edit',
      label: 'Edit',
      icon: 'edit',
      variant: 'ghost' as const,
      onClick: onEdit
    }] : [])
  ]

  return `
    <div class="cf-cms-customer-list">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Customers</h1>
            <p class="mt-1 text-sm text-gray-600">Manage your customer database and relationships</p>
          </div>
          <div class="flex items-center space-x-3">
            ${renderButton({
              label: 'Export Customers',
              variant: 'outline',
              icon: 'download'
            })}
          </div>
        </div>
      </div>

      <!-- Customer Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        ${renderCustomerStats(customers)}
      </div>

      <!-- Customers Table -->
      ${renderTable({
        title: `${customers.length} Customers`,
        columns,
        data: customers.map(customer => ({
          id: customer.id,
          data: customer
        })),
        actions: tableActions,
        pagination,
        filtering: filters,
        search: {
          placeholder: 'Search customers...',
          debounce: 300
        },
        empty: 'No customers found.'
      })}
    </div>
  `
}

function renderProductStats(products: any[]): string {
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.status === 'active').length
  const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length
  const outOfStock = products.filter(p => p.stock === 0).length

  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-blue-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Total Products</dt>
            <dd class="text-lg font-medium text-gray-900">${totalProducts}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-green-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Active</dt>
            <dd class="text-lg font-medium text-gray-900">${activeProducts}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-yellow-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Low Stock</dt>
            <dd class="text-lg font-medium text-gray-900">${lowStock}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-red-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
            <dd class="text-lg font-medium text-gray-900">${outOfStock}</dd>
          </dl>
        </div>
      </div>
    </div>
  `
}

function renderOrderStats(orders: any[]): string {
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-blue-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
            <dd class="text-lg font-medium text-gray-900">${totalOrders}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-yellow-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Pending</dt>
            <dd class="text-lg font-medium text-gray-900">${pendingOrders}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-green-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Revenue</dt>
            <dd class="text-lg font-medium text-gray-900">$${totalRevenue.toFixed(2)}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-purple-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Avg Order Value</dt>
            <dd class="text-lg font-medium text-gray-900">$${avgOrderValue.toFixed(2)}</dd>
          </dl>
        </div>
      </div>
    </div>
  `
}

function renderCustomerStats(customers: any[]): string {
  const totalCustomers = customers.length
  const newCustomers = customers.filter(c => {
    const createdAt = new Date(c.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return createdAt > thirtyDaysAgo
  }).length
  const totalSpent = customers.reduce((sum, customer) => sum + Number(customer.total_spent), 0)
  const avgCustomerValue = totalCustomers > 0 ? totalSpent / totalCustomers : 0

  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-blue-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
            <dd class="text-lg font-medium text-gray-900">${totalCustomers}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-green-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">New (30 days)</dt>
            <dd class="text-lg font-medium text-gray-900">${newCustomers}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-purple-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
            <dd class="text-lg font-medium text-gray-900">$${totalSpent.toFixed(2)}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border-sm border-gray-200 p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 bg-yellow-500 rounded-lg p-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">Avg Customer Value</dt>
            <dd class="text-lg font-medium text-gray-900">$${avgCustomerValue.toFixed(2)}</dd>
          </dl>
        </div>
      </div>
    </div>
  `
}