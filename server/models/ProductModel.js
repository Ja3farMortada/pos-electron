const pool = require("../config/database");

const Rate = require("./RateModel");

class Product {
    // get all products
    static async getAll(inventory_id) {
        const query = `SELECT
        			C.category_name,
                    B.brand_name,
        			P.*,
                    CASE
                        WHEN barcode IS NULL OR barcode = '' THEN false
                        ELSE true
                    END AS have_barcode,
                    COALESCE(t.quantity, 0) AS quantity
        		FROM products P

        		LEFT JOIN products_categories C ON P.category_id_fk = C.category_id
                LEFT JOIN products_brands B ON P.brand_id_fk = B.brand_id
        		LEFT JOIN (
        			SELECT
        				product_id_fk,
        				SUM(CASE WHEN transaction_type = 'SUPPLY' THEN quantity ELSE 0 END)
                        + SUM(CASE WHEN transaction_type = 'RETURN PURCHASE' THEN quantity ELSE 0 END)
                        + SUM(CASE WHEN transaction_type = 'RETURN' THEN quantity ELSE 0 END)
                        + SUM(CASE WHEN transaction_type = 'DELETE' THEN quantity ELSE 0 END)
        				+ SUM(CASE WHEN transaction_type = 'ADD' THEN quantity ELSE 0 END)
        				+ SUM(CASE WHEN transaction_type = 'REMOVE' THEN quantity ELSE 0 END)
        				+ SUM(CASE WHEN transaction_type = 'SALE' THEN quantity ELSE 0 END)
        				+ SUM(CASE WHEN transaction_type = 'DISPOSE' THEN quantity ELSE 0 END)
        				+ SUM(CASE WHEN transaction_type = 'DELIVER' THEN quantity ELSE 0 END) AS quantity
        			FROM inventory_transactions
                    WHERE inventory_id = ?
        			GROUP BY product_id_fk
        		) t ON P.product_id = t.product_id_fk AND P.stock_management = 1
        		WHERE P.is_deleted = 0
        		ORDER BY P.product_id ASC;`;

        const [result] = await pool.query(query, [inventory_id]);
        return result;
    }

    // get by product_id
    static async getById(product_id, inventory_id) {
        const query = `SELECT
        			C.category_name,
                    B.brand_name,
        			P.*,
                    CASE
                        WHEN barcode IS NULL OR barcode = '' THEN false
                        ELSE true
                    END AS have_barcode,
                    COALESCE(t.quantity, 0) AS quantity
        		FROM products P

        		LEFT JOIN products_categories C ON P.category_id_fk = C.category_id
                LEFT JOIN products_brands B ON P.brand_id_fk = B.brand_id
        		LEFT JOIN (
        			SELECT
        				product_id_fk,
        				SUM(CASE WHEN transaction_type = 'SUPPLY' THEN quantity ELSE 0 END)
                        + SUM(CASE WHEN transaction_type = 'RETURN PURCHASE' THEN quantity ELSE 0 END)
                        + SUM(CASE WHEN transaction_type = 'RETURN' THEN quantity ELSE 0 END)
                        + SUM(CASE WHEN transaction_type = 'DELETE' THEN quantity ELSE 0 END)
        				+ SUM(CASE WHEN transaction_type = 'ADD' THEN quantity ELSE 0 END)
        				+ SUM(CASE WHEN transaction_type = 'REMOVE' THEN quantity ELSE 0 END)
        				+ SUM(CASE WHEN transaction_type = 'SALE' THEN quantity ELSE 0 END)
        				+ SUM(CASE WHEN transaction_type = 'DISPOSE' THEN quantity ELSE 0 END)
        				+ SUM(CASE WHEN transaction_type = 'DELIVER' THEN quantity ELSE 0 END) AS quantity
        			FROM inventory_transactions
                    WHERE inventory_id = ?
        			GROUP BY product_id_fk
        		) t ON P.product_id = t.product_id_fk AND P.stock_management = 1
        		WHERE P.is_deleted = 0
        		AND P.product_id = ?`;
        const [rows] = await pool.query(query, [inventory_id, product_id]);
        return rows;
    }

    // create new product
    static async create(data) {
        const connection = await pool.getConnection();
        try {
            // begin transaction
            await connection.beginTransaction();

            let product = {
                category_id_fk: data.category_id_fk,
                brand_id_fk: data.brand_id_fk,
                sku: data.sku,
                barcode: data.barcode == "" ? null : data.barcode,
                product_name: data.product_name,
                unit_cost_usd: data.unit_cost_usd,
                avg_cost_usd: data.unit_cost_usd,
                unit_price_usd: data.unit_price_usd,
                wholesale_price_usd: data.wholesale_price_usd,
                product_notes: data.product_notes,
                low_stock_threshold: data.low_stock_threshold,
                stock_management: data.stock_management,
                is_hidden: data.is_hidden,
                currency: data.currency,
            };
            // // insert into product table
            const [rows] = await connection.query(
                `INSERT INTO products SET ?`,
                product
            );

            if (data.stock_management && data.quantity) {
                await connection.query(
                    `INSERT INTO inventory_transactions (product_id_fk, quantity, transaction_type, transaction_notes) VALUES (?, ?, 'ADD', 'Initial Quantity');`,
                    [rows.insertId, data.quantity]
                );
            }

            // // commit transaction
            await connection.commit();

            return rows;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // update existing product
    static async update(data) {
        const connection = await pool.getConnection();
        try {
            // begin transaction
            await connection.beginTransaction();

            let product = {
                category_id_fk: data.category_id_fk,
                brand_id_fk: data.brand_id_fk,
                barcode: data.barcode == "" ? null : data.barcode,
                sku: data.sku,
                product_name: data.product_name,
                unit_cost_usd: data.unit_cost_usd,
                unit_price_usd: data.unit_price_usd,
                wholesale_price_usd: data.wholesale_price_usd,
                product_notes: data.product_notes,
                stock_management: data.stock_management,
                low_stock_threshold: data.low_stock_threshold,
                is_hidden: data.is_hidden,
                currency: data.currency,
            };

            // check avg cost, if it's equal to unit cost then update it
            let [[{ currency, avg_cost_usd, unit_cost_usd }]] =
                await connection.query(
                    `SELECT currency, avg_cost_usd, unit_cost_usd FROM products WHERE product_id = ?`,
                    data.product_id
                );

            const [{ rate_value }] = await Rate.getRate();

            if (data.currency != currency) {
                if (data.currency == "dollar") {
                    product.avg_cost_usd = avg_cost_usd / rate_value;
                } else {
                    product.avg_cost_usd = avg_cost_usd * rate_value;
                }
            }

            if (avg_cost_usd === unit_cost_usd && data.currency == currency) {
                product.avg_cost_usd = data.unit_cost_usd;
            }

            // update product table
            await connection.query(
                `UPDATE products SET ? WHERE product_id = ?`,
                [product, data.product_id]
            );

            // commit transaction
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // delete product
    static async delete(id) {
        const connection = await pool.getConnection();
        try {
            // begin transaction
            await connection.beginTransaction();

            // delete from product table
            await connection.query(
                `UPDATE products SET is_deleted = 1, barcode = NULL WHERE product_id = ?`,
                id
            );

            // delete transactions
            await connection.query(
                `DELETE FROM inventory_transactions WHERE product_id_fk = ?`,
                id
            );

            // commit transaction
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // update stock qty manually
    static async updateStock(data) {
        if (data.transaction_type === "REMOVE") {
            data.quantity = -data.quantity;
        }
        let query = `INSERT INTO inventory_transactions SET ?`;
        await pool.query(query, data);
    }

    static async getHistoryById(id, inventory_id) {
        // const query = `SELECT * FROM inventory_transactions WHERE product_id_fk = ? AND is_deleted = 0 ORDER BY transaction_datetime DESC LIMIT 100`;
        const query = `SELECT
			T.*,
			SUM(T.quantity) OVER (
				PARTITION BY T.product_id_fk
				ORDER BY T.transaction_datetime
				ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
			) AS balance
			FROM inventory_transactions T
			WHERE T.product_id_fk = ?
            AND T.inventory_id = ?
			AND T.is_deleted = 0
			ORDER BY T.transaction_datetime DESC
			LIMIT 100000;`;
        let [rows] = await pool.query(query, [id, inventory_id]);
        return rows;
    }

    // get units of measure
    static async getUnits() {
        const [rows] = await pool.query(
            `SELECT * FROM units_of_measure WHERE is_deleted = 0`
        );
        return rows;
    }

    // generate barcode
    static async generateBarcode() {
        let generatedBarcode = "9"; // prefix number 9 to keep record of manually generated barcodes
        for (let i = 0; i < 11; i++) {
            generatedBarcode += Math.floor(Math.random() * 10); // Append a random digit
        }

        const [[barcodeExist]] = await pool.query(
            `SELECT barcode FROM products WHERE barcode = ?`,
            generatedBarcode
        );

        if (barcodeExist) {
            this.generateBarcode();
        } else {
            return generatedBarcode;
        }
    }

    // recalculate average cost
    static async recalculateAvgCost(connection) {
        const query = `WITH purchases AS (
            SELECT
                POI.product_id_fk,
                SUM(POI.quantity) AS total_qty,
                SUM(POI.quantity * POI.unit_cost_usd) AS total_cost
            FROM purchase_order_items POI
                INNER JOIN purchase_orders PO ON POI.order_id_fk = PO.order_id
            GROUP BY POI.product_id_fk )

            UPDATE products I
            JOIN purchases P ON I.product_id = P.product_id_fk
            SET I.avg_cost_usd = ROUND((P.total_cost / NULLIF(P.total_qty, 0)), 2);`;

        await connection.query(query);
    }
}

module.exports = Product;
