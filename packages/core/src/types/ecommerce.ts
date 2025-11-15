/**
 * E-Commerce Types
 * Complete type definitions for products, orders, customers, and inventory
 */

import { z } from 'zod'

// ============================================================================
// Products
// ============================================================================

export interface Product {
  id: string
  storeId: string
  name: string
  slug: string
  description?: string
  longDescription?: string
  price: number
  costPrice?: number
  compareAtPrice?: number
  status: 'draft' | 'active' | 'archived'
  sku?: string
  barcode?: string
  weight?: number
  weightUnit: 'lb' | 'kg' | 'g' | 'oz'
  requiresShipping: boolean
  isPhysical: boolean
  isDigital: boolean
  digitalUrl?: string
  digitalExpiresDays?: number
  rating: number
  reviewCount: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  metadata?: Record<string, any>
}

export interface ProductVariant {
  id: string
  productId: string
  storeId: string
  title: string
  sku?: string
  barcode?: string
  price?: number
  costPrice?: number
  compareAtPrice?: number
  weight?: number
  weightUnit: 'lb' | 'kg' | 'g' | 'oz'
  requiresShipping: boolean
  isDefault: boolean
  imageUrl?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ProductOption {
  id: string
  productId: string
  name: string
  position: number
  values: string[]
}

export interface ProductImage {
  id: string
  productId: string
  variantId?: string
  url: string
  altText?: string
  position: number
  createdAt: Date
}

export interface ProductCategory {
  id: string
  storeId: string
  name: string
  slug: string
  description?: string
  parentId?: string
  imageUrl?: string
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductTag {
  id: string
  storeId: string
  name: string
  slug: string
  createdAt: Date
}

// ============================================================================
// Orders
// ============================================================================

export interface Order {
  id: string
  storeId: string
  orderNumber: string
  customerId?: string
  email: string
  phone?: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'partial'
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'cancelled'
  subtotal: number
  taxAmount: number
  shippingCost: number
  discountAmount: number
  total: number
  currency: string
  notes?: string
  shippingMethod?: string
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
  shippedAt?: Date
  deliveredAt?: Date
  metadata?: Record<string, any>
}

export interface OrderItem {
  id: string
  orderId: string
  productId?: string
  variantId?: string
  title: string
  sku?: string
  quantity: number
  price: number
  costPrice?: number
  total: number
  taxAmount: number
  discountAmount: number
  properties?: Record<string, any>
  createdAt: Date
}

export interface Payment {
  id: string
  orderId: string
  storeId: string
  gateway: 'stripe' | 'paypal' | 'square' | 'custom'
  gatewayTransactionId?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod: string
  cardLastFour?: string
  cardBrand?: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface Refund {
  id: string
  orderId: string
  paymentId?: string
  storeId: string
  amount: number
  reason?: string
  status: 'pending' | 'completed' | 'failed'
  gatewayTransactionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Shipment {
  id: string
  orderId: string
  storeId: string
  status: 'pending' | 'shipped' | 'delivered' | 'returned'
  carrier?: string
  trackingNumber?: string
  trackingUrl?: string
  shippedAt?: Date
  estimatedDelivery?: Date
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ShippingAddress {
  id: string
  orderId: string
  customerId?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  streetAddress: string
  streetAddress2?: string
  city: string
  state?: string
  zipCode: string
  country: string
  countryCode?: string
  isDefault: boolean
}

export interface BillingAddress {
  id: string
  orderId: string
  customerId?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  streetAddress: string
  streetAddress2?: string
  city: string
  state?: string
  zipCode: string
  country: string
  countryCode?: string
  isDefault: boolean
}

// ============================================================================
// Customers
// ============================================================================

export interface Customer {
  id: string
  storeId: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  company?: string
  notes?: string
  tags?: string[]
  source?: string
  lifetimeValue: number
  orderCount: number
  lastOrderAt?: Date
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface CustomerAddress {
  id: string
  customerId: string
  firstName: string
  lastName: string
  company?: string
  streetAddress: string
  streetAddress2?: string
  city: string
  state?: string
  zipCode: string
  country: string
  countryCode?: string
  phone?: string
  email?: string
  isDefaultShipping: boolean
  isDefaultBilling: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CustomerSegment {
  id: string
  storeId: string
  name: string
  description?: string
  conditionType: string
  conditions: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Inventory
// ============================================================================

export interface Inventory {
  id: string
  variantId: string
  storeId: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderLevel: number
  reorderQuantity: number
  sku?: string
  barcode?: string
  warehouse?: string
  updatedAt: Date
}

export interface InventoryAdjustment {
  id: string
  inventoryId: string
  quantity: number
  reason?: string
  referenceId?: string
  referenceType?: string
  notes?: string
  createdAt: Date
  createdBy?: string
}

export interface StockTransfer {
  id: string
  variantId: string
  fromWarehouse: string
  toWarehouse: string
  quantity: number
  status: 'pending' | 'in_transit' | 'received'
  createdAt: Date
  completedAt?: Date
  notes?: string
}

// ============================================================================
// Discounts & Promotions
// ============================================================================

export interface Discount {
  id: string
  storeId: string
  code: string
  name: string
  description?: string
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo'
  value: number
  isPercentage: boolean
  maxUses?: number
  usesCount: number
  perCustomerLimit: number
  minimumOrderValue?: number
  maximumOrderValue?: number
  applicableProducts?: string[]
  applicableCategories?: string[]
  applicableCollections?: string[]
  excludedProducts?: string[]
  excludedCategories?: string[]
  customerSegments?: string[]
  status: 'active' | 'inactive' | 'expired'
  startsAt?: Date
  endsAt?: Date
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface GiftCard {
  id: string
  storeId: string
  code: string
  balance: number
  initialBalance: number
  currency: string
  customerId?: string
  status: 'active' | 'inactive' | 'used'
  expiresAt?: Date
  purchasedAt?: Date
  activatedAt?: Date
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface Review {
  id: string
  productId: string
  customerId?: string
  orderId?: string
  rating: number
  title?: string
  comment?: string
  verifiedPurchase: boolean
  helpfulCount: number
  unhelpfulCount: number
  status: 'pending' | 'approved' | 'rejected'
  approvedAt?: Date
  rejectedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Multi-Store
// ============================================================================

export interface Store {
  id: string
  name: string
  slug: string
  description?: string
  domain?: string
  status: 'active' | 'inactive' | 'maintenance'
  currency: string
  timezone?: string
  language: string
  logoUrl?: string
  faviconUrl?: string
  themeId?: string
  brandingSettings?: Record<string, any>
  paymentGateways?: Record<string, any>
  shippingProviders?: Record<string, any>
  taxSettings?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface StoreSetting {
  id: string
  storeId: string
  key: string
  value?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Validation Schemas
// ============================================================================

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Product slug is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  costPrice: z.number().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  sku: z.string().optional(),
  isPhysical: z.boolean().default(true),
  isDigital: z.boolean().default(false),
  digitalUrl: z.string().url().optional(),
})

export const orderCreateSchema = z.object({
  email: z.string().email('Invalid email'),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    streetAddress: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().positive(),
  })).min(1),
})

export const customerCreateSchema = z.object({
  email: z.string().email('Invalid email'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  company: z.string().optional(),
})

export const discountCreateSchema = z.object({
  code: z.string().min(1, 'Discount code is required'),
  name: z.string().min(1),
  type: z.enum(['percentage', 'fixed', 'free_shipping', 'bogo']),
  value: z.number().positive(),
  maxUses: z.number().optional(),
  minimumOrderValue: z.number().optional(),
})

export type ProductInput = z.infer<typeof productCreateSchema>
export type OrderInput = z.infer<typeof orderCreateSchema>
export type CustomerInput = z.infer<typeof customerCreateSchema>
export type DiscountInput = z.infer<typeof discountCreateSchema>
