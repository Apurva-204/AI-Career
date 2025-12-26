const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' }); // Load backend env for DB creds

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'career_ai'
};

const newCareers = [
    { title: 'Electrician', category: 'Trade', description: 'Install and repair electrical systems in homes and businesses.', min_education: 'High School/Cert' },
    { title: 'Plumber', category: 'Trade', description: 'Install and repair water supply lines and waste disposal systems.', min_education: 'High School/Cert' },
    { title: 'Graphic Designer', category: 'Creative', description: 'Create visual concepts using software to communicate ideas.', min_education: 'Diploma/Bootcamp' },
    { title: 'Digital Marketer', category: 'Business', description: 'Promote products and brands through digital channels.', min_education: 'Diploma/Bootcamp' },
    { title: 'Customer Support Specialist', category: 'Service', description: 'Assist customers with inquiries and technical issues.', min_education: 'High School/Cert' },
    { title: 'Chef / Cook', category: 'Service', description: 'Prepare meals and manage kitchen operations.', min_education: 'High School/Cert' },
    { title: 'Carpenter', category: 'Trade', description: 'Construct and repair building frameworks and structures.', min_education: 'Apprenticeship' },
    { title: 'Administrative Assistant', category: 'Business', description: 'Handle office tasks, scheduling, and documentation.', min_education: 'High School/Cert' },
    { title: 'Sales Representative', category: 'Business', description: 'Sell products or services to customers.', min_education: 'High School/Cert' },
    { title: 'IT Support Technician', category: 'Technical', description: 'Diagnose and resolve computer hardware/software issues.', min_education: 'Diploma/Bootcamp' }
];

async function seed() {
    try {
        console.log('Connecting to DB...');
        const conn = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        for (const career of newCareers) {
            // Check if exists
            const [rows] = await conn.execute('SELECT id FROM careers WHERE title = ?', [career.title]);
            if (rows.length === 0) {
                await conn.execute(
                    'INSERT INTO careers (title, category, description, min_education) VALUES (?, ?, ?, ?)',
                    [career.title, career.category, career.description, career.min_education]
                );
                console.log(`Added: ${career.title}`);
            } else {
                console.log(`Skipped (Exists): ${career.title}`);
            }
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
