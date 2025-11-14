# Multi-Store Payments & Digital Downloads Plugin

Comprehensive e-commerce plugin for SonicJS with multi-store management, payment gateway integration, and secure digital downloads.

## Features

### 🏪 Multi-Store Management
- Create and manage multiple independent stores
- Per-store configuration (currency, timezone, branding)
- Store ownership and permission management
- Separate inventory and order management per store

### 🛍️ Product Management
- Support for physical and digital products
- Product variants, images, and metadata
- Stock management and inventory tracking
- Digital product file uploads to Cloudflare R2
- Product categorization and filtering

### 🛒 Shopping Cart
- Per-user, per-store shopping carts
- Real-time price tracking
- Cart persistence and synchronization
- Add/remove/update cart items

### 📦 Order Management
- Create and manage orders
- Multiple order states (pending, processing, shipped)
- Detailed order items and pricing breakdown
- Order history and filtering
- Shipping address management

### 💳 Payment Gateway Integration
- **Stripe Integration**
  - Payment intent creation
  - Webhook handling for payment confirmation
  - Test mode support
  - PCI compliance

- **PayPal Integration**
  - PayPal checkout flow
  - Order capture and validation
  - Sandbox and live modes
  - Webhook handling

### 🔐 Digital Downloads
- Secure, tokenized download links
- Time-limited access (configurable expiry)
- Download count limits (configurable max downloads)
- R2 file storage integration
- Automatic cleanup of expired links

### 🛡️ Security
- Request signature validation for webhooks
- Permission-based access control
- Secure token generation for downloads
- Input validation with Zod schemas
- SQL injection prevention via prepared statements

## Installation

```bash
npm install
```

The plugin is automatically registered in SonicJS core plugin registry.

## Configuration

### Payment Gateway Setup

#### Stripe (Sandbox)

1. Create account at [stripe.com](https://stripe.com)
2. Enable test mode
3. Configure in admin panel:
   - Publishable Key (Test)
   - Secret Key (Test)
   - Webhook Secret

#### PayPal (Sandbox)

1. Create account at [developer.paypal.com](https://developer.paypal.com)
2. Create a sandbox application
3. Configure in admin panel:
   - Client ID (Sandbox)
   - Client Secret (Sandbox)

### Digital Download Settings

```typescript
{
  digital_download_expiry_days: 30,      // Days until links expire
  digital_download_max_downloads: 5,     // Max downloads per link
  enable_test_mode: true                 // Enable test/sandbox modes
}
```

## API Endpoints

### Stores

```http
POST /api/store/stores
GET /api/store/stores/:id
```

### Products

```http
POST /api/store/stores/:storeId/products
GET /api/store/stores/:storeId/products
```

### Shopping Cart

```http
POST /api/store/carts/add
GET /api/store/carts?store_id=:storeId
```

### Orders

```http
POST /api/store/orders
GET /api/store/orders/:id
```

### Digital Downloads

```http
GET /api/store/downloads/:token
```

## Database Schema

### Stores Table
```sql
stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_user_id TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  logo_url TEXT,
  email_support TEXT,
  status TEXT DEFAULT 'active',
  created_at INTEGER,
  updated_at INTEGER
)
```

### Products Table
```sql
products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  cost REAL,
  stock_quantity INTEGER,
  status TEXT DEFAULT 'draft',
  type TEXT CHECK(type IN ('physical', 'digital')),
  image_url TEXT,
  sku TEXT,
  created_at INTEGER,
  updated_at INTEGER
)
```

### Orders Table
```sql
orders (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subtotal REAL,
  tax REAL,
  shipping REAL,
  total REAL NOT NULL,
  payment_method TEXT CHECK(payment_method IN ('stripe', 'paypal', 'free')),
  payment_status TEXT DEFAULT 'pending',
  fulfillment_status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  paypal_order_id TEXT,
  shipping_address TEXT,
  created_at INTEGER,
  updated_at INTEGER
)
```

### Secure Download Links Table
```sql
secure_download_links (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  digital_download_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER
)
```

## Services

### DatabaseService

Core CRUD operations for all entities.

```typescript
const dbService = new DatabaseService(db, logger)

// Stores
await dbService.createStore(input)
await dbService.getStore(id)
await dbService.listStores(ownerUserId, limit, offset)
await dbService.updateStore(id, updates)

// Products
await dbService.createProduct(input)
await dbService.getProduct(id)
await dbService.listProducts(storeId, limit, offset, status)

// Orders
await dbService.createOrder(input, userId)
await dbService.getOrder(id)
await dbService.listOrders(storeId, limit, offset)

// Cart
await dbService.getOrCreateCart(userId, storeId)
await dbService.addToCart(cartId, productId, quantity, price)
```

### PaymentService

Payment gateway operations.

```typescript
const paymentService = new PaymentService(logger, stripeConfig, paypalConfig)

// Stripe
const { clientSecret, publishableKey } = await paymentService.createStripePaymentIntent(order)
const isValid = await paymentService.verifyStripeWebhookSignature(body, signature)

// PayPal
const { orderId, approvalUrl } = await paymentService.createPayPalOrder(order)
const result = await paymentService.capturePayPalOrder(paypalOrderId, token)
```

### DigitalDownloadService

Digital product and secure download management.

```typescript
const downloadService = new DigitalDownloadService(dbService, r2, logger)

// File operations
const objectKey = await downloadService.uploadDigitalProduct(productId, file, fileName, mimeType)
const url = await downloadService.generateDownloadUrl(objectKey, fileName)

// Download links
const links = await downloadService.createDownloadLinksForOrder(orderId, products)
const link = await downloadService.validateDownloadLink(token)
await downloadService.recordDownload(linkId)
```

## Hooks

### Plugin-Specific Hooks

#### `product:created`
Fired after a product is created.

```typescript
builder.addHook('product:created', async (data, context) => {
  // data: Product object
  return data
})
```

#### `order:paid`
Fired after an order payment is confirmed. Used to generate download links for digital products.

```typescript
builder.addHook('order:paid', async (data, context) => {
  // data: Order object
  // Generate secure download links here
  return data
})
```

#### `product:delete`
Fired before product deletion. Validate before allowing deletion.

```typescript
builder.addHook('product:delete', async (data, context) => {
  // Check if product has orders
  // Cancel if necessary
  return data
})
```

## Security Best Practices

### Digital Downloads
1. **Signed URLs**: Use secure tokens with cryptographic signing
2. **Expiry**: Links expire after configured time (default: 30 days)
3. **Rate Limiting**: Implement download rate limiting
4. **Access Control**: Verify user ownership before allowing download

### Payment Processing
1. **PCI Compliance**: Never store full credit card numbers
2. **Webhook Validation**: Always verify webhook signatures
3. **HTTPS Only**: Enforce HTTPS for all payment operations
4. **Encryption**: Encrypt sensitive configuration in transit and at rest

### Multi-Store Security
1. **Store Ownership**: Verify user owns store before modifications
2. **Permission Checks**: Enforce role-based access control
3. **Data Isolation**: Separate data per store at database level
4. **Audit Logging**: Log all admin actions

### Input Validation
All inputs validated with Zod schemas:
- Email format validation
- UUID format validation
- Price/quantity constraints
- String length limits

## Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```typescript
// Example: Creating a store and product
const store = await dbService.createStore({
  name: 'Test Store',
  slug: 'test-store',
  ownerUserId: 'user123',
  currency: 'USD',
  timezone: 'UTC'
})

const product = await dbService.createProduct({
  store_id: store.id,
  name: 'Digital Product',
  slug: 'digital-product',
  price: 29.99,
  stock_quantity: 0,
  type: 'digital'
})
```

## Performance Optimizations

1. **Database Indices**: All frequently queried columns indexed
2. **Query Pagination**: Default limit of 50 items per page
3. **Caching**: Use KV for frequently accessed data
4. **Batch Operations**: Batch order item inserts
5. **Async Operations**: Non-blocking payment processing

## Edge Runtime Compatibility

- ✅ Works with Cloudflare Workers
- ✅ D1 Database support
- ✅ R2 Bucket storage
- ✅ KV Namespace caching
- ✅ No Node.js-specific APIs used

## Example Usage

### Creating a Store

```typescript
const store = await dbService.createStore({
  name: 'My Digital Store',
  slug: 'my-store',
  ownerUserId: 'user-id-123',
  currency: 'USD',
  timezone: 'America/New_York',
  email_support: 'support@example.com'
})
```

### Creating a Digital Product

```typescript
const product = await dbService.createProduct({
  store_id: store.id,
  name: 'Video Course',
  slug: 'video-course',
  description: 'Complete video training course',
  price: 49.99,
  stock_quantity: 0, // Unlimited for digital
  type: 'digital',
  image_url: 'https://example.com/course.jpg'
})

// Upload digital file
const objectKey = await downloadService.uploadDigitalProduct(
  product.id,
  courseBuffer,
  'course-2024.zip',
  'application/zip'
)

// Store reference
await dbService.createDigitalDownload({
  product_id: product.id,
  r2_object_key: objectKey,
  file_name: 'course-2024.zip',
  file_size_bytes: courseBuffer.length,
  mime_type: 'application/zip'
})
```

### Processing a Purchase

```typescript
// Create order
const order = await dbService.createOrder({
  store_id: store.id,
  customer_email: 'customer@example.com',
  items: [{ product_id, quantity: 1 }],
  payment_method: 'stripe'
}, userId)

// Create payment intent
const { clientSecret } = await paymentService.createStripePaymentIntent(order)

// On payment completion
await dbService.updateOrderPaymentStatus(order.id, 'completed', paymentIntentId)

// Trigger order:paid hook to create download links
await hooks.execute('order:paid', order)
```

## Troubleshooting

### Issue: Digital downloads not working
- Check R2 bucket configuration
- Verify file was uploaded successfully
- Check download link expiry
- Verify download count limits

### Issue: Payment processing failures
- Verify API keys are correct
- Check test vs live mode settings
- Review webhook configuration
- Check browser console for errors

### Issue: Cart items disappearing
- Verify cart ownership
- Check database for orphaned carts
- Clear old sessions

## Contributing

Contributions welcome! Please follow:
1. TypeScript best practices
2. Zod schema validation for all inputs
3. Comprehensive error handling
4. Security-first approach

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [SonicJS Issues](https://github.com/sonicjs/core)
- Documentation: [SonicJS Docs](https://sonicjs.com/docs)
- Community: [Discord](https://discord.gg/sonicjs)
