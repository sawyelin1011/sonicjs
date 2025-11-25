/**
 * Multi-Store Payments & Digital Downloads Plugin - Type Definitions
 *
 * Comprehensive TypeScript types and Zod validation schemas for:
 * - Multi-store management
 * - Physical and digital products
 * - Cart and checkout
 * - Orders with payment tracking
 * - Digital downloads with secure links
 * - Payment gateway integration
 */

import { z } from 'zod'

// ============================================================================
// STORE SCHEMAS
// ============================================================================

export const StoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Store name is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().optional(),
  ownerUserId: z.string().uuid(),
  currency: z.string().length(3).default('USD'),
  timezone: z.string().default('UTC'),
  logo_url: z.string().url().optional(),
  email_support: z.string().email().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  created_at: z.number(),
  updated_at: z.number()
})

export type Store = z.infer<typeof StoreSchema>

export const CreateStoreInputSchema = StoreSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export type CreateStoreInput = z.infer<typeof CreateStoreInputSchema>

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const ProductSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  cost: z.number().nonnegative().optional(),
  stock_quantity: z.number().nonnegative(),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
  type: z.enum(['physical', 'digital']),
  image_url: z.string().url().optional(),
  sku: z.string().optional(),
  created_at: z.number(),
  updated_at: z.number()
})

export type Product = z.infer<typeof ProductSchema>

export const CreateProductInputSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export type CreateProductInput = z.infer<typeof CreateProductInputSchema>

// ============================================================================
// DIGITAL DOWNLOAD SCHEMAS
// ============================================================================

export const DigitalDownloadSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  r2_object_key: z.string().min(1),
  file_name: z.string().min(1),
  file_size_bytes: z.number().positive(),
  mime_type: z.string(),
  created_at: z.number(),
  updated_at: z.number()
})

export type DigitalDownload = z.infer<typeof DigitalDownloadSchema>

export const CreateDigitalDownloadInputSchema = DigitalDownloadSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export type CreateDigitalDownloadInput = z.infer<typeof CreateDigitalDownloadInputSchema>

// ============================================================================
// CART SCHEMAS
// ============================================================================

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  cart_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().positive('Quantity must be at least 1'),
  price_at_time: z.number().positive(),
  created_at: z.number()
})

export type CartItem = z.infer<typeof CartItemSchema>

export const CartSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  store_id: z.string().uuid(),
  items: z.array(CartItemSchema),
  created_at: z.number(),
  updated_at: z.number()
})

export type Cart = z.infer<typeof CartSchema>

export const AddToCartInputSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().positive('Quantity must be at least 1').default(1),
  store_id: z.string().uuid()
})

export type AddToCartInput = z.infer<typeof AddToCartInputSchema>

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_type: z.enum(['physical', 'digital']),
  quantity: z.number().positive(),
  unit_price: z.number().positive(),
  subtotal: z.number().positive(),
  created_at: z.number()
})

export type OrderItem = z.infer<typeof OrderItemSchema>

export const OrderSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  user_id: z.string().uuid(),
  customer_email: z.string().email(),
  items: z.array(OrderItemSchema),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().positive(),
  payment_method: z.enum(['stripe', 'paypal', 'free']),
  payment_status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  fulfillment_status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  stripe_payment_intent_id: z.string().optional(),
  paypal_order_id: z.string().optional(),
  shipping_address: z.object({
    name: z.string(),
    email: z.string().email(),
    address_line1: z.string(),
    address_line2: z.string().optional(),
    city: z.string(),
    state_province: z.string(),
    postal_code: z.string(),
    country: z.string()
  }).optional(),
  notes: z.string().optional(),
  created_at: z.number(),
  updated_at: z.number()
})

export type Order = z.infer<typeof OrderSchema>

export const CreateOrderInputSchema = z.object({
  store_id: z.string().uuid(),
  customer_email: z.string().email(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive()
  })),
  shipping_address: z.object({
    name: z.string(),
    email: z.string().email(),
    address_line1: z.string(),
    address_line2: z.string().optional(),
    city: z.string(),
    state_province: z.string(),
    postal_code: z.string(),
    country: z.string()
  }).optional(),
  payment_method: z.enum(['stripe', 'paypal', 'free'])
})

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>

// ============================================================================
// SECURE DOWNLOAD LINK SCHEMAS
// ============================================================================

export const SecureDownloadLinkSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  digital_download_id: z.string().uuid(),
  token: z.string().min(32),
  download_count: z.number().nonnegative().default(0),
  max_downloads: z.number().nonnegative(),
  expires_at: z.number(),
  created_at: z.number()
})

export type SecureDownloadLink = z.infer<typeof SecureDownloadLinkSchema>

export const CreateSecureDownloadLinkInputSchema = SecureDownloadLinkSchema.omit({
  id: true,
  token: true,
  download_count: true,
  created_at: true
})

export type CreateSecureDownloadLinkInput = z.infer<typeof CreateSecureDownloadLinkInputSchema>

// ============================================================================
// PAYMENT GATEWAY SCHEMAS
// ============================================================================

export const StripeConfigSchema = z.object({
  enabled: z.boolean().default(false),
  publishable_key: z.string().min(1),
  secret_key: z.string().min(1),
  webhook_secret: z.string().min(1),
  mode: z.enum(['test', 'live']).default('test')
})

export type StripeConfig = z.infer<typeof StripeConfigSchema>

export const PayPalConfigSchema = z.object({
  enabled: z.boolean().default(false),
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  mode: z.enum(['sandbox', 'live']).default('sandbox')
})

export type PayPalConfig = z.infer<typeof PayPalConfigSchema>

export const PaymentGatewayConfigSchema = z.object({
  stripe: StripeConfigSchema.optional(),
  paypal: PayPalConfigSchema.optional()
})

export type PaymentGatewayConfig = z.infer<typeof PaymentGatewayConfigSchema>

// ============================================================================
// STRIPE WEBHOOK SCHEMAS
// ============================================================================

export const StripeWebhookEventSchema = z.object({
  id: z.string(),
  object: z.string(),
  api_version: z.string(),
  created: z.number(),
  data: z.object({
    object: z.record(z.any()),
    previous_attributes: z.record(z.any()).optional()
  }),
  livemode: z.boolean(),
  pending_webhooks: z.number(),
  request: z.object({
    id: z.string().nullable(),
    idempotency_key: z.string().nullable()
  }),
  type: z.string()
})

export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>

// ============================================================================
// PLUGIN CONFIG SCHEMA
// ============================================================================

export const MultiStorePaymentsConfigSchema = z.object({
  enabled: z.boolean().default(true),
  payment_gateways: PaymentGatewayConfigSchema,
  digital_download_expiry_days: z.number().positive().default(30),
  digital_download_max_downloads: z.number().positive().default(5),
  stripe_webhook_secret: z.string().optional(),
  paypal_webhook_id: z.string().optional(),
  enable_test_mode: z.boolean().default(true)
})

export type MultiStorePaymentsConfig = z.infer<typeof MultiStorePaymentsConfigSchema>

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  errors: z.array(z.string()).optional()
})

export type ApiResponse = z.infer<typeof ApiResponseSchema>

export const PaginationSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
  total: z.number().nonnegative(),
  pages: z.number().nonnegative()
})

export type Pagination = z.infer<typeof PaginationSchema>
