const mysql = require("mysql2/promise");

// Create pool for normal usage (always connects to DB)
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "roottoor",
    database: "angular-pos",
    waitForConnections: true,
    connectionLimit: 30,
    queueLimit: 0,
    multipleStatements: true,
    dateStrings: true,
    typeCast: (field, next) => {
        if (field.type === "TINY" && field.length === 1) {
            return field.string() === "1";
        }
        return next();
    },
});

module.exports = pool;
