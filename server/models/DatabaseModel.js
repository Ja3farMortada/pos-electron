const pool = require("../config/database");

class Database {
    // update database
    static async update() {
        try {
            const queries = [
                `INSERT INTO chart_of_accounts (account_number, english_name, arabic_name, category_number, sub_category_number, account_type) VALUES ('401', 'Accounts Payables (Suppliers)', NULL, 4, '40', 'LIABILITIES');`,

                `CREATE TABLE settings  (
                id int(11) NOT NULL AUTO_INCREMENT,
                brand_name varchar(255) NULL,
                phone_1 varchar(255) NULL,
                phone_2 varchar(255) NULL,
                address text NULL,
                address_2 text NULL,
                email varchar(255) NULL,
                website varchar(255) NULL,
                PRIMARY KEY (id));`,

                `ALTER TABLE products
                ADD COLUMN supplier_id_fk int(11) NULL AFTER is_deleted;`,

                `INSERT INTO chart_of_accounts (account_number, english_name, category_number, sub_category_number, account_type) VALUES ('101', 'Capital Account', 1, '10', 'EQUITY')`,

                `ALTER TABLE inventory_transactions ADD COLUMN order_id_fk int(11) NULL AFTER is_deleted;`,

                `CREATE TABLE sticky_notes
                (id int(11) NOT NULL AUTO_INCREMENT,title varchar(255) NULL,text longtext NULL,PRIMARY KEY (id));`,

                `ALTER TABLE sticky_notes
                ADD COLUMN note_index int(11) NULL DEFAULT NULL AFTER text;`,

                `ALTER TABLE journal_vouchers ADD COLUMN journal_notes varchar(255) NULL AFTER journal_description;`,

                `ALTER TABLE sales_order_items ADD COLUMN avg_cost decimal(10, 2) NULL DEFAULT 0 AFTER unit_cost;`,

                `ALTER TABLE users DROP COLUMN edit_pets;`,

                `ALTER TABLE products ADD COLUMN is_hidden tinyint(1) NOT NULL DEFAULT 0 AFTER supplier_id_fk;`,

                `ALTER TABLE settings ADD COLUMN enable_normal tinyint(1) NOT NULL DEFAULT 1 AFTER website, ADD COLUMN enable_thermal tinyint(1) NOT NULL DEFAULT 0 AFTER enable_normal;`,

                `ALTER TABLE sales_order_items ADD COLUMN original_price decimal(10, 2) NULL AFTER quantity,
                ADD COLUMN discount_percentage decimal(10, 2) NULL AFTER unit_price;`,

                `ALTER TABLE accounts ADD COLUMN default_discount decimal(5, 2) NOT NULL DEFAULT 0 AFTER is_deleted;`,

                `ALTER TABLE accounts DROP COLUMN code;`,

                `ALTER TABLE inventory_transactions MODIFY COLUMN quantity decimal(10, 2) NOT NULL AFTER transaction_type;`,

                `ALTER TABLE sales_order_items MODIFY COLUMN quantity decimal(10, 2) NULL DEFAULT NULL AFTER product_id;`,

                `ALTER TABLE purchase_order_items MODIFY COLUMN quantity decimal(10, 2) NOT NULL AFTER product_unit_abbreviation;`,

                `ALTER TABLE settings ADD COLUMN invoice_note varchar(255) NULL`,

                `ALTER TABLE sales_orders ADD COLUMN total_avg_cost decimal(10, 2) NOT NULL AFTER total_cost;`,

                `UPDATE sales_order_items SET avg_cost = unit_cost WHERE avg_cost IS NULL`,

                // `CREATE TABLE tables (table_id int(0) NOT NULL AUTO_INCREMENT PRIMARY KEY, table_number int(0) NOT NULL UNIQUE);`,

                `ALTER TABLE journal_vouchers ADD COLUMN user_id int(0) NULL AFTER is_deleted;`,

                `ALTER TABLE sales_orders ADD COLUMN user_id int(0) NULL AFTER is_deleted;`,

                `ALTER TABLE purchase_orders ADD COLUMN user_id int(0) NULL AFTER is_deleted;`,

                `ALTER TABLE products ADD COLUMN wholesale_price_usd decimal(10, 2) NULL AFTER unit_price_usd;`,

                `ALTER TABLE return_orders MODIFY COLUMN total_amount decimal(10, 2) NOT NULL AFTER total_cost,ADD COLUMN total_avg_cost decimal(10, 2) NOT NULL AFTER total_cost, ADD COLUMN exchange_rate decimal(20, 2) NULL AFTER total_amount;`,

                `ALTER TABLE return_order_items DROP COLUMN price_type, MODIFY COLUMN quantity decimal(10, 2) NOT NULL AFTER product_id, ADD COLUMN avg_cost decimal(10, 2) NULL AFTER unit_cost;`,

                `ALTER TABLE return_orders MODIFY COLUMN invoice_number varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL AFTER order_id, MODIFY COLUMN journal_voucher_id int(11) NULL AFTER invoice_number, MODIFY COLUMN customer_id int(11) NULL AFTER journal_voucher_id, MODIFY COLUMN total_avg_cost decimal(10, 2) NULL AFTER total_cost;`,

                `ALTER TABLE products ADD COLUMN brand_id_fk int(11) NULL DEFAULT NULL AFTER category_id_fk;`,

                `ALTER TABLE accounts DROP COLUMN is_bank, DROP COLUMN is_employee;`,

                `ALTER TABLE products ADD COLUMN currency enum('dollar','lira') NOT NULL DEFAULT 'dollar' AFTER product_name;`,

                `ALTER TABLE sales_orders ADD COLUMN currency enum('dollar','lira') NOT NULL DEFAULT 'dollar' AFTER user_id;`,

                `ALTER TABLE sales_order_items DROP COLUMN price_type;`,

                `ALTER TABLE journal_vouchers ADD COLUMN currency enum('dollar','lira') NULL DEFAULT 'dollar' AFTER user_id;`,

                `ALTER TABLE journal_items MODIFY COLUMN currency varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL AFTER credit`,

                `UPDATE journal_items SET currency = 'dollar' WHERE currency = 'USD'`,

                `ALTER TABLE journal_vouchers MODIFY COLUMN currency enum('dollar','lira') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'dollar' AFTER total_value, ADD COLUMN exchange_rate decimal(10, 2) NULL AFTER total_value;`,

                `ALTER TABLE journal_items CHANGE COLUMN exchange_value exchange_rate decimal(10, 2) NULL DEFAULT NULL AFTER currency;`,

                `ALTER TABLE purchase_orders ADD COLUMN currency enum('dollar','lira') NOT NULL DEFAULT 'dollar' AFTER order_datetime;`,

                `ALTER TABLE return_orders ADD COLUMN currency enum('dollar','lira') NOT NULL DEFAULT 'dollar' AFTER order_datetime;`,

                `ALTER TABLE sales_orders ADD COLUMN operation_type varchar(255) NULL AFTER customer_id;`,

                `ALTER TABLE sales_orders ADD INDEX user_id('user_id') USING BTREE;`,

                `ALTER TABLE sales_orders ADD INDEX journal_voucher_id(journal_voucher_id) USING BTREE;`,

                `CREATE TABLE return_purchase_orders (
                    order_id int(11) NOT NULL AUTO_INCREMENT,
                    invoice_number varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                    journal_voucher_id int(11) DEFAULT NULL,
                    partner_id_fk int(11) DEFAULT NULL,
                    order_datetime datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    currency enum('dollar','lira') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dollar',
                    total_cost decimal(10,2) NOT NULL DEFAULT '0.00',
                    purchase_notes text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
                    exchange_rate decimal(10,2) DEFAULT NULL,
                    is_deleted tinyint(4) NOT NULL DEFAULT '0',
                    user_id int(11) DEFAULT NULL,
                    PRIMARY KEY (order_id),
                    KEY supplier_id (partner_id_fk) USING BTREE
                    ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

                `CREATE TABLE return_purchase_order_items (
                        order_item_id int(11) NOT NULL AUTO_INCREMENT,
                        order_id_fk int(11) NOT NULL,
                        product_id_fk int(11) NOT NULL,
                        product_name varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                        product_unit_id int(11) DEFAULT NULL,
                        product_unit_abbreviation varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                        quantity decimal(10,2) NOT NULL,
                        unit_cost_usd decimal(10,2) NOT NULL,
                        is_deleted tinyint(4) NOT NULL DEFAULT '0',
                        PRIMARY KEY (order_item_id),
                        KEY order_id (order_id_fk) USING BTREE,
                        KEY product_id (product_id_fk) USING BTREE
                        ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

                `ALTER TABLE inventory_transactions MODIFY COLUMN transaction_type enum('SALE','SUPPLY','RETURN','UNRETURN','DELETE','DISPOSE','DELIVER','ADD','REMOVE','RETURN PURCHASE') NOT NULL AFTER transaction_datetime;`,


                `CREATE TABLE inventory (
                            inventory_id int(11) NOT NULL AUTO_INCREMENT,
                            inventory_name VARCHAR(255) NOT NULL,
                            is_deleted TINYINT NOT NULL DEFAULT '0',
                            PRIMARY KEY (inventory_id)
                        )`,

                `INSERT INTO inventory (inventory_id, inventory_name, is_deleted)
                SELECT 1, 'Default', 0
                WHERE NOT EXISTS (
                    SELECT 1 FROM inventory WHERE inventory_name = 'Default Inventory'
                )`,

                `ALTER TABLE inventory_transactions ADD COLUMN inventory_id int DEFAULT 1 NOT NULL;`,

                `ALTER TABLE purchase_orders ADD COLUMN inventory_id int DEFAULT 1 NOT NULL;`,
                `ALTER TABLE sales_orders ADD COLUMN inventory_id int DEFAULT 1 NOT NULL;`,
                `ALTER TABLE return_orders ADD COLUMN inventory_id int DEFAULT 1 NOT NULL;`,
                `ALTER TABLE return_purchase_orders ADD COLUMN inventory_id int DEFAULT 1 NOT NULL;`,
                
                `UPDATE accounts SET phone = REPLACE(phone, ' ', '');`,

            ];

            // Execute queries asynchronously
            const results = await Promise.allSettled(
                queries.map(async (query) => {
                    try {
                        const [rows] = await pool.query(query);
                        return { success: true, rows };
                    } catch (err) {
                        return { success: false, error: err.message };
                    }
                })
            );

            // Log results
            results.forEach((result, index) => {
                if (result.status === "fulfilled") {
                    // console.log(`Query ${index + 1} succeeded:`, result.value);
                } else {
                    // console.log(
                    //     `Query ${index + 1} failed:`,
                    //     result.reason || result.value.error
                    // );
                }
            });
        } finally {
            return;
        }
    }
}

module.exports = Database;
