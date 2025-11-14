# Multi-Store Payments Plugin - Security Best Practices

Comprehensive security guidelines for e-commerce operations and payment processing.

## 1. Payment Security

### Stripe Integration Security

#### PCI Compliance
- Never capture or store full credit card numbers
- Always use Stripe's Payment Intent API
- Enable 3D Secure for additional fraud prevention
- Keep Stripe API keys in environment variables only

```typescript
// ✅ CORRECT: Use Payment Intent API
const { clientSecret } = await paymentService.createStripePaymentIntent(order)
// Send clientSecret to frontend, never the full card data

// ❌ WRONG: Never capture raw card data
// const card = {
//   number: '4242424242424242',
//   exp_month: 12,
//   exp_year: 2025,
//   cvc: '123'
// }
```

#### Webhook Verification
Always verify webhook signatures to prevent replay attacks and unauthorized requests:

```typescript
import crypto from 'crypto'

async function verifyStripeWebhook(body: string, signature: string, secret: string) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex')
  
  const computedSignature = `t=${Math.floor(Date.now() / 1000)},v1=${hash}`
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  )
}

// Usage
const isValid = await verifyStripeWebhook(
  rawBody,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
)

if (!isValid) {
  throw new Error('Invalid webhook signature')
}
```

### PayPal Integration Security

#### Validation
```typescript
// Validate PayPal order amounts match
async function validatePayPalOrder(paypalOrder: any, dbOrder: any) {
  const expectedAmount = parseFloat(dbOrder.total.toFixed(2))
  const paypalAmount = parseFloat(paypalOrder.purchase_units[0].amount.value)
  
  if (Math.abs(expectedAmount - paypalAmount) > 0.01) {
    throw new Error('PayPal amount mismatch - possible fraud attempt')
  }
  
  // Verify status
  if (paypalOrder.status !== 'APPROVED' && paypalOrder.status !== 'COMPLETED') {
    throw new Error('Invalid PayPal order status')
  }
}
```

#### HTTPS Only
```typescript
// Enforce HTTPS for all PayPal communications
if (!url.startsWith('https://')) {
  throw new Error('PayPal URLs must use HTTPS')
}
```

## 2. Digital Download Security

### Secure Token Generation

```typescript
import crypto from 'crypto'

function generateSecureToken(length: number = 64): string {
  // Use cryptographically secure random bytes
  const bytes = crypto.randomBytes(length)
  return bytes.toString('hex')
}

// Generate 64-character hex token (256 bits of entropy)
const token = generateSecureToken(64)
// Result: "a3f7e9c2b5d1f8a4e6c3b9d2f5e8a1c4b7d0f3e6a9c2b5d8f1e4a7c0d3f6e9"
```

### Time-Limited Access

```typescript
// Set appropriate expiry times
const DIGITAL_DOWNLOAD_EXPIRY_DAYS = 30
const PREVIEW_LINK_EXPIRY_MINUTES = 5
const ADMIN_EXPORT_EXPIRY_HOURS = 1

// Create download link with expiry
const expirySeconds = DIGITAL_DOWNLOAD_EXPIRY_DAYS * 24 * 60 * 60
const expiresAt = Math.floor(Date.now() / 1000) + expirySeconds

// Validate on each download
const now = Math.floor(Date.now() / 1000)
if (link.expires_at < now) {
  throw new Error('Download link has expired')
}
```

### Download Limit Enforcement

```typescript
// Enforce download limits
const MAX_DOWNLOADS = 5

if (link.download_count >= MAX_DOWNLOADS) {
  throw new Error('Download limit exceeded')
}

// Record each download
await db.prepare(`
  UPDATE secure_download_links 
  SET download_count = download_count + 1 
  WHERE id = ?
`).bind(linkId).run()
```

### R2 File Security

```typescript
// Store files outside web root
const objectKey = `digital-products/${productId}/${timestamp}-${randomString()}`

// Use custom metadata
await r2.put(objectKey, fileBuffer, {
  customMetadata: {
    'product-id': productId,
    'uploaded-at': new Date().toISOString(),
    'virus-scanned': 'true'
  },
  contentType: mimeType,
  // Set sensible defaults
  cacheControl: 'no-cache, no-store, must-revalidate',
  httpMetadata: {
    contentDisposition: 'attachment',
    cacheExpires: new Date(Date.now() + 3600000) // 1 hour
  }
})

// Generate signed URLs with expiry
function generateR2SignedUrl(objectKey: string, expirySeconds: number = 3600): string {
  // Implementation using R2 signed URLs
  const url = new URL(`https://your-r2-domain.com/${objectKey}`)
  url.searchParams.set('X-Amz-Expires', expirySeconds.toString())
  return url.toString()
}
```

## 3. Multi-Store Permission Security

### Store Ownership Verification

```typescript
// ALWAYS verify ownership before allowing modifications
async function requireStoreOwnership(userId: string, storeId: string) {
  const store = await dbService.getStore(storeId)
  
  if (!store) {
    throw new Error('Store not found')
  }
  
  if (store.ownerUserId !== userId) {
    throw new Error('Forbidden: You do not own this store')
  }
  
  return store
}

// Usage in route
apiRoutes.post('/stores/:storeId/products', async (c) => {
  const user = c.get('user')
  const storeId = c.req.param('storeId')
  
  // Verify ownership
  await requireStoreOwnership(user.id, storeId)
  
  // Safe to proceed with store operations
})
```

### Role-Based Access Control

```typescript
interface Permission {
  action: string
  resource: string
}

async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const user = await getUser(userId)
  
  // Check direct permissions
  if (user.permissions?.includes(`${permission.action}:${permission.resource}`)) {
    return true
  }
  
  // Check role-based permissions
  const role = await getRole(user.role)
  return role.permissions?.includes(`${permission.action}:${permission.resource}`) || false
}

// Usage
const canManageStore = await hasPermission(user.id, {
  action: 'manage',
  resource: 'store'
})

if (!canManageStore) {
  return c.json({ error: 'Forbidden' }, 403)
}
```

### Multi-Tenant Data Isolation

```typescript
// Use store_id in all queries for data isolation
async function listOrdersForStore(storeId: string, userId: string) {
  // Verify user owns store
  const store = await requireStoreOwnership(userId, storeId)
  
  // Query with store_id filter
  const orders = await db.prepare(`
    SELECT * FROM orders 
    WHERE store_id = ? 
    ORDER BY created_at DESC
  `).bind(storeId).all()
  
  return orders
}
```

## 4. Input Validation Security

### Use Zod for All Inputs

```typescript
import { z } from 'zod'

// Define strict schemas
const ProductInputSchema = z.object({
  name: z.string()
    .min(1, 'Product name required')
    .max(255, 'Product name too long')
    .trim(),
  
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .min(1)
    .max(255),
  
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price too high'),
  
  description: z.string()
    .max(10000, 'Description too long')
    .optional()
})

// Validate before processing
try {
  const input = ProductInputSchema.parse(req.body)
  // Safe to use input
} catch (error) {
  if (error instanceof z.ZodError) {
    return c.json({ error: error.errors }, 400)
  }
}
```

### SQL Injection Prevention

```typescript
// ✅ CORRECT: Use prepared statements
const result = await db.prepare(`
  SELECT * FROM products 
  WHERE store_id = ? AND status = ?
`).bind(storeId, status).first()

// ❌ WRONG: String concatenation (DANGEROUS!)
// const result = await db.exec(`
//   SELECT * FROM products 
//   WHERE store_id = '${storeId}' AND status = '${status}'
// `)
```

## 5. Authentication & Authorization

### JWT Token Validation

```typescript
// Validate tokens on protected routes
async function validateJWT(token: string, secret: string) {
  try {
    const decoded = await verifyJWT(token, secret)
    
    // Check token expiry
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired')
    }
    
    return decoded
  } catch (error) {
    throw new Error('Invalid token')
  }
}
```

### Secure Session Management

```typescript
// Set secure cookies
function setAuthCookie(context: Context, token: string) {
  context.header('Set-Cookie', [
    `auth=${token}; `,
    'HttpOnly; ',           // Prevent JavaScript access
    'Secure; ',             // HTTPS only
    'SameSite=Strict; ',    // CSRF protection
    'Max-Age=86400'         // 24 hours
  ].join(''))
}
```

## 6. Rate Limiting

### Implement Rate Limiting

```typescript
// Rate limit per user/IP
const rateLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(identifier: string, maxRequests: number = 100, windowSeconds: number = 60) {
  const now = Date.now()
  const limit = rateLimits.get(identifier)
  
  if (!limit || limit.resetAt < now) {
    rateLimits.set(identifier, { count: 1, resetAt: now + (windowSeconds * 1000) })
    return true
  }
  
  if (limit.count >= maxRequests) {
    return false
  }
  
  limit.count++
  return true
}

// Usage in route
apiRoutes.post('/orders', async (c) => {
  const userId = c.get('user').id
  
  if (!checkRateLimit(userId, 10, 60)) {
    return c.json({ error: 'Too many requests' }, 429)
  }
  
  // Process order
})
```

## 7. Logging & Monitoring

### Secure Logging

```typescript
// Log security events
function logSecurityEvent(event: SecurityEvent) {
  logger.warn(`Security Event: ${event.type}`, {
    userId: event.userId,
    action: event.action,
    resource: event.resource,
    timestamp: new Date().toISOString(),
    ip: event.ipAddress,
    userAgent: event.userAgent
  })
}

// Log failed payments
logger.warn('Payment processing failed', {
  orderId: order.id,
  reason: error.message,
  paymentMethod: order.payment_method,
  timestamp: new Date().toISOString()
})

// Log unusual activity
if (downloadLink.download_count > downloadLink.max_downloads) {
  logger.error('Download limit bypass attempted', {
    linkId: downloadLink.id,
    actualCount: downloadLink.download_count,
    maxAllowed: downloadLink.max_downloads
  })
}
```

## 8. Environment Configuration

### Secure Configuration

```typescript
// .env (Never commit this!)
STRIPE_PUBLISHABLE_KEY=pk_test_123456789
STRIPE_SECRET_KEY=sk_test_123456789
STRIPE_WEBHOOK_SECRET=whsec_test_123456789

PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret

JWT_SECRET=your_jwt_secret_min_32_chars
ENCRYPTION_KEY=your_encryption_key

# Development only
DEBUG=true
NODE_ENV=production
```

### Validate Configuration

```typescript
// Validate required environment variables
function validateConfiguration() {
  const required = [
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'DATABASE_URL'
  ]
  
  const paymentRequired = process.env.PAYMENT_ENABLED
    ? ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
    : []
  
  const missing = [...required, ...paymentRequired].filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

validateConfiguration()
```

## 9. Error Handling Security

### Safe Error Messages

```typescript
// ✅ CORRECT: Generic error messages to users
return c.json({
  error: 'An error occurred while processing your request'
}, 500)

// ❌ WRONG: Leaking sensitive information
// return c.json({
//   error: 'Database connection failed: host=db.internal port=5432'
// }, 500)

// Log detailed errors internally
logger.error('Database connection failed', {
  host: 'db.internal',
  port: 5432,
  error: dbError
})
```

## 10. Regular Security Audits

### Security Checklist

- [ ] Dependencies up to date (`npm audit`)
- [ ] No hardcoded secrets in code
- [ ] All user inputs validated with Zod
- [ ] All database queries use prepared statements
- [ ] Store ownership verified for all admin operations
- [ ] Rate limiting implemented
- [ ] HTTPS enforced in production
- [ ] Secure cookies set with HttpOnly, Secure, SameSite flags
- [ ] Webhook signatures verified
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging for sensitive operations
- [ ] Regular dependency security updates

### Recommended Tools

```bash
# Check for vulnerabilities
npm audit
npm audit fix

# Update outdated packages
npm outdated
npm update

# Security scanning
npm install -g snyk
snyk test

# OWASP security scanning
npm install -g owasp-dependency-check
dependency-check --project "Multi-Store Payments" --scan .
```

## Compliance

### PCI DSS Compliance
- Never store full credit card numbers
- Use Level 1 PCI-compliant payment processor (Stripe)
- Ensure all transmissions encrypted (TLS 1.2+)
- Regular security testing and scanning

### GDPR Compliance
- Obtain consent before data collection
- Implement right to deletion
- Maintain data processing agreements
- Report breaches within 72 hours

### Data Protection
- Encrypt sensitive data at rest
- Encrypt data in transit (HTTPS)
- Implement access controls
- Regular backups with encryption

## References

- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PCI DSS Compliance Guide](https://www.pcisecuritystandards.org/)
- [GDPR Compliance](https://gdpr-info.eu/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
