/**
 * Dynamic Plugin Loader
 * 
 * Enables loading, installing, and uninstalling plugins at runtime
 * without requiring core modifications
 */

import type { Plugin, PluginContext, PluginConfig, PluginStatus } from '../types'
import { PluginValidator } from './plugin-validator'

export interface PluginLoadOptions {
  pluginPath: string
  config?: PluginConfig
  autoInstall?: boolean
  validateDependencies?: boolean
}

export interface PluginInstallResult {
  success: boolean
  pluginName: string
  version: string
  message?: string
  error?: string
}

export interface PluginDiscoveryResult {
  path: string
  name: string
  version: string
  manifest?: Record<string, any>
}

/**
 * Dynamic Plugin Loader
 * Handles runtime plugin discovery, loading, installation, and uninstallation
 */
export class DynamicPluginLoader {
  private validator: PluginValidator
  private loadedPlugins: Map<string, Plugin> = new Map()
  private pluginMetadata: Map<string, any> = new Map()

  constructor() {
    this.validator = new PluginValidator()
  }

  /**
   * Discover plugins in a directory
   * Scans for plugin directories with manifest.json files
   */
  async discoverPlugins(baseDir: string): Promise<PluginDiscoveryResult[]> {
    try {
      const plugins: PluginDiscoveryResult[] = []
      
      // TODO: Implement directory scanning for plugin discovery
      // This would be implemented based on the runtime environment
      // For now, return empty array
      
      return plugins
    } catch (error) {
      console.error('Error discovering plugins:', error)
      return []
    }
  }

  /**
   * Load a plugin from a path
   * Dynamically imports and validates the plugin
   */
  async loadPlugin(
    options: PluginLoadOptions,
    context: PluginContext
  ): Promise<PluginInstallResult> {
    try {
      const { pluginPath, config = {}, autoInstall = false, validateDependencies = true } = options

      // Load plugin module
      const pluginModule = await this.loadPluginModule(pluginPath)
      const plugin = this.extractPlugin(pluginModule)

      // Validate plugin
      const validationResult = this.validator.validate(plugin)
      if (!validationResult.valid) {
        return {
          success: false,
          pluginName: plugin.name,
          version: plugin.version,
          error: `Validation failed: ${validationResult.errors.join(', ')}`
        }
      }

      // Validate dependencies if requested
      if (validateDependencies && plugin.dependencies?.length) {
        const depValidation = await this.validatePluginDependencies(plugin)
        if (!depValidation.valid) {
          return {
            success: false,
            pluginName: plugin.name,
            version: plugin.version,
            error: `Dependency validation failed: ${depValidation.errors.join(', ')}`
          }
        }
      }

      // Store plugin
      this.loadedPlugins.set(plugin.name, plugin)
      this.pluginMetadata.set(plugin.name, {
        path: pluginPath,
        config,
        loadedAt: new Date(),
        status: 'loaded'
      })

      // Install plugin if requested
      if (autoInstall && plugin.install) {
        try {
          await plugin.install(context)
          this.pluginMetadata.get(plugin.name)!.status = 'installed'
        } catch (error) {
          console.error(`Error installing plugin ${plugin.name}:`, error)
          return {
            success: false,
            pluginName: plugin.name,
            version: plugin.version,
            error: `Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
      }

      return {
        success: true,
        pluginName: plugin.name,
        version: plugin.version,
        message: `Plugin ${plugin.name} loaded successfully`
      }
    } catch (error) {
      console.error('Error loading plugin:', error)
      return {
        success: false,
        pluginName: 'unknown',
        version: '0.0.0',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Install a plugin dynamically
   */
  async installPlugin(
    pluginName: string,
    config: PluginConfig,
    context: PluginContext
  ): Promise<PluginInstallResult> {
    try {
      const plugin = this.loadedPlugins.get(pluginName)
      if (!plugin) {
        return {
          success: false,
          pluginName,
          version: '0.0.0',
          error: `Plugin ${pluginName} not loaded`
        }
      }

      if (!plugin.install) {
        return {
          success: false,
          pluginName,
          version: plugin.version,
          error: `Plugin ${pluginName} does not support installation`
        }
      }

      // Call plugin install hook
      await plugin.install(context)

      // Update metadata
      const metadata = this.pluginMetadata.get(pluginName) || {}
      metadata.config = config
      metadata.status = 'installed'
      metadata.installedAt = new Date()
      this.pluginMetadata.set(pluginName, metadata)

      return {
        success: true,
        pluginName,
        version: plugin.version,
        message: `Plugin ${pluginName} installed successfully`
      }
    } catch (error) {
      console.error(`Error installing plugin ${pluginName}:`, error)
      return {
        success: false,
        pluginName,
        version: '0.0.0',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Uninstall a plugin dynamically
   */
  async uninstallPlugin(
    pluginName: string,
    context: PluginContext,
    removeData: boolean = false
  ): Promise<PluginInstallResult> {
    try {
      const plugin = this.loadedPlugins.get(pluginName)
      if (!plugin) {
        return {
          success: false,
          pluginName,
          version: '0.0.0',
          error: `Plugin ${pluginName} not loaded`
        }
      }

      if (!plugin.uninstall) {
        return {
          success: false,
          pluginName,
          version: plugin.version,
          error: `Plugin ${pluginName} does not support uninstallation`
        }
      }

      // Create context with removeData flag
      const uninstallContext = { ...context, removeData }

      // Call plugin uninstall hook
      await plugin.uninstall(uninstallContext)

      // Update metadata
      const metadata = this.pluginMetadata.get(pluginName) || {}
      metadata.status = 'uninstalled'
      metadata.uninstalledAt = new Date()
      this.pluginMetadata.set(pluginName, metadata)

      // Remove from loaded plugins
      this.loadedPlugins.delete(pluginName)

      return {
        success: true,
        pluginName,
        version: plugin.version,
        message: `Plugin ${pluginName} uninstalled successfully`
      }
    } catch (error) {
      console.error(`Error uninstalling plugin ${pluginName}:`, error)
      return {
        success: false,
        pluginName,
        version: '0.0.0',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get loaded plugin
   */
  getPlugin(name: string): Plugin | undefined {
    return this.loadedPlugins.get(name)
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins.values())
  }

  /**
   * Get plugin metadata
   */
  getPluginMetadata(name: string): any {
    return this.pluginMetadata.get(name)
  }

  /**
   * Get plugin status
   */
  getPluginStatus(name: string): PluginStatus | undefined {
    const plugin = this.loadedPlugins.get(name)
    const metadata = this.pluginMetadata.get(name)

    if (!plugin) return undefined

    return {
      name: plugin.name,
      version: plugin.version,
      active: metadata?.status === 'installed',
      installed: metadata?.status === 'installed' || metadata?.status === 'loaded',
      hasErrors: false,
      errors: [],
      lastError: undefined
    }
  }

  /**
   * Load plugin module dynamically
   * Handles both ESM and CommonJS modules
   */
  private async loadPluginModule(path: string): Promise<any> {
    // In a real implementation, this would use dynamic import
    // For now, this is a placeholder
    try {
      const plugin = await import(path)
      return plugin
    } catch (error) {
      throw new Error(`Failed to load plugin module from ${path}: ${error}`)
    }
  }

  /**
   * Extract plugin from module (handles default export or direct export)
   */
  private extractPlugin(module: any): Plugin {
    if (module.default) {
      return module.default
    }
    if (module.plugin) {
      return module.plugin
    }
    // Assume the module itself is the plugin
    return module
  }

  /**
   * Validate plugin dependencies
   */
  private async validatePluginDependencies(plugin: Plugin): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return { valid: true, errors: [] }
    }

    for (const dep of plugin.dependencies) {
      if (!this.loadedPlugins.has(dep)) {
        errors.push(`Required plugin '${dep}' is not loaded`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const dynamicPluginLoader = new DynamicPluginLoader()
