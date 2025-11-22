const mysql = require("mysql2/promise");

var pool = mysql.createPool({
    connectionLimit: 30,
    host: "localhost",
    user: "root",
    password: "roottoor",
    database: "angular-pos",
    multipleStatements: true,
    dateStrings: true,
    typeCast: (field, next) => {
        if (field.type === "TINY" && field.length === 1) {
            return field.string() === "1";
        }
        return next();
    },
});

pool.getConnection(async (err, connection) => {
    if (err) {
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            console.error("Database connection was closed.");
        }
        if (err.code === "ER_CON_COUNT_ERROR") {
            console.error("Database has too many connections.");
        }
        if (err.code === "ECONNREFUSED") {
            console.error("Database connection was refused.");
        }
    }
    if (connection) await connection.release();
    return;
});

module.exports = pool;
