/**
 * Migration: Create Secure Download Links Table
 * 
 * Secure, time-limited download tokens for digital products
 * Tracks download count and expiry for access control
 */

CREATE TABLE IF NOT EXISTS secure_download_links (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  digital_download_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (digital_download_id) REFERENCES digital_downloads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_secure_download_links_token ON secure_download_links(token);
CREATE INDEX IF NOT EXISTS idx_secure_download_links_order_id ON secure_download_links(order_id);
CREATE INDEX IF NOT EXISTS idx_secure_download_links_expires_at ON secure_download_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_secure_download_links_product_id ON secure_download_links(product_id);
