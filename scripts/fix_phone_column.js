const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function fixDatabase() {
    console.log("Starting DB Fix...");
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'career_guidance'
        });

        console.log("Connected to database. Checking 'users' table...");

        // Check if column exists
        const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'phone'");

        if (columns.length > 0) {
            console.log("Column 'phone' already exists. No action needed.");
        } else {
            console.log("Column 'phone' is missing. Adding it...");
            await connection.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20)");
            console.log("SUCCESS: Column 'phone' added to users table.");
        }

    } catch (err) {
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error("Error: Database 'career_guidance' does not exist.");
        } else {
            console.error("Database Fix Failed:", err);
        }
    } finally {
        if (connection) await connection.end();
        console.log("Done.");
        process.exit(0);
    }
}

fixDatabase();
