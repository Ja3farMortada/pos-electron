const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const DB_NAME = "angular-pos";
const SQL_FILE = path.join(__dirname, "database.sql");

async function initializeDatabase() {
    try {
        // Connect without specifying a database
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "roottoor",
            multipleStatements: true,
        });

        // Check if DB exists
        const [rows] = await connection.query(
            "SHOW DATABASES LIKE ?",
            [DB_NAME]
        );

        if (rows.length === 0) {
            console.log(`📌 Database "${DB_NAME}" not found. Creating using SQL file...`);

            if (!fs.existsSync(SQL_FILE)) {
                throw new Error("database.sql file not found!");
            }

            const sql = fs.readFileSync(SQL_FILE, "utf8");

            await connection.query(sql);

            console.log("✅ Database & tables created successfully!");
        } else {
            console.log(`🔌 Database "${DB_NAME}" already exists.`);
        }

        await connection.end();
    } catch (error) {
        console.error("❌ Database Initialization Error:", error.message);
        process.exit(1);
    }
}

// Initialize DB if needed
initializeDatabase();

// Create pool for normal usage (always connects to DB)
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "roottoor",
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 30,
    queueLimit: 0,
    dateStrings: true,
    typeCast: (field, next) => {
        if (field.type === "TINY" && field.length === 1) {
            return field.string() === "1";
        }
        return next();
    },
});

module.exports = pool;
