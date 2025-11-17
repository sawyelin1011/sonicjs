/**
 * CF-CMS.js Component Type Definitions
 * 
 * TypeScript interfaces for all UI components in the CF-CMS.js admin system
 */

import { BaseComponent, ButtonProps, ResponsiveValue } from './admin.types'

// ============================================================================
// Form Component Types
// ============================================================================

export interface FormComponent extends BaseComponent {
  type: 'form'
  title?: string
  description?: string
  fields: FormFieldComponent[]
  submitButton?: ButtonProps
  cancelButton?: ButtonProps
  resetButton?: ButtonProps
  validation: FormValidation
  layout: 'vertical' | 'horizontal' | 'grid'
  multiStep?: boolean
  steps?: FormStep[]
  currentStep?: number
  onSubmit: string
  onSuccess?: string
  onError?: string
}

export interface FormFieldComponent extends BaseComponent {
  name: string
  type: FormFieldType
  label?: string
  placeholder?: string
  value?: any
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  helper?: string
  validation?: FieldValidation[]
  conditional?: ConditionalRule
  options?: FormFieldOption[]
  config?: Record<string, any>
}

export type FormFieldType = 
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  | 'textarea' | 'rich-text' | 'markdown'
  | 'select' | 'multi-select' | 'checkbox' | 'radio' | 'switch'
  | 'date' | 'time' | 'datetime-local' | 'date-range'
  | 'file' | 'image' | 'avatar'
  | 'color' | 'range' | 'rating'
  | 'hidden' | 'display'
  | 'repeater' | 'group'
  | 'custom'

export interface FormFieldOption {
  value: string | number
  label: string
  disabled?: boolean
  group?: string
  icon?: string
  color?: string
  description?: string
}

export interface FieldValidation {
  type: 'required' | 'email' | 'url' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
  trigger?: 'change' | 'blur' | 'submit'
}

export interface ConditionalRule {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require'
}

export interface FormValidation {
  enabled: boolean
  mode: 'onChange' | 'onBlur' | 'onSubmit'
  revalidate: boolean
  focusError: boolean
  scrollError: boolean
}

export interface FormStep {
  id: string
  title: string
  description?: string
  fields: string[]
  validation?: boolean
  optional?: boolean
}

// ============================================================================
// Table Component Types
// ============================================================================

export interface TableComponent extends BaseComponent {
  type: 'table'
  title?: string
  description?: string
  columns: TableColumn[]
  data: TableDataRow[]
  actions?: TableAction[]
  selection?: TableSelection
  pagination?: TablePagination
  sorting?: TableSorting
  filtering?: TableFiltering
  search?: TableSearch
  loading?: boolean
  empty?: TableEmptyState
  responsive: ResponsiveValue<boolean>
  variant: 'default' | 'bordered' | 'striped' | 'compact'
  sticky?: TableSticky
  expandable?: TableExpandable
}

export interface TableColumn extends BaseComponent {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'badge' | 'link' | 'custom'
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  width?: ResponsiveValue<string>
  minWidth?: ResponsiveValue<string>
  maxWidth?: ResponsiveValue<string>
  align?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  format?: (value: any, row: TableDataRow) => string
  render?: (value: any, row: TableDataRow) => string
  sticky?: boolean
  hidden?: boolean
  className?: string
  style?: Record<string, string>
}

export interface TableDataRow {
  id: string
  data: Record<string, any>
  className?: string
  style?: Record<string, string>
  disabled?: boolean
  expanded?: boolean
  selected?: boolean
  children?: TableDataRow[]
}

export interface TableAction extends BaseComponent {
  key: string
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  onClick?: string
  href?: string
  target?: string
  download?: string
  permissions?: string[]
  condition?: (row: TableDataRow) => boolean
  disabled?: boolean | ((row: TableDataRow) => boolean)
  hidden?: boolean | ((row: TableDataRow) => boolean)
  confirm?: TableActionConfirm
  loading?: boolean
}

export interface TableActionConfirm {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger' | 'warning'
}

export interface TableSelection {
  enabled: boolean
  type: 'single' | 'multiple'
  selectedItems: string[]
  onSelect?: string
  onUnselect?: string
  onSelectAll?: string
  onUnselectAll?: string
  bulkActions?: TableAction[]
  showSelectAll?: boolean
  showSelectPage?: boolean
  persistSelection?: boolean
}

export interface TablePagination {
  enabled: boolean
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  itemsPerPageOptions: number[]
  showFirst?: boolean
  showLast?: boolean
  showPrevNext?: boolean
  showPageNumbers?: boolean
  showItemsPerPage?: boolean
  showTotalItems?: boolean
  maxVisiblePages?: number
  onPageChange?: string
  onItemsPerPageChange?: string
  className?: string
}

export interface TableSorting {
  enabled: boolean
  column: string
  direction: 'asc' | 'desc'
  multiSort?: boolean
  onSort?: string
  sortableColumns?: string[]
  defaultSort?: { column: string; direction: 'asc' | 'desc' }
}

export interface TableFiltering {
  enabled: boolean
  filters: TableFilter[]
  activeFilters: Record<string, any>
  onFilter?: string
  onClear?: string
  showClear?: boolean
  position: 'header' | 'sidebar' | 'modal'
  layout: 'inline' | 'grid' | 'accordion'
}

export interface TableFilter {
  name: string
  label: string
  type: 'text' | 'select' | 'multi-select' | 'date' | 'date-range' | 'number' | 'boolean'
  options?: FormFieldOption[]
  placeholder?: string
  operator?: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between'
  defaultValue?: any
  className?: string
}

export interface TableSearch {
  enabled: boolean
  placeholder?: string
  value?: string
  onSearch?: string
  onClear?: string
  debounce?: number
  fields?: string[]
  className?: string
}

export interface TableEmptyState {
  title?: string
  description?: string
  icon?: string
  action?: ButtonProps
  illustration?: string
  className?: string
}

export interface TableSticky {
  header?: boolean
  columns?: string[]
  offset?: number
}

export interface TableExpandable {
  enabled: boolean
  position: 'start' | 'end'
  icon?: string
  expandedIcon?: string
  onExpand?: string
  onCollapse?: string
  expandSingle?: boolean
  render?: (row: TableDataRow) => string
}

// ============================================================================
// Modal Component Types
// ============================================================================

export interface ModalComponent extends BaseComponent {
  type: 'modal'
  title: string
  content: string | ModalContentComponent
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable: boolean
  backdrop: boolean
  keyboard: boolean
  centered: boolean
  scrollable: boolean
  footer?: string | ModalFooterComponent
  header?: ModalHeaderComponent
  onOpen?: string
  onClose?: string
  onConfirm?: string
  onCancel?: string
  confirmText?: string
  cancelText?: string
  variant: 'default' | 'danger' | 'warning' | 'info' | 'success'
  persistent?: boolean
  animation?: ModalAnimation
  zIndex?: number
}

export interface ModalHeaderComponent extends BaseComponent {
  title?: string
  subtitle?: string
  closeButton?: boolean
  closeButtonVariant?: 'ghost' | 'outline'
  className?: string
}

export interface ModalFooterComponent extends BaseComponent {
  actions: ButtonProps[]
  className?: string
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export interface ModalContentComponent extends BaseComponent {
  type: 'form' | 'table' | 'text' | 'html' | 'custom'
  content: any
  padding?: ResponsiveValue<string>
  scrollable?: boolean
}

export interface ModalAnimation {
  type: 'fade' | 'slide' | 'scale' | 'bounce'
  duration: number
  easing: string
}

// ============================================================================
// Card Component Types
// ============================================================================

export interface CardComponent extends BaseComponent {
  type: 'card'
  title?: string
  subtitle?: string
  content: string | CardContentComponent
  image?: CardImage
  actions?: ButtonProps[]
  footer?: string | CardFooterComponent
  header?: CardHeaderComponent
  variant: 'default' | 'outlined' | 'elevated' | 'filled'
  size: 'sm' | 'md' | 'lg'
  hoverable: boolean
  clickable: boolean
  loading: boolean
  onClick?: string
  aspectRatio?: string
  cover?: boolean
}

export interface CardHeaderComponent extends BaseComponent {
  title?: string
  subtitle?: string
  avatar?: CardAvatar
  actions?: ButtonProps[]
  divider?: boolean
  padding?: ResponsiveValue<string>
}

export interface CardContentComponent extends BaseComponent {
  type: 'text' | 'html' | 'form' | 'table' | 'list' | 'stats' | 'custom'
  content: any
  padding?: ResponsiveValue<string>
}

export interface CardFooterComponent extends BaseComponent {
  content: string
  actions?: ButtonProps[]
  divider?: boolean
  padding?: ResponsiveValue<string>
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export interface CardImage {
  src: string
  alt?: string
  width?: string
  height?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
  position?: 'top' | 'center' | 'bottom'
}

export interface CardAvatar {
  src?: string
  alt?: string
  initials?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square' | 'rounded'
  color?: string
}

// ============================================================================
// Navigation Component Types
// ============================================================================

export interface NavigationComponent extends BaseComponent {
  type: 'navigation'
  variant: 'horizontal' | 'vertical' | 'sidebar' | 'breadcrumb' | 'tabs' | 'pills'
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'pills' | 'underline' | 'segmented'
  collapsible?: boolean
  collapsed?: boolean
  onToggle?: string
  className?: string
}

export interface NavigationItem extends BaseComponent {
  id: string
  label: string
  icon?: string
  badge?: string | number
  active?: boolean
  disabled?: boolean
  href?: string
  target?: string
  children?: NavigationItem[]
  divider?: boolean
  external?: boolean
  permissions?: string[]
  onClick?: string
}

// ============================================================================
// Chart Component Types
// ============================================================================

export interface ChartComponent extends BaseComponent {
  type: 'chart'
  chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar' | 'gauge' | 'funnel'
  title?: string
  subtitle?: string
  data: ChartData
  options?: ChartOptions
  loading?: boolean
  error?: string
  height?: ResponsiveValue<string>
  responsive?: boolean
  theme?: 'light' | 'dark' | 'auto'
  library?: 'chartjs' | 'd3' | 'apexcharts' | 'echarts'
  onDataPointClick?: string
  onDataPointHover?: string
  onLegendClick?: string
}

export interface ChartData {
  labels?: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
  type?: string
  yAxisID?: string
}

export interface ChartOptions {
  responsive?: boolean
  maintainAspectRatio?: boolean
  plugins?: ChartPlugins
  scales?: ChartScales
  legend?: ChartLegend
  tooltip?: ChartTooltip
  animation?: ChartAnimation
  interaction?: ChartInteraction
}

export interface ChartPlugins {
  legend?: boolean | ChartLegend
  title?: boolean | ChartTitle
  tooltip?: boolean | ChartTooltip
}

export interface ChartScales {
  x?: ChartAxis
  y?: ChartAxis
  y1?: ChartAxis
}

export interface ChartAxis {
  display?: boolean
  title?: ChartAxisTitle
  min?: number
  max?: number
  ticks?: ChartAxisTicks
  grid?: ChartAxisGrid
  type?: 'linear' | 'logarithmic' | 'category' | 'timeseries'
}

export interface ChartAxisTitle {
  display?: boolean
  text?: string
  color?: string
  font?: ChartFont
}

export interface ChartAxisTicks {
  display?: boolean
  color?: string
  font?: ChartFont
  maxTicksLimit?: number
  stepSize?: number
  callback?: string
}

export interface ChartAxisGrid {
  display?: boolean
  color?: string
  borderColor?: string
  drawBorder?: boolean
}

export interface ChartLegend {
  display?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right'
  labels?: ChartLegendLabels
}

export interface ChartLegendLabels {
  color?: string
  font?: ChartFont
  padding?: number
  usePointStyle?: boolean
  boxWidth?: number
}

export interface ChartTooltip {
  enabled?: boolean
  backgroundColor?: string
  titleColor?: string
  bodyColor?: string
  borderColor?: string
  borderWidth?: number
  cornerRadius?: number
  displayColors?: boolean
  intersect?: boolean
  mode?: 'index' | 'dataset' | 'point' | 'nearest'
  callbacks?: ChartTooltipCallbacks
}

export interface ChartTooltipCallbacks {
  label?: string
  title?: string
  afterLabel?: string
  beforeLabel?: string
}

export interface ChartTitle {
  display?: boolean
  text?: string
  color?: string
  font?: ChartFont
  padding?: number
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export interface ChartFont {
  family?: string
  size?: number
  weight?: string
  style?: string
}

export interface ChartAnimation {
  duration?: number
  easing?: string
  delay?: number
  onComplete?: string
}

export interface ChartInteraction {
  intersect?: boolean
  mode?: 'index' | 'dataset' | 'point' | 'nearest'
  axis?: 'x' | 'y' | 'xy'
}

// ============================================================================
// Stats Component Types
// ============================================================================

export interface StatsComponent extends BaseComponent {
  type: 'stats'
  title: string
  value: string | number
  change?: StatsChange
  icon?: string
  color?: string
  format?: string
  prefix?: string
  suffix?: string
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
  error?: string
  size?: 'sm' | 'md' | 'lg'
  layout?: 'horizontal' | 'vertical'
  onClick?: string
}

export interface StatsChange {
  value: number
  type: 'increase' | 'decrease'
  period: string
  showArrow?: boolean
  color?: string
}

// ============================================================================
// List Component Types
// ============================================================================

export interface ListComponent extends BaseComponent {
  type: 'list'
  items: ListItem[]
  variant?: 'default' | 'bordered' | 'striped'
  size?: 'sm' | 'md' | 'lg'
  ordered?: boolean
  hoverable?: boolean
  selectable?: boolean
  multiselectable?: boolean
  selectedItems?: string[]
  onItemClick?: string
  loading?: boolean
  empty?: string
  pagination?: TablePagination
  search?: TableSearch
  filtering?: TableFiltering
}

export interface ListItem extends BaseComponent {
  id: string
  title: string
  subtitle?: string
  description?: string
  image?: string
  icon?: string
  badge?: string | number
  actions?: ButtonProps[]
  disabled?: boolean
  selected?: boolean
  metadata?: Record<string, any>
  divider?: boolean
  onClick?: string
}