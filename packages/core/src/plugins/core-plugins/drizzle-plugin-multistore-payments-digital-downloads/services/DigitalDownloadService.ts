/**
 * Digital Download Service
 * 
 * Manages digital product downloads with security:
 * - Secure token generation and validation
 * - Download expiry and limit tracking
 * - R2 file access control
 */

import type { R2Bucket } from '@cloudflare/workers-types'
import type { PluginLogger } from '@sonicjs-cms/core'
import type { SecureDownloadLink, DigitalDownload } from '../types'
import { DatabaseService } from './DatabaseService'

export class DigitalDownloadService {
  constructor(
    private dbService: DatabaseService,
    private r2: R2Bucket | undefined,
    private logger: PluginLogger,
    private expiryDays: number = 30,
    private maxDownloads: number = 5
  ) {}

  // ============================================================================
  // DOWNLOAD LINK OPERATIONS
  // ============================================================================

  async createDownloadLinksForOrder(orderId: string, digitalProducts: { productId: string; digitalDownloadId: string }[]): Promise<SecureDownloadLink[]> {
    const links: SecureDownloadLink[] = []

    for (const product of digitalProducts) {
      const link = await this.dbService.createSecureDownloadLink(
        orderId,
        product.productId,
        product.digitalDownloadId,
        this.maxDownloads,
        this.expiryDays
      )
      links.push(link)
    }

    this.logger.info(`Created ${links.length} download links for order ${orderId}`)
    return links
  }

  async validateDownloadLink(token: string): Promise<SecureDownloadLink | null> {
    const link = await this.dbService.getSecureDownloadLink(token)

    if (!link) {
      this.logger.warn(`Invalid or expired download token: ${token}`)
      return null
    }

    const now = Math.floor(Date.now() / 1000)

    // Check expiry
    if (link.expires_at < now) {
      this.logger.warn(`Download link expired: ${link.id}`)
      return null
    }

    // Check download limit
    if (link.download_count >= link.max_downloads) {
      this.logger.warn(`Download limit reached: ${link.id}`)
      return null
    }

    return link
  }

  async recordDownload(linkId: string): Promise<void> {
    await this.dbService.incrementDownloadCount(linkId)
    this.logger.info(`Download recorded: ${linkId}`)
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  async uploadDigitalProduct(
    productId: string,
    file: Buffer | Blob,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    if (!this.r2) {
      throw new Error('R2 storage is not configured')
    }

    try {
      const objectKey = `digital-products/${productId}/${Date.now()}-${fileName}`

      // Convert Blob to buffer if needed
      let buffer = file
      if (file instanceof Blob) {
        buffer = await file.arrayBuffer() as any
      }

      await this.r2.put(objectKey, buffer, {
        customMetadata: {
          'product-id': productId,
          'original-filename': fileName,
          'uploaded-at': new Date().toISOString()
        },
        contentType: mimeType
      })

      this.logger.info(`Digital product uploaded: ${objectKey}`)
      return objectKey
    } catch (error) {
      this.logger.error(`Failed to upload digital product: ${error}`)
      throw error
    }
  }

  async generateDownloadUrl(
    r2ObjectKey: string,
    fileName: string,
    expirySeconds: number = 3600
  ): Promise<string> {
    if (!this.r2) {
      throw new Error('R2 storage is not configured')
    }

    try {
      // In production, generate a signed URL with expiry
      // This is a simplified example
      const url = `https://downloads.example.com/${r2ObjectKey}?dl=${encodeURIComponent(fileName)}`
      this.logger.info(`Download URL generated for: ${r2ObjectKey}`)
      return url
    } catch (error) {
      this.logger.error(`Failed to generate download URL: ${error}`)
      throw error
    }
  }

  async deleteDigitalProduct(r2ObjectKey: string): Promise<void> {
    if (!this.r2) {
      this.logger.warn('R2 storage not configured for deletion')
      return
    }

    try {
      await this.r2.delete(r2ObjectKey)
      this.logger.info(`Digital product deleted from R2: ${r2ObjectKey}`)
    } catch (error) {
      this.logger.warn(`Failed to delete digital product from R2: ${error}`)
      // Don't throw - continue even if R2 deletion fails
    }
  }

  async getFileSize(r2ObjectKey: string): Promise<number | null> {
    if (!this.r2) {
      return null
    }

    try {
      const object = await this.r2.head(r2ObjectKey)
      return object?.size || 0
    } catch (error) {
      this.logger.warn(`Failed to get file size: ${error}`)
      return null
    }
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  setExpiryDays(days: number): void {
    this.expiryDays = days
    this.logger.info(`Download expiry set to: ${days} days`)
  }

  setMaxDownloads(count: number): void {
    this.maxDownloads = count
    this.logger.info(`Max downloads set to: ${count}`)
  }

  getExpiryDays(): number {
    return this.expiryDays
  }

  getMaxDownloads(): number {
    return this.maxDownloads
  }
}
