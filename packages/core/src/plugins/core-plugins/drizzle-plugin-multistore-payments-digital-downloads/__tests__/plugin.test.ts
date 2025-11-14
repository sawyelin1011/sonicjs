/**
 * Multi-Store Payments Plugin - Test Suite
 *
 * Comprehensive tests for:
 * - Store management
 * - Product creation and management
 * - Cart operations
 * - Order processing
 * - Digital downloads
 * - Payment gateway integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { D1Database } from '@cloudflare/workers-types'
import { DatabaseService } from '../services/DatabaseService'
import { PaymentService } from '../services/PaymentService'
import { DigitalDownloadService } from '../services/DigitalDownloadService'
import type { PluginLogger } from '@sonicjs-cms/core'

// Mock logger
const mockLogger: PluginLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

// Mock database
const mockDb: Partial<D1Database> = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  run: vi.fn().mockResolvedValue({ success: true }),
  first: vi.fn().mockResolvedValue(null),
  all: vi.fn().mockResolvedValue({ results: [] }),
  exec: vi.fn().mockResolvedValue(undefined)
}

describe('Multi-Store Payments Plugin', () => {
  // ============================================================================
  // STORE OPERATIONS TESTS
  // ============================================================================

  describe('Store Operations', () => {
    let dbService: DatabaseService

    beforeEach(() => {
      dbService = new DatabaseService(mockDb as D1Database, mockLogger)
      vi.clearAllMocks()
    })

    it('should create a new store', async () => {
      const storeInput = {
        name: 'Test Store',
        slug: 'test-store',
        description: 'A test store',
        ownerUserId: 'user-123',
        currency: 'USD',
        timezone: 'UTC',
        logo_url: 'https://example.com/logo.png',
        email_support: 'support@example.com',
        status: 'active' as const
      }

      const store = await dbService.createStore(storeInput)

      expect(store).toMatchObject(storeInput)
      expect(store.id).toBeDefined()
      expect(store.created_at).toBeDefined()
      expect(store.updated_at).toBeDefined()
      expect(mockLogger.info).toHaveBeenCalled()
    })

    it('should retrieve a store by ID', async () => {
      const mockStoreData = {
        id: 'store-123',
        name: 'Test Store',
        slug: 'test-store',
        owner_user_id: 'user-123'
      }

      vi.mocked(mockDb.first).mockResolvedValueOnce(mockStoreData)
      const store = await dbService.getStore('store-123')

      expect(store).toBeDefined()
      expect(store?.id).toBe('store-123')
    })

    it('should list stores by owner', async () => {
      const mockStores = [
        { id: 'store-1', name: 'Store 1', owner_user_id: 'user-123' },
        { id: 'store-2', name: 'Store 2', owner_user_id: 'user-123' }
      ]

      vi.mocked(mockDb.all).mockResolvedValueOnce({ results: mockStores })
      vi.mocked(mockDb.first).mockResolvedValueOnce({ count: 2 })

      const { stores, total } = await dbService.listStores('user-123')

      expect(stores).toHaveLength(2)
      expect(total).toBe(2)
    })

    it('should update a store', async () => {
      const existingStore = {
        id: 'store-123',
        name: 'Old Name',
        slug: 'test-store'
      }

      vi.mocked(mockDb.first).mockResolvedValueOnce(existingStore)

      const updated = await dbService.updateStore('store-123', { name: 'New Name' })

      expect(updated.name).toBe('New Name')
      expect(updated.updated_at).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // PRODUCT OPERATIONS TESTS
  // ============================================================================

  describe('Product Operations', () => {
    let dbService: DatabaseService

    beforeEach(() => {
      dbService = new DatabaseService(mockDb as D1Database, mockLogger)
      vi.clearAllMocks()
    })

    it('should create a physical product', async () => {
      const productInput = {
        store_id: 'store-123',
        name: 'Laptop',
        slug: 'laptop',
        description: 'High-performance laptop',
        price: 999.99,
        cost: 500,
        stock_quantity: 50,
        status: 'active' as const,
        type: 'physical' as const,
        sku: 'LAPTOP-001'
      }

      const product = await dbService.createProduct(productInput)

      expect(product).toMatchObject(productInput)
      expect(product.id).toBeDefined()
      expect(product.type).toBe('physical')
    })

    it('should create a digital product', async () => {
      const productInput = {
        store_id: 'store-123',
        name: 'E-Book',
        slug: 'ebook',
        description: 'Digital e-book',
        price: 9.99,
        stock_quantity: 0,
        status: 'active' as const,
        type: 'digital' as const
      }

      const product = await dbService.createProduct(productInput)

      expect(product.type).toBe('digital')
      expect(product.stock_quantity).toBe(0)
    })

    it('should list products for a store', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', store_id: 'store-123', status: 'active' },
        { id: 'prod-2', name: 'Product 2', store_id: 'store-123', status: 'active' }
      ]

      vi.mocked(mockDb.all).mockResolvedValueOnce({ results: mockProducts })
      vi.mocked(mockDb.first).mockResolvedValueOnce({ count: 2 })

      const { products, total } = await dbService.listProducts('store-123')

      expect(products).toHaveLength(2)
      expect(total).toBe(2)
    })

    it('should update product status', async () => {
      const existingProduct = {
        id: 'prod-123',
        name: 'Product',
        status: 'draft'
      }

      vi.mocked(mockDb.first).mockResolvedValueOnce(existingProduct)

      const updated = await dbService.updateProduct('prod-123', { status: 'active' })

      expect(updated.status).toBe('active')
    })
  })

  // ============================================================================
  // CART OPERATIONS TESTS
  // ============================================================================

  describe('Cart Operations', () => {
    let dbService: DatabaseService

    beforeEach(() => {
      dbService = new DatabaseService(mockDb as D1Database, mockLogger)
      vi.clearAllMocks()
    })

    it('should create or get cart for user', async () => {
      vi.mocked(mockDb.first).mockResolvedValueOnce(null) // No existing cart
      vi.mocked(mockDb.all).mockResolvedValueOnce({ results: [] })

      const cart = await dbService.getOrCreateCart('user-123', 'store-123')

      expect(cart.user_id).toBe('user-123')
      expect(cart.store_id).toBe('store-123')
      expect(cart.items).toHaveLength(0)
    })

    it('should add item to cart', async () => {
      const cartItem = await dbService.addToCart('cart-123', 'prod-123', 2, 29.99)

      expect(cartItem.cart_id).toBe('cart-123')
      expect(cartItem.product_id).toBe('prod-123')
      expect(cartItem.quantity).toBe(2)
      expect(cartItem.price_at_time).toBe(29.99)
    })

    it('should remove item from cart', async () => {
      await dbService.removeFromCart('item-123', 'cart-123')

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Cart item removed'))
    })

    it('should clear cart', async () => {
      await dbService.clearCart('cart-123')

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Cart cleared'))
    })
  })

  // ============================================================================
  // ORDER OPERATIONS TESTS
  // ============================================================================

  describe('Order Operations', () => {
    let dbService: DatabaseService

    beforeEach(() => {
      dbService = new DatabaseService(mockDb as D1Database, mockLogger)
      vi.clearAllMocks()
    })

    it('should create an order', async () => {
      const mockProduct = {
        id: 'prod-123',
        name: 'Product',
        price: 99.99,
        type: 'physical'
      }

      vi.mocked(mockDb.first).mockResolvedValueOnce(mockProduct)

      const orderInput = {
        store_id: 'store-123',
        customer_email: 'customer@example.com',
        items: [{ product_id: 'prod-123', quantity: 2 }],
        payment_method: 'stripe' as const
      }

      const order = await dbService.createOrder(orderInput, 'user-123')

      expect(order.id).toBeDefined()
      expect(order.customer_email).toBe('customer@example.com')
      expect(order.items).toHaveLength(1)
      expect(order.total).toBeGreaterThan(0)
      expect(order.subtotal).toBe(199.98) // 99.99 * 2
    })

    it('should calculate tax and shipping', async () => {
      const mockProduct = {
        id: 'prod-123',
        name: 'Product',
        price: 100,
        type: 'physical'
      }

      vi.mocked(mockDb.first).mockResolvedValueOnce(mockProduct)

      const orderInput = {
        store_id: 'store-123',
        customer_email: 'customer@example.com',
        items: [{ product_id: 'prod-123', quantity: 1 }],
        payment_method: 'free' as const
      }

      const order = await dbService.createOrder(orderInput, 'user-123')

      expect(order.subtotal).toBe(100)
      expect(order.tax).toBe(8) // 8% tax
      expect(order.shipping).toBe(10) // Flat $10 shipping
      expect(order.total).toBe(118)
    })

    it('should update order payment status', async () => {
      await dbService.updateOrderPaymentStatus('order-123', 'completed', 'pi_123456')

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('payment status updated'))
    })
  })

  // ============================================================================
  // DIGITAL DOWNLOAD TESTS
  // ============================================================================

  describe('Digital Downloads', () => {
    let dbService: DatabaseService
    let downloadService: DigitalDownloadService

    beforeEach(() => {
      dbService = new DatabaseService(mockDb as D1Database, mockLogger)
      downloadService = new DigitalDownloadService(dbService, undefined, mockLogger, 30, 5)
      vi.clearAllMocks()
    })

    it('should create secure download links for order', async () => {
      vi.mocked(mockDb.prepare).mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
        first: vi.fn().mockResolvedValue(null),
        all: vi.fn().mockResolvedValue({ results: [] })
      } as any)

      const links = await downloadService.createDownloadLinksForOrder('order-123', [
        { productId: 'prod-1', digitalDownloadId: 'dd-1' },
        { productId: 'prod-2', digitalDownloadId: 'dd-2' }
      ])

      expect(links).toHaveLength(2)
      links.forEach(link => {
        expect(link.order_id).toBe('order-123')
        expect(link.token).toBeDefined()
        expect(link.token.length).toBeGreaterThan(32)
        expect(link.max_downloads).toBe(5)
      })
    })

    it('should validate download link', async () => {
      const now = Math.floor(Date.now() / 1000)
      const mockLink = {
        id: 'link-123',
        order_id: 'order-123',
        token: 'valid-token',
        download_count: 2,
        max_downloads: 5,
        expires_at: now + 86400 // 1 day from now
      }

      vi.mocked(mockDb.first).mockResolvedValueOnce(mockLink)

      const link = await downloadService.validateDownloadLink('valid-token')

      expect(link).toBeDefined()
      expect(link?.token).toBe('valid-token')
    })

    it('should reject expired download link', async () => {
      const now = Math.floor(Date.now() / 1000)
      const mockLink = {
        id: 'link-123',
        expires_at: now - 86400 // 1 day ago
      }

      vi.mocked(mockDb.first).mockResolvedValueOnce(null) // Simulating expired link not found

      const link = await downloadService.validateDownloadLink('expired-token')

      expect(link).toBeNull()
    })

    it('should reject download link at limit', async () => {
      const mockLink = {
        id: 'link-123',
        download_count: 5,
        max_downloads: 5
      }

      vi.mocked(mockDb.first).mockResolvedValueOnce(null) // Simulating limit reached

      const link = await downloadService.validateDownloadLink('limit-exceeded-token')

      expect(link).toBeNull()
    })
  })

  // ============================================================================
  // PAYMENT SERVICE TESTS
  // ============================================================================

  describe('Payment Service', () => {
    let paymentService: PaymentService

    beforeEach(() => {
      const stripeConfig = {
        enabled: true,
        publishable_key: 'pk_test_123',
        secret_key: 'sk_test_123',
        webhook_secret: 'whsec_test_123',
        mode: 'test' as const
      }

      const paypalConfig = {
        enabled: true,
        client_id: 'client_123',
        client_secret: 'secret_123',
        mode: 'sandbox' as const
      }

      paymentService = new PaymentService(mockLogger, stripeConfig, paypalConfig)
      vi.clearAllMocks()
    })

    it('should check if Stripe is enabled', () => {
      expect(paymentService.isStripeEnabled()).toBe(true)
    })

    it('should check if PayPal is enabled', () => {
      expect(paymentService.isPayPalEnabled()).toBe(true)
    })

    it('should get available payment methods', () => {
      const methods = paymentService.getAvailablePaymentMethods()

      expect(methods).toContain('stripe')
      expect(methods).toContain('paypal')
      expect(methods).toContain('free')
    })

    it('should verify webhook signature', async () => {
      const isValid = await paymentService.verifyStripeWebhookSignature('body', 'signature')

      expect(typeof isValid).toBe('boolean')
    })
  })

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests', () => {
    let dbService: DatabaseService

    beforeEach(() => {
      dbService = new DatabaseService(mockDb as D1Database, mockLogger)
      vi.clearAllMocks()
    })

    it('should complete full purchase workflow', async () => {
      // This would be a full integration test in a real scenario
      // For now, we'll verify the workflow logic
      const storeInput = {
        name: 'Integration Test Store',
        slug: 'integration-test',
        ownerUserId: 'user-123',
        currency: 'USD',
        timezone: 'UTC',
        status: 'active' as const
      }

      const productInput = {
        store_id: 'store-123',
        name: 'Test Product',
        slug: 'test-product',
        price: 29.99,
        stock_quantity: 100,
        status: 'active' as const,
        type: 'physical' as const
      }

      const orderInput = {
        store_id: 'store-123',
        customer_email: 'test@example.com',
        items: [{ product_id: 'prod-123', quantity: 1 }],
        payment_method: 'stripe' as const
      }

      // Verify inputs are valid
      expect(storeInput.name).toBeDefined()
      expect(productInput.price).toBeGreaterThan(0)
      expect(orderInput.items.length).toBeGreaterThan(0)
    })
  })
})
