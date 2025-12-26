const db = require('../config/db');

// AI LOGIC: WEIGHTED COSINE SIMILARITY & COLD-START RULES
// --------------------------------------------------------
// 1. Trained Logic: Uses weighted skill vectors defined in database.
//    - User Vector: A binary vector (1 = has skill, 0 = missing) or weighted if user rates skills.
//    - Career Vector: Weighted vector based on 'career_skills.weight' (0.0 - 1.0).
//    - Similarity: (A . B) / (||A|| * ||B||)
//
// 2. Cold-Start Logic: Rule-based fallback for users with NO data.
//    - Filters based on broad preferences (Practical vs Theoretical, etc.)
// --------------------------------------------------------

exports.recommendCareers = async (req, res) => {
    try {
        const { userId, assessmentType, answers, skills: userSkills } = req.body;
        // userSkills is array of skill IDs the user possesses

        if (assessmentType === 'cold_start') {
            return await handleColdStart(res, answers);
        } else {
            return await handleSkilledRecommendation(res, userId, userSkills, answers);
        }

    } catch (err) {
        console.error("AI Recommendation Error:", err);
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
};

// --- COLD START LOGIC (Rule-Based) ---
async function handleColdStart(res, answers) {
    // Answers: { workType, environment, time, social, creativity, structure, education, currentStatus, hobby, value }

    let query = "SELECT * FROM careers WHERE 1=1";
    const params = [];

    // 1. Work Type & Environment
    if (answers.workType === 'Practical') {
        query += " AND (category IN ('Trade', 'Technical', 'Creative', 'Service'))";
    } else if (answers.workType === 'Theoretical') {
        query += " AND (category IN ('Business', 'Technical', 'Education'))";
    } else if (answers.workType === 'Digital') {
        query += " AND (category IN ('Technical', 'Business', 'Creative'))";
    }

    if (answers.environment === 'Outdoor') {
        query += " AND category = 'Trade'";
    }

    // 2. Social Preference
    if (answers.social === 'Team') {
        query += " AND category IN ('Business', 'Service', 'Technical')";
    } else if (answers.social === 'Solo') {
        query += " AND category IN ('Technical', 'Creative', 'Trade')";
    }

    // 3. Hobbies & Interests (Strong Filter/Boost)
    if (answers.hobby === 'Gaming' || answers.hobby === 'Social') {
        query += " AND category IN ('Technical', 'Creative', 'Business')";
    } else if (answers.hobby === 'Art') {
        query += " AND category = 'Creative'";
    } else if (answers.hobby === 'Fixing') {
        query += " AND category IN ('Trade', 'Technical')";
    } else if (answers.hobby === 'Reading') {
        query += " AND category IN ('Education', 'Business', 'Technical')";
    }

    // 4. Core Values (Weighted preference)
    if (answers.value === 'High Pay') {
        query += " AND category IN ('Technical', 'Business')";
    } else if (answers.value === 'Impact') {
        query += " AND category IN ('Service', 'Education', 'Health')";
    }

    const [careers] = await db.query(query, params);

    // 5. Education & Time Filter
    const filteredCareers = careers.filter(c => {
        // If user is High School + Short term -> Strict filter for easy entry jobs
        if (answers.education === 'High School' && answers.time === 'Short') {
            return ['High School/Cert', 'Diploma/Bootcamp', 'Apprenticeship', 'None'].includes(c.min_education);
        }
        return true;
    });

    res.json({
        type: 'cold_start',
        recommendations: filteredCareers.slice(0, 3)
    });
}

// --- TRAINED AI LOGIC (Weighted Cosine Similarity) ---
async function handleSkilledRecommendation(res, userId, userSkills, answers) {
    // 1. Fetch all careers and their weighted skills
    const [careerSkills] = await db.query(`
        SELECT cs.career_id, cs.skill_id, cs.weight 
        FROM career_skills cs
    `);

    // 2. Fetch all unique skills to build vector space dimensions
    const [allSkills] = await db.query("SELECT id FROM skills");
    const skillIndexMap = {}; // Map skill_id -> vector index
    allSkills.forEach((s, i) => skillIndexMap[s.id] = i);
    const vectorSize = allSkills.length;

    // 3. Create User Vector (A)
    // For now, assume user has skill = weight 1.0 (or we could ask user proficiency)
    const userVector = new Array(vectorSize).fill(0);
    userSkills.forEach(skillId => {
        if (skillIndexMap[skillId] !== undefined) {
            userVector[skillIndexMap[skillId]] = 1.0;
        }
    });

    // 4. Create Career Vectors (B) and Calculate Similarity
    const careerVectors = {}; // career_id -> vector

    // Group DB rows by career
    careerSkills.forEach(row => {
        if (!careerVectors[row.career_id]) {
            careerVectors[row.career_id] = new Array(vectorSize).fill(0);
        }
        if (skillIndexMap[row.skill_id] !== undefined) {
            careerVectors[row.career_id][skillIndexMap[row.skill_id]] = row.weight;
        }
    });

    const recommendations = [];

    // Cosine Similarity Function
    // Cos(theta) = (A . B) / (|A| * |B|)
    for (const [careerId, careerVector] of Object.entries(careerVectors)) {
        let dotProduct = 0;
        let magA = 0;
        let magB = 0;

        for (let i = 0; i < vectorSize; i++) {
            dotProduct += userVector[i] * careerVector[i];
            magA += userVector[i] * userVector[i];
            magB += careerVector[i] * careerVector[i];
        }

        magA = Math.sqrt(magA);
        magB = Math.sqrt(magB);

        let similarity = 0;
        if (magA > 0 && magB > 0) {
            similarity = dotProduct / (magA * magB);
        }

        if (similarity > 0.0) { // Only relevant matches
            recommendations.push({ careerId: parseInt(careerId), score: similarity });
        }
    }

    // 5. Rank Results
    recommendations.sort((a, b) => b.score - a.score);

    // 6. Fetch Career Details for top results (fetch more initially to allow filtering)
    const topIds = recommendations.slice(0, 20).map(r => r.careerId);
    if (topIds.length === 0) return res.json({ type: 'skilled', recommendations: [] });

    const [details] = await db.query(`SELECT * FROM careers WHERE id IN (?)`, [topIds]);

    // 7. Apply Interaction Filters (Education, Interests)
    let filteredResults = await Promise.all(details.map(async c => {
        const match = recommendations.find(r => r.careerId === c.id);

        // Fetch top 2 courses for this career
        const [relatedCourses] = await db.query(`
            SELECT c.title, c.link, c.platform, c.difficulty 
            FROM courses c 
            JOIN skills s ON c.skill_id = s.id 
            JOIN career_skills cs ON s.id = cs.skill_id 
            WHERE cs.career_id = ? 
            ORDER BY c.difficulty ASC 
            LIMIT 2
        `, [c.id]);

        return { ...c, score: match.score, sample_courses: relatedCourses };
    }));

    if (answers) {
        filteredResults = filteredResults.filter(c => {
            // Education Filter
            // If user has 'High School', hide 'Master' or 'Bachelor' unless 'Long' term is OK
            if (answers.education === 'High School' && c.min_education === 'Master') return false;
            if (answers.education === 'High School' && c.min_education === 'Bachelor' && answers.time === 'Short') return false;
            return true;
        });

        // Boost based on Interest/Hobby
        filteredResults = filteredResults.map(c => {
            let boost = 1.0;
            if (answers.hobby === 'Gaming' && (c.category === 'Technical' || c.category === 'Creative')) boost = 1.2;
            if (answers.hobby === 'Art' && c.category === 'Creative') boost = 1.2;
            if (answers.value === 'High Pay' && c.category === 'Business') boost = 1.1;

            return { ...c, score: c.score * boost };
        });
    }

    // Re-sort and slice
    filteredResults.sort((a, b) => b.score - a.score);

    res.json({ type: 'skilled', recommendations: filteredResults.slice(0, 5) });
}
