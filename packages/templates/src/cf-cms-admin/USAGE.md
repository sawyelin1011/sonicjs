# CF-CMS.js Admin Templates - Usage Guide

This guide demonstrates how to use the CF-CMS.js admin template system to create production-ready, responsive, and plugin-ready admin interfaces.

## Quick Start

### Basic Usage

```typescript
import { renderCFAdminTemplate, DEFAULT_CF_ADMIN_CONFIG } from '@cf-cms/templates'

// Render a basic admin page
const adminPage = renderCFAdminTemplate({
  title: 'Dashboard',
  user: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  },
  config: DEFAULT_CF_ADMIN_CONFIG,
  content: '<h1>Welcome to CF-CMS.js Admin</h1>',
  sidebar: `
    <a href="/admin" class="flex items-center space-x-3 text-white bg-white/20 rounded-lg px-3 py-2">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
      </svg>
      <span>Dashboard</span>
    </a>
  `
})
```

### Using Pre-built Components

```typescript
import { 
  renderDashboard,
  renderContentList,
  renderProductList,
  renderButton,
  renderTable,
  renderModal
} from '@cf-cms/templates'

// Dashboard with widgets
const dashboardContent = renderDashboard({
  title: 'Dashboard',
  layout: 'grid',
  widgets: [
    {
      id: 'users',
      type: 'stat',
      title: 'Total Users',
      size: 'md',
      data: {
        label: 'Total Users',
        value: 1234,
        change: { value: 12, type: 'increase', period: '30 days' },
        icon: 'users'
      }
    }
  ]
})

// Content list with table
const contentList = renderContentList({
  contentType: 'pages',
  items: pages,
  columns: [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'updated_at', label: 'Updated', sortable: true }
  ],
  onCreate: 'createPage()',
  onEdit: 'editPage(id)',
  onDelete: 'deletePage(id)'
})
```

## Component Examples

### Forms

```typescript
import { renderForm, renderInput, renderButton } from '@cf-cms/templates'

const userForm = renderForm({
  title: 'Create User',
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      required: true,
      validation: [
        { type: 'required', message: 'Name is required' },
        { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
      ]
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      validation: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email' }
      ]
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      required: true,
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'editor', label: 'Editor' },
        { value: 'author', label: 'Author' }
      ]
    }
  ],
  action: '/admin/users',
  method: 'POST',
  onSubmit: 'handleUserSubmit(data)',
  onSuccess: 'showSuccessMessage()',
  onError: 'showErrors(errors)'
})
```

### Tables

```typescript
import { renderTable } from '@cf-cms/templates'

const usersTable = renderTable({
  title: 'Users',
  columns: [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      format: (value, row) => `<strong>${value}</strong>`
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'role',
      label: 'Role',
      type: 'badge',
      format: (value) => {
        const colors = {
          admin: 'bg-red-100 text-red-800',
          editor: 'bg-blue-100 text-blue-800',
          author: 'bg-green-100 text-green-800'
        }
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value]}">${value}</span>`
      }
    },
    {
      key: 'created_at',
      label: 'Created',
      type: 'date',
      sortable: true
    }
  ],
  data: users,
  actions: [
    {
      key: 'edit',
      label: 'Edit',
      icon: 'edit',
      variant: 'ghost',
      onClick: 'editUser(id)'
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'danger',
      onClick: 'deleteUser(id)'
    }
  ],
  pagination: {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10,
    onPageChange: 'loadPage(page)'
  },
  search: {
    placeholder: 'Search users...',
    debounce: 300
  },
  filtering: {
    filters: [
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { value: '', label: 'All Roles' },
          { value: 'admin', label: 'Administrator' },
          { value: 'editor', label: 'Editor' },
          { value: 'author', label: 'Author' }
        ]
      }
    ]
  }
})
```

### Modals

```typescript
import { renderModal, renderConfirmationDialog } from '@cf-cms/templates'

const editModal = renderModal({
  id: 'edit-user-modal',
  title: 'Edit User',
  content: userForm,
  size: 'lg',
  onConfirm: 'saveUser()',
  onCancel: 'closeModal()'
})

const deleteConfirm = renderConfirmationDialog({
  title: 'Delete User',
  message: 'Are you sure you want to delete this user? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger',
  onConfirm: 'confirmDelete()'
})
```

## Plugin Integration

### Registering Plugin Components

```typescript
import { 
  registerPluginComponent, 
  registerPluginPage, 
  registerPluginHook 
} from '@cf-cms/templates'

// Register a dashboard widget
registerPluginComponent({
  id: 'analytics-widget',
  name: 'Analytics Widget',
  component: `
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium mb-4">Analytics Overview</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-600">Page Views</p>
          <p class="text-2xl font-bold">12,345</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Unique Visitors</p>
          <p class="text-2xl font-bold">1,234</p>
        </div>
      </div>
    </div>
  `,
  position: 'dashboard',
  priority: 10
})

// Register a custom admin page
registerPluginPage({
  id: 'analytics',
  name: 'Analytics',
  path: '/admin/analytics',
  component: 'renderAnalyticsPage()',
  menuItem: {
    label: 'Analytics',
    icon: 'chart',
    path: '/admin/analytics'
  }
})

// Register a hook
registerPluginHook({
  name: 'content:save',
  handler: (data, context) => {
    console.log('Content saved:', data)
    // Send to analytics service
    sendToAnalytics('content_saved', data)
    return data
  },
  priority: 10
})
```

### Plugin with Custom Components

```typescript
// analytics-plugin.ts
export function initAnalyticsPlugin() {
  // Register dashboard widget
  registerPluginComponent({
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    component: renderAnalyticsWidget,
    position: 'dashboard',
    priority: 5
  })

  // Register menu item
  registerPluginComponent({
    id: 'analytics-menu',
    name: 'Analytics Menu',
    component: `
      <a href="/admin/analytics" class="flex items-center space-x-3 text-gray-300 hover:text-white rounded-lg px-3 py-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
        </svg>
        <span>Analytics</span>
      </a>
    `,
    position: 'sidebar-middle',
    priority: 10
  })

  // Register custom styles
  registerPluginStyle(`
    .analytics-widget {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  `)
}

function renderAnalyticsWidget() {
  return `
    <div class="analytics-widget rounded-lg p-6">
      <h3 class="text-lg font-medium mb-4">Analytics</h3>
      <div class="space-y-3">
        <div class="flex justify-between">
          <span>Page Views Today</span>
          <span class="font-bold">1,234</span>
        </div>
        <div class="flex justify-between">
          <span>Unique Visitors</span>
          <span class="font-bold">456</span>
        </div>
        <div class="flex justify-between">
          <span>Bounce Rate</span>
          <span class="font-bold">32.5%</span>
        </div>
      </div>
    </div>
  `
}
```

## Theme Customization

### Using Theme Variables

```typescript
import { THEME_PRESETS, ThemeConfig } from '@cf-cms/templates'

// Apply a theme preset
const adminPage = renderCFAdminTemplate({
  title: 'Dashboard',
  user: adminUser,
  config: {
    ...DEFAULT_CF_ADMIN_CONFIG,
    theme: 'dark'
  },
  content: dashboardContent,
  sidebar: navigation
})

// Custom theme configuration
const customTheme: ThemeConfig = {
  name: 'Custom Theme',
  mode: 'light',
  variables: {
    primary: '#6366f1',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    radius: '0.5rem',
    fontFamily: 'Inter, sans-serif',
    fontSize: '1rem'
  }
}
```

### CSS Custom Properties

```css
/* Override theme variables */
:root {
  --cf-cms-primary: #6366f1;
  --cf-cms-secondary: #64748b;
  --cf-cms-success: #10b981;
  --cf-cms-warning: #f59e0b;
  --cf-cms-error: #ef4444;
}

/* Dark theme overrides */
[data-theme="dark"] {
  --cf-cms-primary: #818cf8;
  --cf-cms-secondary: #94a3b8;
  --cf-cms-success: #34d399;
  --cf-cms-warning: #fbbf24;
  --cf-cms-error: #f87171;
}
```

## E-commerce Integration

### Product Management

```typescript
import { renderProductList, renderProductForm } from '@cf-cms/templates'

// Product listing page
const productsPage = renderCFAdminTemplate({
  title: 'Products',
  user: adminUser,
  config: DEFAULT_CF_ADMIN_CONFIG,
  content: renderProductList({
    products: [
      {
        id: '1',
        name: 'Premium Widget',
        category: 'Widgets',
        price: 29.99,
        stock: 100,
        status: 'active',
        image: '/products/widget.jpg'
      }
    ],
    categories: productCategories,
    onCreate: 'createProduct()',
    onEdit: 'editProduct(id)',
    onDelete: 'deleteProduct(id)'
  }),
  sidebar: ecommerceNavigation
})

// Product form page
const productForm = renderCFAdminTemplate({
  title: 'Add Product',
  user: adminUser,
  config: DEFAULT_CF_ADMIN_CONFIG,
  content: renderProductForm({
    mode: 'create',
    categories: productCategories,
    onSubmit: 'saveProduct(data)',
    onCancel: 'goBack()'
  }),
  sidebar: ecommerceNavigation
})
```

## Multi-tenant Support

```typescript
// Tenant-specific configuration
const tenantConfig = {
  ...DEFAULT_CF_ADMIN_CONFIG,
  siteName: 'Tenant A',
  multiTenant: true,
  tenantId: 'tenant-a',
  theme: 'light'
}

const tenantPage = renderCFAdminTemplate({
  title: 'Dashboard',
  user: {
    ...adminUser,
    tenantId: 'tenant-a'
  },
  config: tenantConfig,
  content: tenantDashboard,
  sidebar: tenantNavigation
})
```

## Accessibility Features

The templates include built-in accessibility features:

- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support
- Semantic HTML structure

```typescript
// Accessible form with proper labels and ARIA
const accessibleForm = renderForm({
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      ariaLabel: 'Enter your email address',
      ariaDescribedBy: 'email-help'
    }
  ]
})
```

## Responsive Design

All components are mobile-first and responsive:

```typescript
// Responsive dashboard layout
const responsiveDashboard = renderDashboard({
  title: 'Dashboard',
  layout: 'grid', // Automatically adjusts for mobile
  widgets: [
    {
      id: 'stats',
      type: 'stat',
      size: 'md', // Responsive sizing
      data: statsData
    }
  ]
})
```

## Performance Optimization

- Lazy loading for large datasets
- Debounced search and filtering
- Optimized CSS with minimal repaints
- Efficient DOM manipulation
- Component caching

```typescript
// Optimized table with virtual scrolling
const optimizedTable = renderTable({
  data: largeDataset,
  pagination: {
    itemsPerPage: 25,
    onPageChange: 'loadPage(page)'
  },
  search: {
    placeholder: 'Search...',
    debounce: 300 // Debounced search
  }
})
```

## Error Handling

Built-in error handling and validation:

```typescript
const formWithErrorHandling = renderForm({
  fields: formFields,
  validation: 'client',
  onSubmit: 'handleSubmit(data)',
  onError: 'handleErrors(errors)',
  onSuccess: 'handleSuccess()'
})
```

## Integration Examples

### Express.js Integration

```typescript
import express from 'express'
import { renderCFAdminTemplate } from '@cf-cms/templates'

const app = express()

app.get('/admin', (req, res) => {
  const adminPage = renderCFAdminTemplate({
    title: 'Dashboard',
    user: req.user,
    config: {
      siteName: 'My Site',
      theme: 'auto'
    },
    content: renderDashboard({ widgets: dashboardWidgets }),
    sidebar: navigation
  })
  
  res.send(adminPage)
})
```

### Hono.js Integration

```typescript
import { Hono } from 'hono'
import { renderCFAdminTemplate } from '@cf-cms/templates'

const app = new Hono()

app.get('/admin', (c) => {
  const adminPage = renderCFAdminTemplate({
    title: 'Dashboard',
    user: c.get('user'),
    config: {
      siteName: 'My Site',
      theme: 'auto'
    },
    content: renderDashboard({ widgets: dashboardWidgets }),
    sidebar: navigation
  })
  
  return c.html(adminPage)
})
```

## Best Practices

1. **Use semantic HTML** - Templates use proper semantic elements
2. **Follow accessibility guidelines** - All components are accessible
3. **Optimize for performance** - Use pagination and lazy loading
4. **Implement proper error handling** - Handle validation and API errors
5. **Use responsive design** - Test on all screen sizes
6. **Leverage the plugin system** - Extend functionality with plugins
7. **Customize themes properly** - Use CSS custom properties
8. **Test thoroughly** - Test all user interactions and edge cases

## Support

For additional support and examples:

- Check the component documentation
- Review the plugin development guide
- Explore the theme customization options
- Test with different data structures and edge cases