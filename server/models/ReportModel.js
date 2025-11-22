const pool = require("../config/database");
const Accounts = require("./AccountsModel");
const Rate = require("./RateModel");

class Reports {
    // get revenue
    static async getRevenue(startDate, endDate, currency) {
        let query = `SELECT
            COALESCE(SUM(soi.quantity * soi.unit_price), 0) AS totalSale,
            COALESCE(SUM(soi.quantity * CASE WHEN soi.avg_cost = 0 OR soi.avg_cost IS NULL THEN soi.unit_cost ELSE soi.avg_cost END), 0) AS totalCost,
            COALESCE(SUM(soi.quantity * (soi.unit_price - CASE WHEN soi.avg_cost = 0 OR soi.avg_cost IS NULL THEN soi.unit_cost ELSE soi.avg_cost END)), 0) AS grossProfit
            FROM
            sales_order_items soi
            JOIN
            sales_orders so ON soi.order_id = so.order_id
            WHERE
            so.order_datetime BETWEEN ? AND ?
            AND so.currency = ?
            AND soi.is_deleted = 0`;
        let [[result]] = await pool.query(query, [
            startDate,
            endDate,
            currency,
        ]);

        return result;
    }

    // get returns
    static async getReturns(startDate, endDate, currency) {
        const query = `SELECT
            COALESCE(SUM(roi.quantity * roi.unit_price), 0) AS totalReturn,
            COALESCE(SUM(roi.quantity * CASE WHEN roi.avg_cost = 0 OR roi.avg_cost IS NULL THEN roi.unit_cost ELSE roi.avg_cost END), 0) AS totalCost,
            COALESCE(SUM(roi.quantity * (roi.unit_price - CASE WHEN roi.avg_cost = 0 OR roi.avg_cost IS NULL THEN roi.unit_cost ELSE roi.avg_cost END)), 0) AS grossReturn
            FROM
            return_order_items roi
            JOIN
            return_orders ro ON roi.order_id = ro.order_id
            WHERE
            ro.order_datetime BETWEEN ? AND ?
            AND ro.currency = ?
            AND roi.is_deleted = 0`;

        let [[result]] = await pool.query(query, [
            startDate,
            endDate,
            currency,
        ]);

        return result;
    }

    // get total orders and returns
    static async getTotalOrders(startDate, endDate, currency) {
        const query = `SELECT
    (SELECT COUNT(*) FROM sales_orders WHERE order_datetime BETWEEN ? AND ? AND currency = ? AND is_deleted = 0) AS total_orders,

	(SELECT COALESCE(SUM(quantity), 0) FROM sales_order_items soi
        INNER JOIN sales_orders so ON so.order_id = soi.order_id
        WHERE so.order_datetime BETWEEN ? AND ? AND currency = ? AND soi.is_deleted = 0) AS total_items,

    (SELECT COUNT(*) FROM return_orders WHERE order_datetime BETWEEN ? AND ? AND currency = ? AND is_deleted = 0) AS total_returns;`;

        const [[result]] = await pool.query(query, [
            startDate,
            endDate,
            currency,
            startDate,
            endDate,
            currency,
            startDate,
            endDate,
            currency,
        ]);

        return result;
    }

    static async getDebts(startDate, endDate, currency) {
        const query = `
            SELECT
                COALESCE(SUM(total_debts), 0) AS total_debts
            FROM (
                SELECT
                    COALESCE(SUM(ji.debit), 0) AS total_debts
                FROM
                    journal_items ji
                INNER JOIN
                    journal_vouchers jv ON jv.journal_id = ji.journal_id_fk
                INNER JOIN
                    accounts a ON ji.partner_id_fk = a.account_id
                WHERE
                    ji.is_deleted = 0
                    AND a.is_customer = 1
                    AND jv.journal_date BETWEEN ? AND ?
                    AND jv.currency = ?
                GROUP BY
                    ji.partner_id_fk
            ) AS customer_balances;`;
        let [[result]] = await pool.query(query, [
            startDate,
            endDate,
            currency,
        ]);
        return result;
    }

    // get customer payments
    static async getCustomerPayments(startDate, endDate, currency) {
        const query = `SELECT SUM(total_value) AS total_payments
            FROM journal_vouchers
            WHERE journal_date BETWEEN ? AND ?
            AND currency = ?
            AND journal_description = 'Payment Received'`;
        let [[result]] = await pool.query(query, [
            startDate,
            endDate,
            currency,
        ]);
        return result;
    }

    static async getCashBalance(startDate, endDate, currency) {
        const [cashAccount] = await Accounts.getIdByAccountNumber("531");
        const query = `SELECT
        COALESCE(sum(debit) - sum(credit),0) AS balance
        FROM journal_items ji
        where ji.is_deleted = 0
        AND ji.journal_date BETWEEN ? AND ?
        AND ji.currency = ?
        AND ji.account_id_fk = ?`;
        let [[result]] = await pool.query(query, [
            startDate,
            endDate,
            currency,
            cashAccount.id,
        ]);
        return result;
    }

    static async getManualCashTransactions(startDate, endDate, currency) {
        const [cashAccount] = await Accounts.getIdByAccountNumber("531");
        const query = `SELECT
        sum(debit) as total_debit,
        sum(credit) as total_credit,
        COALESCE(sum(debit) - sum(credit),0) AS balance
        FROM journal_items ji
        WHERE ji.is_deleted = 0
        AND ji.reference_number = 'manual'
		AND ji.journal_date BETWEEN ? AND ?
        AND ji.currency = ?
        AND ji.account_id_fk = ?`;
        let [[result]] = await pool.query(query, [
            startDate,
            endDate,
            currency,
            cashAccount.id,
        ]);
        return result;
    }

    // get total expenses
    static async getExpenses(startDate, endDate, currency) {
        let query = `SELECT
        SUM(debit) AS totalExpenses
        FROM journal_items
        WHERE DATE(journal_date) >= ?
        AND DATE(journal_date) <= ?
        AND currency = ?
        AND account_id_fk = 8;`;

        let [[results]] = await pool.query(query, [
            startDate,
            endDate,
            currency,
        ]);

        return results;
    }

    // get total supplier payments
    static async getSupplierPayments(startDate, endDate, currency) {
        let query = `SELECT
        SUM(total_value) AS totalSupplierPayments
        FROM journal_vouchers
        WHERE DATE(journal_date) BETWEEN ? AND ?
        AND currency = ?
        AND journal_number LIKE 'REC%'
		AND is_deleted = 0
        UNION
        SELECT SUM(credit) AS supplier_payments
        FROM journal_items ji
        JOIN journal_vouchers jv ON ji.journal_id_fk = jv.journal_id
        WHERE account_id_fk = 7
        AND DATE(ji.journal_date) BETWEEN ? AND ?
        AND ji.currency = ?
        AND journal_description = 'Supplier Payment';`;

        let [results] = await pool.query(query, [
            startDate,
            endDate,
            currency,
            startDate,
            endDate,
            currency,
        ]);

        return results;
    }

    // get top sales
    static async getTopSales(startDate, endDate, id) {
        let query = `SELECT p.*, c.category_name,
                SUM(soi.quantity) AS count FROM sales_order_items soi
                INNER JOIN products p  ON soi.product_id  = p.product_id
				LEFT JOIN products_categories c ON p.category_id_fk = c.category_id
                WHERE soi.order_id IN

                (SELECT so.order_id FROM sales_orders so
                    WHERE DATE(so.order_datetime) >= ?
                    AND DATE(so.order_datetime) <= ?
                    AND so.is_deleted = 0)`;

        if (id != "null") {
            query += ` AND p.product_id = ? `;
        }
        query += `GROUP BY p.product_id
                ORDER BY count DESC;`;
        let [results] = await pool.query(query, [startDate, endDate, id]);
        return results;
    }

    static async getTopCategories(startDate, endDate) {
        let query = `SELECT PC.category_name,
        SUM(SOI.quantity) AS count FROM sales_orders SO
        INNER JOIN sales_order_items SOI ON SO.order_id = SOI.order_id

        INNER JOIN products P ON P.product_id  = SOI.product_id
        INNER JOIN products_categories PC ON PC.category_id  = P.category_id_fk
        WHERE SO.is_deleted = 0
        AND DATE(SO.order_datetime) >= ?
        AND DATE (SO.order_datetime) <= ?
        GROUP BY PC.category_name
        ORDER BY count DESC
        LIMIT 10
    `;
        let [results] = await pool.query(query, [startDate, endDate]);
        return results;
    }

    // sales analytics
    static async getSalesAnalytics(startDate, endDate) {
        const query = `SELECT
            p.product_id,
            p.sku,
            p.product_name,
            COALESCE(pur.total_purchased, 0) AS total_purchased,
            COALESCE(added.quantity, 0) AS total_added,

            COALESCE(removed.quantity, 0) AS total_removed,
            COALESCE(sal.total_sold, 0) AS total_sold,

            COALESCE(pur.total_purchased, 0) + COALESCE(added.quantity, 0)  - COALESCE(removed.quantity, 0) - COALESCE(sal.total_sold, 0) AS remaining_stock,

            COALESCE(it.stock_quantity, 0) AS actual_stock
        FROM products p

        LEFT JOIN (
                SELECT
                    poi.product_id_fk,
                    SUM(poi.quantity) AS total_purchased
                FROM purchase_order_items poi
                INNER JOIN purchase_orders po ON po.order_id = poi.order_id_fk
                WHERE poi.is_deleted = 0 AND po.is_deleted = 0 AND DATE(po.order_datetime) BETWEEN ? AND ?
                GROUP BY poi.product_id_fk
            ) pur ON pur.product_id_fk = p.product_id AND p.stock_management = 1

        LEFT JOIN (
        	SELECT
                    product_id_fk,
                    + SUM(CASE WHEN transaction_type = 'ADD' THEN quantity ELSE 0 END)
                    AS quantity
                FROM inventory_transactions
                WHERE is_deleted = 0 AND DATE(transaction_datetime) BETWEEN ? AND ?
                GROUP BY product_id_fk
        	) added ON p.product_id = added.product_id_fk AND p.stock_management = 1

        LEFT JOIN (
            SELECT
                    product_id_fk,
                    + SUM(CASE WHEN transaction_type = 'DELETE' THEN quantity ELSE 0 END)
                    AS quantity
                FROM inventory_transactions
                WHERE is_deleted = 0 AND DATE(transaction_datetime) BETWEEN ? AND ?
                GROUP BY product_id_fk
            ) deleted ON p.product_id = deleted.product_id_fk AND p.stock_management = 1

        LEFT JOIN (
            SELECT
                product_id_fk,
                SUM(CASE WHEN transaction_type = 'REMOVE' THEN ABS(quantity) ELSE 0 END)
                AS quantity
            FROM inventory_transactions
            WHERE is_deleted = 0 AND DATE(transaction_datetime) BETWEEN ? AND ?
            GROUP BY product_id_fk
        ) removed ON p.product_id = removed.product_id_fk AND p.stock_management = 1


        LEFT JOIN (
            SELECT
                soi.product_id,
                SUM(soi.quantity) AS total_sold
            FROM sales_order_items soi
            INNER JOIN sales_orders so ON so.order_id = soi.order_id
            WHERE soi.is_deleted = 0 AND so.is_deleted = 0 AND DATE(so.order_datetime) BETWEEN ? AND ?
            GROUP BY soi.product_id
        ) sal ON sal.product_id = p.product_id AND p.stock_management = 1

        LEFT JOIN (
            SELECT product_id_fk, SUM(quantity) AS stock_quantity
            FROM inventory_transactions
            GROUP BY product_id_fk
        ) it ON it.product_id_fk = p.product_id AND p.stock_management = 1

        WHERE p.is_deleted = 0
        AND p.stock_management = 1
        HAVING
            COALESCE(total_purchased, 0) > 0
            OR COALESCE(total_added, 0) > 0
            OR COALESCE(total_removed, 0) > 0
            OR COALESCE(total_sold, 0) > 0
        ORDER BY p.product_id`;

        let [results] = await pool.query(query, [
            startDate,
            endDate,
            startDate,
            endDate,
            startDate,
            endDate,
            startDate,
            endDate,
            startDate,
            endDate,
        ]);

        return results;
    }

    // get stock value
    static async getStockValue() {
        const query = `SELECT
            -- USD totals (values remain in USD)
            SUM(CASE WHEN P.currency = 'dollar' THEN quantity * unit_cost_usd ELSE 0 END) AS cost_value_usd,
            SUM(CASE WHEN P.currency = 'dollar' THEN quantity * unit_price_usd ELSE 0 END) AS selling_value_usd,
            SUM(CASE WHEN P.currency = 'dollar' THEN quantity ELSE 0 END) AS total_quantity_usd,

            -- LBP totals (values remain in LBP)
            SUM(CASE WHEN P.currency = 'lira' THEN quantity * unit_cost_usd ELSE 0 END) AS cost_value_lbp,
            SUM(CASE WHEN P.currency = 'lira' THEN quantity * unit_price_usd ELSE 0 END) AS selling_value_lbp,
            SUM(CASE WHEN P.currency = 'lira' THEN quantity ELSE 0 END) AS total_quantity_lbp

        FROM products P
        LEFT JOIN (
            SELECT
                product_id_fk,
                SUM(CASE WHEN transaction_type IN (
                    'SUPPLY','RETURN','DELETE','ADD','REMOVE','SALE','DISPOSE','DELIVER'
                ) THEN quantity ELSE 0 END) AS quantity
            FROM inventory_transactions
            GROUP BY product_id_fk
        ) t ON P.product_id = t.product_id_fk
        WHERE P.is_deleted = 0
          AND t.quantity > 0`;
        let [[result]] = await pool.query(query);

        return result;
    }
}

module.exports = Reports;
