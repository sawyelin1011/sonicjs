-- E-Commerce: Discounts and Marketing
-- Promotion and discount management system

CREATE TABLE IF NOT EXISTS discounts (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  is_percentage INTEGER DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  per_customer_limit INTEGER DEFAULT 1,
  minimum_order_value DECIMAL(12, 2),
  maximum_order_value DECIMAL(12, 2),
  applicable_products TEXT,
  applicable_categories TEXT,
  applicable_collections TEXT,
  excluded_products TEXT,
  excluded_categories TEXT,
  customer_segments TEXT,
  status TEXT DEFAULT 'active',
  starts_at DATETIME,
  ends_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE(store_id, code)
);

CREATE TABLE IF NOT EXISTS discount_usage (
  id TEXT PRIMARY KEY,
  discount_id TEXT NOT NULL,
  order_id TEXT,
  customer_id TEXT,
  amount_applied DECIMAL(12, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  rule_type TEXT,
  conditions TEXT,
  benefits TEXT,
  status TEXT DEFAULT 'active',
  starts_at DATETIME,
  ends_at DATETIME,
  priority INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  code TEXT NOT NULL,
  discount_id TEXT,
  discount_value DECIMAL(12, 2),
  discount_type TEXT,
  maximum_usage INTEGER,
  times_used INTEGER DEFAULT 0,
  limit_per_customer INTEGER DEFAULT 1,
  free_shipping INTEGER DEFAULT 0,
  exclude_sale_items INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL,
  UNIQUE(store_id, code)
);

CREATE TABLE IF NOT EXISTS gift_cards (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  code TEXT NOT NULL,
  balance DECIMAL(12, 2) NOT NULL,
  initial_balance DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  customer_id TEXT,
  status TEXT DEFAULT 'active',
  expires_at DATETIME,
  purchased_at DATETIME,
  activated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  UNIQUE(store_id, code)
);

CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id TEXT PRIMARY KEY,
  gift_card_id TEXT NOT NULL,
  order_id TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type TEXT,
  reference_type TEXT,
  reference_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reviews_ratings (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  customer_id TEXT,
  order_id TEXT,
  rating INTEGER NOT NULL,
  title TEXT,
  comment TEXT,
  verified_purchase INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  approved_at DATETIME,
  rejected_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS wishlists (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  customer_id TEXT,
  name TEXT NOT NULL,
  is_default INTEGER DEFAULT 0,
  is_public INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY,
  wishlist_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
  UNIQUE(wishlist_id, product_id, variant_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discounts_store_id ON discounts(store_id);
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_status ON discounts(status);
CREATE INDEX IF NOT EXISTS idx_discount_usage_discount_id ON discount_usage(discount_id);
CREATE INDEX IF NOT EXISTS idx_promotions_store_id ON promotions(store_id);
CREATE INDEX IF NOT EXISTS idx_coupons_store_id ON coupons(store_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_store_id ON gift_cards(store_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews_ratings(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews_ratings(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_customer_id ON wishlists(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
