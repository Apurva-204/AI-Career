-- Database Schema using MySQL

CREATE DATABASE IF NOT EXISTS career_guidance;
USE career_guidance;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE, -- Nullable for manual users
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- For manual login
    name VARCHAR(255),
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Careers Table
CREATE TABLE IF NOT EXISTS careers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- e.g. Technical, Creative, Hands-on
    min_education VARCHAR(100) DEFAULT 'None',
    market_outlook VARCHAR(100)
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) -- e.g. Programming, Soft Skill, Tool
);

-- Career_Skills Junction Table (The "Training" Data)
CREATE TABLE IF NOT EXISTS career_skills (
    career_id INT,
    skill_id INT,
    weight FLOAT CHECK (weight >= 0 AND weight <= 1), -- Importance 0.0 to 1.0
    PRIMARY KEY (career_id, skill_id),
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Items Table (Courses/Certifications)
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(255),
    platform VARCHAR(100),
    skill_id INT, -- Related skill
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL
);

-- Assessments (User Progress)
CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    assessment_type ENUM('skilled', 'cold_start') NOT NULL,
    answers JSON, -- Stores raw answers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recommendations (History)
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    career_id INT,
    score FLOAT, -- Match score (Cosine similarity or 1.0 for rule interaction)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- Enrollments Table (User Course Progress)
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
    UNIQUE KEY (user_id, course_id) -- Prevent duplicate enrollments
);
