/**
 * Database Service
 * 
 * Core database operations for all entities
 * Handles CRUD operations, querying, and data validation
 */

import { D1Database } from '@cloudflare/workers-types'
import { v4 as uuidv4 } from 'crypto'
import type { PluginLogger } from '@sonicjs-cms/core'
import type {
  Store,
  CreateStoreInput,
  Product,
  CreateProductInput,
  DigitalDownload,
  CreateDigitalDownloadInput,
  Cart,
  CartItem,
  Order,
  CreateOrderInput,
  SecureDownloadLink,
  OrderItem
} from '../types'

export class DatabaseService {
  constructor(private db: D1Database, private logger: PluginLogger) {}

  // ============================================================================
  // STORE OPERATIONS
  // ============================================================================

  async createStore(input: CreateStoreInput): Promise<Store> {
    const now = Math.floor(Date.now() / 1000)
    const id = uuidv4()

    const store: Store = {
      id,
      ...input,
      created_at: now,
      updated_at: now
    }

    await this.db.prepare(`
      INSERT INTO stores (
        id, name, slug, description, owner_user_id, currency, timezone,
        logo_url, email_support, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      store.id,
      store.name,
      store.slug,
      store.description || null,
      store.ownerUserId,
      store.currency,
      store.timezone,
      store.logo_url || null,
      store.email_support || null,
      store.status,
      store.created_at,
      store.updated_at
    ).run()

    this.logger.info(`Store created: ${store.id} (${store.name})`)
    return store
  }

  async getStore(id: string): Promise<Store | null> {
    const result = await this.db.prepare(`
      SELECT * FROM stores WHERE id = ?
    `).bind(id).first() as any

    if (!result) return null
    return this.mapToStore(result)
  }

  async getStoreBySlug(slug: string): Promise<Store | null> {
    const result = await this.db.prepare(`
      SELECT * FROM stores WHERE slug = ?
    `).bind(slug).first() as any

    if (!result) return null
    return this.mapToStore(result)
  }

  async listStores(ownerUserId?: string, limit = 50, offset = 0): Promise<{ stores: Store[]; total: number }> {
    let query = 'SELECT * FROM stores'
    const params: any[] = []

    if (ownerUserId) {
      query += ' WHERE owner_user_id = ?'
      params.push(ownerUserId)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const results = await this.db.prepare(query).bind(...params).all() as any
    const countResult = await this.db.prepare(
      ownerUserId
        ? 'SELECT COUNT(*) as count FROM stores WHERE owner_user_id = ?'
        : 'SELECT COUNT(*) as count FROM stores'
    ).bind(...(ownerUserId ? [ownerUserId] : [])).first() as any

    return {
      stores: results.results?.map((r: any) => this.mapToStore(r)) || [],
      total: countResult?.count || 0
    }
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<Store> {
    const now = Math.floor(Date.now() / 1000)
    const store = await this.getStore(id)

    if (!store) {
      throw new Error(`Store not found: ${id}`)
    }

    const updated: Store = { ...store, ...updates, updated_at: now }

    await this.db.prepare(`
      UPDATE stores SET
        name = ?, slug = ?, description = ?, currency = ?, timezone = ?,
        logo_url = ?, email_support = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      updated.name,
      updated.slug,
      updated.description || null,
      updated.currency,
      updated.timezone,
      updated.logo_url || null,
      updated.email_support || null,
      updated.status,
      updated.updated_at,
      id
    ).run()

    this.logger.info(`Store updated: ${id}`)
    return updated
  }

  async deleteStore(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM stores WHERE id = ?').bind(id).run()
    this.logger.info(`Store deleted: ${id}`)
  }

  // ============================================================================
  // PRODUCT OPERATIONS
  // ============================================================================

  async createProduct(input: CreateProductInput): Promise<Product> {
    const now = Math.floor(Date.now() / 1000)
    const id = uuidv4()

    const product: Product = {
      id,
      ...input,
      created_at: now,
      updated_at: now
    }

    await this.db.prepare(`
      INSERT INTO products (
        id, store_id, name, slug, description, price, cost, stock_quantity,
        status, type, image_url, sku, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      product.id,
      product.store_id,
      product.name,
      product.slug,
      product.description || null,
      product.price,
      product.cost || null,
      product.stock_quantity,
      product.status,
      product.type,
      product.image_url || null,
      product.sku || null,
      product.created_at,
      product.updated_at
    ).run()

    this.logger.info(`Product created: ${product.id} (${product.name})`)
    return product
  }

  async getProduct(id: string): Promise<Product | null> {
    const result = await this.db.prepare(`
      SELECT * FROM products WHERE id = ?
    `).bind(id).first() as any

    if (!result) return null
    return this.mapToProduct(result)
  }

  async listProducts(storeId: string, limit = 50, offset = 0, status?: string): Promise<{ products: Product[]; total: number }> {
    let query = 'SELECT * FROM products WHERE store_id = ?'
    const params: any[] = [storeId]

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const results = await this.db.prepare(query).bind(...params).all() as any
    const countQuery = 'SELECT COUNT(*) as count FROM products WHERE store_id = ?' + (status ? ' AND status = ?' : '')
    const countParams = status ? [storeId, status] : [storeId]
    const countResult = await this.db.prepare(countQuery).bind(...countParams).first() as any

    return {
      products: results.results?.map((r: any) => this.mapToProduct(r)) || [],
      total: countResult?.count || 0
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const now = Math.floor(Date.now() / 1000)
    const product = await this.getProduct(id)

    if (!product) {
      throw new Error(`Product not found: ${id}`)
    }

    const updated: Product = { ...product, ...updates, updated_at: now }

    await this.db.prepare(`
      UPDATE products SET
        name = ?, slug = ?, description = ?, price = ?, cost = ?,
        stock_quantity = ?, status = ?, image_url = ?, sku = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      updated.name,
      updated.slug,
      updated.description || null,
      updated.price,
      updated.cost || null,
      updated.stock_quantity,
      updated.status,
      updated.image_url || null,
      updated.sku || null,
      updated.updated_at,
      id
    ).run()

    this.logger.info(`Product updated: ${id}`)
    return updated
  }

  async deleteProduct(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
    this.logger.info(`Product deleted: ${id}`)
  }

  // ============================================================================
  // DIGITAL DOWNLOAD OPERATIONS
  // ============================================================================

  async createDigitalDownload(input: CreateDigitalDownloadInput): Promise<DigitalDownload> {
    const now = Math.floor(Date.now() / 1000)
    const id = uuidv4()

    const download: DigitalDownload = {
      id,
      ...input,
      created_at: now,
      updated_at: now
    }

    await this.db.prepare(`
      INSERT INTO digital_downloads (
        id, product_id, r2_object_key, file_name, file_size_bytes,
        mime_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      download.id,
      download.product_id,
      download.r2_object_key,
      download.file_name,
      download.file_size_bytes,
      download.mime_type,
      download.created_at,
      download.updated_at
    ).run()

    this.logger.info(`Digital download created: ${download.id}`)
    return download
  }

  async getDigitalDownloadByProductId(productId: string): Promise<DigitalDownload | null> {
    const result = await this.db.prepare(`
      SELECT * FROM digital_downloads WHERE product_id = ?
    `).bind(productId).first() as any

    if (!result) return null
    return this.mapToDigitalDownload(result)
  }

  async deleteDigitalDownload(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM digital_downloads WHERE id = ?').bind(id).run()
    this.logger.info(`Digital download deleted: ${id}`)
  }

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  async getOrCreateCart(userId: string, storeId: string): Promise<Cart> {
    let cart = await this.db.prepare(`
      SELECT * FROM carts WHERE user_id = ? AND store_id = ?
    `).bind(userId, storeId).first() as any

    if (!cart) {
      const id = uuidv4()
      const now = Math.floor(Date.now() / 1000)

      await this.db.prepare(`
        INSERT INTO carts (id, user_id, store_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, userId, storeId, now, now).run()

      cart = { id, user_id: userId, store_id: storeId, created_at: now, updated_at: now }
    }

    const items = await this.db.prepare(`
      SELECT * FROM cart_items WHERE cart_id = ?
    `).bind(cart.id).all() as any

    return {
      id: cart.id,
      user_id: cart.user_id,
      store_id: cart.store_id,
      items: items.results?.map((r: any) => this.mapToCartItem(r)) || [],
      created_at: cart.created_at,
      updated_at: cart.updated_at
    }
  }

  async addToCart(cartId: string, productId: string, quantity: number, priceAtTime: number): Promise<CartItem> {
    const id = uuidv4()
    const now = Math.floor(Date.now() / 1000)

    await this.db.prepare(`
      INSERT INTO cart_items (id, cart_id, product_id, quantity, price_at_time, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, cartId, productId, quantity, priceAtTime, now).run()

    await this.db.prepare(`
      UPDATE carts SET updated_at = ? WHERE id = ?
    `).bind(now, cartId).run()

    return { id, cart_id: cartId, product_id: productId, quantity, price_at_time: priceAtTime, created_at: now }
  }

  async removeFromCart(cartItemId: string, cartId: string): Promise<void> {
    await this.db.prepare(`
      DELETE FROM cart_items WHERE id = ?
    `).bind(cartItemId).run()

    const now = Math.floor(Date.now() / 1000)
    await this.db.prepare(`
      UPDATE carts SET updated_at = ? WHERE id = ?
    `).bind(now, cartId).run()

    this.logger.info(`Cart item removed: ${cartItemId}`)
  }

  async clearCart(cartId: string): Promise<void> {
    await this.db.prepare(`
      DELETE FROM cart_items WHERE cart_id = ?
    `).bind(cartId).run()

    this.logger.info(`Cart cleared: ${cartId}`)
  }

  // ============================================================================
  // ORDER OPERATIONS
  // ============================================================================

  async createOrder(input: CreateOrderInput, userId: string): Promise<Order> {
    const now = Math.floor(Date.now() / 1000)
    const id = uuidv4()

    let subtotal = 0
    const orderItems: OrderItem[] = []

    for (const item of input.items) {
      const product = await this.getProduct(item.product_id)
      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`)
      }

      const itemSubtotal = product.price * item.quantity
      subtotal += itemSubtotal

      const orderItem: OrderItem = {
        id: uuidv4(),
        order_id: id,
        product_id: product.id,
        product_name: product.name,
        product_type: product.type,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: itemSubtotal,
        created_at: now
      }
      orderItems.push(orderItem)
    }

    const tax = subtotal * 0.08 // Example: 8% tax
    const shipping = input.items.some(item => input.items[0]) ? 10 : 0 // Example: flat $10 shipping
    const total = subtotal + tax + shipping

    const order: Order = {
      id,
      store_id: input.store_id,
      user_id: userId,
      customer_email: input.customer_email,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      payment_method: input.payment_method,
      payment_status: input.payment_method === 'free' ? 'completed' : 'pending',
      fulfillment_status: 'pending',
      shipping_address: input.shipping_address,
      created_at: now,
      updated_at: now
    }

    await this.db.prepare(`
      INSERT INTO orders (
        id, store_id, user_id, customer_email, subtotal, tax, shipping, total,
        payment_method, payment_status, fulfillment_status, shipping_address,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      order.id,
      order.store_id,
      order.user_id,
      order.customer_email,
      order.subtotal,
      order.tax,
      order.shipping,
      order.total,
      order.payment_method,
      order.payment_status,
      order.fulfillment_status,
      order.shipping_address ? JSON.stringify(order.shipping_address) : null,
      order.created_at,
      order.updated_at
    ).run()

    for (const item of orderItems) {
      await this.db.prepare(`
        INSERT INTO order_items (
          id, order_id, product_id, product_name, product_type,
          quantity, unit_price, subtotal, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        item.id,
        item.order_id,
        item.product_id,
        item.product_name,
        item.product_type,
        item.quantity,
        item.unit_price,
        item.subtotal,
        item.created_at
      ).run()
    }

    this.logger.info(`Order created: ${order.id} for ${order.customer_email}`)
    return order
  }

  async getOrder(id: string): Promise<Order | null> {
    const result = await this.db.prepare(`
      SELECT * FROM orders WHERE id = ?
    `).bind(id).first() as any

    if (!result) return null

    const items = await this.db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).bind(id).all() as any

    return this.mapToOrder(result, items.results || [])
  }

  async listOrders(storeId: string, limit = 50, offset = 0): Promise<{ orders: Order[]; total: number }> {
    const results = await this.db.prepare(`
      SELECT * FROM orders WHERE store_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).bind(storeId, limit, offset).all() as any

    const countResult = await this.db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE store_id = ?
    `).bind(storeId).first() as any

    const orders: Order[] = []
    for (const order of results.results || []) {
      const items = await this.db.prepare(`
        SELECT * FROM order_items WHERE order_id = ?
      `).bind(order.id).all() as any

      orders.push(this.mapToOrder(order, items.results || []))
    }

    return {
      orders,
      total: countResult?.count || 0
    }
  }

  async updateOrderPaymentStatus(orderId: string, status: 'completed' | 'failed' | 'refunded', paymentIntentId?: string, paypalOrderId?: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000)

    await this.db.prepare(`
      UPDATE orders SET payment_status = ?, stripe_payment_intent_id = ?, paypal_order_id = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      status,
      paymentIntentId || null,
      paypalOrderId || null,
      now,
      orderId
    ).run()

    this.logger.info(`Order payment status updated: ${orderId} -> ${status}`)
  }

  // ============================================================================
  // SECURE DOWNLOAD LINK OPERATIONS
  // ============================================================================

  async createSecureDownloadLink(
    orderId: string,
    productId: string,
    digitalDownloadId: string,
    maxDownloads: number,
    expiryDays: number
  ): Promise<SecureDownloadLink> {
    const id = uuidv4()
    const token = this.generateSecureToken()
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + (expiryDays * 24 * 60 * 60)

    const link: SecureDownloadLink = {
      id,
      order_id: orderId,
      product_id: productId,
      digital_download_id: digitalDownloadId,
      token,
      download_count: 0,
      max_downloads: maxDownloads,
      expires_at: expiresAt,
      created_at: now
    }

    await this.db.prepare(`
      INSERT INTO secure_download_links (
        id, order_id, product_id, digital_download_id, token,
        download_count, max_downloads, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      link.id,
      link.order_id,
      link.product_id,
      link.digital_download_id,
      link.token,
      link.download_count,
      link.max_downloads,
      link.expires_at,
      link.created_at
    ).run()

    this.logger.info(`Secure download link created: ${link.id}`)
    return link
  }

  async getSecureDownloadLink(token: string): Promise<SecureDownloadLink | null> {
    const now = Math.floor(Date.now() / 1000)

    const result = await this.db.prepare(`
      SELECT * FROM secure_download_links
      WHERE token = ? AND expires_at > ? AND download_count < max_downloads
    `).bind(token, now).first() as any

    if (!result) return null
    return this.mapToSecureDownloadLink(result)
  }

  async incrementDownloadCount(linkId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE secure_download_links SET download_count = download_count + 1
      WHERE id = ?
    `).bind(linkId).run()
  }

  async getDownloadLinksForOrder(orderId: string): Promise<SecureDownloadLink[]> {
    const results = await this.db.prepare(`
      SELECT * FROM secure_download_links WHERE order_id = ?
    `).bind(orderId).all() as any

    return results.results?.map((r: any) => this.mapToSecureDownloadLink(r)) || []
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapToStore(row: any): Store {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      ownerUserId: row.owner_user_id,
      currency: row.currency,
      timezone: row.timezone,
      logo_url: row.logo_url,
      email_support: row.email_support,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }

  private mapToProduct(row: any): Product {
    return {
      id: row.id,
      store_id: row.store_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: row.price,
      cost: row.cost,
      stock_quantity: row.stock_quantity,
      status: row.status,
      type: row.type,
      image_url: row.image_url,
      sku: row.sku,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }

  private mapToDigitalDownload(row: any): DigitalDownload {
    return {
      id: row.id,
      product_id: row.product_id,
      r2_object_key: row.r2_object_key,
      file_name: row.file_name,
      file_size_bytes: row.file_size_bytes,
      mime_type: row.mime_type,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }

  private mapToCartItem(row: any): CartItem {
    return {
      id: row.id,
      cart_id: row.cart_id,
      product_id: row.product_id,
      quantity: row.quantity,
      price_at_time: row.price_at_time,
      created_at: row.created_at
    }
  }

  private mapToOrder(row: any, items: any[]): Order {
    return {
      id: row.id,
      store_id: row.store_id,
      user_id: row.user_id,
      customer_email: row.customer_email,
      items: items.map(i => this.mapToOrderItem(i)),
      subtotal: row.subtotal,
      tax: row.tax,
      shipping: row.shipping,
      total: row.total,
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      fulfillment_status: row.fulfillment_status,
      stripe_payment_intent_id: row.stripe_payment_intent_id,
      paypal_order_id: row.paypal_order_id,
      shipping_address: row.shipping_address ? JSON.parse(row.shipping_address) : undefined,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }

  private mapToOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      order_id: row.order_id,
      product_id: row.product_id,
      product_name: row.product_name,
      product_type: row.product_type,
      quantity: row.quantity,
      unit_price: row.unit_price,
      subtotal: row.subtotal,
      created_at: row.created_at
    }
  }

  private mapToSecureDownloadLink(row: any): SecureDownloadLink {
    return {
      id: row.id,
      order_id: row.order_id,
      product_id: row.product_id,
      digital_download_id: row.digital_download_id,
      token: row.token,
      download_count: row.download_count,
      max_downloads: row.max_downloads,
      expires_at: row.expires_at,
      created_at: row.created_at
    }
  }

  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }
}
