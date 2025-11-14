/**
 * Multi-Store Payments & Digital Downloads Plugin
 * 
 * Comprehensive e-commerce plugin with:
 * - Multi-store management
 * - Physical and digital products
 * - Shopping cart and checkout
 * - Payment gateway integration (Stripe/PayPal)
 * - Secure digital downloads with R2 storage
 * - Admin management pages
 * - Security and webhook validation
 */

import { Hono } from 'hono'
import { html } from 'hono/html'
import { PluginBuilder } from '../../sdk/plugin-builder'
import type { Plugin, PluginContext } from '@sonicjs-cms/core'
import { z } from 'zod'
import { DatabaseService } from './services/DatabaseService'
import { PaymentService } from './services/PaymentService'
import { DigitalDownloadService } from './services/DigitalDownloadService'
import type {
  MultiStorePaymentsConfig,
  AddToCartInputSchema,
  CreateOrderInputSchema,
  CreateProductInputSchema,
  CreateStoreInputSchema
} from './types'

// Migration SQL statements
const MIGRATIONS = [
  // 001: Create stores table
  `CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    owner_user_id TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    logo_url TEXT,
    email_support TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
  CREATE INDEX IF NOT EXISTS idx_stores_owner_user_id ON stores(owner_user_id);
  CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);`,

  // 002: Create products table
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    cost REAL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('active', 'inactive', 'draft')),
    type TEXT NOT NULL CHECK(type IN ('physical', 'digital')),
    image_url TEXT,
    sku TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
  CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
  CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
  CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_products_store_sku ON products(store_id, sku) WHERE sku IS NOT NULL;`,

  // 003: Create digital downloads table
  `CREATE TABLE IF NOT EXISTS digital_downloads (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL UNIQUE,
    r2_object_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_digital_downloads_product_id ON digital_downloads(product_id);
  CREATE INDEX IF NOT EXISTS idx_digital_downloads_r2_object_key ON digital_downloads(r2_object_key);`,

  // 004: Create carts table
  `CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    store_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price_at_time REAL NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
  CREATE INDEX IF NOT EXISTS idx_carts_store_id ON carts(store_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_user_store ON carts(user_id, store_id);
  CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
  CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);`,

  // 005: Create orders table
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subtotal REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    shipping REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('stripe', 'paypal', 'free')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK(fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    stripe_payment_intent_id TEXT,
    paypal_order_id TEXT,
    shipping_address TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL CHECK(product_type IN ('physical', 'digital')),
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
  );
  CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
  CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
  CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
  CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
  CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id);
  CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
  CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);`,

  // 006: Create secure download links table
  `CREATE TABLE IF NOT EXISTS secure_download_links (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    digital_download_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    download_count INTEGER NOT NULL DEFAULT 0,
    max_downloads INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (digital_download_id) REFERENCES digital_downloads(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_secure_download_links_token ON secure_download_links(token);
  CREATE INDEX IF NOT EXISTS idx_secure_download_links_order_id ON secure_download_links(order_id);
  CREATE INDEX IF NOT EXISTS idx_secure_download_links_expires_at ON secure_download_links(expires_at);
  CREATE INDEX IF NOT EXISTS idx_secure_download_links_product_id ON secure_download_links(product_id);`
]

export function createMultiStorePaymentsPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'drizzle-plugin-multistore-payments-digital-downloads',
    version: '1.0.0-beta.1',
    description: 'Multi-store e-commerce with payments, digital downloads, and secure file delivery'
  })

  // ============================================================================
  // METADATA
  // ============================================================================

  builder.metadata({
    author: {
      name: 'SonicJS Team',
      email: 'team@sonicjs.com'
    },
    license: 'MIT',
    compatibility: '^2.0.0',
    dependencies: []
  })

  // ============================================================================
  // DATABASE MODELS
  // ============================================================================

  const StoreSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    owner_user_id: z.string(),
    currency: z.string(),
    timezone: z.string(),
    logo_url: z.string().optional(),
    email_support: z.string().optional(),
    status: z.string(),
    created_at: z.number(),
    updated_at: z.number()
  })

  builder.addModel('Store', {
    tableName: 'stores',
    schema: StoreSchema,
    migrations: MIGRATIONS
  })

  // ============================================================================
  // API ROUTES
  // ============================================================================

  const apiRoutes = new Hono()

  // STORE ENDPOINTS
  apiRoutes.post('/stores', async (c) => {
    try {
      const user = c.get('user')
      if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

      const dbService = c.get('dbService') as DatabaseService
      const body = await c.req.json()
      const input = CreateStoreInputSchema.parse({
        ...body,
        ownerUserId: user.id,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000)
      })

      const store = await dbService.createStore(input)
      return c.json({ success: true, data: store }, 201)
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400)
    }
  })

  apiRoutes.get('/stores/:id', async (c) => {
    try {
      const dbService = c.get('dbService') as DatabaseService
      const store = await dbService.getStore(c.req.param('id'))

      if (!store) {
        return c.json({ success: false, error: 'Store not found' }, 404)
      }

      return c.json({ success: true, data: store })
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500)
    }
  })

  // PRODUCT ENDPOINTS
  apiRoutes.post('/stores/:storeId/products', async (c) => {
    try {
      const user = c.get('user')
      if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

      const dbService = c.get('dbService') as DatabaseService
      const storeId = c.req.param('storeId')

      // Verify store ownership
      const store = await dbService.getStore(storeId)
      if (!store || store.ownerUserId !== user.id) {
        return c.json({ success: false, error: 'Forbidden' }, 403)
      }

      const body = await c.req.json()
      const input = CreateProductInputSchema.parse({
        ...body,
        store_id: storeId
      })

      const product = await dbService.createProduct(input)
      return c.json({ success: true, data: product }, 201)
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400)
    }
  })

  apiRoutes.get('/stores/:storeId/products', async (c) => {
    try {
      const dbService = c.get('dbService') as DatabaseService
      const storeId = c.req.param('storeId')
      const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)
      const offset = parseInt(c.req.query('offset') || '0')

      const { products, total } = await dbService.listProducts(storeId, limit, offset, 'active')
      return c.json({ success: true, data: { products, total, limit, offset } })
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500)
    }
  })

  // CART ENDPOINTS
  apiRoutes.post('/carts/add', async (c) => {
    try {
      const user = c.get('user')
      if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

      const dbService = c.get('dbService') as DatabaseService
      const body = await c.req.json()
      const input = AddToCartInputSchema.parse(body)

      const product = await dbService.getProduct(input.product_id)
      if (!product) {
        return c.json({ success: false, error: 'Product not found' }, 404)
      }

      const cart = await dbService.getOrCreateCart(user.id, input.store_id)
      const cartItem = await dbService.addToCart(cart.id, input.product_id, input.quantity, product.price)

      return c.json({ success: true, data: { cart_item: cartItem, cart } }, 201)
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400)
    }
  })

  apiRoutes.get('/carts', async (c) => {
    try {
      const user = c.get('user')
      if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

      const dbService = c.get('dbService') as DatabaseService
      const storeId = c.req.query('store_id')

      if (!storeId) {
        return c.json({ success: false, error: 'store_id query parameter required' }, 400)
      }

      const cart = await dbService.getOrCreateCart(user.id, storeId)
      return c.json({ success: true, data: cart })
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500)
    }
  })

  // ORDER ENDPOINTS
  apiRoutes.post('/orders', async (c) => {
    try {
      const user = c.get('user')
      if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

      const dbService = c.get('dbService') as DatabaseService
      const paymentService = c.get('paymentService') as PaymentService
      const body = await c.req.json()
      const input = CreateOrderInputSchema.parse(body)

      const order = await dbService.createOrder(input, user.id)

      // Create payment intent if not free
      let paymentData: any = null
      if (input.payment_method === 'stripe') {
        paymentData = await paymentService.createStripePaymentIntent(order)
      } else if (input.payment_method === 'paypal') {
        paymentData = await paymentService.createPayPalOrder(order)
      }

      return c.json({ success: true, data: { order, payment: paymentData } }, 201)
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400)
    }
  })

  apiRoutes.get('/orders/:id', async (c) => {
    try {
      const user = c.get('user')
      if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

      const dbService = c.get('dbService') as DatabaseService
      const order = await dbService.getOrder(c.req.param('id'))

      if (!order || order.user_id !== user.id) {
        return c.json({ success: false, error: 'Order not found' }, 404)
      }

      return c.json({ success: true, data: order })
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500)
    }
  })

  // DIGITAL DOWNLOAD ENDPOINTS
  apiRoutes.get('/downloads/:token', async (c) => {
    try {
      const dbService = c.get('dbService') as DatabaseService
      const downloadService = c.get('downloadService') as DigitalDownloadService
      const token = c.req.param('token')

      const link = await downloadService.validateDownloadLink(token)
      if (!link) {
        return c.json({ success: false, error: 'Invalid, expired, or download limit exceeded' }, 403)
      }

      const download = await dbService.getDigitalDownloadByProductId(link.product_id)
      if (!download) {
        return c.json({ success: false, error: 'Digital product not found' }, 404)
      }

      // Record download
      await downloadService.recordDownload(link.id)

      // Generate download URL
      const downloadUrl = await downloadService.generateDownloadUrl(
        download.r2_object_key,
        download.file_name,
        3600
      )

      return c.json({ success: true, data: { download_url: downloadUrl, file_name: download.file_name } })
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500)
    }
  })

  builder.addRoute('/api/store', apiRoutes, {
    description: 'Multi-store e-commerce API',
    requiresAuth: false,
    priority: 50
  })

  // ============================================================================
  // ADMIN PAGES
  // ============================================================================

  const adminRoutes = new Hono()

  // Dashboard
  adminRoutes.get('/', async (c) => {
    try {
      const user = c.get('user')
      const dbService = c.get('dbService') as DatabaseService

      const { stores } = await dbService.listStores(user.id, 100)

      return c.html(html`
        <!DOCTYPE html>
        <html lang="en" class="dark">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Store Management - SonicJS</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white min-h-screen">
            <div class="p-8">
              <h1 class="text-3xl font-bold mb-8">Store Management</h1>
              
              <div class="mb-6">
                <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                  Create New Store
                </button>
              </div>

              <div class="grid gap-4">
                ${stores.length > 0 ? stores.map(store => html`
                  <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                    <h3 class="font-semibold text-lg mb-2">${store.name}</h3>
                    <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">${store.description || 'No description'}</p>
                    <div class="flex gap-2">
                      <a href="/admin/store/products?store=${store.id}" class="text-indigo-600 hover:underline text-sm">
                        Products
                      </a>
                      <a href="/admin/store/orders?store=${store.id}" class="text-indigo-600 hover:underline text-sm">
                        Orders
                      </a>
                    </div>
                  </div>
                `).join('') : html`
                  <div class="text-center py-8 text-zinc-500">
                    <p>No stores yet. Create your first store to get started.</p>
                  </div>
                `}
              </div>
            </div>
          </body>
        </html>
      `)
    } catch (error: any) {
      return c.html(`<div style="color: red;">Error: ${error.message}</div>`)
    }
  })

  // Products Management
  adminRoutes.get('/products', async (c) => {
    try {
      const user = c.get('user')
      const dbService = c.get('dbService') as DatabaseService
      const storeId = c.req.query('store')

      if (!storeId) {
        return c.html('<div style="color: red;">Store ID required</div>')
      }

      const store = await dbService.getStore(storeId)
      if (!store || store.ownerUserId !== user.id) {
        return c.html('<div style="color: red;">Unauthorized</div>')
      }

      const { products } = await dbService.listProducts(storeId, 100)

      return c.html(html`
        <!DOCTYPE html>
        <html lang="en" class="dark">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Products - ${store.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white min-h-screen">
            <div class="p-8">
              <h1 class="text-3xl font-bold mb-8">${store.name} - Products</h1>
              
              <div class="mb-6">
                <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                  Add Product
                </button>
              </div>

              <div class="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <table class="w-full text-sm">
                  <thead class="border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th class="text-left px-4 py-3 font-semibold">Name</th>
                      <th class="text-left px-4 py-3 font-semibold">Type</th>
                      <th class="text-left px-4 py-3 font-semibold">Price</th>
                      <th class="text-left px-4 py-3 font-semibold">Stock</th>
                      <th class="text-left px-4 py-3 font-semibold">Status</th>
                      <th class="text-left px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${products.map(product => html`
                      <tr class="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                        <td class="px-4 py-3">${product.name}</td>
                        <td class="px-4 py-3"><span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">${product.type}</span></td>
                        <td class="px-4 py-3">$${product.price.toFixed(2)}</td>
                        <td class="px-4 py-3">${product.stock_quantity}</td>
                        <td class="px-4 py-3"><span class="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">${product.status}</span></td>
                        <td class="px-4 py-3 text-indigo-600 cursor-pointer">Edit</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </body>
        </html>
      `)
    } catch (error: any) {
      return c.html(`<div style="color: red;">Error: ${error.message}</div>`)
    }
  })

  // Orders Management
  adminRoutes.get('/orders', async (c) => {
    try {
      const user = c.get('user')
      const dbService = c.get('dbService') as DatabaseService
      const storeId = c.req.query('store')

      if (!storeId) {
        return c.html('<div style="color: red;">Store ID required</div>')
      }

      const store = await dbService.getStore(storeId)
      if (!store || store.ownerUserId !== user.id) {
        return c.html('<div style="color: red;">Unauthorized</div>')
      }

      const { orders } = await dbService.listOrders(storeId, 100)

      return c.html(html`
        <!DOCTYPE html>
        <html lang="en" class="dark">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Orders - ${store.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white min-h-screen">
            <div class="p-8">
              <h1 class="text-3xl font-bold mb-8">${store.name} - Orders</h1>

              <div class="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <table class="w-full text-sm">
                  <thead class="border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th class="text-left px-4 py-3 font-semibold">Order ID</th>
                      <th class="text-left px-4 py-3 font-semibold">Customer</th>
                      <th class="text-left px-4 py-3 font-semibold">Total</th>
                      <th class="text-left px-4 py-3 font-semibold">Payment</th>
                      <th class="text-left px-4 py-3 font-semibold">Status</th>
                      <th class="text-left px-4 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orders.map(order => html`
                      <tr class="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                        <td class="px-4 py-3 font-mono text-xs">${order.id.substring(0, 8)}...</td>
                        <td class="px-4 py-3">${order.customer_email}</td>
                        <td class="px-4 py-3 font-semibold">$${order.total.toFixed(2)}</td>
                        <td class="px-4 py-3"><span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">${order.payment_method}</span></td>
                        <td class="px-4 py-3"><span class="text-xs bg-${order.payment_status === 'completed' ? 'green' : 'yellow'}-100 dark:bg-${order.payment_status === 'completed' ? 'green' : 'yellow'}-900 text-${order.payment_status === 'completed' ? 'green' : 'yellow'}-800 dark:text-${order.payment_status === 'completed' ? 'green' : 'yellow'}-200 px-2 py-1 rounded">${order.payment_status}</span></td>
                        <td class="px-4 py-3 text-sm">${new Date(order.created_at * 1000).toLocaleDateString()}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </body>
        </html>
      `)
    } catch (error: any) {
      return c.html(`<div style="color: red;">Error: ${error.message}</div>`)
    }
  })

  builder.addRoute('/admin/store', adminRoutes, {
    description: 'Store management admin pages',
    requiresAuth: true,
    priority: 75
  })

  // ============================================================================
  // MENU ITEMS
  // ============================================================================

  builder.addMenuItem('Store Management', '/admin/store', {
    icon: 'shopping-cart',
    order: 75,
    permissions: ['store:manage']
  })

  // ============================================================================
  // HOOKS
  // ============================================================================

  // After product created hook
  builder.addHook('product:created', async (data, context) => {
    context.context.logger?.info(`Product created: ${data.id}`)
    return data
  }, { priority: 5 })

  // After order paid hook - create download links
  builder.addHook('order:paid', async (data, context) => {
    try {
      const downloadService = context.context.get?.('downloadService') as DigitalDownloadService | undefined
      const dbService = context.context.get?.('dbService') as DatabaseService | undefined

      if (downloadService && dbService && data.items) {
        const digitalProducts = []

        for (const item of data.items) {
          if (item.product_type === 'digital') {
            const download = await dbService.getDigitalDownloadByProductId(item.product_id)
            if (download) {
              digitalProducts.push({
                productId: item.product_id,
                digitalDownloadId: download.id
              })
            }
          }
        }

        if (digitalProducts.length > 0) {
          const links = await downloadService.createDownloadLinksForOrder(data.id, digitalProducts)
          context.context.logger?.info(`Created ${links.length} download links for order ${data.id}`)
        }
      }
    } catch (error) {
      context.context.logger?.warn(`Failed to create download links: ${error}`)
    }

    return data
  }, { priority: 10 })

  // Before product deletion hook - prevent if orders exist
  builder.addHook('product:delete', async (data, context) => {
    // This would require checking if product appears in any orders
    context.context.logger?.info(`Product deletion initiated: ${data.id}`)
    return data
  }, { priority: 5 })

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  builder.lifecycle({
    install: async (context: PluginContext) => {
      context.logger.info('Multi-Store Payments Plugin installing...')

      // Run migrations
      for (const migration of MIGRATIONS) {
        try {
          // Split by statements and run each
          const statements = migration.split(';').filter(s => s.trim())
          for (const statement of statements) {
            if (statement.trim()) {
              await context.db.exec(statement)
            }
          }
        } catch (error) {
          context.logger.warn(`Migration already applied or error: ${error}`)
        }
      }

      context.logger.info('Multi-Store Payments Plugin installed successfully')
    },

    activate: async (context: PluginContext) => {
      context.logger.info('Multi-Store Payments Plugin activated')

      // Create service instances
      const dbService = new DatabaseService(context.db, context.logger)
      const config: MultiStorePaymentsConfig = {
        enabled: true,
        payment_gateways: {
          stripe: {
            enabled: false,
            publishable_key: '',
            secret_key: '',
            webhook_secret: '',
            mode: 'test'
          },
          paypal: {
            enabled: false,
            client_id: '',
            client_secret: '',
            mode: 'sandbox'
          }
        },
        digital_download_expiry_days: 30,
        digital_download_max_downloads: 5,
        enable_test_mode: true
      }

      const paymentService = new PaymentService(
        context.logger,
        config.payment_gateways?.stripe,
        config.payment_gateways?.paypal
      )

      const downloadService = new DigitalDownloadService(
        dbService,
        context.r2,
        context.logger,
        config.digital_download_expiry_days,
        config.digital_download_max_downloads
      )

      // Make services available to routes
      context.hooks.register('request:start', async (data) => {
        data.dbService = dbService
        data.paymentService = paymentService
        data.downloadService = downloadService
        return data
      }, 1)

      context.logger.info('Multi-Store Payments Plugin fully activated')
    },

    deactivate: async (context: PluginContext) => {
      context.logger.info('Multi-Store Payments Plugin deactivated')
    }
  })

  // ============================================================================
  // BUILD AND RETURN PLUGIN
  // ============================================================================

  return builder.build() as Plugin
}

export const multiStorePaymentsPlugin = createMultiStorePaymentsPlugin()
