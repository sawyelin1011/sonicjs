/**
 * Analytics Example Plugin
 *
 * Comprehensive example demonstrating:
 * - Plugin structure and metadata
 * - Database models and migrations
 * - Custom services and middleware
 * - Hook system integration
 * - Admin pages and UI
 * - Route registration
 * - Configuration management
 * - Error handling and logging
 * - TypeScript best practices
 * - Validation with Zod
 */

import { Hono } from 'hono'
import { html } from 'hono/html'
import { PluginBuilder } from '../../sdk/plugin-builder'
import type { Plugin, PluginContext } from '@sonicjs-cms/core'
import { z } from 'zod'
import { AnalyticsService } from './services/AnalyticsService'
import { createTrackingMiddleware } from './middleware/tracking'
import type { AnalyticsConfig } from './types'

export function createAnalyticsExamplePlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'analytics-example',
    version: '1.0.0-example.1',
    description: 'Comprehensive analytics example plugin demonstrating all SonicJS plugin features'
  })

  // ============================================================================
  // 1. METADATA
  // ============================================================================
  builder.metadata({
    author: {
      name: 'SonicJS Team',
      email: 'team@sonicjs.com',
      url: 'https://sonicjs.com'
    },
    license: 'MIT',
    compatibility: '^2.0.0',
    dependencies: []
  })

  // ============================================================================
  // 2. DATABASE MODELS
  // ============================================================================

  // Events table schema
  const AnalyticsEventsSchema = z.object({
    id: z.string().uuid(),
    eventType: z.string(),
    userId: z.string().optional(),
    path: z.string(),
    referrer: z.string().optional(),
    userAgent: z.string().optional(),
    metadata: z.string(), // JSON string
    timestamp: z.number(),
    createdAt: z.number()
  })

  builder.addModel('AnalyticsEvent', {
    tableName: 'analytics_events',
    schema: AnalyticsEventsSchema,
    migrations: [
      `CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        eventType TEXT NOT NULL,
        userId TEXT,
        path TEXT NOT NULL,
        referrer TEXT,
        userAgent TEXT,
        metadata TEXT,
        timestamp INTEGER NOT NULL,
        createdAt INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(eventType)`,
      `CREATE INDEX IF NOT EXISTS idx_analytics_events_userId ON analytics_events(userId)`,
      `CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp)`
    ]
  })

  // Stats table schema
  const AnalyticsStatsSchema = z.object({
    id: z.string().uuid(),
    eventType: z.string(),
    count: z.number(),
    uniqueUsers: z.number(),
    startTime: z.number(),
    endTime: z.number(),
    createdAt: z.number()
  })

  builder.addModel('AnalyticsStat', {
    tableName: 'analytics_stats',
    schema: AnalyticsStatsSchema,
    migrations: [
      `CREATE TABLE IF NOT EXISTS analytics_stats (
        id TEXT PRIMARY KEY,
        eventType TEXT NOT NULL,
        count INTEGER NOT NULL,
        uniqueUsers INTEGER NOT NULL,
        startTime INTEGER NOT NULL,
        endTime INTEGER NOT NULL,
        createdAt INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_analytics_stats_type ON analytics_stats(eventType)`
    ]
  })

  // ============================================================================
  // 3. ROUTES AND API ENDPOINTS
  // ============================================================================

  const routes = new Hono()

  // Track event endpoint
  routes.post('/track', async (c) => {
    try {
      const analyticsService = c.get('analyticsService') as AnalyticsService

      const schema = z.object({
        eventType: z.string().min(1),
        userId: z.string().optional(),
        path: z.string(),
        metadata: z.record(z.any()).optional()
      })

      const body = await c.req.json()
      const data = schema.parse(body)

      const event = await analyticsService.trackEvent({
        eventType: data.eventType,
        userId: data.userId,
        path: data.path,
        metadata: data.metadata
      })

      return c.json({ success: true, event }, 201)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to track event'
      return c.json({ success: false, error: message }, 400)
    }
  })

  // Get events by type
  routes.get('/events/:type', async (c) => {
    try {
      const analyticsService = c.get('analyticsService') as AnalyticsService
      const type = c.req.param('type')
      const limit = Math.min(parseInt(c.req.query('limit') || '100'), 1000)

      const events = await analyticsService.getEventsByType(type, limit)
      return c.json({ events })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get events'
      return c.json({ error: message }, 500)
    }
  })

  // Get user events
  routes.get('/user/:userId/events', async (c) => {
    try {
      const analyticsService = c.get('analyticsService') as AnalyticsService
      const userId = c.req.param('userId')
      const limit = Math.min(parseInt(c.req.query('limit') || '50'), 500)

      const events = await analyticsService.getEventsByUser(userId, limit)
      return c.json({ events })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user events'
      return c.json({ error: message }, 500)
    }
  })

  // Get analytics summary
  routes.get('/summary', async (c) => {
    try {
      const analyticsService = c.get('analyticsService') as AnalyticsService
      const hours = parseInt(c.req.query('hours') || '24')

      const summary = await analyticsService.getSummary(hours)
      return c.json(summary)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get summary'
      return c.json({ error: message }, 500)
    }
  })

  builder.addRoute('/api/analytics-example', routes, {
    description: 'Analytics API endpoints',
    requiresAuth: false,
    priority: 10
  })

  // ============================================================================
  // 4. MIDDLEWARE
  // ============================================================================

  builder.addSingleMiddleware('analytics-tracking', createTrackingMiddleware(), {
    description: 'Track incoming requests for analytics',
    priority: 5,
    global: true
  })

  // ============================================================================
  // 5. ADMIN PAGES AND UI
  // ============================================================================

  const adminRoutes = new Hono()

  adminRoutes.get('/', async (c) => {
    try {
      const analyticsService = c.get('analyticsService') as AnalyticsService
      const user = c.get('user')

      // Get summary data
      const summary = await analyticsService.getSummary(24)

      return c.html(html`
        <!DOCTYPE html>
        <html lang="en" class="dark">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Analytics - SonicJS</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
              tailwind.config = { darkMode: 'class' }
            </script>
          </head>
          <body class="bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white min-h-screen">
            <div class="flex h-screen">
              <!-- Sidebar -->
              <aside class="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
                <div class="p-4">
                  <h2 class="text-xl font-bold mb-4">SonicJS</h2>
                  <nav>
                    <a href="/admin/dashboard" class="block px-4 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 mb-1">
                      Dashboard
                    </a>
                    <a href="/admin/analytics-example" class="block px-4 py-2 rounded bg-zinc-100 dark:bg-zinc-800 font-medium mb-1">
                      📊 Analytics Example
                    </a>
                  </nav>
                </div>
              </aside>

              <!-- Main Content -->
              <main class="flex-1 overflow-y-auto">
                <div class="p-8">
                  <!-- Header -->
                  <div class="mb-8">
                    <h1 class="text-3xl font-bold mb-2">Analytics Dashboard</h1>
                    <p class="text-zinc-600 dark:text-zinc-400">
                      View analytics and tracking data from the past 24 hours
                    </p>
                  </div>

                  <!-- Stats Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <!-- Total Events -->
                    <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                      <div class="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Total Events
                      </div>
                      <div class="text-3xl font-bold">
                        ${summary.totalEvents.toLocaleString()}
                      </div>
                      <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                        Last 24 hours
                      </div>
                    </div>

                    <!-- Unique Users -->
                    <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                      <div class="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Unique Users
                      </div>
                      <div class="text-3xl font-bold">
                        ${summary.uniqueUsers.toLocaleString()}
                      </div>
                      <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                        Active users
                      </div>
                    </div>

                    <!-- Top Events Count -->
                    <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                      <div class="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Event Types
                      </div>
                      <div class="text-3xl font-bold">
                        ${summary.topEvents.length}
                      </div>
                      <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                        Tracked event types
                      </div>
                    </div>

                    <!-- Top Paths Count -->
                    <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                      <div class="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Pages Tracked
                      </div>
                      <div class="text-3xl font-bold">
                        ${summary.topPaths.length}
                      </div>
                      <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                        Unique pages
                      </div>
                    </div>
                  </div>

                  <!-- Charts Section -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Top Events -->
                    <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                      <h3 class="font-semibold text-lg mb-4">Top Events</h3>
                      <div class="space-y-3">
                        ${summary.topEvents.slice(0, 5).map(e => html`
                          <div class="flex items-center justify-between">
                            <span class="text-sm text-zinc-600 dark:text-zinc-400">${e.eventType}</span>
                            <span class="font-semibold">${e.count.toLocaleString()}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>

                    <!-- Top Paths -->
                    <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                      <h3 class="font-semibold text-lg mb-4">Top Paths</h3>
                      <div class="space-y-3">
                        ${summary.topPaths.slice(0, 5).map(p => html`
                          <div class="flex items-center justify-between">
                            <span class="text-sm text-zinc-600 dark:text-zinc-400 truncate">${p.path}</span>
                            <span class="font-semibold">${p.count.toLocaleString()}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>

                  <!-- Info Card -->
                  <div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      📚 How to Use Analytics Example Plugin
                    </h3>
                    <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                      <li>✓ Track events: POST /api/analytics-example/track</li>
                      <li>✓ Get events by type: GET /api/analytics-example/events/{type}</li>
                      <li>✓ Get user events: GET /api/analytics-example/user/{userId}/events</li>
                      <li>✓ View summary: GET /api/analytics-example/summary</li>
                      <li>✓ Automatic cleanup of events older than 90 days</li>
                    </ul>
                  </div>
                </div>
              </main>
            </div>
          </body>
        </html>
      `)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error rendering page'
      return c.html(`<div style="color: red;">Error: ${message}</div>`)
    }
  })

  builder.addRoute('/admin/analytics-example', adminRoutes, {
    description: 'Analytics dashboard page',
    requiresAuth: true,
    priority: 85
  })

  // ============================================================================
  // 6. MENU ITEMS
  // ============================================================================

  builder.addMenuItem('Analytics Example', '/admin/analytics-example', {
    icon: 'chart-bar',
    order: 85,
    permissions: ['analytics-example:view']
  })

  // ============================================================================
  // 7. HOOKS
  // ============================================================================

  // Track when content is created
  builder.addHook('content:create', async (data, context) => {
    try {
      const analyticsService = context.context.get?.('analyticsService') as AnalyticsService | undefined
      if (analyticsService) {
        await analyticsService.trackEvent({
          eventType: 'content_created',
          path: `/api/content/${data.id}`,
          metadata: { contentType: data.type }
        })
      }
    } catch (error) {
      context.context.logger?.warn('Failed to track content creation', error)
    }
    return data
  }, { priority: 5 })

  // Track when users login
  builder.addHook('auth:login', async (data, context) => {
    try {
      const analyticsService = context.context.get?.('analyticsService') as AnalyticsService | undefined
      if (analyticsService) {
        await analyticsService.trackEvent({
          eventType: 'user_login',
          userId: data.userId,
          path: '/auth/login',
          metadata: { method: data.method }
        })
      }
    } catch (error) {
      context.context.logger?.warn('Failed to track login', error)
    }
    return data
  }, { priority: 5 })

  // ============================================================================
  // 8. LIFECYCLE HOOKS
  // ============================================================================

  builder.lifecycle({
    install: async (context: PluginContext) => {
      context.logger.info('Analytics Example Plugin installing...')

      // Run migrations
      for (const model of this.plugin.models || []) {
        for (const migration of model.migrations) {
          try {
            await context.db.exec(migration)
          } catch (error) {
            context.logger.warn(`Migration already exists: ${error}`)
          }
        }
      }

      context.logger.info('Analytics Example Plugin installed successfully')
    },

    activate: async (context: PluginContext) => {
      context.logger.info('Analytics Example Plugin activated')

      // Create service instance
      const config: AnalyticsConfig = {
        enabled: true,
        trackingEnabled: true,
        retentionDays: 90,
        samplingRate: 1.0
      }

      const analyticsService = new AnalyticsService(context.db, context.kv, config)

      // Make service available to routes
      context.hooks.register('request:start', async (data) => {
        data.analyticsService = analyticsService
        return data
      }, 1)

      // Schedule cleanup
      setInterval(async () => {
        try {
          const deleted = await analyticsService.cleanupOldEvents(config.retentionDays)
          if (deleted > 0) {
            context.logger.debug(`Cleaned up ${deleted} old analytics events`)
          }
        } catch (error) {
          context.logger.warn('Analytics cleanup failed', error as Error)
        }
      }, 24 * 60 * 60 * 1000) // Run daily

      context.logger.info('Analytics Example Plugin fully activated')
    },

    deactivate: async (context: PluginContext) => {
      context.logger.info('Analytics Example Plugin deactivated')
    }
  })

  // ============================================================================
  // 9. BUILD AND RETURN PLUGIN
  // ============================================================================

  return builder.build() as Plugin
}

export const analyticsExamplePlugin = createAnalyticsExamplePlugin()
