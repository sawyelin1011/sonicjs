/**
 * Migration: Create Products Table
 * 
 * Support for both physical and digital products
 * Products belong to stores and can have varying stock levels
 */

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  cost REAL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('active', 'inactive', 'draft')),
  type TEXT NOT NULL CHECK(type IN ('physical', 'digital')),
  image_url TEXT,
  sku TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_store_sku ON products(store_id, sku) WHERE sku IS NOT NULL;
