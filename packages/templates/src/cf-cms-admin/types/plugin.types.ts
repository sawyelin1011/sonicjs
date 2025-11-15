/**
 * CF-CMS.js Plugin System Types
 * 
 * Type definitions for the plugin architecture and extensibility system
 */

import { PluginComponent, PluginPage, PluginHook } from './admin.types'

// ============================================================================
// Plugin Core Types
// ============================================================================

export interface CFPlugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  homepage?: string
  repository?: string
  license: string
  keywords: string[]
  category: PluginCategory
  tags: string[]
  dependencies: PluginDependency[]
  compatibility: PluginCompatibility
  permissions: PluginPermission[]
  config?: PluginConfig
  assets?: PluginAssets
  hooks?: PluginHook[]
  components?: PluginComponent[]
  pages?: PluginPage[]
  middleware?: string[]
  migrations?: PluginMigration[]
  enabled: boolean
  installed: boolean
  installedAt?: Date
  updatedAt?: Date
}

export type PluginCategory = 
  | 'content'
  | 'ecommerce'
  | 'analytics'
  | 'seo'
  | 'security'
  | 'media'
  | 'forms'
  | 'social'
  | 'email'
  | 'cache'
  | 'search'
  | 'theme'
  | 'utility'
  | 'integration'
  | 'development'

export interface PluginDependency {
  name: string
  version: string
  optional: boolean
  reason?: string
}

export interface PluginCompatibility {
  core: string
  node: string
  browsers?: string[]
  database?: string[]
}

export interface PluginPermission {
  name: string
  description: string
  category: 'admin' | 'content' | 'user' | 'system' | 'api'
  dangerous: boolean
}

export interface PluginConfig {
  schema: PluginConfigSchema
  defaults: Record<string, any>
  current?: Record<string, any>
  environment?: Record<string, any>
}

export interface PluginConfigSchema {
  type: 'object'
  properties: Record<string, PluginConfigProperty>
  required?: string[]
  additionalProperties?: boolean
}

export interface PluginConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  title: string
  description?: string
  default?: any
  enum?: any[]
  minimum?: number
  maximum?: number
  pattern?: string
  format?: string
  items?: PluginConfigProperty
  properties?: Record<string, PluginConfigProperty>
  required?: string[]
  group?: string
  order?: number
  conditional?: PluginConfigConditional
}

export interface PluginConfigConditional {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
  action: 'show' | 'hide' | 'enable' | 'disable'
}

export interface PluginAssets {
  css?: string[]
  js?: string[]
  images?: string[]
  fonts?: string[]
  icons?: string[]
}

export interface PluginMigration {
  version: string
  description: string
  up: string | string[]
  down: string | string[]
  dependencies?: string[]
}

// ============================================================================
// Plugin Registry Types
// ============================================================================

export interface PluginRegistry {
  plugins: Map<string, CFPlugin>
  enabled: Set<string>
  hooks: Map<string, PluginHook[]>
  components: Map<string, PluginComponent[]>
  pages: Map<string, PluginPage[]>
  loadOrder: string[]
  dependencies: Map<string, string[]>
}

export interface PluginRegistryConfig {
  autoLoad: boolean
  hotReload: boolean
  devMode: boolean
  maxPlugins: number
  allowedCategories: PluginCategory[]
  blockedPlugins: string[]
}

// ============================================================================
// Plugin Manager Types
// ============================================================================

export interface PluginManager {
  registry: PluginRegistry
  config: PluginRegistryConfig
  loader: PluginLoader
  validator: PluginValidator
  installer: PluginInstaller
  hooks: PluginHookSystem
}

export interface PluginLoader {
  loadPlugin(pluginPath: string): Promise<CFPlugin>
  unloadPlugin(pluginId: string): Promise<void>
  reloadPlugin(pluginId: string): Promise<void>
  validatePlugin(plugin: CFPlugin): Promise<PluginValidationResult>
}

export interface PluginValidator {
  validateManifest(manifest: any): PluginValidationResult
  validateDependencies(plugin: CFPlugin): PluginValidationResult
  validateCompatibility(plugin: CFPlugin): PluginValidationResult
  validatePermissions(plugin: CFPlugin): PluginValidationResult
}

export interface PluginInstaller {
  install(source: string, options?: PluginInstallOptions): Promise<PluginInstallResult>
  uninstall(pluginId: string, options?: PluginUninstallOptions): Promise<void>
  update(pluginId: string, version?: string): Promise<PluginUpdateResult>
  enable(pluginId: string): Promise<void>
  disable(pluginId: string): Promise<void>
}

export interface PluginInstallOptions {
  force?: boolean
  skipDeps?: boolean
  autoEnable?: boolean
  config?: Record<string, any>
}

export interface PluginUninstallOptions {
  keepData?: boolean
  force?: boolean
}

export interface PluginInstallResult {
  success: boolean
  plugin?: CFPlugin
  error?: string
  warnings?: string[]
  dependencies?: PluginDependency[]
}

export interface PluginUpdateResult {
  success: boolean
  oldVersion?: string
  newVersion?: string
  error?: string
  warnings?: string[]
}

export interface PluginValidationResult {
  valid: boolean
  errors: PluginValidationError[]
  warnings: PluginValidationWarning[]
}

export interface PluginValidationError {
  field: string
  message: string
  code: string
  severity: 'error'
}

export interface PluginValidationWarning {
  field: string
  message: string
  code: string
  severity: 'warning'
}

// ============================================================================
// Plugin Hook System Types
// ============================================================================

export interface PluginHookSystem {
  register(hook: PluginHook): void
  unregister(hookId: string): void
  execute(hookName: string, data: any, context?: HookContext): Promise<any>
  hasHooks(hookName: string): boolean
  getHooks(hookName: string): PluginHook[]
  clear(hookName?: string): void
}

export interface HookContext {
  plugin?: string
  user?: any
  request?: any
  response?: any
  config?: any
  logger?: any
  timestamp: Date
}

export interface HookExecution {
  hookName: string
  data: any
  result: any
  duration: number
  errors: Error[]
  warnings: string[]
}

// ============================================================================
// Plugin Template Integration Types
// ============================================================================

export interface TemplatePluginIntegration {
  registerComponent(component: PluginComponent): void
  registerPage(page: PluginPage): void
  registerHook(hook: PluginHook): void
  injectComponent(position: string, component: string): void
  injectStyle(css: string): void
  injectScript(js: string): void
  injectMenuItem(item: MenuItem): void
  injectRoute(route: PluginRoute): void
}

export interface PluginRoute {
  path: string
  component: string
  method?: string[]
  middleware?: string[]
  permissions?: string[]
}

export interface MenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  badge?: string | number
  children?: MenuItem[]
  order?: number
  permissions?: string[]
  divider?: boolean
  external?: boolean
}

// ============================================================================
// Plugin Development Types
// ============================================================================

export interface PluginDevelopmentConfig {
  watchMode: boolean
  hotReload: boolean
  sourceMaps: boolean
  minify: boolean
  target: 'es6' | 'es2018' | 'es2020' | 'esnext'
  module: 'commonjs' | 'esm' | 'umd'
  outputDir: string
  publicDir: string
  devServer?: {
    port: number
    host: string
    https: boolean
  }
}

export interface PluginBuildResult {
  success: boolean
  output: string
  assets: PluginAssets
  size: number
  duration: number
  warnings?: string[]
  errors?: string[]
}

export interface PluginTestConfig {
  framework: 'jest' | 'vitest' | 'mocha'
  coverage: boolean
  coverageThreshold: number
  testMatch: string[]
  setupFiles: string[]
}

export interface PluginDocumentation {
  readme: string
  api: PluginAPIDocumentation[]
  examples: PluginExample[]
  changelog: string
  contributing: string
}

export interface PluginAPIDocumentation {
  name: string
  description: string
  type: 'function' | 'class' | 'interface' | 'enum'
  signature: string
  parameters?: PluginParameter[]
  returns?: PluginParameter
  examples: string[]
  tags: string[]
}

export interface PluginParameter {
  name: string
  type: string
  description: string
  required?: boolean
  default?: any
}

export interface PluginExample {
  title: string
  description: string
  code: string
  language: string
  tags: string[]
}

// ============================================================================
// Plugin Marketplace Types
// ============================================================================

export interface PluginMarketplace {
  search(query: PluginSearchQuery): Promise<PluginSearchResult>
  getPlugin(pluginId: string): Promise<CFPlugin>
  downloadPlugin(pluginId: string, version?: string): Promise<Buffer>
  ratePlugin(pluginId: string, rating: number, review?: string): Promise<void>
  reportPlugin(pluginId: string, reason: string): Promise<void>
}

export interface PluginSearchQuery {
  query?: string
  category?: PluginCategory
  tags?: string[]
  author?: string
  license?: string
  minRating?: number
  verified?: boolean
  limit?: number
  offset?: number
  sort?: 'relevance' | 'popularity' | 'rating' | 'updated' | 'created'
}

export interface PluginSearchResult {
  plugins: CFPlugin[]
  total: number
  facets: PluginSearchFacets[]
  suggestions?: string[]
}

export interface PluginSearchFacets {
  categories: Record<PluginCategory, number>
  tags: Record<string, number>
  authors: Record<string, number>
  licenses: Record<string, number>
}

export interface PluginRating {
  pluginId: string
  userId: string
  rating: number
  review?: string
  helpful: number
  createdAt: Date
  updatedAt: Date
}

export interface PluginStats {
  downloads: number
  installs: number
  stars: number
  forks: number
  issues: number
  lastUpdated: Date
  version: string
}