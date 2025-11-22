const pool = require("../config/database");

class Note {
    // get all
    static async getAll() {
        const query = `SELECT * FROM sticky_notes ORDER BY note_index ASC`;
        const [results] = await pool.query(query);
        return results;
    }

    // get by id
    static async getById(id) {
        const query = `SELECT * FROM sticky_notes WHERE id = ?`;
        const [[results]] = await pool.query(query, id);
        return results;
    }

    // sort
    static async sort(notes) {
        let query = "";
        notes.forEach((element) => {
            query += `UPDATE sticky_notes SET note_index = ${notes.indexOf(
                element
            )} WHERE id = ${element.id};`;
        });
        await pool.query(query);
    }

    // create note
    static async create(note) {
        // create max index for note_index
        const [[{ note_index }]] = await pool.query(
            `SELECT IFNULL(MAX(note_index) + 1, 0) AS note_index FROM sticky_notes`
        );
        note.note_index = note_index;

        const query = `INSERT INTO sticky_notes SET ?`;
        const [row] = await pool.query(query, note);
        return row;
    }

    // update note
    static async update(data) {
        const query = `UPDATE sticky_notes SET ? WHERE id = ?`;
        await pool.query(query, [data, data.id]);
    }

    // delete note
    static async delete(id) {
        const query = `DELETE FROM sticky_notes WHERE id = ?`;
        await pool.query(query, id);
    }
}

module.exports = Note;
