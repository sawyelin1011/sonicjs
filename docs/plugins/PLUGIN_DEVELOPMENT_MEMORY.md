# SonicJS Plugin Development - LLM Memory Guide

> **Purpose**: Quick reference guide for AI/LLM agents working with SonicJS plugins. Contains essential patterns, conventions, and gotchas to remember.

## Quick Memory Snapshot

### Plugin Naming Conventions
- **Plugin ID**: `lowercase-with-hyphens` (e.g., `cache-plugin`, `email-plugin`)
- **Directories**: `/src/plugins/plugin-name/`
- **DB tables**: `snake_case` (e.g., `user_sessions`, `cache_entries`)
- **Classes**: `PascalCase` (e.g., `CacheService`, `EmailHandler`)
- **Functions**: `camelCase` (e.g., `getUserData()`, `sendEmail()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)

### Directory Structure (Standard)
```
src/plugins/my-plugin/
├── index.ts                # Main plugin export
├── manifest.json           # Plugin metadata
├── types.ts                # Type definitions + Zod schemas
├── services/               # Business logic classes
├── middleware/             # Request/response processing
├── models/                 # Database schemas
├── migrations/             # SQL migration files
├── __tests__/              # Test files
└── README.md               # Documentation
```

## Essential Patterns

### Pattern 1: Create Plugin with PluginBuilder

```typescript
import { PluginBuilder } from '../sdk/plugin-builder'

const plugin = PluginBuilder.create({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'What it does'
})
  .metadata({
    author: { name: 'Author' },
    license: 'MIT'
  })
  .addRoute('/api/plugin', honoRouter)
  .lifecycle({
    activate: async (context) => { ... }
  })
  .build()

export const myPlugin = plugin
```

### Pattern 2: Database Model Definition

```typescript
builder.addModel('MyModel', {
  tableName: 'my_models',
  schema: z.object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.number()
  }),
  migrations: [
    `CREATE TABLE my_models (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )`,
    `CREATE INDEX idx_my_models_created ON my_models(createdAt)`
  ]
})
```

### Pattern 3: Service with Database Access

```typescript
export class MyService {
  constructor(
    private db: D1Database,
    private kv: KVNamespace,
    private config: PluginConfig
  ) {}

  async getData(id: string) {
    // Check KV cache first
    const cached = await this.kv.get(`data:${id}`)
    if (cached) return JSON.parse(cached)

    // Query database
    const result = await this.db
      .prepare('SELECT * FROM data WHERE id = ?')
      .bind(id)
      .first()

    // Cache result
    if (result) {
      await this.kv.put(`data:${id}`, JSON.stringify(result), {
        expirationTtl: 3600
      })
    }

    return result
  }
}
```

### Pattern 4: Hook Handler

```typescript
plugin.addHook('content:create', async (data, context) => {
  context.logger.info('Content created', data.id)
  
  // Process event
  const enriched = {
    ...data,
    customField: 'processed'
  }
  
  // Return modified data
  return enriched
}, { priority: 10 })
```

### Pattern 5: API Route with Validation

```typescript
const routes = new Hono()

routes.post('/data', async (c) => {
  try {
    // Validate input
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email()
    })
    const body = await c.req.json()
    const validated = schema.parse(body)

    // Get service from context
    const service = c.get('myService')
    const result = await service.create(validated)

    return c.json(result, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error'
    return c.json({ error: message }, 400)
  }
})

builder.addRoute('/api/my-plugin', routes)
```

### Pattern 6: Admin Page with Form

```typescript
const adminRoutes = new Hono()

adminRoutes.get('/', async (c) => {
  const service = c.get('myService')
  const settings = await service.getSettings()

  return c.html(html`
    <form id="settingsForm">
      <input name="apiKey" value="${settings.apiKey || ''}" />
      <button type="submit">Save</button>
    </form>
    <script>
      document.getElementById('settingsForm').onsubmit = async (e) => {
        e.preventDefault()
        const data = new FormData(e.target)
        await fetch('/api/my-plugin/settings', {
          method: 'POST',
          body: JSON.stringify(Object.fromEntries(data))
        })
      }
    </script>
  `)
})

builder.addRoute('/admin/my-plugin', adminRoutes, {
  requiresAuth: true
})
```

### Pattern 7: Lifecycle Methods

```typescript
plugin.lifecycle({
  install: async (context) => {
    // Run migrations
    for (const model of plugin.models || []) {
      for (const migration of model.migrations) {
        await context.db.exec(migration)
      }
    }
    context.logger.info('Plugin installed')
  },

  activate: async (context) => {
    // Initialize services
    const service = new MyService(context.db, context.kv, context.config)
    context.set('myService', service)
    
    // Register hooks
    context.hooks.register('event:name', handler)
    
    context.logger.info('Plugin activated')
  },

  deactivate: async (context) => {
    // Cleanup
    context.logger.info('Plugin deactivated')
  }
})
```

## Important Gotchas & Reminders

### ✓ DO

- ✓ Use `PluginBuilder` for plugin creation (fluent API is cleaner)
- ✓ Always validate input with Zod schemas
- ✓ Use `context.logger` instead of `console`
- ✓ Return modified data from hooks (don't just execute side effects)
- ✓ Use KV for caching expensive operations
- ✓ Create database indices for frequently queried columns
- ✓ Include proper error handling in try-catch blocks
- ✓ Use TypeScript types everywhere for type safety
- ✓ Test plugins with real SonicJS app context
- ✓ Run migrations safely (check if table exists)

### ✗ DON'T

- ✗ Don't use `console.log` - use `context.logger`
- ✗ Don't forget migrations for database changes
- ✗ Don't skip input validation
- ✗ Don't use camelCase for database tables (use snake_case)
- ✗ Don't hardcode configuration values
- ✗ Don't throw errors in hooks (log and return data instead)
- ✗ Don't cache things that change frequently
- ✗ Don't forget error handling in async functions
- ✗ Don't create plugin without testing
- ✗ Don't modify global state directly

## Hook System Details

### Standard Hooks Available

```
APP_INIT                    // App initializing
APP_READY                   // App ready
APP_SHUTDOWN                // App shutting down

REQUEST_START               // Request received
REQUEST_END                 // Response sent
REQUEST_ERROR               // Error in request

AUTH_LOGIN                  // User login
AUTH_LOGOUT                 // User logout
AUTH_REGISTER               // New user registered

CONTENT_CREATE              // Content created
CONTENT_UPDATE              // Content updated
CONTENT_DELETE              // Content deleted
CONTENT_PUBLISH             // Content published

MEDIA_UPLOAD                // File uploaded
MEDIA_DELETE                // File deleted

PLUGIN_INSTALL              // Plugin installed
PLUGIN_ACTIVATE             // Plugin activated
PLUGIN_DEACTIVATE           // Plugin deactivated

ADMIN_MENU_RENDER           // Menu rendering
ADMIN_PAGE_RENDER           // Page rendering

DB_MIGRATE                  // Database migrating
DB_SEED                     // Database seeding
```

### Hook Execution Order

- Hooks execute in **priority order** (lower number = earlier)
- Default priority is `10`
- Can cancel further execution with `context.cancel()`
- All handlers receive and return data
- Exceptions logged but don't stop other handlers

### Hook Handler Signature

```typescript
(data: any, context: HookContext) => Promise<any>

// Context has:
{
  plugin: string              // Plugin that registered this
  context: PluginContext      // Full plugin context
  cancel?: () => void         // Stop other handlers
}
```

## PluginContext Properties

```typescript
interface PluginContext {
  db: D1Database              // Database queries
  kv: KVNamespace             // Key-value cache
  r2?: R2Bucket               // File storage
  config: PluginConfig        // Plugin settings
  services: {
    auth: AuthService
    content: ContentService
    media: MediaService
  }
  hooks: HookSystem           // Hook registration
  logger: PluginLogger        // Logging: debug/info/warn/error
}
```

## Logging Levels

```typescript
context.logger.debug('Dev-only info', { data })  // Not in production
context.logger.info('Important event')            // Normal operation
context.logger.warn('Unusual condition', warn)    // Potential problem
context.logger.error('Failure', error, { data })  // Error occurred
```

Output format: `[Plugin:plugin-name] Message`

## Database Query Patterns

### Single Row

```typescript
const row = await db
  .prepare('SELECT * FROM table WHERE id = ?')
  .bind(id)
  .first()
```

### Multiple Rows

```typescript
const { results } = await db
  .prepare('SELECT * FROM table WHERE type = ?')
  .bind('type')
  .all()
```

### Insert/Update/Delete

```typescript
const { meta } = await db
  .prepare('INSERT INTO table (id, name) VALUES (?, ?)')
  .bind(id, name)
  .run()

console.log(meta.changes)  // Number of rows affected
```

### Run Migration

```typescript
try {
  await context.db.exec(`CREATE TABLE IF NOT EXISTS ...`)
} catch (error) {
  context.logger.warn('Migration may already exist', error)
}
```

## Validation with Zod

### Basic Validation

```typescript
import { z } from 'zod'

const schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive(),
  active: z.boolean().optional()
})

const validated = schema.parse(data)  // Throws on invalid
const safe = schema.safeParse(data)   // Returns {success, data/error}
```

### Create Type from Schema

```typescript
type MyData = z.infer<typeof schema>
```

## Configuration Management

### Store Configuration

```typescript
const config = {
  enabled: true,
  apiKey: 'secret',
  maxRetries: 3
}

await pluginManager.install(plugin, config)
```

### Access Configuration

```typescript
plugin.lifecycle({
  activate: async (context) => {
    const apiKey = context.config.apiKey
    const maxRetries = context.config.maxRetries
  }
})
```

### Update Configuration

```typescript
const service = new MyService(db, kv, config)
await service.updateConfig({ apiKey: 'new-key' })
```

## Testing Plugins

### Mock PluginContext

```typescript
const context = {
  db: { prepare: vi.fn().mockReturnThis(), ... },
  kv: { get: vi.fn(), put: vi.fn(), ... },
  config: { enabled: true },
  services: { ... },
  hooks: { register: vi.fn(), ... },
  logger: { info: vi.fn(), ... }
}
```

### Test Route Handler

```typescript
const c = {
  req: { method: 'GET', path: '/test' },
  json: vi.fn(),
  get: vi.fn(),
  set: vi.fn()
}

await handler(c)
expect(c.json).toHaveBeenCalled()
```

### Test Hook Handler

```typescript
const data = { id: '123', name: 'test' }
const context = { logger: { info: vi.fn() } }

const result = await hookHandler(data, { context })
expect(result).toEqual(data)
```

## Performance Tips

1. **Use KV for caching** - Much faster than DB queries
2. **Add indices** - For frequently queried columns
3. **Batch operations** - Reduce DB round trips
4. **Cleanup old data** - Regular maintenance
5. **Set TTL on KV** - Auto-cleanup cached data
6. **Sample events** - Not all if high volume
7. **Async operations** - Don't block requests
8. **Pagination** - Limit results in queries

## Security Checklist

- [ ] Validate all inputs with Zod
- [ ] Check user permissions before operations
- [ ] Sanitize user-provided strings
- [ ] Use prepared statements (built-in)
- [ ] Don't expose sensitive data in responses
- [ ] Log security events
- [ ] Use HTTPS for external APIs
- [ ] Rate limit API endpoints
- [ ] Encrypt sensitive configuration
- [ ] Test with malicious inputs

## Common Errors & Solutions

### Database Migration Fails
```
Error: "table already exists"
→ Use: CREATE TABLE IF NOT EXISTS
```

### Hook Not Firing
```
→ Check: Hook name matches exactly (case-sensitive)
→ Check: Plugin is activated before event occurs
→ Check: Handler doesn't throw (catches and logs)
```

### Performance Issues
```
→ Add database indices
→ Implement KV caching
→ Check database query plans
→ Reduce hook chain length
```

### Memory Leaks
```
→ Cleanup in deactivate() lifecycle
→ Set KV TTL for cache entries
→ Don't keep reference to full response objects
→ Remove event listeners
```

### Type Errors
```
→ Import types from @sonicjs-cms/core
→ Use z.infer<typeof schema> for types
→ Fully type function parameters
→ Enable strict TypeScript checking
```

## Reference Implementations

Look at these in `/src/plugins/core-plugins/` for examples:

1. **hello-world-plugin** - Simplest example (routing + UI)
2. **email-plugin** - Service with configuration (email sending)
3. **cache-plugin** - Advanced KV usage (caching system)
4. **database-tools-plugin** - Database operations
5. **workflow-plugin** - Complex state management
6. **analytics-example-plugin** - Complete example (all features!)

## Useful Commands

```bash
# Build plugin
npm run build

# Test plugin
npm run test -- plugin-name

# Test with coverage
npm run test:coverage -- plugin-name

# Watch tests
npm run test:watch -- plugin-name

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## File Templates

### Manifest Template
```json
{
  "id": "plugin-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "description": "Description",
  "author": "Author",
  "license": "MIT",
  "adminMenu": {
    "label": "Plugin",
    "path": "/admin/plugin",
    "order": 50
  }
}
```

### Plugin File Template
```typescript
import { PluginBuilder } from '../sdk/plugin-builder'
import type { Plugin } from '@sonicjs-cms/core'

export function createMyPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'my-plugin',
    version: '1.0.0',
    description: 'Description'
  })

  builder.metadata({
    author: { name: 'Author' },
    license: 'MIT'
  })

  builder.lifecycle({
    activate: async (context) => {
      context.logger.info('Activated')
    }
  })

  return builder.build() as Plugin
}

export const myPlugin = createMyPlugin()
```

---

**Last Updated**: November 2024  
**SonicJS Version**: 2.0.0+  
**Document Version**: 1.0.0
