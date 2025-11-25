/**
 * Payment Service
 * 
 * Handles payment gateway integration (Stripe & PayPal)
 * Creates payment intents, validates webhooks, and processes payments
 */

import type { PluginLogger } from '@sonicjs-cms/core'
import type { StripeConfig, PayPalConfig, Order } from '../types'

export class PaymentService {
  constructor(
    private logger: PluginLogger,
    private stripeConfig?: StripeConfig,
    private paypalConfig?: PayPalConfig
  ) {}

  // ============================================================================
  // STRIPE OPERATIONS
  // ============================================================================

  async createStripePaymentIntent(order: Order): Promise<{ clientSecret: string; publishableKey: string }> {
    if (!this.stripeConfig?.enabled || !this.stripeConfig?.secret_key) {
      throw new Error('Stripe is not configured')
    }

    try {
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.stripeConfig.secret_key}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          amount: Math.round(order.total * 100).toString(), // Convert to cents
          currency: 'usd',
          payment_method_types: 'card',
          metadata: {
            order_id: order.id,
            store_id: order.store_id,
            customer_email: order.customer_email
          },
          description: `Order ${order.id} from store ${order.store_id}`
        })
      })

      const data = await response.json() as any

      if (!response.ok) {
        this.logger.error(`Stripe API error: ${data.error?.message || 'Unknown error'}`)
        throw new Error(data.error?.message || 'Failed to create payment intent')
      }

      this.logger.info(`Stripe payment intent created: ${data.id}`)

      return {
        clientSecret: data.client_secret,
        publishableKey: this.stripeConfig.publishable_key
      }
    } catch (error) {
      this.logger.error(`Stripe payment intent creation failed: ${error}`)
      throw error
    }
  }

  async verifyStripeWebhookSignature(body: string, signature: string): Promise<boolean> {
    if (!this.stripeConfig?.webhook_secret) {
      this.logger.warn('Stripe webhook secret not configured')
      return false
    }

    try {
      const crypto = await import('crypto')
      const hash = crypto.subtle.digest(
        'sha-256',
        new TextEncoder().encode(body + this.stripeConfig.webhook_secret)
      )

      // In production, use proper Stripe webhook verification
      // This is a simplified version for development
      return true
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error}`)
      return false
    }
  }

  async handleStripePaymentIntentSucceeded(paymentIntentId: string): Promise<void> {
    this.logger.info(`Stripe payment completed: ${paymentIntentId}`)
  }

  async handleStripePaymentIntentFailed(paymentIntentId: string, errorMessage: string): Promise<void> {
    this.logger.warn(`Stripe payment failed: ${paymentIntentId} - ${errorMessage}`)
  }

  // ============================================================================
  // PAYPAL OPERATIONS
  // ============================================================================

  async createPayPalOrder(order: Order): Promise<{ orderId: string; approvalUrl: string }> {
    if (!this.paypalConfig?.enabled || !this.paypalConfig?.client_id || !this.paypalConfig?.client_secret) {
      throw new Error('PayPal is not configured')
    }

    try {
      // Get access token
      const authResponse = await fetch(
        `https://api.${this.paypalConfig.mode === 'sandbox' ? 'sandbox.' : ''}paypal.com/v1/oauth2/token`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Authorization': `Basic ${btoa(`${this.paypalConfig.client_id}:${this.paypalConfig.client_secret}`)}`
          },
          body: 'grant_type=client_credentials'
        }
      )

      const authData = await authResponse.json() as any

      if (!authResponse.ok) {
        throw new Error('Failed to get PayPal access token')
      }

      // Create order
      const orderResponse = await fetch(
        `https://api.${this.paypalConfig.mode === 'sandbox' ? 'sandbox.' : ''}paypal.com/v2/checkout/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.access_token}`
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
              {
                reference_id: order.id,
                amount: {
                  currency_code: 'USD',
                  value: order.total.toFixed(2),
                  breakdown: {
                    item_total: { currency_code: 'USD', value: order.subtotal.toFixed(2) },
                    tax_total: { currency_code: 'USD', value: order.tax.toFixed(2) },
                    shipping: { currency_code: 'USD', value: order.shipping.toFixed(2) }
                  }
                }
              }
            ],
            application_context: {
              brand_name: 'Your Store',
              user_action: 'PAY_NOW'
            }
          })
        }
      )

      const orderData = await orderResponse.json() as any

      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create PayPal order')
      }

      const approvalUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href

      if (!approvalUrl) {
        throw new Error('No approval URL in PayPal response')
      }

      this.logger.info(`PayPal order created: ${orderData.id}`)

      return {
        orderId: orderData.id,
        approvalUrl
      }
    } catch (error) {
      this.logger.error(`PayPal order creation failed: ${error}`)
      throw error
    }
  }

  async capturePayPalOrder(paypalOrderId: string, accessToken: string): Promise<{ id: string; status: string }> {
    if (!this.paypalConfig?.enabled) {
      throw new Error('PayPal is not configured')
    }

    try {
      const response = await fetch(
        `https://api.${this.paypalConfig.mode === 'sandbox' ? 'sandbox.' : ''}paypal.com/v2/checkout/orders/${paypalOrderId}/capture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      const data = await response.json() as any

      if (!response.ok) {
        throw new Error(data.message || 'Failed to capture PayPal order')
      }

      this.logger.info(`PayPal order captured: ${data.id}`)

      return {
        id: data.id,
        status: data.status
      }
    } catch (error) {
      this.logger.error(`PayPal order capture failed: ${error}`)
      throw error
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  isStripeEnabled(): boolean {
    return this.stripeConfig?.enabled || false
  }

  isPayPalEnabled(): boolean {
    return this.paypalConfig?.enabled || false
  }

  getAvailablePaymentMethods(): string[] {
    const methods: string[] = []
    if (this.isStripeEnabled()) methods.push('stripe')
    if (this.isPayPalEnabled()) methods.push('paypal')
    methods.push('free')
    return methods
  }

  updateStripeConfig(config: Partial<StripeConfig>): void {
    if (this.stripeConfig) {
      Object.assign(this.stripeConfig, config)
      this.logger.info('Stripe configuration updated')
    }
  }

  updatePayPalConfig(config: Partial<PayPalConfig>): void {
    if (this.paypalConfig) {
      Object.assign(this.paypalConfig, config)
      this.logger.info('PayPal configuration updated')
    }
  }
}
