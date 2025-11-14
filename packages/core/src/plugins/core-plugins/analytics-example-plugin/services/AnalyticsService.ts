/**
 * Analytics Service
 * 
 * Business logic for analytics tracking and reporting
 */

import { D1Database, KVNamespace } from '@cloudflare/workers-types'
import { AnalyticsEvent, AnalyticsEventSchema, EventTrackingData, AnalyticsConfig } from '../types'

export class AnalyticsService {
  private readonly dbPrefix = 'analytics:'
  private eventCache: Map<string, AnalyticsEvent> = new Map()

  constructor(
    private db: D1Database,
    private kv: KVNamespace,
    private config: AnalyticsConfig
  ) {}

  /**
   * Track an event
   */
  async trackEvent(data: EventTrackingData): Promise<AnalyticsEvent> {
    if (!this.config.trackingEnabled) {
      throw new Error('Tracking is disabled')
    }

    const event: AnalyticsEvent = {
      id: this.generateId(),
      eventType: data.eventType,
      userId: data.userId,
      path: data.path,
      referrer: data.userAgent?.split('|')[0],
      userAgent: data.userAgent,
      metadata: data.metadata,
      timestamp: Date.now(),
      createdAt: Date.now()
    }

    // Validate event structure
    const validated = AnalyticsEventSchema.parse(event)

    // Store in database
    await this.db.prepare(`
      INSERT INTO analytics_events (id, eventType, userId, path, referrer, userAgent, metadata, timestamp, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      validated.id,
      validated.eventType,
      validated.userId,
      validated.path,
      validated.referrer,
      validated.userAgent,
      JSON.stringify(validated.metadata || {}),
      validated.timestamp,
      validated.createdAt
    ).run()

    // Cache in KV for quick access
    await this.cacheEvent(validated)

    return validated
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: string, limit: number = 100): Promise<AnalyticsEvent[]> {
    const result = await this.db.prepare(`
      SELECT * FROM analytics_events
      WHERE eventType = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).bind(eventType, limit).all()

    return (result.results as any[]).map(row => ({
      id: row.id,
      eventType: row.eventType,
      userId: row.userId,
      path: row.path,
      referrer: row.referrer,
      userAgent: row.userAgent,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      timestamp: row.timestamp,
      createdAt: row.createdAt
    }))
  }

  /**
   * Get events for user
   */
  async getEventsByUser(userId: string, limit: number = 50): Promise<AnalyticsEvent[]> {
    const result = await this.db.prepare(`
      SELECT * FROM analytics_events
      WHERE userId = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).bind(userId, limit).all()

    return (result.results as any[]).map(row => ({
      id: row.id,
      eventType: row.eventType,
      userId: row.userId,
      path: row.path,
      referrer: row.referrer,
      userAgent: row.userAgent,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      timestamp: row.timestamp,
      createdAt: row.createdAt
    }))
  }

  /**
   * Get analytics summary
   */
  async getSummary(hours: number = 24): Promise<{
    totalEvents: number
    uniqueUsers: number
    topEvents: Array<{ eventType: string; count: number }>
    topPaths: Array<{ path: string; count: number }>
  }> {
    const since = Date.now() - (hours * 60 * 60 * 1000)

    // Total events
    const totalResult = await this.db.prepare(`
      SELECT COUNT(*) as count FROM analytics_events WHERE timestamp > ?
    `).bind(since).first()

    // Unique users
    const uniqueResult = await this.db.prepare(`
      SELECT COUNT(DISTINCT userId) as count FROM analytics_events WHERE timestamp > ?
    `).bind(since).first()

    // Top events
    const topEventsResult = await this.db.prepare(`
      SELECT eventType, COUNT(*) as count FROM analytics_events
      WHERE timestamp > ?
      GROUP BY eventType
      ORDER BY count DESC
      LIMIT 10
    `).bind(since).all()

    // Top paths
    const topPathsResult = await this.db.prepare(`
      SELECT path, COUNT(*) as count FROM analytics_events
      WHERE timestamp > ?
      GROUP BY path
      ORDER BY count DESC
      LIMIT 10
    `).bind(since).all()

    return {
      totalEvents: (totalResult as any)?.count || 0,
      uniqueUsers: (uniqueResult as any)?.count || 0,
      topEvents: (topEventsResult.results as any[]).map(r => ({
        eventType: r.eventType,
        count: r.count
      })),
      topPaths: (topPathsResult.results as any[]).map(r => ({
        path: r.path,
        count: r.count
      }))
    }
  }

  /**
   * Clear old events (retention cleanup)
   */
  async cleanupOldEvents(retentionDays: number = 90): Promise<number> {
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000)

    const result = await this.db.prepare(`
      DELETE FROM analytics_events WHERE createdAt < ?
    `).bind(cutoffTime).run()

    return result.meta.changes || 0
  }

  /**
   * Cache event in KV
   */
  private async cacheEvent(event: AnalyticsEvent): Promise<void> {
    const cacheKey = `${this.dbPrefix}${event.id}`
    await this.kv.put(cacheKey, JSON.stringify(event), {
      expirationTtl: 24 * 60 * 60 // 24 hours
    })
  }

  /**
   * Get event from cache
   */
  async getEventFromCache(eventId: string): Promise<AnalyticsEvent | null> {
    const cached = await this.kv.get(`${this.dbPrefix}${eventId}`)
    if (!cached) return null
    return JSON.parse(cached)
  }

  /**
   * Generate unique ID (simplified UUID)
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<AnalyticsConfig>): Promise<void> {
    Object.assign(this.config, config)
  }

  /**
   * Get current configuration
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config }
  }
}
