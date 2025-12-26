USE career_guidance;

-- Seed Skills
INSERT INTO skills (name, category) VALUES 
('JavaScript', 'Programming'), ('Python', 'Programming'), ('Machine Learning', 'Data Science'),
('Communication', 'Soft Skill'), ('Graphic Design', 'Creative'), ('Adobe Photoshop', 'Tool'),
('Project Management', 'Business'), ('Troubleshooting', 'Technical'), ('Customer Service', 'Soft Skill'),
('Plumbing', 'Trade'), ('Carpentry', 'Trade'), ('SQL', 'Data Science'), ('React', 'Programming');

-- Seed Careers
INSERT INTO careers (title, description, category, min_education) VALUES
('Full Stack Developer', 'Builds web applications using frontend and backend technologies.', 'Technical', 'Bachelor/Bootcamp'),
('Data Scientist', 'Analyzes complex data to help make decisions.', 'Technical', 'Master/Bachelor'),
('Graphic Designer', 'Creates visual content to communicate messages.', 'Creative', 'Diploma/Bootcamp'),
('IT Support Specialist', 'Assists organizations with computer systems and networks.', 'Technical', 'High School/Cert'),
('Digital Marketing Associate', 'Assists in marketing campaigns.', 'Business', 'High School/Cert'),
('Plumber', 'Installs and repairs water systems.', 'Trade', 'Apprenticeship');

-- Seed Career Skills (The "Model Training")
-- Full Stack Developer: High JS, Med Python, High React
SET @career_fs := (SELECT id FROM careers WHERE title = 'Full Stack Developer');
INSERT INTO career_skills (career_id, skill_id, weight) VALUES
(@career_fs, (SELECT id FROM skills WHERE name = 'JavaScript'), 0.9),
(@career_fs, (SELECT id FROM skills WHERE name = 'React'), 0.9),
(@career_fs, (SELECT id FROM skills WHERE name = 'SQL'), 0.6),
(@career_fs, (SELECT id FROM skills WHERE name = 'Communication'), 0.4);

-- Data Scientist: High Python, High ML, High SQL
SET @career_ds := (SELECT id FROM careers WHERE title = 'Data Scientist');
INSERT INTO career_skills (career_id, skill_id, weight) VALUES
(@career_ds, (SELECT id FROM skills WHERE name = 'Python'), 0.9),
(@career_ds, (SELECT id FROM skills WHERE name = 'Machine Learning'), 1.0),
(@career_ds, (SELECT id FROM skills WHERE name = 'SQL'), 0.8),
(@career_ds, (SELECT id FROM skills WHERE name = 'Communication'), 0.5);

-- Graphic Designer: High Design, High Photoshop
SET @career_gd := (SELECT id FROM careers WHERE title = 'Graphic Designer');
INSERT INTO career_skills (career_id, skill_id, weight) VALUES
(@career_gd, (SELECT id FROM skills WHERE name = 'Graphic Design'), 1.0),
(@career_gd, (SELECT id FROM skills WHERE name = 'Adobe Photoshop'), 0.9),
(@career_gd, (SELECT id FROM skills WHERE name = 'Communication'), 0.6);

-- IT Support (Entry Level / Cold Start Friendly): High Troubleshooting, High Service
SET @career_it := (SELECT id FROM careers WHERE title = 'IT Support Specialist');
INSERT INTO career_skills (career_id, skill_id, weight) VALUES
(@career_it, (SELECT id FROM skills WHERE name = 'Troubleshooting'), 0.9),
(@career_it, (SELECT id FROM skills WHERE name = 'Customer Service'), 0.8),
(@career_it, (SELECT id FROM skills WHERE name = 'Communication'), 0.7);

-- Seed Items (Learnings)
INSERT INTO courses (title, link, platform, skill_id, difficulty) VALUES
('Complete JavaScript Course', 'https://udemy.com/js', 'Udemy', (SELECT id FROM skills WHERE name = 'JavaScript'), 'Beginner'),
('Python for Data Science', 'https://coursera.org/python', 'Coursera', (SELECT id FROM skills WHERE name = 'Python'), 'Beginner'),
('Google IT Support Professional', 'https://coursera.org', 'Coursera', (SELECT id FROM skills WHERE name = 'Troubleshooting'), 'Beginner'),
('Graphic Design Masterclass', 'https://udemy.com/design', 'Udemy', (SELECT id FROM skills WHERE name = 'Graphic Design'), 'Intermediate');

-- Seed Users
INSERT INTO users (google_id, email, name, role) VALUES
('admin', 'admin@career.ai', 'Admin', 'admin');
