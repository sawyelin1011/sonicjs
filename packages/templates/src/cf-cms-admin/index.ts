/**
 * CF-CMS.js Admin Templates - Main Export
 * 
 * Production-ready, rebranded, responsive, and plugin-ready admin UI templates for CF-CMS.js
 */

// ============================================================================
// Layout Exports
// ============================================================================

export { renderCFAdminLayout } from './layouts/admin-main.layout'

// ============================================================================
// Component Exports
// ============================================================================

// Form Components
export {
  renderButton,
  renderButtonGroup
} from './components/forms/button.component'

export {
  renderInput,
  renderTextarea,
  renderSelect,
  renderCheckbox,
  renderRadioGroup
} from './components/forms/input.component'

export {
  renderForm,
  renderFormField,
  renderMultiStepForm
} from './components/forms/form.component'

// Table Components
export {
  renderTable
} from './components/tables/table.component'

// Modal Components
export {
  renderModal,
  renderConfirmationDialog,
  renderAlertDialog,
  renderSideDrawer
} from './components/modals/modal.component'

// ============================================================================
// Page Exports
// ============================================================================

// Dashboard
export {
  renderDashboard
} from './pages/dashboard/dashboard.page'

// Content Management
export {
  renderContentList,
  renderContentForm,
  renderContentPreview
} from './pages/content/content.page'

// E-commerce
export {
  renderProductList,
  renderProductForm,
  renderOrderList,
  renderCustomerList
} from './pages/ecommerce/ecommerce.page'

// ============================================================================
// Plugin System Exports
// ============================================================================

export {
  registerPluginComponent,
  registerPluginPage,
  registerPluginHook,
  registerPluginStyle,
  registerPluginScript,
  renderPluginComponents,
  renderPluginMenuItems,
  getPluginStyles,
  getPluginScripts,
  initializePlugins,
  executeHook
} from './plugins/plugin-system'

// ============================================================================
// Theme System Exports
// ============================================================================

export {
  THEME_VARIABLES,
  DARK_THEME_CSS,
  LIGHT_THEME_CSS,
  THEME_PRESETS
} from './themes'

export type { ThemeConfig, ThemeVariables } from './themes'

// ============================================================================
// Utility Exports
// ============================================================================

export {
  // String utilities
  slugify,
  capitalize,
  camelCase,
  kebabCase,
  truncate,
  escapeHtml,
  unescapeHtml,
  
  // Date utilities
  formatDate,
  timeAgo,
  isValidDate,
  
  // Number utilities
  formatNumber,
  formatCurrency,
  formatPercent,
  formatBytes,
  clamp,
  randomBetween,
  
  // Array utilities
  chunk,
  unique,
  groupBy,
  sortBy,
  flatten,
  
  // Object utilities
  deepClone,
  deepMerge,
  pick,
  omit,
  isEmpty,
  
  // Validation utilities
  isEmail,
  isUrl,
  isPhone,
  isUUID,
  isStrongPassword,
  isValidJSON,
  
  // Color utilities
  hexToRgb,
  rgbToHex,
  lightenColor,
  darkenColor,
  getContrastColor,
  
  // Storage utilities
  storageAvailable,
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  
  // URL utilities
  getQueryParams,
  setQueryParam,
  removeQueryParam,
  buildUrl,
  
  // Device utilities
  isMobile,
  isTablet,
  isDesktop,
  getBrowser,
  getOS,
  
  // Event utilities
  debounce,
  throttle,
  addEventListeners,
  removeEventListeners,
  dispatchCustomEvent,
  
  // Class utilities
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setAttributes,
  
  // Animation utilities
  animate,
  fadeIn,
  fadeOut,
  slideIn
} from './utils'

// ============================================================================
// Type Exports
// ============================================================================

// Core types
export type {
  CFAdminUser,
  CFAdminConfig,
  CFAdminLayoutData,
  MenuItem,
  BreadcrumbItem,
  NotificationItem,
  BaseComponent,
  ButtonProps,
  InputProps,
  SelectProps,
  TextareaProps,
  CheckboxProps,
  RadioGroupProps,
  FormData,
  FormField,
  ValidationRule,
  ConditionalRule,
  TableColumn,
  TableData,
  TableAction,
  PaginationData,
  SortingData,
  FilteringData,
  SelectionData,
  ModalData,
  CardData,
  ChartData,
  ChartOptions,
  DashboardData,
  WidgetData,
  StatWidgetData,
  PluginComponent,
  PluginPage,
  PluginHook,
  ThemeVariables,
  ThemeConfig,
  ResponsiveValue,
  ColorVariant,
  SizeVariant,
  Variant,
  LoadingState,
  ApiResponse
} from './types'

// Plugin types
export type {
  CFPlugin,
  PluginCategory,
  PluginDependency,
  PluginCompatibility,
  PluginPermission,
  PluginConfig,
  PluginAssets,
  PluginRegistry,
  PluginManager,
  PluginHookSystem,
  TemplatePluginIntegration,
  PluginRoute,
  PluginDevelopmentConfig,
  PluginBuildResult,
  PluginTestConfig,
  PluginDocumentation,
  PluginAPIDocumentation,
  PluginParameter,
  PluginExample,
  PluginMarketplace,
  PluginSearchQuery,
  PluginSearchResult,
  PluginSearchFacets,
  PluginRating,
  PluginStats
} from './types'

// Component types
export type {
  FormComponent,
  FormFieldComponent,
  FormFieldType,
  FormFieldOption,
  FieldValidation,
  FormValidation,
  FormStep,
  TableComponent,
  TableColumn,
  TableDataRow,
  TableAction,
  TableActionConfirm,
  TableSelection,
  TablePagination,
  TableSorting,
  TableFiltering,
  TableFilter,
  TableSearch,
  TableEmptyState,
  TableSticky,
  TableExpandable,
  ModalComponent,
  ModalHeaderComponent,
  ModalFooterComponent,
  ModalContentComponent,
  ModalAnimation,
  CardComponent,
  CardHeaderComponent,
  CardContentComponent,
  CardFooterComponent,
  CardImage,
  CardAvatar,
  NavigationComponent,
  NavigationItem,
  ChartComponent,
  ChartDataset,
  ChartPlugins,
  ChartScales,
  ChartAxis,
  ChartAxisTitle,
  ChartAxisTicks,
  ChartAxisGrid,
  ChartLegend,
  ChartLegendLabels,
  ChartTooltip,
  ChartTooltipCallbacks,
  ChartTitle,
  ChartFont,
  ChartAnimation,
  ChartInteraction,
  StatsComponent,
  StatsChange,
  ListComponent,
  ListItem
} from './types'

// ============================================================================
// Validation Exports
// ============================================================================

export {
  validationEngine,
  ValidationRuleBuilder,
  required,
  requiredIf,
  requiredUnless,
  minLength,
  maxLength,
  exactLength,
  pattern,
  email,
  url,
  phone,
  alphanumeric,
  alpha,
  numeric,
  slug,
  uuid,
  min,
  max,
  range,
  positive,
  negative,
  integer,
  decimal,
  date,
  datetime,
  minDate,
  maxDate,
  dateRange,
  futureDate,
  pastDate,
  age,
  minItems,
  maxItems,
  exactItems,
  uniqueItems,
  contains,
  excludes,
  fileType,
  fileSize,
  imageFile,
  documentFile,
  strongPassword,
  passwordStrength,
  custom,
  async,
  when,
  unless,
  allOf,
  anyOf,
  oneOf
} from './utils'

export type {
  ValidationResult,
  ValidationContext,
  ValidatorFunction,
  ValidationError,
  ValidationEngine
} from './utils'

// ============================================================================
// Main Template Export
// ============================================================================

/**
 * Render a complete CF-CMS.js admin interface
 * 
 * This is the main entry point for rendering the admin UI with all features:
 * - Responsive design with mobile-first approach
 * - Plugin-ready architecture with injection points
 * - Component standardization
 * - Theme support (light/dark/auto)
 * - Accessibility features (ARIA, keyboard navigation)
 * - Multi-tenant support
 * - E-commerce compatibility
 * 
 * @param props - Admin layout configuration
 * @returns Complete HTML string for the admin interface
 */
export function renderCFAdminTemplate(props: CFAdminLayoutData): string {
  const {
    title,
    description,
    user,
    config,
    content,
    sidebar,
    breadcrumbs,
    notifications,
    scripts = [],
    styles = [],
    metaTags = [],
    customData = {}
  } = props

  // Add plugin styles and scripts
  const pluginStyles = getPluginStyles()
  const pluginScripts = getPluginScripts()
  
  const allStyles = [...styles, pluginStyles]
  const allScripts = [...scripts, pluginScripts]

  // Initialize plugins if provided
  if (customData.plugins) {
    initializePlugins(customData.plugins)
  }

  // Render the main admin layout
  return renderCFAdminLayout({
    title,
    description,
    user,
    config: {
      ...config,
      siteName: config.siteName || 'CF-CMS.js',
      theme: config.theme || 'auto'
    },
    content: `
      <!-- Plugin injection point: content-top -->
      ${renderPluginComponents('content-top')}
      
      <!-- Main content -->
      ${content}
      
      <!-- Plugin injection point: content-bottom -->
      ${renderPluginComponents('content-bottom')}
    `,
    sidebar: `
      <!-- Plugin injection point: sidebar-top -->
      ${renderPluginComponents('sidebar-top')}
      
      <!-- Main navigation -->
      ${sidebar}
      
      <!-- Plugin menu items -->
      ${renderPluginMenuItems()}
      
      <!-- Plugin injection point: sidebar-bottom -->
      ${renderPluginComponents('sidebar-bottom')}
    `,
    breadcrumbs,
    notifications,
    scripts: allScripts,
    styles: allStyles,
    metaTags: [
      ...metaTags,
      { name: 'generator', content: 'CF-CMS.js Admin Templates' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
    ],
    customData: {
      ...customData,
      plugins: customData.plugins || []
    }
  })
}

// ============================================================================
// Version Information
// ============================================================================

export const CF_CMS_ADMIN_VERSION = '1.0.0'
export const CF_CMS_ADMIN_BUILD_DATE = new Date().toISOString()

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CF_ADMIN_CONFIG = {
  theme: 'auto',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  currency: 'USD',
  plugins: [],
  multiTenant: false
}

// ============================================================================
// Feature Flags
// ============================================================================

export const CF_ADMIN_FEATURES = {
  RESPONSIVE_DESIGN: true,
  PLUGIN_SYSTEM: true,
  THEME_SUPPORT: true,
  ACCESSIBILITY: true,
  MULTI_TENANT: true,
  E_COMMERCE: true,
  INTERNATIONALIZATION: true,
  REAL_TIME_UPDATES: true,
  OFFLINE_SUPPORT: false
}

// ============================================================================
// Quick Start Examples
// ============================================================================

/**
 * Example: Basic dashboard
 */
export function renderBasicDashboard() {
  return renderCFAdminTemplate({
    title: 'Dashboard',
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    },
    config: DEFAULT_CF_ADMIN_CONFIG,
    content: renderDashboard({
      id: 'main-dashboard',
      title: 'Dashboard',
      layout: 'grid',
      widgets: [
        {
          id: 'users-stat',
          type: 'stat',
          title: 'Total Users',
          size: 'md',
          data: {
            label: 'Total Users',
            value: 1234,
            change: { value: 12, type: 'increase', period: '30 days' },
            icon: 'users'
          }
        },
        {
          id: 'revenue-stat',
          type: 'stat',
          title: 'Revenue',
          size: 'md',
          data: {
            label: 'Revenue',
            value: 45678,
            change: { value: 8, type: 'increase', period: '30 days' },
            icon: 'revenue'
          }
        }
      ]
    }),
    sidebar: `
      <a href="#" class="flex items-center space-x-3 text-white bg-white/20 rounded-lg px-3 py-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
        <span>Dashboard</span>
      </a>
    `
  })
}

/**
 * Example: Content management page
 */
export function renderContentManagement() {
  return renderCFAdminTemplate({
    title: 'Content',
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    },
    config: DEFAULT_CF_ADMIN_CONFIG,
    content: renderContentList({
      contentType: 'pages',
      items: [],
      columns: [
        { key: 'title', label: 'Title', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'updated_at', label: 'Updated', sortable: true }
      ],
      onCreate: 'createPage()'
    }),
    sidebar: `
      <a href="#" class="flex items-center space-x-3 text-gray-300 hover:text-white rounded-lg px-3 py-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
        <span>Pages</span>
      </a>
    `
  })
}