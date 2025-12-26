const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'career_guidance'
    });

    console.log('Connected to MySQL. Updating Users table...');

    try {
        // Add password column
        try {
            await connection.query('ALTER TABLE users ADD COLUMN password VARCHAR(255)');
            console.log('Added password column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('password column already exists.');
            else console.error(e.message);
        }

        // Add phone column
        try {
            await connection.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
            console.log('Added phone column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('phone column already exists.');
            else console.error(e.message);
        }

        // Make google_id nullable
        try {
            await connection.query('ALTER TABLE users MODIFY google_id VARCHAR(255) NULL');
            console.log('Made google_id nullable.');
        } catch (e) {
            console.error(e.message);
        }

        console.log('Migration Complete.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await connection.end();
    }
}

migrate();
