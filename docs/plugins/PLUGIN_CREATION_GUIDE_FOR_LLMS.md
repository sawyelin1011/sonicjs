# SonicJS Plugin Creation Guide for AI/LLM Agents

> **Guide Purpose**: This document provides comprehensive, structured information for AI/LLM agents to understand and create SonicJS plugins. It prioritizes clarity, completeness, and machine readability.

## Quick Reference

### What is a SonicJS Plugin?
A modular extension to SonicJS that adds new features by implementing one or more of these extension points:
- **Routes** - API endpoints and web pages
- **Middleware** - Request/response processing
- **Models** - Database tables and schemas  
- **Services** - Reusable business logic
- **Hooks** - Event subscriptions for extensibility
- **Admin Pages** - Administrative UI pages
- **Components** - Reusable UI components
- **Menu Items** - Navigation entries

---

## 1. PLUGIN STRUCTURE AND FILES

### Standard Plugin Directory Layout

```
src/plugins/your-plugin-name/
├── index.ts                    # Main plugin definition
├── manifest.json               # Plugin metadata
├── README.md                   # Plugin documentation
├── package.json                # Dependencies (if standalone)
├── services/                   # Business logic classes
│   ├── MyService.ts
│   └── AnotherService.ts
├── middleware/                 # Custom middleware
│   └── auth.ts
├── models/                     # Database schemas
│   └── MyModel.ts
├── migrations/                 # Database migration files
│   ├── 0001_create_table.sql
│   └── 0002_add_column.sql
├── routes.ts                   # Optional: Separate route definitions
├── types.ts                    # TypeScript types and interfaces
├── utils.ts                    # Helper functions
├── templates/                  # HTML templates
│   ├── page.html
│   └── component.html
└── __tests__/                  # Test files
    ├── plugin.test.ts
    └── service.test.ts
```

### Minimal Plugin Structure (for simple plugins)

```
src/plugins/simple-plugin/
├── index.ts
└── manifest.json
```

---

## 2. CORE CONCEPTS

### 2.1 Plugin Interface

Every plugin must export an object implementing the `Plugin` interface:

```typescript
interface Plugin {
  // REQUIRED: Plugin identification
  name: string                           // Unique ID (lowercase, hyphens: "my-plugin")
  version: string                        // Semantic version: "1.0.0"
  
  // OPTIONAL: Metadata
  description?: string                  // Human description
  author?: {
    name: string                         // Author name
    email?: string                       // Contact email
    url?: string                         // Website URL
  }
  dependencies?: string[]                // Other required plugins: ["cache-plugin"]
  compatibility?: string                 // SonicJS version: "^2.0.0"
  license?: string                       // License type: "MIT"
  
  // OPTIONAL: Extension points (define what your plugin adds)
  routes?: PluginRoutes[]                // API and web routes
  middleware?: PluginMiddleware[]        // Request/response processing
  models?: PluginModel[]                 // Database tables
  services?: PluginService[]             // Reusable services
  adminPages?: PluginAdminPage[]        // Admin UI pages
  adminComponents?: PluginComponent[]   // Reusable components
  menuItems?: PluginMenuItem[]           // Navigation menu entries
  hooks?: PluginHook[]                   // Event subscriptions
  
  // OPTIONAL: Lifecycle methods (executed at plugin state changes)
  install?: (context: PluginContext) => Promise<void>
  uninstall?: (context: PluginContext) => Promise<void>
  activate?: (context: PluginContext) => Promise<void>
  deactivate?: (context: PluginContext) => Promise<void>
  configure?: (config: PluginConfig) => Promise<void>
}
```

### 2.2 PluginContext

Plugins receive a context object providing access to SonicJS APIs:

```typescript
interface PluginContext {
  // DATABASE ACCESS
  db: D1Database                         // Cloudflare D1 database instance
  
  // KEY-VALUE STORAGE
  kv: KVNamespace                        // Cloudflare KV storage
  
  // FILE STORAGE
  r2?: R2Bucket                          // Cloudflare R2 object storage
  
  // CONFIGURATION
  config: PluginConfig                   // Plugin-specific settings
  
  // CORE SERVICES
  services: {
    auth: AuthService                    // Authentication operations
    content: ContentService              // Content management
    media: MediaService                  // Media/file handling
  }
  
  // EVENT SYSTEM
  hooks: HookSystem | ScopedHookSystem   // Register/execute events
  
  // LOGGING
  logger: PluginLogger                   // Log messages: info/warn/error/debug
}
```

### 2.3 Standard Hooks

Hooks enable event-driven extensibility. Register handlers for these events:

```typescript
// APPLICATION LIFECYCLE
'app:init'           // SonicJS initialization started
'app:ready'          // SonicJS initialization complete
'app:shutdown'       // SonicJS shutting down

// REQUEST LIFECYCLE
'request:start'      // Request received
'request:end'        // Response sent
'request:error'      // Error occurred

// AUTHENTICATION
'auth:login'         // User login occurred
'auth:logout'        // User logout occurred
'auth:register'      // New user registered
'user:login'         // Alternative login hook
'user:logout'        // Alternative logout hook

// CONTENT MANAGEMENT
'content:create'     // Content item created
'content:update'     // Content item updated
'content:delete'     // Content item deleted
'content:publish'    // Content item published
'content:save'       // Content item saved

// MEDIA MANAGEMENT
'media:upload'       // File uploaded
'media:delete'       // File deleted
'media:transform'    // Image transformed

// PLUGIN SYSTEM
'plugin:install'     // Plugin installed
'plugin:uninstall'   // Plugin uninstalled
'plugin:activate'    // Plugin activated
'plugin:deactivate'  // Plugin deactivated

// ADMIN INTERFACE
'admin:menu:render'  // Admin menu being rendered
'admin:page:render'  // Admin page being rendered

// DATABASE
'db:migrate'         // Database migration running
'db:seed'            // Database seeding occurring
```

### 2.4 Plugin Builder Pattern

The recommended way to create plugins is using the PluginBuilder SDK:

```typescript
import { PluginBuilder } from '../sdk/plugin-builder'

const plugin = PluginBuilder.create({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'What my plugin does'
})
  .metadata({
    author: { name: 'John Doe', email: 'john@example.com' },
    license: 'MIT'
  })
  .addRoute('/admin/my-plugin', honoRouter)
  .addMiddleware([...])
  .addHook('content:create', async (data, context) => { ... })
  .lifecycle({
    activate: async (context) => { ... },
    deactivate: async (context) => { ... }
  })
  .build()
```

---

## 3. MANIFEST.JSON

The `manifest.json` file provides plugin metadata. This is OPTIONAL but recommended for discoverability.

```json
{
  "id": "unique-plugin-id",
  "name": "Human Readable Plugin Name",
  "version": "1.0.0",
  "description": "What this plugin does",
  "author": "Author Name or Company",
  "homepage": "https://github.com/user/plugin",
  "repository": "https://github.com/user/plugin.git",
  "license": "MIT",
  "category": "utilities",
  "tags": ["category", "feature"],
  "dependencies": [],
  "settings": {},
  "hooks": {},
  "routes": [],
  "permissions": {
    "plugin-id:permission": "Permission description"
  },
  "adminMenu": {
    "label": "Plugin Name",
    "icon": "icon-name",
    "path": "/admin/plugin-path",
    "order": 50
  }
}
```

**Key Fields**:
- `id`: Unique identifier (used in plugin registry)
- `version`: Semantic versioning
- `dependencies`: Array of required plugin IDs
- `category`: Plugin category (utilities, content, auth, etc.)
- `tags`: Search/discovery tags
- `permissions`: Permission keys this plugin defines
- `adminMenu`: Admin panel navigation entry

---

## 4. CREATING A PLUGIN: STEP-BY-STEP

### Step 1: Create Plugin Directory and Files

```bash
mkdir -p src/plugins/my-plugin/{services,middleware,models,migrations,__tests__}
touch src/plugins/my-plugin/index.ts
touch src/plugins/my-plugin/manifest.json
```

### Step 2: Define Manifest

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name",
  "license": "MIT",
  "adminMenu": {
    "label": "My Plugin",
    "path": "/admin/my-plugin",
    "order": 50
  }
}
```

### Step 3: Create Main Plugin File

```typescript
// src/plugins/my-plugin/index.ts
import { PluginBuilder } from '../sdk/plugin-builder'
import { Hono } from 'hono'
import type { Plugin } from '@sonicjs-cms/core'

// Create and configure plugin
const plugin = PluginBuilder.create({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My plugin description'
})

// Add metadata
plugin.metadata({
  author: { name: 'Your Name' },
  license: 'MIT'
})

// Create routes
const routes = new Hono()
routes.get('/', (c) => c.json({ message: 'Hello' }))

// Add routes to plugin
plugin.addRoute('/api/my-plugin', routes)

// Add lifecycle
plugin.lifecycle({
  activate: async (context) => {
    context.logger.info('My plugin activated')
  }
})

// Build and export
export const myPlugin = plugin.build() as Plugin
```

### Step 4: Register Plugin

Add to plugin configuration (typically in app setup):

```typescript
import { myPlugin } from './plugins/my-plugin'

await pluginManager.install(myPlugin, { enabled: true })
```

---

## 5. EXTENSION POINTS IN DETAIL

### 5.1 Routes

Define HTTP endpoints and web pages:

```typescript
const routes = new Hono()

// GET endpoint
routes.get('/list', async (c) => {
  return c.json({ items: [] })
})

// POST endpoint with middleware
routes.post('/create', authMiddleware, async (c) => {
  const body = await c.req.json()
  return c.json({ success: true })
})

// HTML page
routes.get('/page', async (c) => {
  return c.html(html`<h1>My Page</h1>`)
})

plugin.addRoute('/api/my-plugin', routes, {
  description: 'My plugin API endpoints',
  requiresAuth: true,
  priority: 10
})
```

**Options**:
- `description`: Route description
- `requiresAuth`: Require authentication
- `roles`: Required user roles
- `priority`: Execution order

### 5.2 Middleware

Process requests/responses:

```typescript
const myMiddleware = async (c, next) => {
  // Before request processing
  console.log('Request:', c.req.method, c.req.path)
  
  await next()
  
  // After request processing
  console.log('Response status:', c.res.status)
}

plugin.addSingleMiddleware('my-middleware', myMiddleware, {
  description: 'My custom middleware',
  priority: 5,
  global: true
})
```

**Options**:
- `priority`: Lower executes first (0-100)
- `global`: Apply to all routes
- `routes`: Specific routes to apply to

### 5.3 Services

Reusable business logic:

```typescript
class MyService {
  constructor(private db: D1Database) {}
  
  async getData() {
    return await this.db.prepare('SELECT * FROM data').all()
  }
}

plugin.addService('myService', new MyService(context.db), {
  description: 'My business service',
  singleton: true
})
```

### 5.4 Database Models

Define database tables:

```typescript
import { z } from 'zod'

const mySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.number()
})

plugin.addModel('MyModel', {
  tableName: 'my_models',
  schema: mySchema,
  migrations: [
    `CREATE TABLE my_models (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )`
  ]
})
```

### 5.5 Admin Pages

UI for admin panel:

```typescript
plugin.addAdminPage(
  '/my-plugin',
  'My Plugin',
  myPluginTemplate,
  {
    description: 'My plugin settings',
    icon: 'settings',
    permissions: ['admin']
  }
)
```

### 5.6 Menu Items

Navigation entries:

```typescript
plugin.addMenuItem('My Plugin', '/admin/my-plugin', {
  icon: 'puzzle',
  order: 50,
  permissions: ['admin']
})
```

### 5.7 Hooks

Subscribe to events:

```typescript
plugin.addHook('content:create', async (data, context) => {
  context.logger.info('Content created:', data)
  // Perform action
  return data
}, { priority: 10 })

// Or use lifecycle method
plugin.lifecycle({
  activate: async (context) => {
    context.hooks.register('user:login', async (data) => {
      context.logger.info('User logged in:', data.userId)
      return data
    })
  }
})
```

---

## 6. HOOK SYSTEM DETAILS

### Hook Registration

```typescript
// In plugin definition
plugin.addHook('content:update', async (data, context) => {
  // data: Updated content object
  // context: HookContext with plugin info
  
  // Modify and return data
  return {
    ...data,
    customField: 'modified'
  }
}, { priority: 5 })
```

### Hook Execution

When a hook is triggered, all registered handlers execute in priority order (lower = earlier):

```
Handler 1 (priority: 1) ──→ Handler 2 (priority: 5) ──→ Handler 3 (priority: 10)
  ↓                           ↓                           ↓
  data1                       data2                       data3
```

### Hook Context

```typescript
interface HookContext {
  plugin: string                    // Which plugin registered this
  context: PluginContext            // Full plugin context
  cancel?: () => void               // Cancel remaining handlers
}
```

### Cancel Execution

```typescript
plugin.addHook('content:delete', async (data, context) => {
  if (isProtected(data.id)) {
    context.cancel()  // Stop other handlers
    throw new Error('Cannot delete protected content')
  }
  return data
})
```

---

## 7. PLUGIN CONFIGURATION

Plugins can have configuration settings:

```typescript
interface PluginConfig {
  enabled: boolean           // Is plugin active
  [key: string]: any        // Custom settings
  installedAt?: number      // Installation timestamp
  updatedAt?: number        // Update timestamp
}
```

Example:

```typescript
const config: PluginConfig = {
  enabled: true,
  apiKey: 'secret-key',
  maxRetries: 3,
  timeout: 5000
}

await pluginManager.install(plugin, config)
```

Access in plugin:

```typescript
plugin.lifecycle({
  activate: async (context) => {
    const apiKey = context.config.apiKey
    const maxRetries = context.config.maxRetries
  }
})
```

---

## 8. LOGGING

Plugins have access to a logger:

```typescript
plugin.lifecycle({
  activate: async (context) => {
    context.logger.debug('Debug message', { data: 'value' })
    context.logger.info('Info message')
    context.logger.warn('Warning message')
    context.logger.error('Error message', new Error('Something failed'))
  }
})
```

Output format:
```
[Plugin:my-plugin] Debug message { data: 'value' }
[Plugin:my-plugin] Info message
[Plugin:my-plugin] Warning message
[Plugin:my-plugin] Error message Error: Something failed
```

---

## 9. PLUGIN VALIDATION

Plugins are validated on installation. Requirements:

1. **Name validation**: Lowercase, hyphens, no spaces
   ```
   ✓ my-plugin, cache-plugin, email-sender
   ✗ MyPlugin, my_plugin, "my plugin"
   ```

2. **Version validation**: Must be semantic versioning
   ```
   ✓ 1.0.0, 2.1.3-beta.1, 0.0.1
   ✗ 1, latest, 2.x
   ```

3. **No reserved names**: Cannot use:
   ```
   core, system, admin, api, auth, content, media, users, collections
   ```

4. **No conflicting paths**: Cannot reserve:
   ```
   /admin, /api, /auth, /docs, /media, /_assets
   ```

5. **Dependencies valid**: All listed dependencies must exist

---

## 10. BEST PRACTICES

### 10.1 Naming Conventions

```typescript
// Plugin names: lowercase with hyphens
✓ my-plugin, cache-plugin, email-service
✗ MyPlugin, my_plugin

// Database tables: snake_case
✓ user_profiles, cache_entries
✗ UserProfiles, cacheEntries

// Classes: PascalCase
✓ class UserService, class CacheManager
✗ class user_service, class cacheManager

// Functions/methods: camelCase
✓ function getUserData, async isAuthorized()
✗ function get_user_data, async IsAuthorized()

// Constants: UPPER_SNAKE_CASE
✓ const MAX_RETRIES = 3, const API_KEY = 'key'
✗ const maxRetries = 3, const apiKey = 'key'
```

### 10.2 Error Handling

```typescript
plugin.lifecycle({
  activate: async (context) => {
    try {
      const result = await risky_operation()
    } catch (error) {
      context.logger.error('Operation failed', error)
      // Graceful fallback
      return
    }
  }
})
```

### 10.3 Dependencies

```typescript
// Declare dependencies
PluginBuilder.create({
  name: 'analytics',
  version: '1.0.0',
  dependencies: ['cache-plugin']  // Requires cache-plugin
})

// Use in hooks
plugin.lifecycle({
  activate: async (context) => {
    // Access other services via context
    await context.services.auth.verifyToken(token)
  }
})
```

### 10.4 Type Safety

```typescript
// Use TypeScript types
import type { Plugin, PluginContext } from '@sonicjs-cms/core'

// Type hook handlers
const handler: HookHandler = async (data: ContentItem, context: HookContext) => {
  return data
}

// Use Zod for runtime validation
const schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1)
})

type MyModel = z.infer<typeof schema>
```

### 10.5 Performance

```typescript
// Use caching for expensive operations
plugin.lifecycle({
  activate: async (context) => {
    const cached = await context.kv.get('my-key')
    if (cached) return JSON.parse(cached)
    
    const result = await expensiveOperation()
    await context.kv.put('my-key', JSON.stringify(result), {
      expirationTtl: 3600  // 1 hour
    })
    return result
  }
})

// Use priority for hook execution
plugin.addHook('content:update', handler, { priority: 1 })  // High priority
```

### 10.6 Security

```typescript
// Always validate input
plugin.addRoute('/api/data', routes)
routes.post('/save', async (c) => {
  const schema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email()
  })
  
  const body = await c.req.json()
  const validated = schema.parse(body)  // Throws on invalid
  
  // Save validated data
})

// Check permissions
plugin.lifecycle({
  activate: async (context) => {
    context.hooks.register('admin:page:render', async (data) => {
      if (!hasPermission(data.user)) {
        throw new Error('Unauthorized')
      }
      return data
    })
  }
})
```

---

## 11. TESTING PLUGINS

### Unit Tests

```typescript
// __tests__/plugin.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { myPlugin } from '../index'

describe('My Plugin', () => {
  let context: PluginContext
  
  beforeEach(async () => {
    // Setup mock context
    context = createMockContext()
  })
  
  it('should activate successfully', async () => {
    await myPlugin.activate?.(context)
    expect(context.logger.info).toHaveBeenCalled()
  })
  
  it('should register hooks', async () => {
    await myPlugin.activate?.(context)
    expect(myPlugin.hooks).toHaveLength(1)
  })
  
  afterEach(() => {
    // Cleanup
  })
})
```

### Integration Tests

```typescript
// Test with real SonicJS app
import { createSonicJSApp } from '@sonicjs-cms/core'

it('should work with app', async () => {
  const app = createSonicJSApp()
  await app.installPlugin(myPlugin)
  
  const response = await app.request('/api/my-plugin/data')
  expect(response.status).toBe(200)
})
```

---

## 12. COMMON PATTERNS

### Pattern 1: Data Processing Hook

```typescript
plugin.addHook('content:create', async (data, context) => {
  context.logger.debug('Processing new content:', data.title)
  
  // Enrich data
  const enriched = {
    ...data,
    processedAt: Date.now(),
    wordCount: data.content.split(' ').length
  }
  
  // Store metadata
  await context.kv.put(
    `content:${data.id}:metadata`,
    JSON.stringify({ processedAt: enriched.processedAt })
  )
  
  return enriched
})
```

### Pattern 2: API with Database

```typescript
const routes = new Hono()

routes.get('/items', async (c) => {
  const db = c.env.DB
  const items = await db
    .prepare('SELECT * FROM items WHERE active = ?')
    .bind(true)
    .all()
  return c.json(items)
})

routes.post('/items', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  
  await db.prepare(
    'INSERT INTO items (name, value) VALUES (?, ?)'
  ).bind(body.name, body.value).run()
  
  return c.json({ success: true })
})

plugin.addRoute('/api/my-plugin', routes)
```

### Pattern 3: Admin Settings UI

```typescript
const settingsTemplate = (settings) => html`
  <form id="settings">
    <input name="apiKey" value="${settings.apiKey}" />
    <button type="submit">Save</button>
  </form>
  <script>
    document.getElementById('settings').onsubmit = async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      await fetch('/api/my-plugin/settings', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData))
      })
    }
  </script>
`

plugin.addAdminPage('/my-plugin', 'My Plugin', settingsTemplate)
```

### Pattern 4: Service with Lifecycle

```typescript
class DataService {
  private cache: Map<string, any> = new Map()
  
  async getData(id: string) {
    if (this.cache.has(id)) {
      return this.cache.get(id)
    }
    const data = await fetch(`/api/data/${id}`)
    this.cache.set(id, data)
    return data
  }
}

plugin.addService('dataService', new DataService())

plugin.lifecycle({
  activate: async (context) => {
    context.logger.info('Service activated')
  },
  deactivate: async (context) => {
    // Cleanup
    context.logger.info('Service deactivated')
  }
})
```

---

## 13. TROUBLESHOOTING

### Plugin Won't Load

**Check**:
1. Name follows convention (lowercase, hyphens)
2. Version is valid semantic version
3. Dependencies exist and are loaded
4. No reserved names or paths used

### Hooks Not Firing

**Check**:
1. Hook name matches exactly: `'content:create'` not `'contentCreate'`
2. Plugin is activated
3. Handler is registered before event occurs
4. No `cancel()` called by earlier handler

### Database Access Fails

**Check**:
1. `context.db` is available
2. Migrations have run
3. Table names are correct
4. SQL syntax is valid

### Performance Issues

**Check**:
1. Hooks not doing heavy work
2. Database queries are indexed
3. KV storage being used for caching
4. Middleware priority is correct

---

## 14. PLUGIN DEVELOPMENT CHECKLIST

- [ ] Created plugin directory structure
- [ ] Created `manifest.json` with metadata
- [ ] Created `index.ts` with Plugin definition
- [ ] Used PluginBuilder for configuration
- [ ] Added descriptive metadata (author, license)
- [ ] Implemented appropriate extension points
- [ ] Added lifecycle methods (activate/deactivate)
- [ ] Added error handling and logging
- [ ] Validated inputs (Zod schemas)
- [ ] Added TypeScript types
- [ ] Created unit tests
- [ ] Added README documentation
- [ ] Tested with real SonicJS app
- [ ] Verified plugin validation passes
- [ ] Checked performance and security

---

## 15. PLUGIN PUBLISHING

### Naming Convention
```
@sonicjs-plugins/my-plugin
```

### NPM Package Setup
```json
{
  "name": "@sonicjs-plugins/my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### Publishing Steps
1. Build: `npm run build`
2. Test: `npm run test`
3. Publish: `npm publish`
4. Submit to SonicJS Plugin Registry

---

## 16. REFERENCE IMPLEMENTATIONS

See these example plugins in the codebase:

1. **hello-world-plugin** - Simple route and menu item
2. **email-plugin** - Transactional email service
3. **cache-plugin** - Caching with KV storage
4. **database-tools-plugin** - Database operations
5. **workflow-plugin** - Complex state management

---

## 17. QUICK START TEMPLATE

```typescript
// src/plugins/template-plugin/index.ts
import { PluginBuilder } from '../sdk/plugin-builder'
import { Hono } from 'hono'
import type { Plugin } from '@sonicjs-cms/core'

export function createTemplatePlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'template-plugin',
    version: '1.0.0',
    description: 'Template plugin'
  })

  builder.metadata({
    author: { name: 'Your Name' },
    license: 'MIT'
  })

  const routes = new Hono()
  routes.get('/', (c) => c.json({ status: 'ok' }))

  builder.addRoute('/api/template', routes)
  
  builder.lifecycle({
    activate: async (context) => {
      context.logger.info('Template plugin activated')
    }
  })

  return builder.build() as Plugin
}

export const templatePlugin = createTemplatePlugin()
```

---

**Last Updated**: November 2024  
**SonicJS Version**: 2.0.0+  
**Document Version**: 1.0.0
