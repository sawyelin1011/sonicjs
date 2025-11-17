/**
 * CF-CMS.js Dashboard Page
 * 
 * Responsive dashboard with widgets, stats, and charts
 */

import { DashboardData, WidgetData, StatWidgetData } from '../types'
import { renderTable } from '../components/tables/table.component'
import { renderButton } from '../components/forms/button.component'

export function renderDashboard(props: DashboardData): string {
  const {
    id,
    title = 'Dashboard',
    layout = 'grid',
    widgets,
    filters,
    refreshInterval,
    className = ''
  } = props

  const dashboardId = id || `dashboard-${Date.now()}`

  return `
    <div class="cf-cms-dashboard ${className}" id="${dashboardId}">
      <!-- Dashboard Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">${title}</h1>
            <p class="mt-1 text-sm text-gray-600">Welcome back! Here's what's happening with your site today.</p>
          </div>
          <div class="flex items-center space-x-3">
            ${filters ? renderDashboardFilters(filters, dashboardId) : ''}
            ${renderRefreshButton(dashboardId, refreshInterval)}
          </div>
        </div>
      </div>

      <!-- Dashboard Widgets -->
      <div class="${getDashboardLayoutClass(layout)}">
        ${widgets.map(widget => renderWidget(widget)).join('')}
      </div>

      <!-- Plugin injection point -->
      <div class="cf-cms-dashboard-plugins mt-8"></div>

      ${renderDashboardScripts(dashboardId, { refreshInterval })}
    </div>
  `
}

function renderWidget(widget: WidgetData): string {
  const { id, type, title, size, position, data, loading, error, className = '' } = widget

  const widgetId = id || `widget-${Date.now()}-${Math.random()}`
  const sizeClasses = getWidgetSizeClasses(size)
  const positionStyles = position ? `
    grid-column: ${position.x + 1} / span ${position.w};
    grid-row: ${position.y + 1} / span ${position.h};
  ` : ''

  if (loading) {
    return `
      <div class="cf-cms-widget ${sizeClasses} ${className}" style="${positionStyles}" id="${widgetId}">
        ${renderWidgetSkeleton(title)}
      </div>
    `
  }

  if (error) {
    return `
      <div class="cf-cms-widget ${sizeClasses} ${className}" style="${positionStyles}" id="${widgetId}">
        ${renderWidgetError(title, error)}
      </div>
    `
  }

  let content = ''
  switch (type) {
    case 'stat':
      content = renderStatWidget(data as StatWidgetData)
      break
    case 'chart':
      content = renderChartWidget(data)
      break
    case 'table':
      content = renderTableWidget(data)
      break
    case 'list':
      content = renderListWidget(data)
      break
    case 'custom':
      content = data.content || '<div class="text-gray-500">Custom widget content</div>'
      break
    default:
      content = '<div class="text-gray-500">Unknown widget type</div>'
  }

  return `
    <div class="cf-cms-widget ${sizeClasses} ${className}" style="${positionStyles}" id="${widgetId}">
      ${renderWidgetContainer(title, content, widgetId)}
    </div>
  `
}

function renderWidgetContainer(title: string, content: string, widgetId: string): string {
  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      ${title ? `
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">${title}</h3>
            <div class="flex items-center space-x-2">
              <button
                type="button"
                onclick="refreshWidget('${widgetId}')"
                class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="Refresh widget"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                type="button"
                onclick="toggleWidgetOptions('${widgetId}')"
                class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="Widget options"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ` : ''}
      <div class="flex-1 p-6 overflow-hidden">
        ${content}
      </div>
    </div>
  `
}

function renderStatWidget(data: StatWidgetData): string {
  const {
    label,
    value,
    change,
    icon,
    color = 'blue',
    format,
    prefix = '',
    suffix = '',
    description
  } = data

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500'
  }

  const iconHtml = icon ? `
    <div class="flex-shrink-0">
      <div class="${colorClasses[color]} rounded-lg p-3">
        <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          ${getIconSvg(icon)}
        </svg>
      </div>
    </div>
  ` : ''

  const changeHtml = change ? `
    <div class="flex items-center">
      <svg class="w-4 h-4 ${change.type === 'increase' ? 'text-green-500' : 'text-red-500'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        ${change.type === 'increase' ? 
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />' :
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />'
        }
      </svg>
      <span class="ml-1 text-sm font-medium ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}">
        ${change.type === 'increase' ? '+' : ''}${change.value}%
      </span>
      <span class="ml-1 text-sm text-gray-500">${change.period}</span>
    </div>
  ` : ''

  const formattedValue = format ? formatValue(value, format) : value

  return `
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600">${label}</p>
        <div class="flex items-baseline">
          <p class="text-2xl font-semibold text-gray-900">
            ${prefix}${formattedValue}${suffix}
          </p>
        </div>
        ${changeHtml}
        ${description ? `<p class="mt-1 text-sm text-gray-500">${description}</p>` : ''}
      </div>
      ${iconHtml}
    </div>
  `
}

function renderChartWidget(data: any): string {
  return `
    <div class="h-full flex items-center justify-center">
      <div class="text-center">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="text-gray-500">Chart widget</p>
        <p class="text-sm text-gray-400 mt-1">Chart will be rendered here</p>
      </div>
    </div>
  `
}

function renderTableWidget(data: any): string {
  // This would render a mini table widget
  return `
    <div class="h-full overflow-hidden">
      <div class="text-center text-gray-500">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p>Table widget</p>
      </div>
    </div>
  `
}

function renderListWidget(data: any): string {
  return `
    <div class="space-y-3">
      ${Array.isArray(data) ? data.slice(0, 5).map((item, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-blue-600">${index + 1}</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">${item.title || item.name}</p>
              <p class="text-xs text-gray-500">${item.description || item.subtitle}</p>
            </div>
          </div>
          ${item.value ? `
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">${item.value}</p>
              ${item.change ? `
                <p class="text-xs ${item.change > 0 ? 'text-green-600' : 'text-red-600'}">
                  ${item.change > 0 ? '+' : ''}${item.change}%
                </p>
              ` : ''}
            </div>
          ` : ''}
        </div>
      `).join('') : `
        <div class="text-center text-gray-500">
          <p>No data available</p>
        </div>
      `}
    </div>
  `
}

function renderWidgetSkeleton(title: string): string {
  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col animate-pulse">
      ${title ? `
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="h-6 bg-gray-300 rounded w-1/3"></div>
        </div>
      ` : ''}
      <div class="flex-1 p-6">
        <div class="space-y-3">
          <div class="h-4 bg-gray-300 rounded w-3/4"></div>
          <div class="h-8 bg-gray-300 rounded w-1/2"></div>
          <div class="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  `
}

function renderWidgetError(title: string, error: string): string {
  return `
    <div class="bg-white rounded-lg shadow-sm border border-red-200 h-full flex flex-col">
      ${title ? `
        <div class="px-6 py-4 border-b border-red-200">
          <h3 class="text-lg font-medium text-red-900">${title}</h3>
        </div>
      ` : ''}
      <div class="flex-1 p-6 flex items-center justify-center">
        <div class="text-center">
          <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-900 font-medium">Error loading widget</p>
          <p class="text-red-600 text-sm mt-1">${error}</p>
        </div>
      </div>
    </div>
  `
}

function renderDashboardFilters(filters: any, dashboardId: string): string {
  return `
    <div class="flex items-center space-x-2">
      ${filters.map((filter: any) => `
        <select
          class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          onchange="handleDashboardFilter('${dashboardId}', '${filter.name}', this.value)"
        >
          ${filter.options.map((option: any) => `
            <option value="${option.value}" ${option.selected ? 'selected' : ''}>
              ${option.label}
            </option>
          `).join('')}
        </select>
      `).join('')}
    </div>
  `
}

function renderRefreshButton(dashboardId: string, refreshInterval?: number): string {
  return renderButton({
    label: 'Refresh',
    icon: 'refresh',
    variant: 'outline',
    size: 'sm',
    onClick: `refreshDashboard('${dashboardId}')`
  })
}

function getDashboardLayoutClass(layout: string): string {
  switch (layout) {
    case 'grid':
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    case 'masonry':
      return 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6'
    case 'flex':
      return 'flex flex-wrap gap-6'
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
  }
}

function getWidgetSizeClasses(size: string): string {
  switch (size) {
    case 'sm':
      return 'col-span-1 row-span-1'
    case 'md':
      return 'col-span-1 row-span-2 md:col-span-2 md:row-span-2'
    case 'lg':
      return 'col-span-1 row-span-3 md:col-span-2 md:row-span-3 lg:col-span-3 lg:row-span-2'
    case 'xl':
      return 'col-span-1 row-span-4 md:col-span-2 md:row-span-4 lg:col-span-4 lg:row-span-3'
    case 'full':
      return 'col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-4 lg:row-span-2'
    default:
      return 'col-span-1 row-span-1'
  }
}

function getIconSvg(iconName: string): string {
  const icons: Record<string, string> = {
    'users': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />',
    'revenue': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
    'orders': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />',
    'growth': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />',
    'chart': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />',
    'clock': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />',
    'document': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />'
  }
  
  return icons[iconName] || ''
}

function formatValue(value: any, format: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))
    case 'percentage':
      return `${value}%`
    case 'number':
      return Number(value).toLocaleString()
    case 'bytes':
      return formatBytes(Number(value))
    default:
      return String(value)
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function renderDashboardScripts(dashboardId: string, options: any): string {
  const { refreshInterval } = options

  return `
    <script>
      window['dashboard_${dashboardId}'] = {
        refreshInterval: ${refreshInterval || 0},
        autoRefresh: null
      };
      
      function refreshDashboard(dashboardId) {
        // Trigger dashboard refresh
        console.log('Refreshing dashboard:', dashboardId);
        // In real implementation, this would reload data via API
        location.reload();
      }
      
      function refreshWidget(widgetId) {
        console.log('Refreshing widget:', widgetId);
        // In real implementation, this would reload specific widget data
      }
      
      function toggleWidgetOptions(widgetId) {
        console.log('Toggle options for widget:', widgetId);
        // In real implementation, this would show widget options modal
      }
      
      function handleDashboardFilter(dashboardId, filterName, value) {
        console.log('Filter changed:', { dashboardId, filterName, value });
        // In real implementation, this would apply filter and reload data
        location.search = new URLSearchParams({ [filterName]: value }).toString();
      }
      
      // Auto-refresh setup
      ${refreshInterval ? `
        const dashboard = window['dashboard_${dashboardId}'];
        if (dashboard.refreshInterval > 0) {
          dashboard.autoRefresh = setInterval(() => {
            refreshDashboard(dashboardId);
          }, dashboard.refreshInterval * 1000);
        }
      ` : ''}
    </script>
  `
}