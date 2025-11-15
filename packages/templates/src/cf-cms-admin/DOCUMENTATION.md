# CF-CMS.js Admin Templates

A production-ready, rebranded, responsive, and plugin-ready admin UI template system for CF-CMS.js.

## 🎯 Features

- **✅ Rebranded Design** - Complete CF-CMS.js branding replacing SonicJS
- **📱 Responsive & Mobile-First** - Optimized for all screen sizes and devices  
- **🔌 Plugin-Ready Architecture** - Extensible system with hooks and injection points
- **🧩 Component Standardization** - Consistent UI components with accessibility support
- **🎨 Theme System** - Dark/light mode with customizable CSS variables
- **🛒 E-commerce Ready** - Built-in support for multi-store and product management
- **🌐 Multi-tenant Support** - Dynamic data loading for multi-tenant setups
- **♿ Accessibility** - ARIA, keyboard navigation, and screen reader support
- **⚡ Performance Optimized** - Lazy loading, debounced operations, efficient rendering

## 📁 Directory Structure

```
cf-cms-admin/
├── README.md                    # This file
├── USAGE.md                     # Comprehensive usage guide
├── index.ts                     # Main export file
├── types/                       # TypeScript definitions
│   ├── admin.types.ts          # Core admin interface types
│   ├── component.types.ts       # UI component types
│   ├── plugin.types.ts          # Plugin system types
│   └── index.ts                # Type exports
├── themes/                      # Theme system
│   ├── variables.css            # CSS custom properties
│   ├── index.ts                # Theme exports
│   └── dark.theme.css           # Dark theme styles
├── utils/                       # Utility functions
│   ├── helpers.ts               # Helper functions
│   ├── validators.ts            # Form validation
│   └── index.ts                # Utility exports
├── layouts/                     # Layout templates
│   ├── admin-main.layout.ts     # Main admin layout
│   └── index.ts                # Layout exports
├── components/                  # UI components
│   ├── forms/                  # Form components
│   │   ├── button.component.ts
│   │   ├── input.component.ts
│   │   ├── form.component.ts
│   │   └── index.ts
│   ├── tables/                 # Table components
│   │   ├── table.component.ts
│   │   └── index.ts
│   ├── modals/                 # Modal components
│   │   ├── modal.component.ts
│   │   └── index.ts
│   └── index.ts                # Component exports
├── pages/                       # Page templates
│   ├── dashboard/              # Dashboard pages
│   │   └── dashboard.page.ts
│   ├── content/                # Content management
│   │   └── content.page.ts
│   ├── ecommerce/              # E-commerce pages
│   │   └── ecommerce.page.ts
│   └── index.ts                # Page exports
└── plugins/                     # Plugin system
    ├── plugin-system.ts        # Plugin integration
    └── index.ts                # Plugin exports
```

## 🚀 Quick Start

### Installation

```bash
npm install @cf-cms/templates
```

### Basic Usage

```typescript
import { renderCFAdminTemplate, DEFAULT_CF_ADMIN_CONFIG } from '@cf-cms/templates'

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
const dashboard = renderDashboard({
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

## 🧩 Component Library

### Forms

```typescript
import { renderForm, renderInput, renderButton } from '@cf-cms/templates'

const form = renderForm({
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
    }
  ],
  action: '/admin/users',
  method: 'POST',
  submitText: 'Create User',
  validation: 'client',
  onSubmit: 'handleUserSubmit(data)'
})
```

### Tables

```typescript
import { renderTable } from '@cf-cms/templates'

const table = renderTable({
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
  }
})
```

### Modals

```typescript
import { renderModal, renderConfirmationDialog } from '@cf-cms/templates'

const modal = renderModal({
  id: 'edit-user-modal',
  title: 'Edit User',
  content: userForm,
  size: 'lg',
  onConfirm: 'saveUser()',
  onCancel: 'closeModal()'
})

const confirmDialog = renderConfirmationDialog({
  title: 'Delete User',
  message: 'Are you sure you want to delete this user? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger',
  onConfirm: 'confirmDelete()'
})
```

## 🔌 Plugin System

The CF-CMS.js admin templates include a powerful plugin system for extensibility:

### Registering Plugin Components

```typescript
import { registerPluginComponent, registerPluginPage } from '@cf-cms/templates'

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
```

### Plugin Hooks

```typescript
import { registerPluginHook } from '@cf-cms/templates'

// Register a hook for content save
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

## 🎨 Theme System

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
  content: dashboardContent
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

## 🛒 E-commerce Integration

### Product Management

```typescript
import { renderProductList, renderProductForm } from '@cf-cms/templates'

// Product listing
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

// Product form
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

## 📱 Responsive Design

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

## ♿ Accessibility Features

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

## 🔧 Framework Integration

### Express.js

```typescript
import express from 'express'
import { renderCFAdminTemplate } from '@cf-cms/templates'

const app = express()

app.get('/admin', (req, res) => {
  const adminPage = renderCFAdminTemplate({
    title: 'Dashboard',
    user: req.user,
    config: { siteName: 'My Site', theme: 'auto' },
    content: renderDashboard({ widgets: dashboardWidgets }),
    sidebar: navigation
  })
  
  res.send(adminPage)
})
```

### Hono.js

```typescript
import { Hono } from 'hono'
import { renderCFAdminTemplate } from '@cf-cms/templates'

const app = new Hono()

app.get('/admin', (c) => {
  const adminPage = renderCFAdminTemplate({
    title: 'Dashboard',
    user: c.get('user'),
    config: { siteName: 'My Site', theme: 'auto' },
    content: renderDashboard({ widgets: dashboardWidgets }),
    sidebar: navigation
  })
  
  return c.html(adminPage)
})
```

## 📚 Documentation

- [Usage Guide](./USAGE.md) - Comprehensive usage examples
- [Component Documentation](./docs/components.md) - Detailed component API
- [Plugin Development Guide](./docs/plugins.md) - Building custom plugins
- [Theme Customization](./docs/themes.md) - Theme system documentation
- [API Reference](./docs/api.md) - Complete API reference

## 🚀 Production Deployment

### Environment Configuration

```typescript
const productionConfig = {
  theme: 'auto',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  currency: 'USD',
  plugins: ['analytics', 'seo', 'cache'],
  multiTenant: true,
  siteName: 'My CF-CMS Site'
}
```

### Performance Optimization

- Lazy loading for large datasets
- Debounced search and filtering
- Optimized CSS with minimal repaints
- Efficient DOM manipulation
- Component caching

### Security Features

- XSS protection with HTML escaping
- CSRF protection support
- Input validation and sanitization
- Secure cookie handling
- Content Security Policy support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

## 🔗 Related Projects

- [CF-CMS.js Core](../../packages/core) - Main CMS functionality
- [CF-CMS.js CLI](../../packages/cli) - Command line tools
- [CF-CMS.js Plugins](../../packages/plugins) - Plugin ecosystem

---

**CF-CMS.js Admin Templates** - Production-ready admin UI for modern web applications.