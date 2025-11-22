const pool = require("../config/database");

class Rate {
	static async getRate() {
		const [rows] = await pool.query(
			`SELECT rate_value FROM exchange_rate WHERE rate_id = (SELECT MAX(rate_id) FROM exchange_rate) AND is_deleted = 0`
		);
		return rows;
	}

	static async getAll() {
		const [rows] = await pool.query(
			`SELECT * FROM exchange_rate WHERE is_deleted = 0 ORDER BY rate_id DESC`
		);
		return rows;
	}

	static async getById(id) {
		const [rows] = await pool.query(
			`SELECT rate_value FROM exchange_rate WHERE rate_id = ?`,
			id
		);
		return rows;
	}

	static async getByYear(year) {
		const [rows] = await pool.query(
			`SELECT
                YEAR(transaction_datetime) AS year,
                MONTHNAME(transaction_datetime) AS month,
                MONTH(transaction_datetime),
                MIN(rate_value) AS min_rate_value,
                MAX(rate_value) AS max_rate_value
            FROM
                exchange_rate
            WHERE
                YEAR(transaction_datetime) = ?
            GROUP BY
                YEAR(transaction_datetime), MONTHNAME(transaction_datetime), MONTH(transaction_datetime)
                ORDER BY MONTH(transaction_datetime) ASC;
            `,
			year
		);
		return rows;
	}

	static async addRate(rate) {
		const [rows] = await pool.query(
			`INSERT INTO exchange_rate SET ?`,
			rate
		);
		return rows;
	}
}

module.exports = Rate;
