/**
 * CF-CMS.js Admin UI Type Definitions
 * 
 * Comprehensive TypeScript interfaces for the CF-CMS.js admin UI system
 */

// ============================================================================
// Core Admin Types
// ============================================================================

export interface CFAdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'author' | 'contributor'
  avatar?: string
  permissions: string[]
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CFAdminConfig {
  siteName: string
  siteUrl: string
  logo?: string
  favicon?: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
  currency: string
  plugins: string[]
  multiTenant: boolean
  tenantId?: string
}

export interface CFAdminLayoutData {
  title: string
  description?: string
  user: CFAdminUser
  config: CFAdminConfig
  content: string
  sidebar: string
  breadcrumbs?: BreadcrumbItem[]
  notifications?: NotificationItem[]
  scripts?: string[]
  styles?: string[]
  metaTags?: MetaTag[]
  customData?: Record<string, any>
}

// ============================================================================
// Navigation Types
// ============================================================================

export interface MenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  badge?: string | number
  children?: MenuItem[]
  active?: boolean
  disabled?: boolean
  permissions?: string[]
  divider?: boolean
  external?: boolean
}

export interface BreadcrumbItem {
  label: string
  path?: string
  active?: boolean
}

// ============================================================================
// Component Types
// ============================================================================

export interface BaseComponent {
  id: string
  className?: string
  style?: Record<string, string>
  dataAttributes?: Record<string, string>
  ariaLabel?: string
  testId?: string
}

export interface ButtonProps extends BaseComponent {
  label: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  onClick?: string
  type?: 'button' | 'submit' | 'reset'
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export interface InputProps extends BaseComponent {
  name: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  value?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  helper?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  autoComplete?: string
}

export interface SelectProps extends BaseComponent {
  name: string
  label?: string
  placeholder?: string
  value?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  required?: boolean
  disabled?: boolean
  error?: string
  helper?: string
  multiple?: boolean
  searchable?: boolean
}

export interface TextareaProps extends BaseComponent {
  name: string
  label?: string
  placeholder?: string
  value?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  helper?: string
  rows?: number
  maxLength?: number
  resizable?: boolean
}

export interface CheckboxProps extends BaseComponent {
  name: string
  label?: string
  checked?: boolean
  disabled?: boolean
  indeterminate?: boolean
  error?: string
  helper?: string
  required?: boolean
}

export interface RadioGroupProps extends BaseComponent {
  name: string
  label?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  value?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helper?: string
  inline?: boolean
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormField {
  name: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' |
        'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'time' |
        'datetime-local' | 'color' | 'range' | 'hidden' | 'rich-text' |
        'custom'
  label?: string
  placeholder?: string
  value?: any
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  helper?: string
  options?: Array<{ value: string; label: string; disabled?: boolean }>
  validation?: ValidationRule[]
  className?: string
  conditional?: ConditionalRule
  customComponent?: string
  customProps?: Record<string, any>
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message: string
}

export interface ConditionalRule {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than'
  value: any
  action: 'show' | 'hide' | 'enable' | 'disable'
}

export interface FormData {
  id?: string
  title?: string
  description?: string
  fields: FormField[]
  action: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  enctype?: string
  className?: string
  submitText?: string
  cancelText?: string
  showReset?: boolean
  multipart?: boolean
  validation?: 'client' | 'server' | 'both'
  onSubmit?: string
  onSuccess?: string
  onError?: string
}

// ============================================================================
// Table Types
// ============================================================================

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  minWidth?: string
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'badge' | 'custom'
  format?: (value: any, row: any) => string
  className?: string
  sticky?: boolean
}

export interface TableAction {
  key: string
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  onClick?: string
  href?: string
  target?: string
  permissions?: string[]
  condition?: (row: any) => boolean
  className?: string
}

export interface TableData {
  id: string
  columns: TableColumn[]
  data: any[]
  actions?: TableAction[]
  pagination?: PaginationData
  sorting?: SortingData
  filtering?: FilteringData
  selection?: SelectionData
  loading?: boolean
  empty?: string
  className?: string
  responsive?: boolean
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
  compact?: boolean
}

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  showFirst?: boolean
  showLast?: boolean
  showPrevNext?: boolean
  showPageNumbers?: boolean
  maxVisiblePages?: number
  className?: string
}

export interface SortingData {
  column: string
  direction: 'asc' | 'desc'
  multiSort?: boolean
}

export interface FilteringData {
  filters: FilterField[]
  activeFilters: Record<string, any>
  showClear?: boolean
  className?: string
}

export interface FilterField {
  name: string
  label: string
  type: 'text' | 'select' | 'date' | 'daterange' | 'number' | 'boolean'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
  operator?: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
}

export interface SelectionData {
  enabled: boolean
  type: 'single' | 'multiple'
  selectedItems: any[]
  onSelect?: string
  bulkActions?: TableAction[]
}

// ============================================================================
// Modal Types
// ============================================================================

export interface ModalData {
  id: string
  title: string
  content: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  backdrop?: boolean
  keyboard?: boolean
  centered?: boolean
  scrollable?: boolean
  footer?: string
  className?: string
  onOpen?: string
  onClose?: string
  onConfirm?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger' | 'warning' | 'info' | 'success'
}

// ============================================================================
// Card Types
// ============================================================================

export interface CardData {
  id: string
  title?: string
  subtitle?: string
  content: string
  image?: string
  actions?: ButtonProps[]
  footer?: string
  variant?: 'default' | 'outlined' | 'elevated' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
  className?: string
  onClick?: string
}

// ============================================================================
// Chart Types
// ============================================================================

export interface ChartData {
  id: string
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar'
  title?: string
  subtitle?: string
  data: any[]
  options?: ChartOptions
  loading?: boolean
  error?: string
  className?: string
  height?: number
  responsive?: boolean
}

export interface ChartOptions {
  legend?: boolean
  grid?: boolean
  tooltips?: boolean
  animation?: boolean
  colors?: string[]
  yAxis?: AxisOptions
  xAxis?: AxisOptions
}

export interface AxisOptions {
  title?: string
  min?: number
  max?: number
  ticks?: number
  format?: string
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardData {
  id: string
  title: string
  layout: 'grid' | 'masonry' | 'flex'
  widgets: WidgetData[]
  filters?: FilterField[]
  refreshInterval?: number
  className?: string
}

export interface WidgetData {
  id: string
  type: 'stat' | 'chart' | 'table' | 'list' | 'custom'
  title: string
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  position: { x: number; y: number; w: number; h: number }
  data: any
  loading?: boolean
  error?: string
  className?: string
  refreshInterval?: number
}

export interface StatWidgetData {
  label: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon?: string
  color?: string
  format?: string
}

// ============================================================================
// Plugin Types
// ============================================================================

export interface PluginComponent {
  id: string
  name: string
  component: string
  position: 'header' | 'sidebar' | 'content' | 'footer' | 'dashboard' | 'menu'
  priority: number
  permissions?: string[]
  props?: Record<string, any>
  conditions?: PluginCondition[]
}

export interface PluginPage {
  id: string
  name: string
  path: string
  component: string
  menuItem: MenuItem
  permissions?: string[]
  layout?: string
  middleware?: string[]
}

export interface PluginHook {
  name: string
  handler: string
  priority: number
  context?: string[]
}

export interface PluginCondition {
  field: string
  operator: string
  value: any
}

// ============================================================================
// Theme Types
// ============================================================================

export interface ThemeVariables {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  shadow: string
  radius: string
  fontFamily: string
  fontSize: string
}

export interface ThemeConfig {
  name: string
  mode: 'light' | 'dark'
  variables: ThemeVariables
  customCSS?: string
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  timestamp: Date
  read: boolean
  actions?: Array<{
    label: string
    onClick: string
    variant?: string
  }>
  autoClose?: boolean
  duration?: number
}

// ============================================================================
// Meta Types
// ============================================================================

export interface MetaTag {
  name?: string
  property?: string
  content: string
  httpEquiv?: string
  charset?: string
}

// ============================================================================
// Utility Types
// ============================================================================

export type ResponsiveValue<T> = T | {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  xxl?: T
}

export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Variant = 'default' | 'outline' | 'ghost' | 'link'

export interface LoadingState {
  loading: boolean
  error?: string
  data?: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    pagination?: PaginationData
    timestamp: Date
    version: string
  }
}