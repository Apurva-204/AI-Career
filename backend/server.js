const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', apiRoutes);

const db = require('./config/db'); // Ensure db is imported if not already, but api routes usage implies it handles it. 
// Actually apiRoutes uses db, but here we need to access it. 
// Let's import it or just use a raw connection if db.js exports a pool.
// Looking at file list, db.js exists. 
// I'll add a robust check.

// Temporary Migration: Fix Missing Phone Column
(async () => {
    try {
        console.log("Running Schema Check...");
        const connection = await require('mysql2/promise').createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'career_guidance'
        });

        // Check for 'phone'
        try {
            await connection.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20)");
            console.log("MIGRATION SUCCESS: Added 'phone' column to users table.");
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error("Phone Schema Check Failed:", e.message);
        }

        // Check for 'password'
        try {
            await connection.query("ALTER TABLE users ADD COLUMN password VARCHAR(255)");
            console.log("MIGRATION SUCCESS: Added 'password' column to users table.");
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error("Password Schema Check Failed:", e.message);
        }

        // Check for 'name' (Just in case)
        try {
            await connection.query("ALTER TABLE users ADD COLUMN name VARCHAR(255)");
            console.log("MIGRATION SUCCESS: Added 'name' column to users table.");
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error("Name Schema Check Failed:", e.message);
        }

        // Fix google_id to be Nullable (for manual signups)
        try {
            await connection.query("ALTER TABLE users MODIFY google_id VARCHAR(255) NULL");
            console.log("MIGRATION SUCCESS: Made 'google_id' nullable.");
        } catch (e) {
            console.error("Google ID Schema Check Failed:", e.message);
        }

        // Restore 'courses' table if missing (Simplified schema to avoid dependency hell)
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS courses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    link VARCHAR(255),
                    platform VARCHAR(100),
                    skill_id INT,
                    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner'
                )
            `);
            console.log("MIGRATION SUCCESS: Checked/Created 'courses' table.");
        } catch (e) {
            console.error("Courses Table Check Failed:", e.message);
        }

        // Restore 'enrollments' table if missing
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS enrollments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    course_id INT NOT NULL,
                    progress INT DEFAULT 0,
                    completed_lessons INT DEFAULT 0,
                    total_lessons INT DEFAULT 20,
                    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                    UNIQUE KEY (user_id, course_id)
                )
            `);
            console.log("MIGRATION SUCCESS: Checked/Created 'enrollments' table.");
        } catch (e) {
            console.error("Enrollments Table Check Failed:", e.message);
        }

        await connection.end();
    } catch (err) {
        console.error("Migration Connection Failed:", err);
    }
})();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
