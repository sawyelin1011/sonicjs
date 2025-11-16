# E-Commerce Setup Guide

CF CMS includes comprehensive e-commerce capabilities with full support for products, orders, inventory management, customers, payments, and multi-store deployments.

## Features Overview

### Products & Inventory
- **Product Variants**: Create products with multiple variants (size, color, etc.)
- **Inventory Tracking**: Real-time stock management with warehouse support
- **Digital Products**: Support for downloadable/digital products
- **Product Categories & Tags**: Organize products hierarchically
- **Product Images**: Multiple images per product and variant

### Orders & Payments
- **Order Management**: Complete order lifecycle (pending → processing → fulfilled)
- **Payment Processing**: Multiple payment gateway integration (Stripe, PayPal, Square)
- **Order Items**: Track line items with pricing and discounts
- **Shipping**: Integrated shipping with carrier integration
- **Order History**: Complete order tracking and history

### Customers
- **Customer Profiles**: Store customer information and preferences
- **Customer Addresses**: Multiple shipping and billing addresses
- **Customer Segments**: Organize customers by behavior or demographics
- **Customer Notes**: Internal notes and communication history
- **Loyalty Tracking**: Lifetime value and order tracking

### Inventory Management
- **Stock Tracking**: Real-time inventory levels
- **Inventory Adjustments**: Manual stock adjustments with reasons
- **Stock Transfers**: Transfer inventory between warehouses
- **Reorder Levels**: Automatic low-stock alerts
- **Reserved Quantity**: Track reserved/pending inventory

### Discounts & Promotions
- **Discount Codes**: Create promotional codes with rules
- **Promotional Rules**: Conditional discounts based on cart value, products, etc.
- **Gift Cards**: Digital gift card system
- **Automatic Promotions**: Time-based and rule-based promotions
- **Usage Limits**: Per-code and per-customer usage limits

## Database Schema

### Products Tables
```sql
products               -- Main product records
product_variants       -- Product variants (size, color, etc.)
product_options        -- Product option definitions
product_images         -- Product images
product_categories     -- Product categories
product_tags           -- Product tags
```

### Orders Tables
```sql
orders                 -- Order records
order_items            -- Items in orders
payments               -- Payment records
refunds                -- Refund records
shipments              -- Shipment tracking
shipping_addresses     -- Shipping addresses
billing_addresses      -- Billing addresses
```

### Inventory Tables
```sql
inventory              -- Inventory levels
inventory_adjustments  -- Inventory adjustments
stock_transfers        -- Stock transfers between warehouses
```

### Customers Tables
```sql
customers              -- Customer records
customer_addresses     -- Customer addresses
customer_segments      -- Customer segments
customer_notes         -- Customer notes
```

### Discounts Tables
```sql
discounts              -- Discount codes
discount_usage         -- Discount usage tracking
promotions             -- Promotional rules
coupons                -- Coupon records
gift_cards             -- Gift card records
gift_card_transactions -- Gift card transactions
reviews_ratings        -- Product reviews
wishlists              -- Customer wishlists
```

### Multi-Store Tables
```sql
stores                 -- Store configurations
store_settings         -- Store settings
```

## API Endpoints

### Products API

#### List Products
```bash
GET /api/products?page=1&limit=20&sort=created_at&search=keyword
```

#### Get Product
```bash
GET /api/products/{id}
```

Response includes:
- Product details
- Variants
- Images
- Categories
- Tags

#### Create Product
```bash
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "price": 99.99,
  "costPrice": 49.99,
  "status": "active",
  "sku": "SKU-001",
  "isPhysical": true,
  "isDigital": false
}
```

### Orders API

#### List Orders
```bash
GET /api/orders?page=1&limit=20&status=pending
```

#### Get Order
```bash
GET /api/orders/{id}
```

Response includes:
- Order details
- Order items
- Shipping address
- Billing address
- Payments
- Shipments

#### Create Order
```bash
POST /api/orders
Content-Type: application/json

{
  "email": "customer@example.com",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "streetAddress": "123 Main St",
    "city": "Anytown",
    "zipCode": "12345",
    "country": "USA"
  },
  "items": [
    {
      "productId": "prod-123",
      "variantId": "var-456",
      "quantity": 2
    }
  ]
}
```

### Customers API

#### List Customers
```bash
GET /api/customers?page=1&limit=20
```

#### Create Customer
```bash
POST /api/customers
Content-Type: application/json

{
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0123",
  "company": "Acme Corp"
}
```

### Inventory API

#### Check Inventory
```bash
GET /api/inventory?variant_id={variantId}
```

Response:
```json
{
  "available": 50,
  "quantity": 100,
  "reserved": 50,
  "reorderLevel": 10
}
```

### Discounts API

#### Validate Discount Code
```bash
GET /api/discounts/{code}
```

Response:
```json
{
  "valid": true,
  "code": "SUMMER20",
  "type": "percentage",
  "value": 20,
  "minimumOrderValue": 50
}
```

## Admin Dashboard

The CF CMS admin includes comprehensive e-commerce management:

### Products Management
- View all products with filtering and search
- Create, edit, delete products
- Manage variants and options
- Upload product images
- Set pricing and cost tracking
- Organize with categories and tags

### Orders Management
- View all orders with status filtering
- Edit order details
- Process payments
- Manage shipments and tracking
- Create refunds
- Add order notes

### Customer Management
- View customer directory
- Edit customer profiles
- View customer history
- Add customer notes
- Manage customer segments

### Inventory Management
- View inventory levels
- Make inventory adjustments
- Set reorder levels
- Manage stock transfers
- View adjustment history

### Discounts & Promotions
- Create discount codes
- Set up promotions
- Create gift cards
- View usage and analytics

## Integration Examples

### Stripe Payment Integration

```typescript
import { Hono } from 'hono'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_API_KEY!)

export const stripePaymentPlugin = {
  name: 'stripe-payments',
  version: '1.0.0',
  
  routes: [{
    path: '/api/payments/stripe/webhook',
    handler: new Hono().post(async (c) => {
      const body = await c.req.text()
      const signature = c.req.header('stripe-signature')!
      
      try {
        const event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        )
        
        switch (event.type) {
          case 'payment_intent.succeeded':
            // Update order payment status
            break
          case 'charge.refunded':
            // Process refund
            break
        }
        
        return c.json({ received: true })
      } catch (err) {
        return c.json({ error: 'Webhook error' }, 400)
      }
    })
  }]
}
```

### Custom Shipping Integration

```typescript
export const customShippingPlugin = {
  name: 'custom-shipping',
  version: '1.0.0',
  
  services: [{
    name: 'shippingCalculator',
    implementation: {
      async calculateShipping(order, destination) {
        // Custom shipping logic
        return {
          carrier: 'custom',
          method: 'standard',
          cost: 10.00,
          estimatedDays: 5
        }
      }
    }
  }]
}
```

## Multi-Store Setup

CF CMS supports multiple stores with separate:
- Product catalogs
- Customer bases
- Orders
- Inventory
- Payment gateways
- Shipping providers

### Configure Stores

```sql
-- Create store
INSERT INTO stores (id, name, slug, currency, domain)
VALUES ('store-1', 'Main Store', 'main-store', 'USD', 'shop.example.com');

-- Store-specific settings
INSERT INTO store_settings (store_id, key, value)
VALUES ('store-1', 'payment_gateway', 'stripe');
```

### Multi-Store API

All API endpoints support store context:
```bash
GET /api/stores/store-1/products
GET /api/stores/store-1/orders
GET /api/stores/store-1/customers
```

## Performance Optimization

### Indexing

E-commerce tables include optimized indexes for common queries:
- Product lookups by SKU, slug, status
- Order lookups by customer, status, date
- Inventory lookups by variant and warehouse
- Discount lookups by code and status

### Caching

Implement caching for frequently accessed data:
```typescript
// Cache product listings
const cacheKey = `products:${page}:${limit}:${sort}`
const cached = await kv.get(cacheKey)

if (cached) return cached

const products = await db.prepare('SELECT * FROM products...')
await kv.put(cacheKey, products, { expirationTtl: 3600 })

return products
```

### Database Optimization

- Use pagination for large result sets
- Index frequently filtered columns
- Archive old orders periodically
- Use generated columns for calculations (e.g., availableQuantity)

## Security Considerations

### Input Validation
All inputs are validated using Zod schemas before processing.

### Payment Security
- Never expose payment gateway keys in frontend
- Use server-side payment processing
- Store only tokenized payment methods

### Customer Data
- Encrypt sensitive customer information
- Use HTTPS for all communications
- Implement proper access controls

### Inventory
- Validate stock availability before confirming orders
- Implement order-level locking
- Handle concurrent order processing

## Next Steps

1. [Create a product](./products.md)
2. [Set up payment gateways](./payments.md)
3. [Configure shipping](./shipping.md)
4. [Create promotions](./promotions.md)
5. [Multi-store setup](./multi-store.md)

## API Reference

See [E-Commerce API Reference](./api-ecommerce.md) for complete API documentation.
