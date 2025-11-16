-- E-Commerce: Inventory and Customers
-- Stock management and customer relationship management

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  variant_id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  reorder_level INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  sku TEXT,
  barcode TEXT,
  warehouse TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE(variant_id, store_id, warehouse)
);

CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id TEXT PRIMARY KEY,
  inventory_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id TEXT,
  reference_type TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stock_transfers (
  id TEXT PRIMARY KEY,
  variant_id TEXT NOT NULL,
  from_warehouse TEXT NOT NULL,
  to_warehouse TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  notes TEXT,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  notes TEXT,
  tags TEXT,
  source TEXT,
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  last_order_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE(store_id, email)
);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  street_address TEXT NOT NULL,
  street_address_2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT,
  phone TEXT,
  email TEXT,
  is_default_shipping INTEGER DEFAULT 0,
  is_default_billing INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer_segments (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  condition_type TEXT,
  conditions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer_segment_assignments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  segment_id TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (segment_id) REFERENCES customer_segments(id) ON DELETE CASCADE,
  UNIQUE(customer_id, segment_id)
);

CREATE TABLE IF NOT EXISTS customer_notes (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  status TEXT DEFAULT 'active',
  currency TEXT DEFAULT 'USD',
  timezone TEXT,
  language TEXT DEFAULT 'en',
  logo_url TEXT,
  favicon_url TEXT,
  theme_id TEXT,
  branding_settings TEXT,
  payment_gateways TEXT,
  shipping_providers TEXT,
  tax_settings TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT,
  UNIQUE(slug)
);

CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE(store_id, key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_store_id ON inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_inventory_id ON inventory_adjustments(inventory_id);
CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_store_id ON customer_segments(store_id);
CREATE INDEX IF NOT EXISTS idx_customer_segment_assignments_customer_id ON customer_segment_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_store_settings_store_id ON store_settings(store_id);
