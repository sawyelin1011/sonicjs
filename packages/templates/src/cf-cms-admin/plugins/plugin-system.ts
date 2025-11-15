/**
 * CF-CMS.js Plugin System
 * 
 * Plugin integration, hooks, and extension points
 */

import { PluginComponent, PluginPage, PluginHook } from '../types'

// Plugin registry for components and pages
class PluginRegistry {
  private components: Map<string, PluginComponent[]> = new Map()
  private pages: Map<string, PluginPage> = new Map()
  private hooks: Map<string, PluginHook[]> = new Map()
  private styles: string[] = []
  private scripts: string[] = []

  // Component registration
  registerComponent(component: PluginComponent): void {
    const position = component.position
    if (!this.components.has(position)) {
      this.components.set(position, [])
    }
    this.components.get(position)!.push(component)
    
    // Sort by priority
    this.components.get(position)!.sort((a, b) => a.priority - b.priority)
  }

  // Page registration
  registerPage(page: PluginPage): void {
    this.pages.set(page.id, page)
  }

  // Hook registration
  registerHook(hook: PluginHook): void {
    const hookName = hook.name
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, [])
    }
    this.hooks.get(hookName)!.push(hook)
    
    // Sort by priority
    this.hooks.get(hookName)!.sort((a, b) => a.priority - b.priority)
  }

  // Style registration
  registerStyle(css: string): void {
    this.styles.push(css)
  }

  // Script registration
  registerScript(js: string): void {
    this.scripts.push(js)
  }

  // Get components by position
  getComponents(position: string): PluginComponent[] {
    return this.components.get(position) || []
  }

  // Get page by ID
  getPage(id: string): PluginPage | undefined {
    return this.pages.get(id)
  }

  // Get all pages
  getAllPages(): PluginPage[] {
    return Array.from(this.pages.values())
  }

  // Get hooks by name
  getHooks(name: string): PluginHook[] {
    return this.hooks.get(name) || []
  }

  // Get all styles
  getStyles(): string[] {
    return [...this.styles]
  }

  // Get all scripts
  getScripts(): string[] {
    return [...this.scripts]
  }

  // Execute hook
  async executeHook(name: string, data: any, context: any = {}): Promise<any> {
    const hooks = this.getHooks(name)
    let result = data
    
    for (const hook of hooks) {
      try {
        if (typeof hook.handler === 'string') {
          // Execute string-based handler
          result = eval(hook.handler)(result, context)
        } else if (typeof hook.handler === 'function') {
          // Execute function-based handler
          result = await hook.handler(result, context)
        }
      } catch (error) {
        console.error(`Error executing hook ${name}:`, error)
      }
    }
    
    return result
  }

  // Clear all registrations
  clear(): void {
    this.components.clear()
    this.pages.clear()
    this.hooks.clear()
    this.styles.length = 0
    this.scripts.length = 0
  }
}

// Global plugin registry instance
const pluginRegistry = new PluginRegistry()

// Plugin manager functions
export function registerPluginComponent(component: PluginComponent): void {
  pluginRegistry.registerComponent(component)
}

export function registerPluginPage(page: PluginPage): void {
  pluginRegistry.registerPage(page)
}

export function registerPluginHook(hook: PluginHook): void {
  pluginRegistry.registerHook(hook)
}

export function registerPluginStyle(css: string): void {
  pluginRegistry.registerStyle(css)
}

export function registerPluginScript(js: string): void {
  pluginRegistry.registerScript(js)
}

// Render plugin components
export function renderPluginComponents(position: string): string {
  const components = pluginRegistry.getComponents(position)
  
  if (components.length === 0) {
    return ''
  }

  return components.map(component => {
    try {
      if (typeof component.component === 'string') {
        // Return component string
        return `<div class="cf-cms-plugin-component" data-plugin-id="${component.id}">${component.component}</div>`
      } else if (typeof component.component === 'function') {
        // Execute component function
        const result = component.component(component.props || {})
        return `<div class="cf-cms-plugin-component" data-plugin-id="${component.id}">${result}</div>`
      }
    } catch (error) {
      console.error(`Error rendering plugin component ${component.id}:`, error)
      return `<div class="cf-cms-plugin-error">Error loading component: ${component.id}</div>`
    }
    return ''
  }).join('')
}

// Render plugin menu items
export function renderPluginMenuItems(): string {
  const pages = pluginRegistry.getAllPages()
  
  return pages
    .filter(page => page.menuItem)
    .map(page => `
      <a href="${page.path}" class="flex items-center space-x-3 text-gray-300 hover:text-white rounded-lg px-3 py-2 transition-all hover:bg-white/10">
        ${page.menuItem?.icon ? `
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            ${getIconSvg(page.menuItem.icon)}
          </svg>
        ` : ''}
        <span>${page.menuItem?.label}</span>
        ${page.menuItem?.badge ? `
          <span class="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">${page.menuItem.badge}</span>
        ` : ''}
      </a>
    `).join('')
}

// Get plugin styles and scripts
export function getPluginStyles(): string {
  const styles = pluginRegistry.getStyles()
  return styles.length > 0 ? `<style>${styles.join('\n')}</style>` : ''
}

export function getPluginScripts(): string {
  const scripts = pluginRegistry.getScripts()
  return scripts.map(script => `<script>${script}</script>`).join('')
}

// Plugin initialization
export function initializePlugins(plugins: any[]): void {
  plugins.forEach(plugin => {
    try {
      if (plugin.init) {
        plugin.init()
      }
      
      // Register plugin components
      if (plugin.components) {
        plugin.components.forEach(registerPluginComponent)
      }
      
      // Register plugin pages
      if (plugin.pages) {
        plugin.pages.forEach(registerPluginPage)
      }
      
      // Register plugin hooks
      if (plugin.hooks) {
        plugin.hooks.forEach(registerPluginHook)
      }
      
      // Register plugin styles
      if (plugin.styles) {
        plugin.styles.forEach(registerPluginStyle)
      }
      
      // Register plugin scripts
      if (plugin.scripts) {
        plugin.scripts.forEach(registerPluginScript)
      }
    } catch (error) {
      console.error(`Error initializing plugin ${plugin.id}:`, error)
    }
  })
}

// Hook execution utilities
export async function executeHook(name: string, data: any, context?: any): Promise<any> {
  return await pluginRegistry.executeHook(name, data, context)
}

// Plugin utilities
export function getPluginInfo(id: string): any {
  // This would return plugin information from the registry
  return null
}

export function isPluginEnabled(id: string): boolean {
  // This would check if a plugin is enabled
  return true
}

export function enablePlugin(id: string): void {
  // This would enable a plugin
}

export function disablePlugin(id: string): void {
  // This would disable a plugin
}

// Icon helper function
function getIconSvg(iconName: string): string {
  const icons: Record<string, string> = {
    'chart': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />',
    'users': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />',
    'settings': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />',
    'package': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />'
  }
  
  return icons[iconName] || ''
}

// Export the registry for advanced usage
export { pluginRegistry }