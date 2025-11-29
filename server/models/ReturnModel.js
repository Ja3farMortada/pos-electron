const pool = require("../config/database");
const moment = require("moment-timezone");
const Accounts = require("./AccountsModel");

class ReturnOrder {
    // create order
    static async create(order, items, user) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const user_id = user.user_id;
            const modify_cash = order.modify_cash;

            delete order.operation_type;
            delete order.total_lbp;
            delete order.id;
            delete order.discount_value;
            delete order.payment_amount;
            delete order.total_qty;
            delete order.modify_cash;

            moment.tz.setDefault("Asia/Beirut");
            order.order_datetime = moment(order.order_datetime).format(
                `YYYY-MM-DD HH:mm:ss`
            );

            // ##############################################################################################
            // ####################### create journal voucher and journal items #############################
            let query = `INSERT INTO journal_vouchers (journal_date, journal_description, journal_notes, total_value, currency, exchange_rate, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            let [journal_voucher] = await connection.query(query, [
                order.order_datetime,
                "Return",
                order.journal_notes,
                order.total_amount,
                order.currency,
                order.exchange_rate,
                user_id,
            ]);
            order.journal_voucher_id = journal_voucher.insertId;

            // create first common journal item entry for sales
            // sales goods account
            let [_7011] = await Accounts.getIdByAccountNumber("7011");
            const salesGood = {
                journal_id_fk: journal_voucher.insertId,
                journal_date: order.order_datetime,
                account_id_fk: _7011.id,
                reference_number: order.reference_number,
                partner_id_fk: null,
                currency: order.currency,
                debit: order.total_amount,
                credit: 0,
                exchange_rate: order.exchange_rate,
            };
            await connection.query(
                `INSERT INTO journal_items SET ?`,
                salesGood
            );

            // if customer selected, then it should deduct from his balance
            if (order.customer_id) {
                // ordinary clients account
                let [_4111] = await Accounts.getIdByAccountNumber("4111");
                const ordinaryClients = {
                    journal_id_fk: journal_voucher.insertId,
                    journal_date: order.order_datetime,
                    account_id_fk: _4111.id,
                    reference_number: order.reference_number,
                    partner_id_fk: order.customer_id,
                    currency: order.currency,
                    debit: 0,
                    credit: order.total_amount,
                    exchange_rate: order.exchange_rate,
                };
                await connection.query(
                    `INSERT INTO journal_items SET ?`,
                    ordinaryClients
                );
            } else {
                // no customer selected, so check if modify cash is enabled to deduct from cash, otherwise deduct from capital account
                let capitalOrCash;
                if (modify_cash) {
                    [capitalOrCash] = await Accounts.getIdByAccountNumber(
                        "531"
                    );
                } else {
                    [capitalOrCash] = await Accounts.getIdByAccountNumber(
                        "101"
                    );
                }
                const cashSource = {
                    journal_id_fk: journal_voucher.insertId,
                    journal_date: order.order_datetime,
                    account_id_fk: capitalOrCash.id,
                    reference_number: order.reference_number,
                    partner_id_fk: null,
                    currency: order.currency,
                    debit: 0,
                    credit: order.total_amount,
                    exchange_rate: order.exchange_rate,
                };

                await connection.query(
                    `INSERT INTO journal_items SET ?`,
                    cashSource
                );
            }

            delete order.journal_notes;
            order.user_id = user_id;

            // insert the new sales order
            const [result] = await connection.query(
                `INSERT INTO return_orders SET ?`,
                order
            );

            let order_id = result.insertId;

            // generate invoice_number
            let [[{ number }]] = await connection.query(
                `SELECT IFNULL(MAX(CAST(SUBSTRING(invoice_number, 4) AS UNSIGNED)), 1000) + 1 AS number FROM return_orders`
            );

            let invoice_number = `RET${number.toString().padStart(4, "0")}`;

            // let invoice_number = invoice.invoice_number;
            await connection.query(
                `UPDATE return_orders SET invoice_number = ? WHERE order_id = ?`,
                [invoice_number, order_id]
            );

            // update journal voucher number
            await connection.query(
                `UPDATE journal_vouchers SET journal_number = ? WHERE journal_id = ?`,
                [invoice_number, journal_voucher.insertId]
            );

            let invoice_map = Array.from(items).map(function (item) {
                return [
                    order_id,
                    item.product_id,
                    item.quantity,
                    item.unit_price,
                    item.quantity * item.unit_price,
                    item.unit_cost,
                    item.avg_cost,
                ];
            });

            await connection.query(
                `INSERT INTO return_order_items (order_id, product_id, quantity, unit_price, total_price, unit_cost, avg_cost ) VALUES ?`,
                [invoice_map]
            );

            // modify qty for stock managed items

            if (items.length > 0) {
                let queries = "";
                let product_id = null;
                let quantity = null;
                let params = [];
                items.forEach((element) => {
                    if (element.stock_management == 1) {
                        product_id = element["product_id"];
                        quantity = element["quantity"];
                        params = params.concat([
                            product_id,
                            quantity,
                            order_id,
                            invoice_number,
                            order.inventory_id,
                        ]);
                        //add order_items to inventory transactions
                        queries += `INSERT INTO inventory_transactions (product_id_fk, quantity, transaction_type, order_id_fk, transaction_notes, inventory_id) VALUES (?, ?, 'RETURN', ?, ?, ?);`;
                    }
                });
                if (queries) {
                    await connection.query(queries, params);
                }
            }

            await connection.commit();
            return order_id;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // edit order
    static async update(order, items) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            order.order_datetime = moment(order.order_datetime).format(
                "YYYY-MM-DD HH:mm:ss"
            );

            let order_id = order.order_id;
            delete order.total_lbp;
            // const user_id = user.user_id;

            //check existing order for user
            let [[orderCheck]] = await connection.query(
                `SELECT * FROM return_orders WHERE order_id = ?`,
                [order_id]
            );
            if (!orderCheck) throw new Error("Order not found");

            // check journal item record for account number 2 that check if order was debt or normal
            let [[journalItem]] = await connection.query(
                `SELECT * FROM journal_items WHERE journal_id_fk = ? AND account_id_fk = 2`,
                orderCheck.journal_voucher_id
            );

            let wasDebt = false;
            if (journalItem) {
                wasDebt = true;
            }

            // delete items from inventory transactions
            await connection.query(
                `DELETE FROM inventory_transactions WHERE order_id_fk = ? AND transaction_type = 'RETURN'`,
                [order_id]
            );

            // update inventory qty for deleted items
            let inventoryQueries = "";
            let product_id = null;
            let quantity = null;

            // add order_items to inventory transactions
            items.forEach((element) => {
                if (element.stock_management == 1) {
                    product_id = element.product_id;
                    quantity = element.quantity;

                    // update inventory
                    inventoryQueries += `INSERT INTO inventory_transactions (product_id_fk, transaction_type, quantity, order_id_fk, transaction_notes, inventory_id) VALUES (${product_id}, 'RETURN', ${quantity}, ${order_id}, '${orderCheck.invoice_number}', ${order.inventory_id});`;
                }
            });

            if (inventoryQueries) {
                await connection.query(inventoryQueries);
            }

            //delete voucher and items
            let deleteVoucherQuery = `DELETE FROM journal_vouchers WHERE journal_id = ?`;
            await connection.query(
                deleteVoucherQuery,
                orderCheck.journal_voucher_id
            );

            let deleteJournalItemsQuery = `DELETE FROM journal_items WHERE journal_id_fk = ?`;
            await connection.query(
                deleteJournalItemsQuery,
                orderCheck.journal_voucher_id
            );
            // }

            // delete old items
            let deleteItemsQuery = `DELETE FROM return_order_items WHERE order_id = ?`;
            await connection.query(deleteItemsQuery, order_id);

            // delete old invoice
            let deleteOrderQuery = `DELETE FROM return_orders WHERE order_id = ?`;
            await connection.query(deleteOrderQuery, order_id);

            // ##############################################################################################
            // ####################### create journal voucher and journal items #############################
            let query = `INSERT INTO journal_vouchers (journal_date, journal_description, journal_notes, total_value, currency, exchange_rate, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            let [journal_voucher] = await connection.query(query, [
                order.order_datetime,
                "Return",
                order.journal_notes,
                order.total_amount,
                orderCheck.currency,
                orderCheck.exchange_rate,
                orderCheck.user_id,
            ]);
            order.journal_voucher_id = journal_voucher.insertId;

            // create first common journal item entry for sales
            // sales goods account
            let [_7011] = await Accounts.getIdByAccountNumber("7011");
            const salesGood = {
                journal_id_fk: journal_voucher.insertId,
                journal_date: order.order_datetime,
                account_id_fk: _7011.id,
                reference_number: order.reference_number,
                partner_id_fk: null,
                currency: orderCheck.currency,
                debit: order.total_amount,
                exchange_rate: order.exchange_rate,
            };
            await connection.query(
                `INSERT INTO journal_items SET ?`,
                salesGood
            );

            // if customer selected
            if (order.customer_id && wasDebt) {
                // ordinary clients account
                let [_4111] = await Accounts.getIdByAccountNumber("4111");
                const ordinaryClients = {
                    journal_id_fk: journal_voucher.insertId,
                    journal_date: order.order_datetime,
                    account_id_fk: _4111.id,
                    reference_number: order.reference_number,
                    partner_id_fk: order.customer_id,
                    currency: orderCheck.currency,
                    credit: order.total_amount,
                    exchange_rate: orderCheck.exchange_rate,
                };
                await connection.query(
                    `INSERT INTO journal_items SET ?`,
                    ordinaryClients
                );
            } else {
                // if no debt applied, add cash to cash account
                // cash account
                let [_531] = await Accounts.getIdByAccountNumber("531");
                const cashDollar = {
                    journal_id_fk: journal_voucher.insertId,
                    journal_date: order.order_datetime,
                    account_id_fk: _531.id,
                    reference_number: order.reference_number,
                    partner_id_fk: null,
                    currency: orderCheck.currency,
                    credit: order.total_amount,
                    exchange_rate: orderCheck.exchange_rate,
                };
                await connection.query(
                    `INSERT INTO journal_items SET ?`,
                    cashDollar
                );
            }

            // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            // ++++++++++++++++++ Insert the new order +++++++++++++++++++++++

            // fix date
            // order.order_datetime = moment(order.order_datetime).format(
            //     `YYYY-MM-DD HH:mm`
            // );

            // fix invoice number
            order.invoice_number = `RET${order.invoice_number.padStart(
                4,
                "0"
            )}`;

            // update journal voucher number
            await connection.query(
                `UPDATE journal_vouchers SET journal_number = ? WHERE journal_id = ?`,
                [order.invoice_number, order.journal_voucher_id]
            );

            delete order.journal_notes;
            order.user_id = orderCheck.user_id;
            order.currency = orderCheck.currency;
            order.exchange_rate = orderCheck.exchange_rate;

            // insert query
            await connection.query(`INSERT INTO return_orders SET ?`, order);

            let invoice_map = Array.from(items).map(function (item) {
                return [
                    order_id,
                    item.product_id,
                    item.quantity,
                    item.unit_price,
                    item.quantity * item.unit_price,
                    item.unit_cost,
                    item.avg_cost,
                ];
            });

            const [new_order] = await connection.query(
                `INSERT INTO return_order_items (order_id, product_id, quantity, unit_price, total_price, unit_cost, avg_cost) VALUES ?`,
                [invoice_map]
            );

            await connection.commit();
            return new_order.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // delete invoice
    static async delete(order_id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            //check existing order for user
            let [[orderCheck]] = await connection.query(
                `
				SELECT * FROM return_orders WHERE order_id = ?`,
                [order_id]
            );
            if (!orderCheck) throw new Error("Order not found");

            // delete from inventory transactions
            await connection.query(
                `DELETE FROM inventory_transactions WHERE transaction_type = 'RETURN' AND order_id_fk = ? `,
                [order_id]
            );

            if (orderCheck.journal_voucher_id) {
                //delete voucher and items
                let deleteVoucherQuery = `DELETE FROM journal_vouchers WHERE journal_id = ?`;
                await connection.query(
                    deleteVoucherQuery,
                    orderCheck.journal_voucher_id
                );

                let deleteJournalItemsQuery = `DELETE FROM journal_items WHERE journal_id_fk = ?`;
                await connection.query(
                    deleteJournalItemsQuery,
                    orderCheck.journal_voucher_id
                );
            }

            // delete old items
            let deleteItemsQuery = `UPDATE return_order_items SET is_deleted = 1 WHERE order_id = ?`;
            await connection.query(deleteItemsQuery, order_id);

            // delete old invoice
            let deleteOrderQuery = `UPDATE return_orders SET is_deleted = 1 WHERE order_id = ?`;
            await connection.query(deleteOrderQuery, order_id);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // get added order
    static async getById(id) {
        const [[order]] = await pool.query(
            `SELECT
            A.name AS customer_name,
            A.phone AS customer_phone,
            A.address AS customer_address,
            O.*,
            O.order_datetime AS order_date,
            JV.journal_notes,
            JSON_ARRAYAGG(JSON_OBJECT('order_item_id', M.order_item_id, 'product_id', M.product_id, 'product_name', S.product_name, 'barcode', S.barcode, 'quantity', M.quantity, 'unit_cost', M.unit_cost, 'unit_price', M.unit_price, 'total_price', M.total_price)) items
            FROM return_orders O
            INNER JOIN return_order_items M ON O.order_id = M.order_id
            INNER JOIN products S ON S.product_id = M.product_id
            LEFT JOIN accounts  A ON O.customer_id = A.account_id
            LEFT JOIN journal_vouchers JV ON O.journal_voucher_id = JV.journal_id
            WHERE O.is_deleted = 0
            AND O.order_id = ?
            GROUP BY O.order_id`,
            [id]
        );
        return order;
    }
}

module.exports = ReturnOrder;
