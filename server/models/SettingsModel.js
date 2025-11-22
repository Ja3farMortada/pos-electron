const pool = require("../config/database");

class Settings {
    // get print page settings
    static async getPrintPageSettings() {
        const [[result]] = await pool.query("SELECT * FROM settings LIMIT 1");
        return result;
    }

    // update print page settings
    static async updatePrintPageSettings(data) {
        const query = `UPDATE settings SET ? WHERE id = 1`;
        await pool.query(query, data);
    }
}

module.exports = Settings;
