create database `angular-pos`;
use `angular-pos`;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: accounts
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `accounts` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `financial_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_customer` tinyint(1) DEFAULT '0',
  `is_supplier` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `default_discount` decimal(5, 2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`account_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: chart_of_accounts
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `chart_of_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_number` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `english_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `arabic_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category_number` int NOT NULL,
  `sub_category_number` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `account_type` enum(
  'EXPENSES',
  'INCOME',
  'EQUITY',
  'ASSETS',
  'LIABILITIES',
  'ASSETS/ LIABILITIES'
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chart_of_accounts_categories_unique` (`account_number`)
) ENGINE = InnoDB AUTO_INCREMENT = 48 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: exchange_rate
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `exchange_rate` (
  `rate_id` int NOT NULL AUTO_INCREMENT,
  `rate_value` decimal(10, 0) NOT NULL DEFAULT '89400',
  `transaction_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`rate_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 18 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: inventory
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `inventory_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`inventory_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: inventory_transactions
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `product_id_fk` int NOT NULL,
  `transaction_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_type` enum(
  'SALE',
  'SUPPLY',
  'RETURN',
  'UNRETURN',
  'DELETE',
  'DISPOSE',
  'DELIVER',
  'ADD',
  'REMOVE',
  'RETURN PURCHASE'
  ) COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `transaction_notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `order_id_fk` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `inventory_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`transaction_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: journal_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `journal_items` (
  `journal_item_id` int NOT NULL AUTO_INCREMENT,
  `journal_id_fk` int NOT NULL,
  `journal_date` datetime DEFAULT NULL,
  `account_id_fk` int NOT NULL,
  `partner_id_fk` int DEFAULT NULL,
  `reference_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `debit` decimal(10, 2) NOT NULL DEFAULT '0.00',
  `credit` decimal(10, 2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `exchange_rate` decimal(10, 2) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`journal_item_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: journal_vouchers
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `journal_vouchers` (
  `journal_id` int NOT NULL AUTO_INCREMENT,
  `journal_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `journal_date` datetime NOT NULL,
  `reference_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `journal_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `journal_notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `total_value` decimal(10, 2) NOT NULL,
  `exchange_rate` decimal(10, 2) DEFAULT NULL,
  `currency` enum('dollar', 'lira') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'dollar',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`journal_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: products
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `category_id_fk` int DEFAULT NULL,
  `brand_id_fk` int DEFAULT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `barcode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `currency` enum('dollar', 'lira') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'dollar',
  `avg_cost_usd` decimal(10, 2) DEFAULT NULL,
  `unit_cost_usd` decimal(10, 2) NOT NULL,
  `unit_price_usd` decimal(10, 2) NOT NULL DEFAULT '1.00',
  `wholesale_price_usd` decimal(10, 2) DEFAULT NULL,
  `product_notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `stock_management` tinyint(1) NOT NULL DEFAULT '1',
  `low_stock_threshold` int DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `supplier_id_fk` int DEFAULT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `barcode` (`barcode`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: products_brands
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `products_brands` (
  `brand_id` int NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`brand_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: products_categories
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `products_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_index` int DEFAULT NULL,
  `category_name` varchar(50) NOT NULL,
  `show_on_sell` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`category_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: purchase_order_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id_fk` int NOT NULL,
  `product_id_fk` int NOT NULL,
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_unit_id` int DEFAULT NULL,
  `product_unit_abbreviation` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `unit_cost_usd` decimal(10, 2) NOT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id_fk`) USING BTREE,
  KEY `product_id` (`product_id_fk`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: purchase_orders
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `journal_voucher_id` int DEFAULT NULL,
  `partner_id_fk` int DEFAULT NULL,
  `order_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `currency` enum('dollar', 'lira') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dollar',
  `total_cost` decimal(10, 2) NOT NULL DEFAULT '0.00',
  `purchase_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `exchange_rate` decimal(10, 2) DEFAULT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `user_id` int DEFAULT NULL,
  `inventory_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`order_id`),
  KEY `supplier_id` (`partner_id_fk`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: return_order_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `return_order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `unit_price` decimal(10, 2) NOT NULL,
  `total_price` decimal(10, 2) NOT NULL,
  `unit_cost` decimal(10, 2) NOT NULL,
  `avg_cost` decimal(10, 2) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`order_item_id`),
  KEY `return_order_items_order_id` (`order_id`),
  KEY `return_order_items_product_id` (`product_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: return_orders
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `return_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `journal_voucher_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `order_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `currency` enum('dollar', 'lira') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'dollar',
  `total_cost` decimal(10, 2) NOT NULL,
  `total_avg_cost` decimal(10, 2) DEFAULT NULL,
  `total_amount` decimal(10, 2) NOT NULL,
  `exchange_rate` decimal(20, 2) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `inventory_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`order_id`),
  KEY `return_customer_id` (`customer_id`),
  KEY `return_user_id` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: return_purchase_order_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `return_purchase_order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id_fk` int NOT NULL,
  `product_id_fk` int NOT NULL,
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_unit_id` int DEFAULT NULL,
  `product_unit_abbreviation` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `unit_cost_usd` decimal(10, 2) NOT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id_fk`) USING BTREE,
  KEY `product_id` (`product_id_fk`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: return_purchase_orders
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `return_purchase_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `journal_voucher_id` int DEFAULT NULL,
  `partner_id_fk` int DEFAULT NULL,
  `order_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `currency` enum('dollar', 'lira') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dollar',
  `total_cost` decimal(10, 2) NOT NULL DEFAULT '0.00',
  `purchase_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `exchange_rate` decimal(10, 2) DEFAULT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `user_id` int DEFAULT NULL,
  `inventory_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`order_id`),
  KEY `supplier_id` (`partner_id_fk`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: sales_order_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sales_order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` decimal(10, 2) DEFAULT NULL,
  `original_price` decimal(10, 2) DEFAULT NULL,
  `unit_price` decimal(10, 2) DEFAULT NULL,
  `discount_percentage` decimal(10, 2) DEFAULT NULL,
  `total_price` decimal(10, 2) DEFAULT NULL,
  `unit_cost` decimal(10, 2) DEFAULT NULL,
  `avg_cost` decimal(10, 2) DEFAULT '0.00',
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: sales_orders
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sales_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `journal_voucher_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `operation_type` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `order_datetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_cost` decimal(10, 2) DEFAULT NULL,
  `total_avg_cost` decimal(10, 2) NOT NULL,
  `total_amount` decimal(10, 2) DEFAULT NULL,
  `exchange_rate` decimal(20, 2) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `user_id` int DEFAULT NULL,
  `currency` enum('dollar', 'lira') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'dollar',
  `inventory_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`order_id`),
  KEY `customer_id` (`customer_id`),
  KEY `journal_voucher_id` (`journal_voucher_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: settings
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `address_2` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enable_normal` tinyint(1) NOT NULL DEFAULT '1',
  `enable_thermal` tinyint(1) NOT NULL DEFAULT '0',
  `invoice_note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: sticky_notes
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sticky_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_index` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: units_of_measure
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `units_of_measure` (
  `unit_id` int NOT NULL AUTO_INCREMENT,
  `unit_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `unit_abbreviation` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`unit_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: users
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` enum('admin', 'user') NOT NULL DEFAULT 'user',
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `show_stock` tinyint(1) NOT NULL DEFAULT '0',
  `show_cost` tinyint(1) NOT NULL DEFAULT '0',
  `edit_invoice` tinyint(1) NOT NULL DEFAULT '0',
  `delete_invoice` tinyint(1) NOT NULL DEFAULT '0',
  `show_reports` tinyint(1) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 14 DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: accounts
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: chart_of_accounts
# ------------------------------------------------------------

INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    1,
    '4011',
    'Invoices ',
    'فواتیر ',
    4,
    '40',
    'LIABILITIES'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    2,
    '4111',
    'Ordinary Clients ',
    'زبائن عادیون ',
    4,
    '41',
    'ASSETS'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    3,
    '413',
    'Notes Receivable ( Clients ) ',
    'اوراق قبض - زبائن ',
    4,
    '41',
    'ASSETS'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (4, '6011', 'Goods ', 'البضاعة ', 6, '60', 'EXPENSES');
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (5, '7011', 'Sales Goods ', '- ', 7, '70', 'INCOME');
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    6,
    '44271',
    'V.A.T On Sales',
    NULL,
    4,
    '44',
    'LIABILITIES'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    7,
    '531',
    'Cash Dollar',
    'كاش دولار',
    5,
    '53',
    'ASSETS'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    8,
    '6112',
    'Consumables Purchases ',
    'شراء مواد ولوازم استھلاكیة ',
    6,
    '61',
    'EXPENSES'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    9,
    '61121',
    'Fuel And Gaz ',
    'محروقات ',
    6,
    '61',
    'EXPENSES'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    10,
    '61122',
    'Maintenance Products ',
    'مواد الصیانة ',
    6,
    '61',
    'EXPENSES'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    11,
    '61123',
    'Workshop And Factory Supplies ',
    'لوازم للمشغل و المصنع ',
    6,
    '61',
    'EXPENSES'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    12,
    '61124',
    'Stores Supplies ',
    'لوازم للمخزن ',
    6,
    '61',
    'EXPENSES'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    13,
    '61125',
    'Office Supplies ',
    'لوازم مكتبیة ',
    6,
    '61',
    'EXPENSES'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (
    14,
    '401',
    'Accounts Payables ( Suppliers ) ',
    NULL,
    4,
    '40',
    'LIABILITIES'
  );
INSERT INTO
  `chart_of_accounts` (
    `id`,
    `account_number`,
    `english_name`,
    `arabic_name`,
    `category_number`,
    `sub_category_number`,
    `account_type`
  )
VALUES
  (15, '101', 'Capital Account', NULL, 1, '10', 'EQUITY');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: exchange_rate
# ------------------------------------------------------------

INSERT INTO
  `exchange_rate` (
    `rate_id`,
    `rate_value`,
    `transaction_datetime`,
    `is_deleted`
  )
VALUES
  (1, 90000, '2024-08-24 08:35:48', 0);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: inventory
# ------------------------------------------------------------

INSERT INTO
  `inventory` (`inventory_id`, `inventory_name`, `is_deleted`)
VALUES
  (1, 'Default', 0);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: inventory_transactions
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: journal_items
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: journal_vouchers
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: products
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: products_brands
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: products_categories
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: purchase_order_items
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: purchase_orders
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: return_order_items
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: return_orders
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: return_purchase_order_items
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: return_purchase_orders
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: sales_order_items
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: sales_orders
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: settings
# ------------------------------------------------------------

INSERT INTO
  `settings` (
    `id`,
    `brand_name`,
    `phone_1`,
    `phone_2`,
    `address`,
    `address_2`,
    `email`,
    `website`,
    `enable_normal`,
    `enable_thermal`,
    `invoice_note`
  )
VALUES
  (
    1,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    1,
    0,
    'Thank you for choosing us.'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: sticky_notes
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: units_of_measure
# ------------------------------------------------------------

INSERT INTO
  `units_of_measure` (
    `unit_id`,
    `unit_name`,
    `unit_abbreviation`,
    `is_deleted`
  )
VALUES
  (1, 'unit', 'unit', 0);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: users
# ------------------------------------------------------------

INSERT INTO
  `users` (
    `user_id`,
    `username`,
    `password`,
    `user_type`,
    `first_name`,
    `last_name`,
    `last_login`,
    `show_stock`,
    `show_cost`,
    `edit_invoice`,
    `delete_invoice`,
    `show_reports`,
    `is_deleted`
  )
VALUES
  (
    7,
    'admin',
    '$2a$10$QmR5EBArlKV8Gd7Rh3mEJOm/xvVMbLq8nyVpfotKSX0ZINskrXArW',
    'admin',
    'admin',
    'admin',
    '2025-11-30 12:42:09',
    1,
    1,
    1,
    1,
    1,
    0
  );
INSERT INTO
  `users` (
    `user_id`,
    `username`,
    `password`,
    `user_type`,
    `first_name`,
    `last_name`,
    `last_login`,
    `show_stock`,
    `show_cost`,
    `edit_invoice`,
    `delete_invoice`,
    `show_reports`,
    `is_deleted`
  )
VALUES
  (
    12,
    'user',
    '$2a$10$SBVxcnDHuoCKE9U44sL/o.ZNkyYJlcJXXfmsfx2bCZLzlRX9Q5N0C',
    'user',
    'user',
    'user',
    '2025-06-23 15:02:54',
    0,
    0,
    0,
    0,
    0,
    0
  );

