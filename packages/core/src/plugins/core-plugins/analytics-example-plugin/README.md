# Analytics Example Plugin

A comprehensive example plugin demonstrating all SonicJS plugin features. This plugin is designed as a learning resource for plugin developers and LLM agents understanding the SonicJS plugin ecosystem.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Configuration](#configuration)
8. [Hooks](#hooks)
9. [Development](#development)
10. [Testing](#testing)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

## Overview

The Analytics Example Plugin tracks user interactions and events across a SonicJS application. It demonstrates:

- **Plugin Structure**: Proper organization and file layout
- **Database Models**: Creating and managing database tables
- **Services**: Implementing business logic with dependency injection
- **Routes**: API endpoints for tracking and querying data
- **Middleware**: Request processing and data capture
- **Hooks**: Event subscriptions for automatic tracking
- **Admin UI**: Dashboard for visualizing analytics
- **Configuration**: Plugin-level configuration management
- **Error Handling**: Graceful error management and logging
- **Testing**: Unit and integration test patterns
- **TypeScript**: Full type safety throughout

## Features

### Core Capabilities

- **Event Tracking**: Track any user action or system event
- **Analytics Summary**: Aggregate statistics by event type and page
- **User Tracking**: Monitor individual user activity
- **Automatic Cleanup**: Remove old events based on retention policy
- **Caching**: Fast KV-based event caching
- **Admin Dashboard**: Visual dashboard showing analytics trends

### Hooks Provided

- `content:create` - Track when content is created
- `auth:login` - Track user login events

### Admin Features

- Analytics dashboard at `/admin/analytics-example`
- Real-time statistics display
- Top events and pages visualization
- Configuration management UI

## Architecture

```
analytics-example-plugin/
├── index.ts                      # Main plugin definition
├── types.ts                      # TypeScript type definitions
├── manifest.json                 # Plugin metadata
├── services/
│   └── AnalyticsService.ts      # Business logic
├── middleware/
│   └── tracking.ts              # Request tracking middleware
├── migrations/                   # (Optional) Database migrations
├── __tests__/
│   └── plugin.test.ts           # Test suite
└── README.md                     # This file
```

### Component Responsibilities

#### `index.ts` - Plugin Definition
- Creates the plugin using PluginBuilder
- Defines routes for API and admin UI
- Configures database models
- Registers middleware
- Registers hook handlers
- Implements lifecycle methods

#### `types.ts` - Type Definitions
- Zod schemas for validation
- TypeScript interfaces
- Configuration types

#### `services/AnalyticsService.ts` - Business Logic
- Event tracking logic
- Analytics aggregation
- Data persistence
- Cache management

#### `middleware/tracking.ts` - Request Processing
- Captures incoming request metadata
- Filters excluded paths
- Prepares data for tracking

## Installation

### In a SonicJS Application

```typescript
// src/app.ts
import { analyticsExamplePlugin } from '@sonicjs-cms/core/plugins/core-plugins/analytics-example-plugin'
import { pluginManager } from './plugins'

await pluginManager.install(analyticsExamplePlugin, {
  enabled: true,
  trackingEnabled: true,
  retentionDays: 90
})
```

### Plugin Manager Setup

```typescript
const pluginManager = new PluginManager()
await pluginManager.initialize(pluginContext)
await pluginManager.install(analyticsExamplePlugin)
```

## API Reference

### Track Event

**Endpoint**: `POST /api/analytics-example/track`

**Request Body**:
```json
{
  "eventType": "button_click",
  "userId": "user123",
  "path": "/dashboard",
  "metadata": {
    "buttonId": "submit-btn",
    "section": "form"
  }
}
```

**Response**:
```json
{
  "success": true,
  "event": {
    "id": "uuid",
    "eventType": "button_click",
    "userId": "user123",
    "path": "/dashboard",
    "timestamp": 1699000000000,
    "createdAt": 1699000000000
  }
}
```

### Get Events by Type

**Endpoint**: `GET /api/analytics-example/events/{type}?limit=100`

**Parameters**:
- `type` (string, required): Event type to retrieve
- `limit` (integer, optional): Maximum results (default: 100, max: 1000)

**Response**:
```json
{
  "events": [
    {
      "id": "uuid",
      "eventType": "page_view",
      "userId": "user123",
      "path": "/home",
      "timestamp": 1699000000000,
      "createdAt": 1699000000000
    }
  ]
}
```

### Get User Events

**Endpoint**: `GET /api/analytics-example/user/{userId}/events?limit=50`

**Parameters**:
- `userId` (string, required): User identifier
- `limit` (integer, optional): Maximum results (default: 50, max: 500)

**Response**:
```json
{
  "events": [
    {
      "id": "uuid",
      "eventType": "login",
      "userId": "user123",
      "path": "/auth/login",
      "timestamp": 1699000000000,
      "createdAt": 1699000000000
    }
  ]
}
```

### Get Summary Statistics

**Endpoint**: `GET /api/analytics-example/summary?hours=24`

**Parameters**:
- `hours` (integer, optional): Time period in hours (default: 24)

**Response**:
```json
{
  "totalEvents": 1500,
  "uniqueUsers": 250,
  "topEvents": [
    {"eventType": "page_view", "count": 800},
    {"eventType": "button_click", "count": 450},
    {"eventType": "form_submit", "count": 250}
  ],
  "topPaths": [
    {"path": "/", "count": 600},
    {"path": "/products", "count": 400},
    {"path": "/checkout", "count": 300}
  ]
}
```

## Database Schema

### analytics_events Table

Stores individual tracked events.

```sql
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  eventType TEXT NOT NULL,
  userId TEXT,
  path TEXT NOT NULL,
  referrer TEXT,
  userAgent TEXT,
  metadata TEXT,
  timestamp INTEGER NOT NULL,
  createdAt INTEGER NOT NULL
)
```

**Fields**:
- `id`: Unique event identifier (UUID)
- `eventType`: Type of event (e.g., "page_view", "button_click")
- `userId`: Associated user (optional)
- `path`: Request path
- `referrer`: HTTP referrer
- `userAgent`: User agent string
- `metadata`: JSON-serialized additional data
- `timestamp`: When event occurred (ms)
- `createdAt`: When record was created (ms)

**Indices**:
- `idx_analytics_events_type`: Fast lookup by event type
- `idx_analytics_events_userId`: Fast lookup by user
- `idx_analytics_events_timestamp`: Fast lookup by time

### analytics_stats Table

Aggregated statistics (optional for future use).

```sql
CREATE TABLE analytics_stats (
  id TEXT PRIMARY KEY,
  eventType TEXT NOT NULL,
  count INTEGER NOT NULL,
  uniqueUsers INTEGER NOT NULL,
  startTime INTEGER NOT NULL,
  endTime INTEGER NOT NULL,
  createdAt INTEGER NOT NULL
)
```

## Configuration

### Plugin Configuration

```typescript
const config = {
  enabled: true,                    // Enable/disable plugin
  trackingEnabled: true,            // Enable/disable event tracking
  retentionDays: 90,                // Keep events for N days
  samplingRate: 1.0,                // Sample 100% of events (0-1)
  excludePaths: [                   // Paths to exclude from tracking
    '/_assets',
    '/health',
    '/status'
  ]
}

await pluginManager.install(analyticsExamplePlugin, config)
```

### Access Configuration in Plugin

```typescript
plugin.lifecycle({
  activate: async (context) => {
    const retentionDays = context.config.retentionDays
    const trackingEnabled = context.config.trackingEnabled
  }
})
```

## Hooks

The plugin registers handlers for these standard hooks:

### content:create

Automatically track when new content is created.

```typescript
plugin.addHook('content:create', async (data, context) => {
  // Tracks: { eventType: 'content_created', metadata: { contentType } }
  return data
}, { priority: 5 })
```

### auth:login

Automatically track when users log in.

```typescript
plugin.addHook('auth:login', async (data, context) => {
  // Tracks: { eventType: 'user_login', userId, method }
  return data
}, { priority: 5 })
```

## Development

### Project Structure

```
analytics-example-plugin/
├── index.ts                      # Main entry point
├── types.ts                      # TypeScript definitions
├── manifest.json                 # Plugin metadata
├── services/                     # Business logic
│   └── AnalyticsService.ts
├── middleware/                   # Request processing
│   └── tracking.ts
├── __tests__/                    # Test suite
│   └── plugin.test.ts
└── README.md
```

### Adding New Features

**1. Add a New Route**

```typescript
// In index.ts
routes.get('/custom', async (c) => {
  return c.json({ data: 'value' })
})

builder.addRoute('/api/analytics-example', routes)
```

**2. Add a New Hook Handler**

```typescript
builder.addHook('user:logout', async (data, context) => {
  // Handle logout event
  return data
})
```

**3. Add a New Service Method**

```typescript
// In AnalyticsService.ts
async exportEvents(eventType: string): Promise<string> {
  const events = await this.getEventsByType(eventType)
  return JSON.stringify(events)
}
```

**4. Add Database Model**

```typescript
builder.addModel('NewModel', {
  tableName: 'new_table',
  schema: z.object({ ... }),
  migrations: [`CREATE TABLE ...`]
})
```

### Running Tests

```bash
npm run test -- analytics-example-plugin

# With coverage
npm run test:coverage -- analytics-example-plugin

# Watch mode
npm run test:watch -- analytics-example-plugin
```

### Building

```bash
npm run build

# Build with type checking
npm run build:check
```

## Testing

### Unit Tests

Test individual components in isolation:

```typescript
describe('AnalyticsService', () => {
  it('should track events', async () => {
    const event = await service.trackEvent({
      eventType: 'test',
      path: '/test'
    })
    expect(event.id).toBeDefined()
  })
})
```

### Integration Tests

Test with real SonicJS app:

```typescript
it('should work with app', async () => {
  const response = await app.request('/api/analytics-example/track', {
    method: 'POST',
    body: { eventType: 'test', path: '/test' }
  })
  expect(response.status).toBe(201)
})
```

### Running Tests

```bash
# All tests
npm run test

# Specific file
npm run test -- plugin.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Best Practices

### 1. Always Validate Input

```typescript
const schema = z.object({
  eventType: z.string().min(1),
  path: z.string()
})
const validated = schema.parse(data)
```

### 2. Handle Errors Gracefully

```typescript
try {
  await analyticsService.trackEvent(data)
} catch (error) {
  context.logger.error('Tracking failed', error)
  // Don't throw - let app continue
}
```

### 3. Use Appropriate Logging

```typescript
context.logger.debug('Detailed debug info', { data })
context.logger.info('Important event occurred')
context.logger.warn('Unusual condition', warning)
context.logger.error('Critical failure', error)
```

### 4. Cache Expensive Operations

```typescript
const cached = await context.kv.get('key')
if (cached) return JSON.parse(cached)

const result = await expensiveOp()
await context.kv.put('key', JSON.stringify(result))
```

### 5. Type Everything

```typescript
// ✓ Good
const trackEvent = async (data: EventTrackingData): Promise<AnalyticsEvent> => {
  // ...
}

// ✗ Avoid
const trackEvent = async (data) => {
  // ...
}
```

### 6. Write Descriptive Comments

```typescript
/**
 * Track an event
 * 
 * @param data - Event data to track
 * @returns Stored event
 * @throws Error if tracking is disabled
 */
async trackEvent(data: EventTrackingData): Promise<AnalyticsEvent> {
  // ...
}
```

### 7. Clean Up Resources

```typescript
plugin.lifecycle({
  deactivate: async (context) => {
    // Clear KV cache
    // Stop timers
    // Close connections
    context.logger.info('Cleaned up')
  }
})
```

## Troubleshooting

### Plugin Won't Activate

**Check**:
1. Database migrations have run
2. All dependencies are loaded
3. Configuration is valid

```typescript
const result = await context.db.exec(migration)
```

### Events Not Being Tracked

**Check**:
1. `trackingEnabled` is `true` in config
2. Path is not excluded
3. Service is properly initialized

```typescript
const service = new AnalyticsService(db, kv, config)
```

### Slow Query Performance

**Check**:
1. Database indices exist
2. Not querying too large date range
3. KV caching is working

### Out of Memory

**Check**:
1. Event cache size
2. Running cleanup regularly
3. Retention policy is reasonable

---

## Examples

### Track Page Views

```javascript
// Client-side tracking
fetch('/api/analytics-example/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'page_view',
    path: window.location.pathname,
    userId: currentUser.id
  })
})
```

### Track Button Clicks

```typescript
// In route handler
routes.post('/submit', async (c) => {
  const trackingData = c.get('tracking')
  
  await analyticsService.trackEvent({
    eventType: 'form_submit',
    path: trackingData.path,
    metadata: { formId: 'contact-form' }
  })
  
  return c.json({ success: true })
})
```

### Custom Analytics

```typescript
// Get specific statistics
const summary = await analyticsService.getSummary(24)
const userEvents = await analyticsService.getEventsByUser('user123')
const typeEvents = await analyticsService.getEventsByType('page_view')
```

---

**Last Updated**: November 2024  
**SonicJS Version**: 2.0.0+  
**Plugin Version**: 1.0.0-example.1
