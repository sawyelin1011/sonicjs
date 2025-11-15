# CF-CMS.js Admin UI Templates

A production-ready, responsive, and plugin-ready admin UI template system for CF-CMS.js.

## Features

- **Rebranded Design**: Complete CF-CMS.js branding with modern aesthetics
- **Responsive & Mobile-First**: Optimized for all screen sizes and devices
- **Plugin-Ready Architecture**: Extensible system with hooks and injection points
- **Component Standardization**: Consistent UI components with accessibility support
- **Dynamic Data Loading**: Multi-tenant support with real-time data fetching
- **Theme System**: Dark/light mode with customizable CSS variables
- **E-commerce Ready**: Built-in support for multi-store and product management

## Directory Structure

```
templates/
├── cf-cms-admin.template.ts         # Main admin layout template
├── components/                       # Reusable UI components
│   ├── forms/                        # Form components
│   ├── tables/                       # Table components
│   ├── modals/                       # Modal components
│   ├── cards/                        # Card components
│   ├── charts/                       # Chart components
│   ├── navigation/                   # Navigation components
│   └── index.ts                      # Component exports
├── pages/                           # Admin page templates
│   ├── dashboard/                    # Dashboard pages
│   ├── content/                      # Content management
│   ├── users/                        # User management
│   ├── settings/                     # Settings pages
│   ├── ecommerce/                    # E-commerce pages
│   └── index.ts                      # Page exports
├── layouts/                         # Layout templates
│   ├── admin-main.layout.ts         # Main admin layout
│   ├── auth.layout.ts               # Authentication layout
│   └── index.ts                      # Layout exports
├── plugins/                         # Plugin integration
│   ├── plugin-hooks.ts              # Plugin hook system
│   ├── plugin-injection.ts          # Component injection
│   └── index.ts                      # Plugin exports
├── themes/                          # Theme system
│   ├── variables.css                # CSS custom properties
│   ├── dark.theme.css               # Dark theme
│   ├── light.theme.css              # Light theme
│   └── index.ts                      # Theme exports
├── types/                           # TypeScript definitions
│   ├── admin.types.ts               # Admin interface types
│   ├── component.types.ts           # Component types
│   ├── plugin.types.ts              # Plugin types
│   └── index.ts                      # Type exports
├── utils/                           # Utility functions
│   ├── helpers.ts                   # Helper functions
│   ├── validators.ts                # Form validators
│   └── index.ts                      # Utility exports
└── index.ts                         # Main export file
```

## Quick Start

```typescript
import { renderCFAdminLayout, renderDashboard } from '@cf-cms/templates'

// Render main admin layout
const adminPage = renderCFAdminLayout({
  title: 'Dashboard - CF-CMS.js',
  user: { name: 'Admin User', email: 'admin@example.com' },
  content: renderDashboard({
    stats: { users: 1234, revenue: 45678 },
    recentActivity: [...]
  }),
  sidebar: 'dashboard'
})
```

## Plugin Integration

```typescript
// Register plugin components
import { registerPluginComponent, registerPluginPage } from '@cf-cms/templates/plugins'

// Add custom dashboard widget
registerPluginComponent('dashboard-widget', {
  component: 'custom-analytics-widget',
  position: 'sidebar',
  priority: 10
})

// Add custom admin page
registerPluginPage('analytics', {
  path: '/admin/analytics',
  component: 'analytics-page',
  menuItem: { label: 'Analytics', icon: 'chart-bar' }
})
```

## Theme Customization

```css
/* Override theme variables */
:root {
  --cf-cms-primary: #3b82f6;
  --cf-cms-secondary: #64748b;
  --cf-cms-success: #10b981;
  --cf-cms-warning: #f59e0b;
  --cf-cms-error: #ef4444;
  --cf-cms-background: #ffffff;
  --cf-cms-surface: #f8fafc;
}
```

## Component Usage

### Forms
```typescript
import { renderForm, renderFormField } from '@cf-cms/templates/components/forms'

const form = renderForm({
  fields: [
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'password', type: 'password', label: 'Password', required: true }
  ],
  action: '/login',
  method: 'POST'
})
```

### Tables
```typescript
import { renderTable } from '@cf-cms/templates/components/tables'

const table = renderTable({
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' }
  ],
  data: users,
  actions: ['edit', 'delete']
})
```

## Documentation

- [Component Documentation](./docs/components.md)
- [Plugin Development Guide](./docs/plugins.md)
- [Theme Customization](./docs/themes.md)
- [API Reference](./docs/api.md)

## License

MIT License - see LICENSE file for details.