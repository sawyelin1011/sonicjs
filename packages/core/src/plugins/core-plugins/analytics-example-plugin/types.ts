/**
 * Analytics Example Plugin - Type Definitions
 * 
 * Demonstrates TypeScript best practices for plugin development
 */

import { z } from 'zod'

export const AnalyticsEventSchema = z.object({
  id: z.string().uuid(),
  eventType: z.string().min(1),
  userId: z.string().optional(),
  path: z.string(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.number(),
  createdAt: z.number()
})

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>

export const AnalyticsStatSchema = z.object({
  id: z.string().uuid(),
  eventType: z.string(),
  count: z.number(),
  uniqueUsers: z.number(),
  startTime: z.number(),
  endTime: z.number(),
  createdAt: z.number()
})

export type AnalyticsStat = z.infer<typeof AnalyticsStatSchema>

export interface AnalyticsConfig {
  enabled: boolean
  trackingEnabled: boolean
  retentionDays: number
  samplingRate?: number
  excludePaths?: string[]
}

export interface EventTrackingData {
  eventType: string
  userId?: string
  path: string
  userAgent?: string
  metadata?: Record<string, any>
}
