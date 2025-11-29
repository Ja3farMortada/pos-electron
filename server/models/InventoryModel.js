const pool = require("../config/database");

class Inventory {
    // get all
    static async getAll() {
        const [result] = await pool.query(
            `SELECT * FROM inventory WHERE is_deleted = 0`
        );
        return result;
    }

    // get by id
    static async getById(id) {
        const [[result]] = await pool.query(
            `SELECT * FROM inventory WHERE inventory_id = ?`,
            [id]
        );
        return result;
    }

    // create
    static async create(name) {
        const [result] = await pool.query(
            `INSERT INTO inventory (inventory_name) VALUES (?)`,
            [name]
        );
        return result;
    }

    // update
    static async update(data) {
        const [result] = await pool.query(
            `UPDATE inventory SET ? WHERE inventory_id = ?`,
            [data, data.inventory_id]
        );
        return result;
    }

    // delete
    static async delete(inventory_id) {
        const [result] = await pool.query(
            `UPDATE inventory SET is_deleted = 1 WHERE inventory_id = ?`,
            [inventory_id]
        );
        return result;
    }

    
}

module.exports = Inventory;