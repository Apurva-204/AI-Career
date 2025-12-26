const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const schemaPath = path.join(__dirname, '../database/schema.sql');
const seedsPath = path.join(__dirname, '../database/seeds.sql');

async function setupDatabase() {
    try {
        console.log("Connecting to MySQL...");
        // Connect without database selected first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log("Reading SQL files...");
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const seeds = fs.readFileSync(seedsPath, 'utf8');

        console.log("Executing Schema...");
        // Split by semicolon to execute queries one by one
        const schemaQueries = schema.split(';').filter(q => q.trim());
        for (const query of schemaQueries) {
            await connection.query(query);
        }

        console.log("Executing Seeds...");
        const seedQueries = seeds.split(';').filter(q => q.trim());
        for (const query of seedQueries) {
            // seeds might fail if duplicates exist, ignore errors for seeds
            try {
                await connection.query(query);
            } catch (e) {
                // If dup entry, ignore
                if (e.code !== 'ER_DUP_ENTRY') console.log("Seed warning:", e.message);
            }
        }

        console.log("Database Setup Complete!");
        await connection.end();

    } catch (err) {
        console.error("Database Setup Failed:", err);
    }
}

setupDatabase();
