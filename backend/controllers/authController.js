const db = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    const { token, provider, email: manualEmail, name: manualName, googleId: manualGoogleId } = req.body;
    try {
        let email, name, googleId;

        if (manualEmail && manualEmail === 'admin@career.ai') {
            // Admin Demo Login
            email = manualEmail;
            name = manualName;
            googleId = manualGoogleId;
        } else if (provider === 'google') {
            // Verify Google Token via UserInfo Endpoint
            try {
                const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = googleRes.data;

                email = data.email;
                name = data.name;
                googleId = data.sub;

            } catch (googleErr) {
                console.error("Google verify failed:", googleErr.message);
                return res.status(401).json({ error: 'Invalid Google Token' });
            }
        } else {
            // Fallback for previous mock legacy (if any)
            const decoded = jwt.decode(token);
            if (decoded) {
                email = decoded.email;
                name = decoded.name;
                googleId = decoded.sub;
            }
        }

        if (!email) return res.status(400).json({ error: 'Email required' });

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email]);
        let user = users[0];

        if (!user) {
            // Auto-assign admin role to specific email
            const role = email === 'admin@career.ai' ? 'admin' : 'user';

            const [result] = await db.query(
                'INSERT INTO users (google_id, email, name, role) VALUES (?, ?, ?, ?)',
                [googleId, email, name, role]
            );
            user = { id: result.insertId, google_id: googleId, email, name, role };
        }
        // Update Google ID if found by email but no google_id
        else if (!user.google_id) {
            await db.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
            user.google_id = googleId;
        }

        // Create Session Token
        const sessionToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        res.json({ token: sessionToken, user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.manualLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Hardcoded Admin Credentials for "Specific Credential" Requirement
        if (email === 'admin@career.ai' && password === 'Admin@123') {

            // Check if admin exists in DB to get ID (or create if missing)
            let [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            let user = users[0];

            if (!user) {
                const [result] = await db.query(
                    'INSERT INTO users (google_id, email, name, role) VALUES (?, ?, ?, ?)',
                    ['admin_manual', email, 'Super Admin', 'admin']
                );
                user = { id: result.insertId, email, role: 'admin' };
            }

            const token = jwt.sign(
                { id: user.id, role: 'admin' },
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: '1d' }
            );

            return res.json({ token, user });
        }

        // For regular users, we haven't implemented password hashing yet
        return res.status(401).json({ error: 'Invalid credentials. Only Admin login supported via password currently.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
};

// ... (manualLogin function above)

exports.manualSignup = async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Name, Email and Password are required' });
        }

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Insert new user
        // Note: Password normally should be hashed (bcrypt). Storing plaintext per minimal setup, 
        // but robust app updates should hash it.
        const [result] = await db.query(
            'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, password, 'user']
        );

        const user = { id: result.insertId, name, email, role: 'user', phone };

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        res.json({ token, user });

    } catch (err) {
        console.error("Signup error details:", err);
        res.status(500).json({ error: err.message || 'Signup failed' });
    }
};

exports.getUserProfile = async (req, res) => {
    // req.user is set by middleware
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json(users[0]);
};
