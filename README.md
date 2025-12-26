# AI-Enhanced Career Guidance System

## Overview
A comprehensive web application that uses Artificial Intelligence to guide users toward suitable career paths. Ideally for students and professionals, it supports both "Skilled" users (Resume matching) and "Cold-Start" users (No prior experience).

## AI Workflow
The system uses a **Hybrid AI Model** implemented in Node.js:
1.  **Weighted Cosine Similarity (Skilled Users)**:
    - Careers have weighted skill requirements stored in the database (e.g., Data Science = 0.9 Python, 0.5 Communication).
    - User skills are vectorized and compared against career vectors using Cosine Similarity.
    - Results are ranked by relevance score (0.0 - 1.0).
2.  **Rule-Based Decision Tree (Cold-Start Users)**:
    - For users with no skills, the system applies a fallback logic.
    - Inputs: Work Preference (Practical/Theory), Environment (Indoor/Outdoor), Timeframe.
    - Outputs: Beginner-friendly careers (e.g., IT Support, Graphic Design) without demanding prerequisites.

## Features
- **Google Authentication**: Secure login.
- **Interactive Assessment**: Adaptive form based on user type.
- **Personalized Dashboard**: Shows career matches, match scores, and recommended steps.
- **Admin Ready**: Database schema supports admin management (future UI expansion).

## How to Run Locally

### Prerequisites
- Node.js & npm installed.
- MySQL Server running.

### Installation
1.  **Database Setup**:
    - Ensure MySQL is running on default port.
    - Run the setup script:
    ```bash
    node scripts/setup_db.js
    ```
2.  **Backend**:
    ```bash
    cd backend
    npm install
    npm start
    ```
    Server runs on `http://localhost:5000`

3.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    App runs on `http://localhost:5173`

## Environment Variables
Create a `.env` in `backend/` if needed:
```
DB_USER=root
DB_PASSWORD=
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=supersecret
```
