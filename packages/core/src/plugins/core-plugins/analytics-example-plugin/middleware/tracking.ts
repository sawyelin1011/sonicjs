/**
 * Analytics Tracking Middleware
 * 
 * Captures incoming requests for analytics
 */

import type { Context, Next, MiddlewareHandler } from 'hono'

export interface TrackingOptions {
  excludePaths?: string[]
  trackQueryParams?: boolean
}

export const createTrackingMiddleware = (options: TrackingOptions = {}): MiddlewareHandler => {
  const excludePaths = options.excludePaths || [
    '/_assets',
    '/admin/analytics-example',
    '/health',
    '/status'
  ]

  return async (c: Context, next: Next) => {
    const path = c.req.path

    // Check if path should be excluded
    const isExcluded = excludePaths.some(excluded => path.startsWith(excluded))

    if (isExcluded) {
      await next()
      return
    }

    // Store request info for later access by routes
    const trackingData = {
      method: c.req.method,
      path: path,
      userAgent: c.req.header('user-agent'),
      referrer: c.req.header('referer'),
      timestamp: Date.now()
    }

    c.set('tracking', trackingData)

    await next()
  }
}
