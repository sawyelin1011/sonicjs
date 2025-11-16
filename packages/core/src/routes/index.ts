/**
 * Routes Module Exports
 *
 * All route handlers for CF CMS including:
 * - API routes (content, media, system)
 * - E-Commerce routes (products, orders, customers)
 * - Admin UI routes
 * - Authentication routes
 */

// API routes
export { default as apiRoutes } from './api'
export { default as apiContentCrudRoutes } from './api-content-crud'
export { default as apiMediaRoutes } from './api-media'
export { default as apiSystemRoutes } from './api-system'
export { default as apiEcommerceRoutes } from './api-ecommerce'
export { default as adminApiRoutes } from './admin-api'

// Auth routes
export { default as authRoutes } from './auth'

// Test routes (only for development/test environments)
export { default as testCleanupRoutes } from './test-cleanup'

// Admin UI routes
export { default as adminContentRoutes } from './admin-content'
export { userRoutes as adminUsersRoutes } from './admin-users'
export { adminMediaRoutes } from './admin-media'
export { adminPluginRoutes } from './admin-plugins'
export { adminLogsRoutes } from './admin-logs'
export { adminDesignRoutes } from './admin-design'
export { adminCheckboxRoutes } from './admin-checkboxes'
export { default as adminTestimonialsRoutes } from './admin-testimonials'
export { default as adminCodeExamplesRoutes } from './admin-code-examples'
export { adminDashboardRoutes } from './admin-dashboard'
export { adminCollectionsRoutes } from './admin-collections'
export { adminSettingsRoutes } from './admin-settings'

export const ROUTES_INFO = {
  message: 'CF CMS core routes available',
  available: [
    'apiRoutes',
    'apiContentCrudRoutes',
    'apiMediaRoutes',
    'apiSystemRoutes',
    'apiEcommerceRoutes',
    'adminApiRoutes',
    'authRoutes',
    'testCleanupRoutes',
    'adminContentRoutes',
    'adminUsersRoutes',
    'adminMediaRoutes',
    'adminPluginRoutes',
    'adminLogsRoutes',
    'adminDesignRoutes',
    'adminCheckboxRoutes',
    'adminTestimonialsRoutes',
    'adminCodeExamplesRoutes',
    'adminDashboardRoutes',
    'adminCollectionsRoutes',
    'adminSettingsRoutes'
  ],
  features: [
    'Full e-commerce support (products, orders, inventory)',
    'Dynamic plugin system (load/install/uninstall)',
    'Multi-store and multi-tenant',
    'Content management with versioning',
    'User and permission management',
    'Media management with R2 storage',
    'Real-time analytics and logging'
  ],
  status: 'Production-ready - CF CMS 3.0.0',
  reference: 'https://github.com/cf-cms/cf-cms',
  version: '3.0.0'
} as const
