const pool = require("../config/database");
const Accounts = require("./AccountsModel");
const moment = require("moment-timezone");

class BalanceModel {
    // get balance
    static async getBalance(currency) {
        const [_531] = await Accounts.getIdByAccountNumber("531");
        const query = `SELECT COALESCE(sum(debit) - sum(credit),0) AS balance
        FROM journal_items ji
        WHERE ji.is_deleted = 0
        AND ji.currency = ?
        AND ji.account_id_fk = ?`;

        const [[rows]] = await pool.query(query, [currency, _531.id]);

        return rows;
    }

    // get cash transaction history
    static async getCashTransactions(start, end, currency) {
        const [_531] = await Accounts.getIdByAccountNumber("531");
        let query = `WITH partner_balance AS (
            SELECT
                SUM(CASE WHEN ji.debit IS NOT NULL THEN ji.debit ELSE 0 END) AS debit,
                SUM(CASE WHEN ji.credit IS NOT NULL THEN ji.credit ELSE 0 END) AS credit
            FROM
                journal_items ji
            INNER JOIN
                journal_vouchers jv ON ji.journal_id_fk = jv.journal_id
            WHERE
                ji.account_id_fk = ?
                AND Date(jv.journal_date) < ?
                AND ji.currency = ?
                AND ji.is_deleted = 0
        )
        SELECT
            NULL AS journal_date,
            NULL AS journal_datetime,
            NULL AS journal_number,
            'Initial Balance' AS journal_description,
            COALESCE(pb.debit, 0) AS debit,
            COALESCE(pb.credit, 0) AS credit,
            NULL AS currency,
            NULL AS exchange_rate,
            COALESCE(pb.debit, 0) - COALESCE(pb.credit, 0) AS balance
        FROM
            partner_balance pb

        UNION
        (
        SELECT
        DATE(jv.journal_date) AS journal_date,
        jv.journal_date AS journal_datetime,
        jv.journal_number,
        jv.journal_description,
        ji.debit,
        ji.credit,
        ji.currency,
        ji.exchange_rate,
        NULL AS balance
        FROM
        journal_items ji
        INNER JOIN
        journal_vouchers jv ON jv.journal_id = ji.journal_id_fk
        WHERE
        ji.account_id_fk  = ?
        AND DATE(jv.journal_date) BETWEEN ? AND ?
        AND ji.is_deleted = 0
        AND ji.currency = ?
        )
        ORDER BY
        journal_datetime ASC`;

        const [rows] = await pool.query(query, [
            _531.id,
            start,
            currency,
            _531.id,
            start,
            end,
            currency,
        ]);
        return rows;
    }

    // correct balance manually
    static async correctBalance(data, user_id) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            moment.tz.setDefault("Asia/Beirut");
            let date = moment().format(`YYYY-MM-DD HH:mm:ss`);

            // create journal voucher
            let query = `INSERT INTO journal_vouchers (journal_date, journal_number, journal_notes, journal_description, total_value, exchange_rate, currency, reference_number, user_id) VALUES (?, 'Manual Transaction', 'manual', ?, ?, ?, ?, ?, ?)`;
            let [journal_voucher] = await connection.query(query, [
                date,
                data.transaction_notes,
                data.amount,
                data.exchange_rate,
                data.currency,
                "manual",
                user_id,
            ]);

            // cash account
            let [_531] = await Accounts.getIdByAccountNumber("531");
            let cashDollar = {
                journal_id_fk: journal_voucher.insertId,
                journal_date: date,
                account_id_fk: _531.id,
                reference_number: "manual",
                currency: data.currency,
                exchange_rate: data.exchange_rate,
            };

            // capital account
            let [_101] = await Accounts.getIdByAccountNumber("101");
            let capital = {
                journal_id_fk: journal_voucher.insertId,
                journal_date: date,
                account_id_fk: _101.id,
                reference_number: "manual",
                currency: data.currency,
                exchange_rate: data.exchange_rate,
            };

            // check transaction type
            if (data.transaction_type == "ADD") {
                cashDollar.debit = data.amount;
                capital.credit = data.amount;
            } else {
                cashDollar.credit = data.amount;
                capital.debit = data.amount;
            }

            // create journal entries
            await connection.query(
                `INSERT INTO journal_items SET ?`,
                cashDollar
            );
            await connection.query(`INSERT INTO journal_items SET ?`, capital);

            // commit changes
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = BalanceModel;
