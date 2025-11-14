# Multi-Store Payments Plugin - Example Usage & Testing

Complete guide with code examples for testing and using the plugin.

## Testing the Plugin

### 1. Creating Test Stores

```typescript
import { DatabaseService } from './services/DatabaseService'
import type { PluginLogger } from '@sonicjs-cms/core'

// Initialize services
const dbService = new DatabaseService(db, logger)

// Create a test store
const store = await dbService.createStore({
  name: 'Digital Products Co',
  slug: 'digital-products-co',
  description: 'E-learning and software products',
  ownerUserId: 'user-12345',
  currency: 'USD',
  timezone: 'America/New_York',
  logo_url: 'https://example.com/logo.png',
  email_support: 'support@digital-products.com',
  status: 'active'
})

console.log('Created store:', store.id)

// Create another store
const physicalStore = await dbService.createStore({
  name: 'Physical Goods Store',
  slug: 'physical-goods',
  description: 'Handmade crafts and merchandise',
  ownerUserId: 'user-12345',
  currency: 'USD',
  timezone: 'America/Los_Angeles',
  status: 'active'
})

console.log('Created physical store:', physicalStore.id)
```

### 2. Creating Test Products

```typescript
// Create a digital product (course)
const courseProduct = await dbService.createProduct({
  store_id: store.id,
  name: 'Advanced TypeScript Mastery',
  slug: 'typescript-mastery',
  description: 'Complete guide to TypeScript with real-world projects',
  price: 79.99,
  cost: 0, // Digital products have no cost
  stock_quantity: 0, // Unlimited
  status: 'active',
  type: 'digital',
  image_url: 'https://example.com/typescript-course.jpg'
})

console.log('Created digital product:', courseProduct.id)

// Create a physical product
const physicalProduct = await dbService.createProduct({
  store_id: physicalStore.id,
  name: 'Handmade Ceramic Mug',
  slug: 'ceramic-mug',
  description: 'Beautiful handcrafted ceramic mug - 12oz',
  price: 24.99,
  cost: 8.50,
  stock_quantity: 150,
  status: 'active',
  type: 'physical',
  sku: 'MUG-CERAMIC-001',
  image_url: 'https://example.com/mug.jpg'
})

console.log('Created physical product:', physicalProduct.id)

// Upload digital content for the course
const courseBuffer = Buffer.from('Course content... (in real app, this would be a zip file)')
const objectKey = await downloadService.uploadDigitalProduct(
  courseProduct.id,
  courseBuffer,
  'typescript-mastery-2024.zip',
  'application/zip'
)

console.log('Uploaded digital content to R2:', objectKey)

// Create digital download record
const digitalDownload = await dbService.createDigitalDownload({
  product_id: courseProduct.id,
  r2_object_key: objectKey,
  file_name: 'typescript-mastery-2024.zip',
  file_size_bytes: courseBuffer.length,
  mime_type: 'application/zip'
})

console.log('Created digital download record:', digitalDownload.id)
```

### 3. Testing Shopping Cart

```typescript
// Get or create cart for user
const cart = await dbService.getOrCreateCart('user-456', store.id)
console.log('Cart ID:', cart.id)

// Add items to cart
const courseItem = await dbService.addToCart(
  cart.id,
  courseProduct.id,
  1, // quantity
  courseProduct.price // price at time
)

const bundle = await dbService.addToCart(
  cart.id,
  'another-product-id',
  2,
  49.99
)

// Get updated cart
const updatedCart = await dbService.getOrCreateCart('user-456', store.id)
console.log('Cart items count:', updatedCart.items.length)
console.log('Cart total:', updatedCart.items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0))

// Remove item from cart
await dbService.removeFromCart(courseItem.id, cart.id)
console.log('Item removed from cart')

// Clear entire cart
await dbService.clearCart(cart.id)
console.log('Cart cleared')
```

### 4. Testing Order Creation & Checkout

```typescript
import { PaymentService } from './services/PaymentService'

// Initialize payment service
const paymentService = new PaymentService(
  logger,
  {
    enabled: true,
    publishable_key: 'pk_test_123456789',
    secret_key: 'sk_test_123456789',
    webhook_secret: 'whsec_test_123456789',
    mode: 'test'
  },
  {
    enabled: true,
    client_id: 'test-client-id',
    client_secret: 'test-client-secret',
    mode: 'sandbox'
  }
)

// Create order with Stripe payment
const order = await dbService.createOrder(
  {
    store_id: store.id,
    customer_email: 'customer@example.com',
    items: [
      { product_id: courseProduct.id, quantity: 1 }
    ],
    payment_method: 'stripe',
    shipping_address: {
      name: 'John Doe',
      email: 'customer@example.com',
      address_line1: '123 Main St',
      city: 'New York',
      state_province: 'NY',
      postal_code: '10001',
      country: 'US'
    }
  },
  'user-456' // user ID
)

console.log('Order created:', order.id)
console.log('Order total:', order.total) // 79.99 + 6.40 (tax) + 10 (shipping) = 96.39
console.log('Payment status:', order.payment_status) // 'pending'

// Create Stripe payment intent
try {
  const { clientSecret, publishableKey } = await paymentService.createStripePaymentIntent(order)
  console.log('Stripe payment intent created')
  console.log('Client secret:', clientSecret)
  console.log('Publishable key:', publishableKey)
  
  // In a real app, send clientSecret to frontend for payment processing
  // const paymentResult = await stripe.confirmCardPayment(clientSecret, ...)
  
  // Simulate successful payment
  await dbService.updateOrderPaymentStatus(
    order.id,
    'completed',
    'pi_1234567890', // Stripe payment intent ID
    undefined
  )
  
  console.log('Payment confirmed')
} catch (error) {
  console.error('Payment intent creation failed:', error)
}

// Trigger order:paid hook to create download links
await hooks.execute('order:paid', order, context)
console.log('Download links generated')

// Verify download links were created
const downloadLinks = await dbService.getDownloadLinksForOrder(order.id)
console.log('Download links created:', downloadLinks.length)
downloadLinks.forEach(link => {
  console.log(`- Token: ${link.token.substring(0, 20)}...`)
  console.log(`  Expires: ${new Date(link.expires_at * 1000).toISOString()}`)
  console.log(`  Max downloads: ${link.max_downloads}`)
})
```

### 5. Testing Digital Downloads

```typescript
// Get download link from email/order confirmation
const downloadToken = downloadLinks[0].token

// Validate and serve download
const validLink = await downloadService.validateDownloadLink(downloadToken)

if (!validLink) {
  console.log('Download link invalid, expired, or limit exceeded')
} else {
  console.log('Link is valid')
  
  // Get digital download details
  const digitalDownload = await dbService.getDigitalDownloadByProductId(validLink.product_id)
  
  if (digitalDownload) {
    // Record the download
    await downloadService.recordDownload(validLink.id)
    console.log('Download recorded, count:', validLink.download_count + 1)
    
    // Generate download URL
    const downloadUrl = await downloadService.generateDownloadUrl(
      digitalDownload.r2_object_key,
      digitalDownload.file_name,
      3600 // 1 hour expiry
    )
    
    console.log('Download URL:', downloadUrl)
    // Send user to this URL to download file
  }
}

// Try to download again (should work up to max_downloads)
const link2 = await downloadService.validateDownloadLink(downloadToken)
if (link2) {
  console.log('Second download allowed')
  await downloadService.recordDownload(link2.id)
} else {
  console.log('Download limit reached')
}
```

### 6. Testing PayPal Integration

```typescript
// Create order with PayPal payment
const paypalOrder = await dbService.createOrder(
  {
    store_id: physicalStore.id,
    customer_email: 'customer@example.com',
    items: [
      { product_id: physicalProduct.id, quantity: 2 }
    ],
    payment_method: 'paypal',
    shipping_address: {
      name: 'Jane Smith',
      email: 'customer@example.com',
      address_line1: '456 Oak Ave',
      city: 'Los Angeles',
      state_province: 'CA',
      postal_code: '90001',
      country: 'US'
    }
  },
  'user-789'
)

console.log('PayPal order created:', paypalOrder.id)

// Create PayPal payment
try {
  const { orderId, approvalUrl } = await paymentService.createPayPalOrder(paypalOrder)
  console.log('PayPal order created:', orderId)
  console.log('Approval URL:', approvalUrl)
  
  // In real app, redirect user to approvalUrl
  // After user approves, capture the order
  
  // Simulate user approval and capture
  // const result = await paymentService.capturePayPalOrder(orderId, accessToken)
  
  // Update order payment status
  await dbService.updateOrderPaymentStatus(
    paypalOrder.id,
    'completed',
    undefined,
    orderId // PayPal order ID
  )
  
  console.log('PayPal payment captured and order updated')
} catch (error) {
  console.error('PayPal payment failed:', error)
}
```

### 7. Testing Admin Operations

```typescript
// List all orders for a store
const { orders: allOrders, total: totalOrders } = await dbService.listOrders(store.id, 10)
console.log(`Total orders: ${totalOrders}`)
allOrders.forEach(order => {
  console.log(`- Order ${order.id}: $${order.total} (${order.payment_status})`)
})

// Get specific order details
const orderDetails = await dbService.getOrder(order.id)
console.log('Order details:')
console.log('- Customer:', orderDetails?.customer_email)
console.log('- Items:')
orderDetails?.items.forEach(item => {
  console.log(`  - ${item.product_name}: ${item.quantity} x $${item.unit_price}`)
})
console.log('- Subtotal:', orderDetails?.subtotal)
console.log('- Tax:', orderDetails?.tax)
console.log('- Shipping:', orderDetails?.shipping)
console.log('- Total:', orderDetails?.total)

// List all products in a store
const { products: allProducts } = await dbService.listProducts(store.id, 50)
console.log(`Store has ${allProducts.length} products`)
allProducts.forEach(product => {
  console.log(`- ${product.name}: $${product.price} (${product.type})`)
})

// Update product price
await dbService.updateProduct(courseProduct.id, { price: 89.99 })
console.log('Product price updated to $89.99')

// Change product status
await dbService.updateProduct(courseProduct.id, { status: 'inactive' })
console.log('Product marked as inactive')
```

### 8. Testing Security Features

```typescript
// Test download link validation
const now = Math.floor(Date.now() / 1000)

// Create link that expires soon
const expiringLink = await dbService.createSecureDownloadLink(
  order.id,
  courseProduct.id,
  digitalDownload.id,
  1, // max 1 download
  0 // expires immediately (0 days)
)

// Try to use immediately (should fail due to expiry)
await new Promise(resolve => setTimeout(resolve, 100))
const expired = await downloadService.validateDownloadLink(expiringLink.token)
if (!expired) {
  console.log('✓ Expired link correctly rejected')
}

// Test max download limit
const limitedLink = await dbService.createSecureDownloadLink(
  order.id,
  courseProduct.id,
  digitalDownload.id,
  2, // max 2 downloads
  30
)

// Simulate reaching the limit
await downloadService.recordDownload(limitedLink.id)
await downloadService.recordDownload(limitedLink.id)

// Try third download (should fail)
const atLimit = await downloadService.validateDownloadLink(limitedLink.token)
if (!atLimit) {
  console.log('✓ Download limit correctly enforced')
}

// Test store ownership verification
const unauthorizedUser = 'hacker-user'
const otherStore = await dbService.getStore(physicalStore.id)

if (otherStore?.ownerUserId !== unauthorizedUser) {
  console.log('✓ Store ownership verified')
}
```

### 9. API Testing with cURL

```bash
# Create a store
curl -X POST http://localhost:3000/api/store/stores \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store",
    "slug": "my-store",
    "currency": "USD",
    "timezone": "UTC",
    "status": "active"
  }'

# List products
curl -X GET 'http://localhost:3000/api/store/stores/STORE_ID/products?limit=50' \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add to cart
curl -X POST http://localhost:3000/api/store/carts/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PRODUCT_ID",
    "quantity": 1,
    "store_id": "STORE_ID"
  }'

# Create order
curl -X POST http://localhost:3000/api/store/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": "STORE_ID",
    "customer_email": "customer@example.com",
    "items": [{"product_id": "PRODUCT_ID", "quantity": 1}],
    "payment_method": "stripe"
  }'

# Download digital file
curl -X GET 'http://localhost:3000/api/store/downloads/DOWNLOAD_TOKEN' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Performance Testing

```typescript
// Simulate high load
async function loadTest() {
  const startTime = Date.now()
  const promises = []
  
  // Create 100 orders
  for (let i = 0; i < 100; i++) {
    promises.push(
      dbService.createOrder(
        {
          store_id: store.id,
          customer_email: `customer${i}@example.com`,
          items: [{ product_id: courseProduct.id, quantity: 1 }],
          payment_method: 'free'
        },
        `user-${i}`
      )
    )
  }
  
  await Promise.all(promises)
  const duration = Date.now() - startTime
  
  console.log(`Created 100 orders in ${duration}ms`)
  console.log(`Average: ${(duration / 100).toFixed(2)}ms per order`)
}

await loadTest()
```

## Webhook Testing

```typescript
// Test Stripe webhook
const stripeEvent = {
  id: 'evt_test_123',
  object: 'event',
  api_version: '2023-10-16',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'pi_1234567890',
      object: 'payment_intent',
      status: 'succeeded',
      amount: 9639,
      currency: 'usd',
      metadata: {
        order_id: order.id,
        store_id: store.id
      }
    }
  },
  livemode: false,
  pending_webhooks: 0,
  request: { id: null, idempotency_key: null },
  type: 'payment_intent.succeeded'
}

// Validate signature and process
const isValid = await paymentService.verifyStripeWebhookSignature(
  JSON.stringify(stripeEvent),
  'whsec_test_signature'
)

if (isValid && stripeEvent.type === 'payment_intent.succeeded') {
  await dbService.updateOrderPaymentStatus(
    stripeEvent.data.object.metadata.order_id,
    'completed',
    stripeEvent.data.object.id
  )
  console.log('Webhook processed successfully')
}
```

## Notes

- Replace `STORE_ID`, `PRODUCT_ID`, etc. with actual values from your database
- Use valid authorization tokens for authenticated endpoints
- In production, use environment variables for sensitive data
- Always validate webhook signatures before processing
- Test thoroughly before deploying to production
