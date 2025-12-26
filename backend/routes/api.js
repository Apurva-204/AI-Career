const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const aiController = require('../controllers/aiController');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.user = decoded;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Admin access required' });
    }
}

// Auth Routes
router.post('/auth/google', authController.googleLogin);
router.post('/auth/login', authController.manualLogin);
router.post('/auth/signup', authController.manualSignup);
router.get('/user/profile', verifyToken, authController.getUserProfile);

// AI Routes
router.post('/ai/recommend', aiController.recommendCareers);

// Data Routes
router.get('/skills', async (req, res) => {
    const [skills] = await db.query('SELECT * FROM skills');
    res.json(skills);
});

router.get('/career/:id/roadmap', verifyToken, async (req, res) => {
    const careerId = req.params.id;
    const [courses] = await db.query(`
        SELECT c.*, s.name as skill_name 
        FROM courses c 
        JOIN skills s ON c.skill_id = s.id 
        JOIN career_skills cs ON s.id = cs.skill_id
        WHERE cs.career_id = ?
    `, [careerId]);

    res.json(courses);
});

// Admin Routes
router.get('/admin/careers', verifyToken, verifyAdmin, async (req, res) => {
    const [careers] = await db.query('SELECT * FROM careers');
    res.json(careers);
});

router.post('/admin/careers', verifyToken, verifyAdmin, async (req, res) => {
    const { title, description, category, min_education } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO careers (title, description, category, min_education) VALUES (?, ?, ?, ?)',
            [title, description, category, min_education]
        );
        res.json({ message: 'Career added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/careers/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM careers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Career deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Users Management
router.get('/admin/users', verifyToken, verifyAdmin, async (req, res) => {
    const [users] = await db.query('SELECT id, name, email, role, created_at FROM users');
    res.json(users);
});

router.delete('/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Skills Management
router.post('/admin/skills', verifyToken, verifyAdmin, async (req, res) => {
    const { name, category } = req.body;
    try {
        const [result] = await db.query('INSERT INTO skills (name, category) VALUES (?, ?)', [name, category]);
        res.json({ message: 'Skill added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/skills/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
        res.json({ message: 'Skill deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Courses Management
router.get('/admin/courses', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [courses] = await db.query(`
            SELECT c.*, s.name as skill_name 
            FROM courses c 
            LEFT JOIN skills s ON c.skill_id = s.id
        `);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/courses', verifyToken, verifyAdmin, async (req, res) => {
    const { title, link, platform, skill_id, difficulty } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO courses (title, link, platform, skill_id, difficulty) VALUES (?, ?, ?, ?, ?)',
            [title, link, platform, skill_id, difficulty]
        );
        res.json({ message: 'Course added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/courses/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Enrollment Routes
// User Enrollment Routes
router.post('/user/enroll', verifyToken, async (req, res) => {
    const { course_id, total_lessons, course_metadata } = req.body;
    const userId = req.user.id;

    // If we have metadata, use it to ensure course exists in DB (for ID sync)
    // Fallback to course_id if it's a pure number and no metadata

    try {
        let finalCourseId = course_id;

        if (course_metadata && course_metadata.title) {
            // Check if exists by title
            const [existing] = await db.query('SELECT id FROM courses WHERE title = ?', [course_metadata.title]);
            if (existing.length > 0) {
                finalCourseId = existing[0].id;
            } else {
                // Insert new course
                const [newCourse] = await db.query(
                    'INSERT INTO courses (title, link, platform, difficulty) VALUES (?, ?, ?, ?)',
                    [course_metadata.title, course_metadata.url || course_metadata.link || '', course_metadata.platform || 'Online', 'Beginner']
                );
                finalCourseId = newCourse.insertId;
            }
        }

        const [result] = await db.query(
            'INSERT INTO enrollments (user_id, course_id, total_lessons) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE enrollment_date = CURRENT_TIMESTAMP',
            [userId, finalCourseId, total_lessons || 20]
        );
        res.json({ message: 'Enrolled successfully', id: result.insertId, course_id: finalCourseId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/user/enrollments', verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const [enrollments] = await db.query(`
            SELECT e.*, c.title, c.platform, c.link, c.difficulty, s.name as skill_name
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN skills s ON c.skill_id = s.id
            WHERE e.user_id = ?
        `, [userId]);
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/user/enrollments/:id', verifyToken, async (req, res) => {
    const { progress, completed_lessons } = req.body;
    try {
        await db.query(
            'UPDATE enrollments SET progress = ?, completed_lessons = ? WHERE id = ? AND user_id = ?',
            [progress, completed_lessons, req.params.id, req.user.id]
        );
        res.json({ message: 'Progress updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/user/enrollments/:id', verifyToken, async (req, res) => {
    try {
        await db.query('DELETE FROM enrollments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Unenrolled' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Analytics
router.get('/admin/stats', verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Users per Career (based on recommendations for now)
        const [careerStats] = await db.query(`
            SELECT c.title, COUNT(DISTINCT r.user_id) as user_count
            FROM careers c
            LEFT JOIN recommendations r ON c.id = r.career_id
            GROUP BY c.id
            ORDER BY user_count DESC
        `);

        // Users per Course
        const [courseStats] = await db.query(`
            SELECT c.title, COUNT(e.id) as enrollment_count
            FROM courses c
            LEFT JOIN enrollments e ON c.id = e.course_id
            GROUP BY c.id
            ORDER BY enrollment_count DESC
        `);

        // Total Users
        const [userCount] = await db.query('SELECT COUNT(*) as total FROM users');
        const totalUsers = userCount[0].total;

        res.json({ careerStats, courseStats, totalUsers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/notifications', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [recs] = await db.query('SELECT * FROM recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);

        if (recs.length === 0) return res.json([]);

        const rec = recs[0];
        const [careers] = await db.query('SELECT * FROM careers WHERE id = ?', [rec.career_id]);

        if (careers.length === 0) return res.json([]);
        const career = careers[0];

        const alerts = [];

        // 1. Default Welcome Notification (Always visible)
        alerts.push({
            id: 'welcome-msg',
            type: 'info',
            title: 'Welcome to CareerAI',
            message: 'Start your journey by taking the Career Assessment test!'
        });

        // Match Alert
        if (rec.score > 0.7) {
            alerts.push({
                id: Date.now(),
                type: 'success',
                title: 'Career Match',
                message: `You have a strong profile for ${career.title}!`
            });
        }

        // Generic Interaction Alert
        alerts.push({
            id: Date.now() + 1,
            type: 'info',
            title: 'Keep Learning',
            message: `Explore new courses to boost your ${career.category} skills.`
        });

        res.json(alerts);

    } catch (err) {
        console.error(err);
        res.json([]); // Return empty on error to avoid breaking UI
    }
});

module.exports = router;
