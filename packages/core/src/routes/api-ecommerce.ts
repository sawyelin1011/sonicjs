/**
 * E-Commerce API Routes
 * 
 * Complete REST API for e-commerce operations:
 * - Products and variants
 * - Orders and payments
 * - Customers
 * - Inventory
 * - Discounts and promotions
 */

import { Hono } from 'hono'
import { Context } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'
import {
  productCreateSchema,
  orderCreateSchema,
  customerCreateSchema,
  discountCreateSchema,
  type Product,
  type Order,
  type Customer,
  type Discount,
  type Inventory
} from '../types/ecommerce'

export const apiEcommerceRoutes = new Hono()

// ============================================================================
// Products API
// ============================================================================

/**
 * GET /api/products - List all products
 * Query params: page, limit, sort, filter, search
 */
apiEcommerceRoutes.get('/products', async (c: Context) => {
  try {
    const db = c.env.DB as D1Database
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const sort = c.req.query('sort') || 'created_at'
    const search = c.req.query('search')
    const offset = (page - 1) * limit

    let query = `
      SELECT p.*, COUNT(*) OVER() as total
      FROM products p
      WHERE p.status = 'active'
    `
    const params: any[] = []

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY p.${sort} DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const stmt = db.prepare(query)
    const result = await stmt.bind(...params).all() as any

    const products = result.results as Product[]
    const total = result.results[0]?.total || 0

    return c.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return c.json({ error: 'Failed to fetch products' }, 500)
  }
})

/**
 * GET /api/products/:id - Get product by ID
 */
apiEcommerceRoutes.get('/products/:id', async (c: Context) => {
  try {
    const db = c.env.DB as D1Database
    const id = c.req.param('id')

    const stmt = db.prepare(`
      SELECT p.*, 
             COUNT(DISTINCT v.id) as variant_count,
             COUNT(DISTINCT pi.id) as image_count
      FROM products p
      LEFT JOIN product_variants v ON p.id = v.product_id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `)
    
    const product = await stmt.bind(id).first() as any

    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }

    // Get variants
    const variantsStmt = db.prepare(`
      SELECT * FROM product_variants WHERE product_id = ?
    `)
    const variants = await variantsStmt.bind(id).all() as any

    // Get images
    const imagesStmt = db.prepare(`
      SELECT * FROM product_images WHERE product_id = ? ORDER BY position
    `)
    const images = await imagesStmt.bind(id).all() as any

    return c.json({
      ...product,
      variants: variants.results || [],
      images: images.results || []
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return c.json({ error: 'Failed to fetch product' }, 500)
  }
})

/**
 * POST /api/products - Create new product (admin only)
 */
apiEcommerceRoutes.post('/products', async (c: Context) => {
  try {
    const db = c.env.DB as D1Database
    const body = await c.req.json()

    // Validate input
    const validated = productCreateSchema.parse(body)

    const id = crypto.randomUUID()
    const stmt = db.prepare(`
      INSERT INTO products (id, store_id, name, slug, description, price, cost_price, status, sku, is_physical, is_digital, digital_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    await stmt.bind(
      id,
      c.env.STORE_ID || 'default',
      validated.name,
      validated.slug,
      validated.description,
      validated.price,
      validated.costPrice || null,
      validated.status,
      validated.sku || null,
      validated.isPhysical ? 1 : 0,
      validated.isDigital ? 1 : 0,
      validated.digitalUrl || null
    ).run()

    return c.json({ id, message: 'Product created successfully' }, 201)
  } catch (error) {
    console.error('Error creating product:', error)
    return c.json({ error: 'Failed to create product' }, 500)
  }
})

// ============================================================================
// Orders API
// ============================================================================

/**
 * GET /api/orders - List orders
 */
apiEcommerceRoutes.get('/orders', async (c: Context) => {
  try {
    const db = c.env.DB as D1Database
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const status = c.req.query('status')
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM orders WHERE 1=1'
    const params: any[] = []

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const stmt = db.prepare(query)
    const result = await stmt.bind(...params).all() as any

    const orders = result.results as Order[]

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1'
    if (status) {
      countQuery += ' AND status = ?'
    }

    const countStmt = db.prepare(countQuery)
    const countResult = await (status ? countStmt.bind(status) : countStmt).first() as any
    const total = countResult?.total || 0

    return c.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return c.json({ error: 'Failed to fetch orders' }, 500)
  }
})

/**
 * GET /api/orders/:id - Get order details
 */
apiEcommerceRoutes.get('/orders/:id', async (c: Context) => {
  try {
    const db = c.env.DB as D1Database
    const id = c.req.param('id')

    const stmt = db.prepare('SELECT * FROM orders WHERE id = ?')
    const order = await stmt.bind(id).first() as Order

    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }

    // Get order items
    const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?')
    const items = await itemsStmt.bind(id).all() as any

    // Get shipping address
    const shippingStmt = db.prepare('SELECT * FROM shipping_addresses WHERE order_id = ?')
    const shipping = await shippingStmt.bind(id).first()

    // Get billing address
    const billingStmt = db.prepare('SELECT * FROM billing_addresses WHERE order_id = ?')
    const billing = await billingStmt.bind(id).first()

    // Get payments
    const paymentsStmt = db.prepare('SELECT * FROM payments WHERE order_id = ?')
    const payments = await paymentsStmt.bind(id).all() as any

    return c.json({
      ...order,
      items: items.results || [],
      shippingAddress: shipping,
      billingAddress: billing,
      payments: payments.results || []
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return c.json({ error: 'Failed to fetch order' }, 500)
  }
})

/**
 * POST /api/orders - Create new order
 */
apiEcommerceRoutes.post('/orders', async (c: Context) => {
  try {
    const db = c.env.DB as D1Database
    const body = await c.req.json()

    // Validate input
    const validated = orderCreateSchema.parse(body)

    const orderId = crypto.randomUUID()
    const orderNumber = `ORD-${Date.now()}`

    // Calculate totals
    let subtotal = 0
    for (const item of validated.items) {
      // TODO: Get product price
      subtotal += item.quantity * 0 // placeholder
    }

    // Create order
    const stmt = db.prepare(`
      INSERT INTO orders (id, store_id, order_number, email, status, payment_status, fulfillment_status, subtotal, total)
      VALUES (?, ?, ?, ?, 'pending', 'unpaid', 'unfulfilled', ?, ?)
    `)

    await stmt.bind(
      orderId,
      c.env.STORE_ID || 'default',
      orderNumber,
      validated.email,
      subtotal,
      subtotal
    ).run()

    return c.json({ id: orderId, orderNumber, message: 'Order created successfully' }, 201)
  } catch (error) {
    console.error('Error creating order:', error)
    return c.json({ error: 'Failed to create order' }, 500)
  }
})

// ============================================================================
// Customers API
// ============================================================================

/**
 * GET /api/customers - List customers
 */
apiEcommerceRoutes.get('/customers', async (c: Context) => {
  try {
    const db = c.env.DB as D1Database
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = (page - 1) * limit

    const stmt = db.prepare(`
      SELECT * FROM customers
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    const result = await stmt.bind(limit, offset).all() as any

    const customers = result.results as Customer[]

    // Get total count
    const countStmt = db.prepare('SELECT COUNT(*) as total FROM customers')
    const countResult = await countStmt.first() as any
    const total = countResult?.total || 0

    return c.json({
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return c.json({ error: 'Failed to fetch customers' }, 500)
  }
})

/**
 * POST /api/customers - Create new customer
 */
apiEcommerceRoutes.post('/customers', async (c: Context) => {
  try {
    const db = c.env.DB as D1Database
    const body = await c.req.json()

    // Validate input
    const validated = customerCreateSchema.parse(body)

    const id = crypto.randomUUID()
    const stmt = db.prepare(`
      INSERT INTO customers (id, store_id, email, first_name, last_name, phone, company)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    await stmt.bind(
      id,
      c.env.STORE_ID || 'default',
      validated.email,
      validated.firstName,
      validated.lastName,
      validated.phone || null,
      validated.company || null
    ).run()

    return c.json({ id, message: 'Customer created successfully' }, 201)
  } catch (error) {
    console.error('Error creating customer:', error)
    return c.json({ error: 'Failed to create customer' }, 500)
  }
})

// ============================================================================
// Inventory API
// ============================================================================

/**
 * GET /api/inventory - Check inventory
 */
apiEcommerceRoutes.get('/inventory', async (c: Context) => {
  try {
    const db = c.env.DB as D1Database
    const variantId = c.req.query('variant_id')

    if (!variantId) {
      return c.json({ error: 'variant_id is required' }, 400)
    }

    const stmt = db.prepare(`
      SELECT * FROM inventory WHERE variant_id = ?
    `)
    const inventory = await stmt.bind(variantId).first() as Inventory

    if (!inventory) {
      return c.json({ available: 0, quantity: 0, reserved: 0 })
    }

    return c.json({
      available: inventory.availableQuantity,
      quantity: inventory.quantity,
      reserved: inventory.reservedQuantity,
      reorderLevel: inventory.reorderLevel
    })
  } catch (error) {
    console.error('Error checking inventory:', error)
    return c.json({ error: 'Failed to check inventory' }, 500)
  }
})

// ============================================================================
// Discounts API
// ============================================================================

/**
 * GET /api/discounts/:code - Validate discount code
 */
apiEcommerceRoutes.get('/discounts/:code', async (c: Context) => {
  try {
    const db = c.env.DB as D1Database
    const code = c.req.param('code')

    const stmt = db.prepare(`
      SELECT * FROM discounts 
      WHERE code = ? AND status = 'active'
      AND (starts_at IS NULL OR starts_at <= datetime('now'))
      AND (ends_at IS NULL OR ends_at > datetime('now'))
    `)
    const discount = await stmt.bind(code).first() as Discount

    if (!discount) {
      return c.json({ valid: false, error: 'Invalid or expired discount code' }, 404)
    }

    if (discount.maxUses && discount.usesCount >= discount.maxUses) {
      return c.json({ valid: false, error: 'Discount code has been used' }, 400)
    }

    return c.json({
      valid: true,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      minimumOrderValue: discount.minimumOrderValue
    })
  } catch (error) {
    console.error('Error validating discount:', error)
    return c.json({ error: 'Failed to validate discount' }, 500)
  }
})

export default apiEcommerceRoutes
