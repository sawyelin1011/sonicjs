-- E-Commerce: Products and Variants
-- Comprehensive product management with variants, pricing, and inventory

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  cost_price DECIMAL(12, 2),
  compare_at_price DECIMAL(12, 2),
  status TEXT DEFAULT 'draft',
  sku TEXT UNIQUE,
  barcode TEXT,
  weight DECIMAL(8, 3),
  weight_unit TEXT DEFAULT 'lb',
  requires_shipping INTEGER DEFAULT 1,
  is_physical INTEGER DEFAULT 1,
  is_digital INTEGER DEFAULT 0,
  digital_url TEXT,
  digital_expires_days INTEGER,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  metadata TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  title TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  price DECIMAL(12, 2),
  cost_price DECIMAL(12, 2),
  compare_at_price DECIMAL(12, 2),
  weight DECIMAL(8, 3),
  weight_unit TEXT DEFAULT 'lb',
  requires_shipping INTEGER DEFAULT 1,
  is_default INTEGER DEFAULT 0,
  image_url TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE(product_id, sku)
);

CREATE TABLE IF NOT EXISTS product_options (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_option_values (
  id TEXT PRIMARY KEY,
  option_id TEXT NOT NULL,
  value TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variant_options (
  id TEXT PRIMARY KEY,
  variant_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  value TEXT NOT NULL,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE,
  UNIQUE(variant_id, option_id)
);

CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  parent_id TEXT,
  image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  meta_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  UNIQUE(store_id, slug)
);

CREATE TABLE IF NOT EXISTS product_category_assignments (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE,
  UNIQUE(product_id, category_id)
);

CREATE TABLE IF NOT EXISTS product_tags (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE(store_id, slug)
);

CREATE TABLE IF NOT EXISTS product_tag_assignments (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES product_tags(id) ON DELETE CASCADE,
  UNIQUE(product_id, tag_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_store_id ON product_variants(store_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_categories_store_id ON product_categories(store_id);
CREATE INDEX IF NOT EXISTS idx_product_category_assignments_product_id ON product_category_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_category_assignments_category_id ON product_category_assignments(category_id);
