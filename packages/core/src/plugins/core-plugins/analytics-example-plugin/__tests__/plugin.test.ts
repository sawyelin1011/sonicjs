/**
 * Analytics Example Plugin - Test Suite
 * 
 * Demonstrates testing patterns for SonicJS plugins
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { PluginContext, Plugin } from '@sonicjs-cms/core'
import { analyticsExamplePlugin } from '../index'
import { AnalyticsService } from '../services/AnalyticsService'

/**
 * Mock PluginContext for testing
 */
function createMockContext(): PluginContext {
  return {
    db: {
      prepare: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue({}),
      all: vi.fn().mockResolvedValue([]),
      first: vi.fn().mockResolvedValue(null),
      run: vi.fn().mockResolvedValue({})
    } as any,
    kv: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue({ keys: [] })
    } as any,
    config: {
      enabled: true,
      trackingEnabled: true,
      retentionDays: 90
    },
    services: {
      auth: {} as any,
      content: {} as any,
      media: {} as any
    },
    hooks: {
      register: vi.fn(),
      execute: vi.fn(),
      unregister: vi.fn(),
      getHooks: vi.fn().mockReturnValue([])
    } as any,
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }
  }
}

describe('Analytics Example Plugin', () => {
  let context: PluginContext
  let plugin: Plugin

  beforeEach(() => {
    context = createMockContext()
    plugin = analyticsExamplePlugin
  })

  describe('Plugin Structure', () => {
    it('should have correct plugin metadata', () => {
      expect(plugin.name).toBe('analytics-example')
      expect(plugin.version).toMatch(/^\d+\.\d+\.\d+/)
      expect(plugin.description).toBeDefined()
      expect(plugin.author).toBeDefined()
    })

    it('should define database models', () => {
      expect(plugin.models).toBeDefined()
      expect(plugin.models?.length).toBeGreaterThan(0)
    })

    it('should define routes', () => {
      expect(plugin.routes).toBeDefined()
      expect(plugin.routes?.length).toBeGreaterThan(0)
    })

    it('should define middleware', () => {
      expect(plugin.middleware).toBeDefined()
      expect(plugin.middleware?.length).toBeGreaterThan(0)
    })

    it('should define admin page route', () => {
      expect(plugin.routes).toBeDefined()
      const adminRoute = plugin.routes?.find(r => r.path.includes('admin'))
      expect(adminRoute).toBeDefined()
    })

    it('should define menu item', () => {
      expect(plugin.menuItems).toBeDefined()
      expect(plugin.menuItems?.length).toBeGreaterThan(0)
      expect(plugin.menuItems?.[0].label).toContain('Analytics')
    })

    it('should define hooks', () => {
      expect(plugin.hooks).toBeDefined()
      expect(plugin.hooks?.length).toBeGreaterThan(0)
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should have install lifecycle method', () => {
      expect(plugin.install).toBeDefined()
      expect(typeof plugin.install).toBe('function')
    })

    it('should have activate lifecycle method', () => {
      expect(plugin.activate).toBeDefined()
      expect(typeof plugin.activate).toBe('function')
    })

    it('should have deactivate lifecycle method', () => {
      expect(plugin.deactivate).toBeDefined()
      expect(typeof plugin.deactivate).toBe('function')
    })

    it('should log when activating', async () => {
      if (plugin.activate) {
        await plugin.activate(context)
        expect(context.logger.info).toHaveBeenCalled()
      }
    })
  })

  describe('Database Models', () => {
    it('should have analytics_events model', () => {
      const eventsModel = plugin.models?.find(m => m.tableName === 'analytics_events')
      expect(eventsModel).toBeDefined()
      expect(eventsModel?.migrations.length).toBeGreaterThan(0)
    })

    it('should have analytics_stats model', () => {
      const statsModel = plugin.models?.find(m => m.tableName === 'analytics_stats')
      expect(statsModel).toBeDefined()
      expect(statsModel?.migrations.length).toBeGreaterThan(0)
    })

    it('should include database indices in migrations', () => {
      const eventsModel = plugin.models?.find(m => m.tableName === 'analytics_events')
      const migrations = eventsModel?.migrations || []
      const hasIndices = migrations.some(m => m.includes('INDEX'))
      expect(hasIndices).toBe(true)
    })
  })

  describe('Routes', () => {
    it('should define API route prefix', () => {
      const apiRoute = plugin.routes?.find(r => r.path.includes('api'))
      expect(apiRoute).toBeDefined()
      expect(apiRoute?.path).toContain('analytics-example')
    })

    it('should require authentication for admin routes', () => {
      const adminRoute = plugin.routes?.find(r => r.path.includes('admin'))
      expect(adminRoute?.requiresAuth).toBe(true)
    })
  })

  describe('Hooks', () => {
    it('should register content:create hook', () => {
      const hooks = plugin.hooks || []
      const contentHook = hooks.find(h => h.name === 'content:create')
      expect(contentHook).toBeDefined()
    })

    it('should register auth:login hook', () => {
      const hooks = plugin.hooks || []
      const loginHook = hooks.find(h => h.name === 'auth:login')
      expect(loginHook).toBeDefined()
    })

    it('should have hook handlers', () => {
      const hooks = plugin.hooks || []
      hooks.forEach(hook => {
        expect(hook.handler).toBeDefined()
        expect(typeof hook.handler).toBe('function')
      })
    })
  })

  describe('Menu Items', () => {
    it('should define admin menu item', () => {
      expect(plugin.menuItems).toBeDefined()
      const adminMenu = plugin.menuItems?.[0]
      expect(adminMenu?.label).toBeDefined()
      expect(adminMenu?.path).toBeDefined()
      expect(adminMenu?.path).toContain('admin')
    })

    it('should have icon for menu item', () => {
      const adminMenu = plugin.menuItems?.[0]
      expect(adminMenu?.icon).toBeDefined()
    })

    it('should have order for menu item', () => {
      const adminMenu = plugin.menuItems?.[0]
      expect(adminMenu?.order).toBeDefined()
      expect(adminMenu?.order).toBeGreaterThan(0)
    })
  })

  describe('Configuration', () => {
    it('should support configuration', () => {
      const config = plugin.configure ? true : false
      expect(config).toBe(true)
    })
  })

  describe('Middleware', () => {
    it('should have tracking middleware', () => {
      expect(plugin.middleware).toBeDefined()
      const trackingMiddleware = plugin.middleware?.find(m => m.name.includes('tracking'))
      expect(trackingMiddleware).toBeDefined()
    })

    it('should have global middleware enabled', () => {
      const trackingMiddleware = plugin.middleware?.find(m => m.name.includes('tracking'))
      expect(trackingMiddleware?.global).toBe(true)
    })
  })
})

describe('AnalyticsService', () => {
  let service: AnalyticsService
  let mockDb: any
  let mockKv: any
  let config: any

  beforeEach(() => {
    mockDb = {
      prepare: vi.fn().mockReturnThis(),
      bind: vi.fn().mockReturnThis(),
      run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
      all: vi.fn().mockResolvedValue({ results: [] }),
      first: vi.fn().mockResolvedValue({ count: 0 })
    }

    mockKv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined)
    }

    config = {
      enabled: true,
      trackingEnabled: true,
      retentionDays: 90
    }

    service = new AnalyticsService(mockDb, mockKv, config)
  })

  describe('trackEvent', () => {
    it('should throw if tracking is disabled', async () => {
      service = new AnalyticsService(mockDb, mockKv, {
        ...config,
        trackingEnabled: false
      })

      await expect(
        service.trackEvent({
          eventType: 'test',
          path: '/test'
        })
      ).rejects.toThrow('Tracking is disabled')
    })

    it('should track an event', async () => {
      const event = await service.trackEvent({
        eventType: 'page_view',
        path: '/home',
        userId: 'user123'
      })

      expect(event.id).toBeDefined()
      expect(event.eventType).toBe('page_view')
      expect(event.path).toBe('/home')
      expect(event.userId).toBe('user123')
    })

    it('should store event in database', async () => {
      await service.trackEvent({
        eventType: 'click',
        path: '/button'
      })

      expect(mockDb.prepare).toHaveBeenCalled()
      expect(mockDb.run).toHaveBeenCalled()
    })

    it('should cache event in KV', async () => {
      await service.trackEvent({
        eventType: 'test',
        path: '/test'
      })

      expect(mockKv.put).toHaveBeenCalled()
    })
  })

  describe('getEventsByType', () => {
    it('should retrieve events by type', async () => {
      mockDb.all.mockResolvedValue({
        results: [
          {
            id: '1',
            eventType: 'click',
            path: '/button',
            timestamp: Date.now(),
            createdAt: Date.now()
          }
        ]
      })

      const events = await service.getEventsByType('click', 100)

      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe('click')
    })

    it('should limit results', async () => {
      await service.getEventsByType('click', 50)
      expect(mockDb.prepare).toHaveBeenCalled()
    })
  })

  describe('getSummary', () => {
    it('should return analytics summary', async () => {
      mockDb.first.mockResolvedValue({ count: 100 })
      mockDb.all.mockResolvedValue({ results: [] })

      const summary = await service.getSummary(24)

      expect(summary).toHaveProperty('totalEvents')
      expect(summary).toHaveProperty('uniqueUsers')
      expect(summary).toHaveProperty('topEvents')
      expect(summary).toHaveProperty('topPaths')
    })

    it('should handle empty results', async () => {
      mockDb.first.mockResolvedValue(null)
      mockDb.all.mockResolvedValue({ results: [] })

      const summary = await service.getSummary(24)

      expect(summary.totalEvents).toBe(0)
      expect(summary.uniqueUsers).toBe(0)
      expect(summary.topEvents).toHaveLength(0)
    })
  })

  describe('cleanupOldEvents', () => {
    it('should delete old events', async () => {
      mockDb.run.mockResolvedValue({ meta: { changes: 50 } })

      const deleted = await service.cleanupOldEvents(90)

      expect(deleted).toBe(50)
      expect(mockDb.prepare).toHaveBeenCalled()
    })
  })

  describe('Configuration', () => {
    it('should get current configuration', () => {
      const cfg = service.getConfig()
      expect(cfg).toEqual(config)
    })

    it('should update configuration', async () => {
      await service.updateConfig({ trackingEnabled: false })
      const cfg = service.getConfig()
      expect(cfg.trackingEnabled).toBe(false)
    })
  })
})
