const pool = require("../config/database");
const moment = require("moment");

class History {
    // fetch sales invoices
    static async fetchSalesHistory(criteria) {

        let sql = `SELECT
            A.name AS customer_name,
            A.phone AS customer_phone,
            A.address AS customer_address,
            O.*,
            O.order_datetime AS order_date,
            I.inventory_name,
            U.username
            FROM sales_orders O
            LEFT JOIN users U ON U.user_id = O.user_id
            LEFT JOIN accounts A ON O.customer_id = A.account_id
            INNER JOIN inventory I ON O.inventory_id = I.inventory_id

            WHERE O.is_deleted = 0 `;
        const params = [];
        if (criteria.invoice_number) {
            sql += ` AND O.invoice_number LIKE ?`;
            params.push(`%${criteria.invoice_number}`);
        }
        if (criteria.customer_id) {
            sql += ` AND O.customer_id = ?`;
            params.push(criteria.customer_id);
        }
        if (criteria.inventory_id) {
            sql += ` AND O.inventory_id = ?`;
            params.push(criteria.inventory_id);
        }
        if (criteria.start_date) {
            sql += ` AND DATE(order_datetime) >= ?`;
            params.push(moment(criteria.start_date).format("yyyy-MM-DD"));
        }
        if (criteria.end_date) {
            sql += ` AND DATE(order_datetime) <= ?`;
            params.push(moment(criteria.end_date).format("yyyy-MM-DD"));
        }
        if (criteria.product_id) {
            sql += ` AND EXISTS (SELECT * FROM sales_order_items x WHERE x.order_id = O.order_id AND x.product_id = ? ) `;
            params.push(criteria.product_id);
        }
        if (criteria.user_id) {
            sql += ` AND O.user_id = ? `;
            params.push(criteria.user_id);
        }

        sql += ` GROUP BY O.order_id
        ORDER BY order_date DESC, O.invoice_number DESC `;
        if (
            criteria.invoice_number ||
            criteria.customer_id ||
            criteria.selected_dates
        ) {
            // do nothing now for LIMIT
        } else {
            sql += ` LIMIT 1000`;
            params.push(criteria.limit || 100);
        }

        const [rows] = await pool.query(sql, params);
        return rows;
    }

    // fetch order items by order id
    static async fetchOrderItemsById(ids) {
        let query = `SELECT
            I.*,
            P.product_name,
            P.stock_management
            FROM sales_order_items I
            INNER JOIN products P ON I.product_id = P.product_id
            WHERE I.is_deleted = 0
            AND order_id IN (?)`;
        let [results] = await pool.query(query, [ids]);
        return results;
    }

    // fetch order items by order id
    static async fetchReturnOrderItemsById(ids) {
        let query = `SELECT
            I.*,
            P.product_name
            FROM return_order_items I
            INNER JOIN products P ON I.product_id = P.product_id
            WHERE I.is_deleted = 0
            AND order_id IN (?)`;
        let [results] = await pool.query(query, [ids]);
        return results;
    }

    //fetch payment history
    static async fetchPaymentHistory(criteria) {
        let sql = `SELECT
				A.name AS partner_name,
				A.phone AS partner_phone,
				A.address AS partner_address,
				A.account_id AS account_id,
                A.account_id AS partner_id,
				P.*,
                P.total_value as amount,
				P.journal_date AS payment_date
                FROM journal_vouchers P
                INNER JOIN journal_items I ON P.journal_id = I.journal_id_fk
                INNER JOIN accounts A ON I.partner_id_fk = A.account_id
                WHERE P.is_deleted = 0 AND I.is_deleted = 0 AND journal_number LIKE 'PAY%' `;
        const params = [];
        if (criteria.payment_number) {
            sql += ` AND P.journal_number LIKE ?`;
            params.push(`%${criteria.payment_number}`);
        }
        if (criteria.partner_id) {
            sql += ` AND I.partner_id_fk = ?`;
            params.push(criteria.partner_id);
        }
        if (criteria.payment_date) {
            sql += ` AND DATE(P.journal_date) = ?`;
            params.push(moment(criteria.payment_date).format("yyyy-MM-DD"));
        }

        sql += ` ORDER BY payment_date DESC, P.journal_number DESC
		LIMIT ? OFFSET ?`;
        params.push(criteria.limit || 100);
        params.push(criteria.offset || 0);

        const [rows] = await pool.query(sql, params);
        return rows;
    }

    //fetch return history
    static async fetchReturnHistory(criteria) {
        let sql = `SELECT
                A.name AS customer_name,
                A.phone AS customer_phone,
                A.address AS customer_address,
                RO.*,
                I.inventory_name,
                DATE(RO.order_datetime) AS order_date,
                JSON_ARRAYAGG(JSON_OBJECT('order_item_id', M.order_item_id, 'product_id', M.product_id, 'product_name', S.product_name, 'sku', S.sku, 'barcode', S.barcode, 'stock_management', S.stock_management, 'quantity', M.quantity, 'unit_cost', M.unit_cost, 'unit_price', M.unit_price, 'total_price', M.total_price)) items
            FROM return_orders RO
            INNER JOIN return_order_items M ON RO.order_id = M.order_id
            INNER JOIN products S ON S.product_id = M.product_id
            LEFT JOIN accounts  A ON RO.customer_id = A.account_id
            INNER JOIN inventory I ON RO.inventory_id = I.inventory_id
            WHERE RO.is_deleted = 0 `;
        const params = [];
        if (criteria.invoice_number) {
            sql += ` AND RO.invoice_number = ?`;
            params.push(criteria.invoice_number);
        }
        if (criteria.customer_id) {
            sql += ` AND RO.customer_id = ?`;
            params.push(criteria.customer_id);
        }
        if (criteria.invoice_date) {
            sql += ` AND DATE(order_datetime) = ?`;
            params.push(moment(criteria.invoice_date).format("yyyy-MM-DD"));
        }

        sql += ` GROUP BY RO.order_id
        ORDER BY order_date DESC, RO.invoice_number DESC
        LIMIT ? OFFSET ?`;
        params.push(criteria.limit || 100);
        params.push(criteria.offset || 0);

        const [rows] = await pool.query(sql, params);
        return rows;
    }

    //fetch purchase history
    static async fetchPurchaseHistory(criteria) {
        let sql = `SELECT
            A.name AS supplier_name,
            A.phone AS supplier_phone,
            A.address AS supplier_address,
            A.financial_number,
            PO.*,
            DATE(PO.order_datetime) AS order_date,
            I.inventory_name,
            JSON_ARRAYAGG(JSON_OBJECT('order_item_id', M.order_item_id, 'product_id', M.product_id_fk, 'product_name', S.product_name, 'barcode', S.barcode , 'quantity', M.quantity, 'unit_cost', M.unit_cost_usd, 'unit_price', M.unit_cost_usd )) items
            FROM purchase_orders PO
            INNER JOIN purchase_order_items M ON PO.order_id = M.order_id_fk
            INNER JOIN products S ON S.product_id = M.product_id_fk
            LEFT JOIN accounts  A ON PO.partner_id_fk  = A.account_id
            INNER JOIN inventory I ON PO.inventory_id = I.inventory_id
            WHERE PO.is_deleted = 0`;
        const params = [];
        if (criteria.invoice_number) {
            sql += ` AND PO.invoice_number = ?`;
            params.push(criteria.invoice_number);
        }
        if (criteria.supplier_id) {
            sql += ` AND PO.partner_id_fk = ?`;
            params.push(criteria.supplier_id);
        }
        if (criteria.invoice_date) {
            sql += ` AND DATE(order_datetime) = ?`;
            params.push(moment(criteria.invoice_date).format("yyyy-MM-DD"));
        }

        sql += ` GROUP BY PO.order_id
        ORDER BY order_date DESC, PO.invoice_number DESC
        LIMIT ? OFFSET ?`;
        params.push(criteria.limit || 100);
        params.push(criteria.offset || 0);

        const [rows] = await pool.query(sql, params);
        return rows;
    }

    // fetch Purchase items by Purchase id
    static async fetchPurchaseItemsById(ids) {
        let query = `SELECT
        POI.*,
        P.product_name
        FROM purchase_order_items POI
        INNER JOIN products P ON POI.product_id_fk = P.product_id
        WHERE POI.is_deleted = 0
        AND order_id_fk IN (?)`;
        let [results] = await pool.query(query, [ids]);
        return results;
    }

    //fetch receipts history
    static async fetchReceiptHistory(criteria) {
        let sql = `SELECT
				A.name AS partner_name,
				A.phone AS partner_phone,
				A.address AS partner_address,
                A.account_id AS account_id,
				A.account_id AS partner_id,
				P.*,
                P.total_value as amount,
				P.journal_date AS payment_date
                FROM journal_vouchers P
                INNER JOIN journal_items I ON P.journal_id = I.journal_id_fk
                INNER JOIN accounts A ON I.partner_id_fk = A.account_id
                WHERE P.is_deleted = 0 AND journal_description = 'Supplier Payment'`;
        const params = [];
        if (criteria.payment_number) {
            sql += ` AND P.journal_number = ?`;
            params.push(criteria.payment_number);
        }
        if (criteria.partner_id) {
            sql += ` AND I.partner_id_fk = ?`;
            params.push(criteria.partner_id);
        }
        if (criteria.payment_date) {
            sql += ` AND DATE(P.journal_date) = ?`;
            params.push(moment(criteria.payment_date).format("yyyy-MM-DD"));
        }

        sql += ` ORDER BY payment_date DESC, P.journal_number DESC
		LIMIT ? OFFSET ?`;
        params.push(criteria.limit || 100);
        params.push(criteria.offset || 0);

        const [rows] = await pool.query(sql, params);

        return rows;
    }

    // fetch return purchase history
    static async fetchReturnPurchaseHistory(criteria) {
        let sql = `SELECT
            A.name AS supplier_name,
            A.phone AS supplier_phone,
            A.address AS supplier_address,
            A.financial_number,
            PO.*,
            DATE(PO.order_datetime) AS order_date,
            JSON_ARRAYAGG(JSON_OBJECT('order_item_id', M.order_item_id, 'product_id', M.product_id_fk, 'product_name', S.product_name, 'barcode', S.barcode , 'quantity', M.quantity, 'unit_cost', M.unit_cost_usd, 'unit_price', M.unit_cost_usd )) items
            FROM return_purchase_orders PO
            INNER JOIN return_purchase_order_items M ON PO.order_id = M.order_id_fk
            INNER JOIN products S ON S.product_id = M.product_id_fk
            LEFT JOIN accounts  A ON PO.partner_id_fk  = A.account_id
            WHERE PO.is_deleted = 0`;
        const params = [];
        if (criteria.invoice_number) {
            sql += ` AND PO.invoice_number = ?`;
            params.push(criteria.invoice_number);
        }
        if (criteria.supplier_id) {
            sql += ` AND PO.partner_id_fk = ?`;
            params.push(criteria.supplier_id);
        }
        if (criteria.invoice_date) {
            sql += ` AND DATE(order_datetime) = ?`;
            params.push(moment(criteria.invoice_date).format("yyyy-MM-DD"));
        }

        sql += ` GROUP BY PO.order_id
        ORDER BY order_date DESC, PO.invoice_number DESC
        LIMIT ? OFFSET ?`;
        params.push(criteria.limit || 100);
        params.push(criteria.offset || 0);

        const [rows] = await pool.query(sql, params);
        return rows;
    }

    // fetch Return Purchase items by Purchase id
    static async fetchReturnPurchaseItemsById(ids) {
        let query = `SELECT
        POI.*,
        P.product_name
        FROM return_purchase_order_items POI
        INNER JOIN products P ON POI.product_id_fk = P.product_id
        WHERE POI.is_deleted = 0
        AND order_id_fk IN (?)`;
        let [results] = await pool.query(query, [ids]);
        return results;
    }
}

module.exports = History;
