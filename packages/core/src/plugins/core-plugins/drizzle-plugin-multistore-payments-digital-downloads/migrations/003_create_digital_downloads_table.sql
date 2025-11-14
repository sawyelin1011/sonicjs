/**
 * Migration: Create Digital Downloads Table
 * 
 * Store R2 file references for digital products
 * Maps products to their file storage in Cloudflare R2
 */

CREATE TABLE IF NOT EXISTS digital_downloads (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE,
  r2_object_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_digital_downloads_product_id ON digital_downloads(product_id);
CREATE INDEX IF NOT EXISTS idx_digital_downloads_r2_object_key ON digital_downloads(r2_object_key);
