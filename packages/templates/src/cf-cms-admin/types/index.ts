/**
 * CF-CMS.js Type System Index
 * 
 * Central export point for all type definitions
 */

// Core admin types
export * from './admin.types'

// Plugin system types
export * from './plugin.types'

// Component types
export * from './component.types'

// Re-export commonly used types for convenience
export type {
  // Core types
  CFAdminUser,
  CFAdminConfig,
  CFAdminLayoutData,
  MenuItem,
  BreadcrumbItem,
  NotificationItem,
  
  // Component types
  BaseComponent,
  ButtonProps,
  InputProps,
  SelectProps,
  TextareaProps,
  CheckboxProps,
  RadioGroupProps,
  
  // Form types
  FormField,
  FormData,
  ValidationRule,
  ConditionalRule,
  
  // Table types
  TableColumn,
  TableData,
  TableAction,
  PaginationData,
  SortingData,
  FilteringData,
  SelectionData,
  
  // Modal types
  ModalData,
  
  // Card types
  CardData,
  
  // Chart types
  ChartData,
  ChartOptions,
  
  // Dashboard types
  DashboardData,
  WidgetData,
  StatWidgetData,
  
  // Plugin types
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
  
  // Theme types
  ThemeVariables,
  ThemeConfig,
  
  // Utility types
  ResponsiveValue,
  ColorVariant,
  SizeVariant,
  Variant,
  LoadingState,
  ApiResponse
} from './admin.types'

export type {
  // Plugin specific types
  PluginComponent,
  PluginPage,
  PluginHook,
  PluginCondition,
  PluginRegistryConfig,
  PluginLoader,
  PluginValidator,
  PluginInstaller,
  PluginInstallOptions,
  PluginUninstallOptions,
  PluginInstallResult,
  PluginUpdateResult,
  PluginValidationResult,
  PluginValidationError,
  PluginValidationWarning,
  HookContext,
  HookExecution,
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
} from './plugin.types'

export type {
  // Component specific types
  FormComponent,
  FormFieldComponent,
  FormFieldType,
  FormFieldOption,
  FieldValidation,
  FormValidation,
  FormStep,
  
  // Table component types
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
  
  // Modal component types
  ModalComponent,
  ModalHeaderComponent,
  ModalFooterComponent,
  ModalContentComponent,
  ModalAnimation,
  
  // Card component types
  CardComponent,
  CardHeaderComponent,
  CardContentComponent,
  CardFooterComponent,
  CardImage,
  CardAvatar,
  
  // Navigation component types
  NavigationComponent,
  NavigationItem,
  
  // Chart component types
  ChartComponent,
  ChartData,
  ChartDataset,
  ChartOptions,
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
  
  // Stats component types
  StatsComponent,
  StatsChange,
  
  // List component types
  ListComponent,
  ListItem
} from './component.types'