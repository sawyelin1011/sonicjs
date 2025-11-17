/**
 * CF-CMS.js Main Admin Layout
 * 
 * Responsive, plugin-ready admin layout with sidebar, header, and content areas
 */

import { CFAdminLayoutData, MenuItem, NotificationItem } from '../types'
import { renderButton } from '../components/forms/button.component'

export function renderCFAdminLayout(props: CFAdminLayoutData): string {
  const {
    title,
    description,
    user,
    config,
    content,
    sidebar,
    breadcrumbs,
    notifications = [],
    scripts = [],
    styles = [],
    metaTags = [],
    customData = {}
  } = props

  // Build meta tags
  const metaTagsHtml = [
    `<meta charset="UTF-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    `<title>${title} - ${config.siteName || 'CF-CMS.js'}</title>`,
    `<meta name="description" content="${description || `CF-CMS.js Admin - ${title}`}">`,
    `<meta name="author" content="${user.name}">`,
    ...metaTags.map(tag => {
      if (tag.name) {
        return `<meta name="${tag.name}" content="${tag.content}">`
      } else if (tag.property) {
        return `<meta property="${tag.property}" content="${tag.content}">`
      } else if (tag.httpEquiv) {
        return `<meta http-equiv="${tag.httpEquiv}" content="${tag.content}">`
      }
      return ''
    })
  ].join('\n    ')

  // Build styles
  const stylesHtml = [
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`,
    `<script src="https://cdn.tailwindcss.com"></script>`,
    `<style>
      /* CF-CMS.js Custom Styles */
      :root {
        --cf-cms-primary: #3b82f6;
        --cf-cms-secondary: #64748b;
        --cf-cms-success: #22c55e;
        --cf-cms-warning: #f59e0b;
        --cf-cms-error: #ef4444;
        --cf-cms-info: #0ea5e9;
        --cf-cms-sidebar-width: 16rem;
        --cf-cms-header-height: 4rem;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .cf-cms-sidebar {
        width: var(--cf-cms-sidebar-width);
        transition: transform 0.3s ease-in-out;
      }
      
      .cf-cms-sidebar-collapsed {
        transform: translateX(-100%);
      }
      
      @media (min-width: 1024px) {
        .cf-cms-sidebar-collapsed {
          transform: translateX(0);
          width: 4rem;
        }
      }
      
      .cf-cms-content {
        margin-left: var(--cf-cms-sidebar-width);
        transition: margin-left 0.3s ease-in-out;
      }
      
      .cf-cms-content-expanded {
        margin-left: 0;
      }
      
      @media (min-width: 1024px) {
        .cf-cms-content-expanded {
          margin-left: 4rem;
        }
      }
      
      .cf-cms-header {
        height: var(--cf-cms-header-height);
      }
      
      /* Plugin injection points */
      .cf-cms-plugin-header-start { order: -10; }
      .cf-cms-plugin-header-center { order: 0; }
      .cf-cms-plugin-header-end { order: 10; }
      .cf-cms-plugin-sidebar-top { order: -10; }
      .cf-cms-plugin-sidebar-middle { order: 0; }
      .cf-cms-plugin-sidebar-bottom { order: 10; }
      .cf-cms-plugin-content-top { order: -10; }
      .cf-cms-plugin-content-middle { order: 0; }
      .cf-cms-plugin-content-bottom { order: 10; }
    </style>`,
    ...styles.map(style => `<link rel="stylesheet" href="${style}">`)
  ].join('\n    ')

  // Build scripts
  const scriptsHtml = [
    `<script>
      // CF-CMS.js Admin Configuration
      window.CF_CMS_CONFIG = ${JSON.stringify(config)};
      window.CF_CMS_USER = ${JSON.stringify(user)};
      window.CF_CMS_THEME = '${config.theme || 'auto'}';
      
      // Theme management
      function initTheme() {
        const theme = window.CF_CMS_THEME;
        if (theme === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
          document.documentElement.setAttribute('data-theme', theme);
        }
      }
      
      // Sidebar management
      function toggleSidebar() {
        const sidebar = document.getElementById('cf-cms-sidebar');
        const content = document.getElementById('cf-cms-content');
        const overlay = document.getElementById('cf-cms-sidebar-overlay');
        
        if (sidebar.classList.contains('cf-cms-sidebar-collapsed')) {
          sidebar.classList.remove('cf-cms-sidebar-collapsed');
          content.classList.remove('cf-cms-content-expanded');
          overlay.classList.add('hidden');
        } else {
          sidebar.classList.add('cf-cms-sidebar-collapsed');
          content.classList.add('cf-cms-content-expanded');
          overlay.classList.remove('hidden');
        }
      }
      
      // User dropdown management
      function toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.toggle('hidden');
      }
      
      // Notification management
      function toggleNotifications() {
        const panel = document.getElementById('notification-panel');
        panel.classList.toggle('hidden');
      }
      
      // Close dropdowns when clicking outside
      document.addEventListener('click', function(event) {
        if (!event.target.closest('#user-dropdown') && !event.target.closest('[onclick*="toggleUserDropdown"]')) {
          document.getElementById('user-dropdown')?.classList.add('hidden');
        }
        if (!event.target.closest('#notification-panel') && !event.target.closest('[onclick*="toggleNotifications"]')) {
          document.getElementById('notification-panel')?.classList.add('hidden');
        }
      });
      
      // Initialize on DOM load
      document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        
        // Listen for system theme changes
        if (window.CF_CMS_THEME === 'auto') {
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', initTheme);
        }
      });
    </script>`,
    ...scripts.map(script => `<script src="${script}"></script>`)
  ].join('\n    ')

  return `<!DOCTYPE html>
<html lang="en" data-theme="${config.theme || 'auto'}">
<head>
    ${metaTagsHtml}
    ${stylesHtml}
    ${scriptsHtml}
</head>
<body class="bg-gray-50 text-gray-900 antialiased">
    <!-- Mobile Sidebar Overlay -->
    <div id="cf-cms-sidebar-overlay" class="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden hidden" onclick="toggleSidebar()"></div>
    
    <!-- Sidebar -->
    <aside id="cf-cms-sidebar" class="cf-cms-sidebar fixed inset-y-0 left-0 z-30 bg-gray-900 text-white lg:translate-x-0 transform">
        ${renderSidebar(sidebar, config)}
    </aside>
    
    <!-- Main Content Area -->
    <div id="cf-cms-content" class="cf-cms-content min-h-screen">
        <!-- Header -->
        <header class="cf-cms-header bg-white shadow-sm border-b border-gray-200 relative z-20">
            ${renderHeader(user, notifications, config)}
        </header>
        
        <!-- Breadcrumbs -->
        ${breadcrumbs ? renderBreadcrumbs(breadcrumbs) : ''}
        
        <!-- Page Content -->
        <main class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Plugin injection point: content-top -->
                <div class="cf-cms-plugin-content-top"></div>
                
                <!-- Main content -->
                <div class="cf-cms-plugin-content-middle">
                    ${content}
                </div>
                
                <!-- Plugin injection point: content-bottom -->
                <div class="cf-cms-plugin-content-bottom"></div>
            </div>
        </main>
    </div>
    
    <!-- Plugin initialization script -->
    <script>
      // Initialize plugins
      if (window.CF_CMS_PLUGINS) {
        window.CF_CMS_PLUGINS.forEach(function(plugin) {
          if (plugin.init) {
            plugin.init();
          }
        });
      }
    </script>
</body>
</html>`
}

function renderSidebar(sidebarContent: string, config: any): string {
  return `
    <div class="flex flex-col h-full">
      <!-- Logo Area -->
      <div class="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
        <div class="flex items-center">
          <svg class="h-8 w-auto text-blue-400" viewBox="0 0 200 40" fill="currentColor">
            <path d="M20 10 L30 10 L35 20 L25 20 Z M30 10 L40 10 L45 20 L35 20 Z" opacity="0.8"/>
            <path d="M50 10 L60 10 L65 20 L55 20 Z" opacity="0.6"/>
            <path d="M70 10 L80 10 L85 20 L75 20 Z" opacity="0.4"/>
            <text x="95" y="25" font-family="Inter, sans-serif" font-size="16" font-weight="600">CF-CMS</text>
          </svg>
        </div>
        <button
          type="button"
          onclick="toggleSidebar()"
          class="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Plugin injection point: sidebar-top -->
      <div class="cf-cms-plugin-sidebar-top"></div>
      
      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        ${sidebarContent}
      </nav>
      
      <!-- Plugin injection point: sidebar-middle -->
      <div class="cf-cms-plugin-sidebar-middle"></div>
      
      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-gray-700">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium">${config.siteName ? config.siteName.charAt(0).toUpperCase() : 'C'}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">${config.siteName || 'CF-CMS.js'}</p>
            <p class="text-xs text-gray-400 truncate">v${config.version || '1.0.0'}</p>
          </div>
        </div>
      </div>
      
      <!-- Plugin injection point: sidebar-bottom -->
      <div class="cf-cms-plugin-sidebar-bottom"></div>
    </div>
  `
}

function renderHeader(user: any, notifications: NotificationItem[], config: any): string {
  const unreadCount = notifications.filter(n => !n.read).length

  return `
    <div class="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
      <!-- Mobile menu button -->
      <button
        type="button"
        onclick="toggleSidebar()"
        class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <!-- Plugin injection point: header-start -->
      <div class="cf-cms-plugin-header-start"></div>
      
      <!-- Search Bar -->
      <div class="flex-1 max-w-lg mx-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search..."
          />
        </div>
      </div>
      
      <!-- Plugin injection point: header-center -->
      <div class="cf-cms-plugin-header-center"></div>
      
      <!-- Right side items -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <div class="relative">
          <button
            type="button"
            onclick="toggleNotifications()"
            class="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5l-5-5h5V3h0v14z" />
            </svg>
            ${unreadCount > 0 ? `
              <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
            ` : ''}
          </button>
          
          <!-- Notification Panel -->
          <div id="notification-panel" class="hidden absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div class="p-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
            </div>
            <div class="max-h-96 overflow-y-auto">
              ${notifications.length > 0 ? notifications.slice(0, 5).map(notification => `
                <div class="p-4 hover:bg-gray-50 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}">
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      ${getNotificationIcon(notification.type)}
                    </div>
                    <div class="ml-3 w-0 flex-1">
                      <p class="text-sm font-medium text-gray-900">${notification.title}</p>
                      <p class="text-sm text-gray-500">${notification.message}</p>
                      <p class="text-xs text-gray-400 mt-1">${formatTime(notification.timestamp)}</p>
                    </div>
                  </div>
                </div>
              `).join('') : `
                <div class="p-4 text-center text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5l-5-5h5V3h0v14z" />
                  </svg>
                  <p class="mt-2 text-sm">No notifications</p>
                </div>
              `}
            </div>
            ${notifications.length > 0 ? `
              <div class="p-4 border-t border-gray-200">
                <a href="#" class="block text-sm text-blue-600 hover:text-blue-500 font-medium">View all notifications</a>
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- User Dropdown -->
        <div class="relative">
          <button
            type="button"
            onclick="toggleUserDropdown()"
            class="flex items-center space-x-3 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-white">${user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-900">${user.name}</p>
              <p class="text-xs text-gray-500">${user.role}</p>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <!-- User Dropdown Menu -->
          <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div class="py-1">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg class="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Profile
              </a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg class="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </a>
              <div class="border-t border-gray-100"></div>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg class="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </a>
            </div>
          </div>
        </div>
        
        <!-- Plugin injection point: header-end -->
        <div class="cf-cms-plugin-header-end"></div>
      </div>
    </div>
  `
}

function renderBreadcrumbs(breadcrumbs: any[]): string {
  return `
    <nav class="bg-white border-b border-gray-200" aria-label="Breadcrumb">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol class="flex items-center space-x-2 py-3">
          ${breadcrumbs.map((item, index) => `
            <li class="flex items-center">
              ${index > 0 ? `
                <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              ` : ''}
              ${item.path ? `
                <a href="${item.path}" class="text-sm font-medium text-gray-500 hover:text-gray-700 ${item.active ? 'text-gray-900' : ''}">
                  ${item.label}
                </a>
              ` : `
                <span class="text-sm font-medium text-gray-900">${item.label}</span>
              `}
            </li>
          `).join('')}
        </ol>
      </div>
    </nav>
  `
}

function getNotificationIcon(type: string): string {
  const icons = {
    info: '<svg class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    success: '<svg class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    warning: '<svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>',
    error: '<svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
  }
  
  return icons[type] || icons.info
}

function formatTime(timestamp: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return new Date(timestamp).toLocaleDateString()
}