const pool = require("../config/database");

class Unit {
    // get all unit of measures
    static async getAll() {
        const [rows] = await pool.query(
            `SELECT * FROM units_of_measure WHERE is_deleted = 0`
        );
        return rows;
    }

    // get by id
    static async getById(id) {
        const [[rows]] = await pool.query(
            `SELECT * FROM units_of_measure WHERE unit_id = ?`,
            id
        );
        return rows;
    }

    // create unit
    static async create(unit) {
        // insert new unit
        const [rows] = await pool.query(
            `INSERT INTO units_of_measure SET ?`,
            unit
        );
        return rows;
    }

    // update unit
    static async update(unit) {
        await pool.query(`UPDATE units_of_measure SET ? WHERE unit_id = ?`, [
            unit,
            unit.unit_id,
        ]);
    }

    // delete unit
    static async delete(id) {
        await pool.query(
            `UPDATE units_of_measure SET is_deleted = 1 WHERE unit_id = ?`,
            id
        );
    }
}

module.exports = Unit;
