const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Helper to construct date filtering SQL clause and parameter array
 */
function getDateCondition(query) {
    const { days, startDate, endDate } = query;
    let condition = '';
    let params = [];

    if (startDate && endDate) {
        condition = 'review_date >= ? AND review_date <= ?';
        params = [startDate, endDate];
    } else if (startDate) {
        condition = 'review_date >= ?';
        params = [startDate];
    } else if (endDate) {
        condition = 'review_date <= ?';
        params = [endDate];
    } else if (days && !isNaN(parseInt(days, 10))) {
        condition = 'review_date >= CURDATE() - INTERVAL ? DAY';
        params = [parseInt(days, 10)];
    }

    return {
        clause: condition ? `WHERE ${condition}` : '',
        whereAnd: condition ? `AND ${condition}` : '',
        params
    };
}

/**
 * GET /api/analytics/summary
 * Overview metrics for Mess Manager Dashboard (supports date filtering: days, startDate, endDate)
 */
router.get('/summary', async (req, res) => {
    try {
        const { clause, params } = getDateCondition(req.query);

        // 1. Overall stats
        const overallSql = `
            SELECT 
                COUNT(*) AS total_reviews,
                COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating
            FROM food_reviews
            ${clause}
        `;
        const [overallRows] = await db.query(overallSql, params);
        const { total_reviews, avg_rating } = overallRows[0];

        // 2. Meal breakdown
        const mealSql = `
            SELECT 
                meal_type,
                COUNT(*) AS review_count,
                ROUND(AVG(rating), 1) AS avg_rating
            FROM food_reviews
            ${clause}
            GROUP BY meal_type
        `;
        const [mealRows] = await db.query(mealSql, params);

        const mealStats = {
            Breakfast: { avg_rating: 0, count: 0 },
            Lunch: { avg_rating: 0, count: 0 },
            Dinner: { avg_rating: 0, count: 0 }
        };
        mealRows.forEach(row => {
            if (mealStats[row.meal_type]) {
                mealStats[row.meal_type] = {
                    avg_rating: Number(row.avg_rating),
                    count: row.review_count
                };
            }
        });

        // 3. Rating distribution (1 to 5 stars)
        const ratingDistributionSql = `
            SELECT 
                rating,
                COUNT(*) AS count
            FROM food_reviews
            ${clause}
            GROUP BY rating
            ORDER BY rating DESC
        `;
        const [distRows] = await db.query(ratingDistributionSql, params);

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distRows.forEach(row => {
            distribution[row.rating] = row.count;
        });

        return res.json({
            totalReviews: total_reviews,
            averageRating: Number(avg_rating),
            mealBreakdown: mealStats,
            ratingDistribution: distribution
        });
    } catch (err) {
        console.error('Error fetching analytics summary:', err);
        return res.status(500).json({ error: 'Internal server error while fetching analytics summary' });
    }
});

/**
 * GET /api/analytics/trends
 * Daily rating trends respecting date filters (days, startDate, endDate)
 */
router.get('/trends', async (req, res) => {
    try {
        const { clause, params } = getDateCondition(req.query);

        const sql = `
            SELECT 
                review_date,
                ROUND(AVG(rating), 1) AS avg_rating,
                COUNT(*) AS review_count
            FROM food_reviews
            ${clause}
            GROUP BY review_date
            ORDER BY review_date ASC
        `;

        const [rows] = await db.query(sql, params);

        const trends = rows.map(r => {
            const d = new Date(r.review_date + 'T00:00:00');
            const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
            return {
                date: r.review_date,
                day: weekday,
                avgRating: Number(r.avg_rating),
                reviewCount: r.review_count
            };
        });

        return res.json({ trends });
    } catch (err) {
        console.error('Error fetching analytics trends:', err);
        return res.status(500).json({ error: 'Internal server error while fetching trends' });
    }
});

/**
 * GET /api/analytics/meal-comparison
 * Comprehensive breakdown comparison across Breakfast, Lunch, and Dinner
 */
router.get('/meal-comparison', async (req, res) => {
    try {
        const { clause, params } = getDateCondition(req.query);

        const sql = `
            SELECT 
                meal_type,
                COUNT(*) AS total_reviews,
                COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating,
                SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS positive_reviews,
                SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) AS negative_reviews
            FROM food_reviews
            ${clause}
            GROUP BY meal_type
        `;

        const [rows] = await db.query(sql, params);

        const meals = ['Breakfast', 'Lunch', 'Dinner'].map(meal => {
            const row = rows.find(r => r.meal_type === meal);
            const total = row ? row.total_reviews : 0;
            const avg = row ? Number(row.avg_rating) : 0;
            const positive = row ? Number(row.positive_reviews) : 0;
            const negative = row ? Number(row.negative_reviews) : 0;
            return {
                meal_type: meal,
                total_reviews: total,
                avg_rating: avg,
                positive_reviews: positive,
                negative_reviews: negative,
                satisfaction_rate: total > 0 ? Math.round((positive / total) * 100) : 0
            };
        });

        return res.json({ meals });
    } catch (err) {
        console.error('Error fetching meal comparison:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/analytics/recent-feedback
 * Recent student reviews with written feedback comments
 */
router.get('/recent-feedback', async (req, res) => {
    try {
        const { clause, params } = getDateCondition(req.query);
        const limit = parseInt(req.query.limit || '6', 10);

        const commentCondition = clause ? `${clause} AND comment IS NOT NULL AND TRIM(comment) != ''` : `WHERE comment IS NOT NULL AND TRIM(comment) != ''`;

        const sql = `
            SELECT id, student_id, student_name, hostel_block, room_no, meal_type, rating, comment, review_date, created_at
            FROM food_reviews
            ${commentCondition}
            ORDER BY review_date DESC, created_at DESC
            LIMIT ?
        `;

        const [rows] = await db.query(sql, [...params, limit]);
        return res.json({ feedback: rows });
    } catch (err) {
        console.error('Error fetching recent feedback:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/analytics/alerts
 * Low-rating quality alerts (< 3.0) with minimum review count threshold to avoid single outlier noise
 */
router.get('/alerts', async (req, res) => {
    try {
        const { clause, params } = getDateCondition(req.query);
        const minReviews = parseInt(req.query.min_reviews || '2', 10);

        const sql = `
            SELECT 
                review_date,
                meal_type,
                ROUND(AVG(rating), 1) AS avg_rating,
                COUNT(*) AS review_count
            FROM food_reviews
            ${clause}
            GROUP BY review_date, meal_type
            HAVING AVG(rating) < 3.0 AND COUNT(*) >= ?
            ORDER BY review_date DESC
            LIMIT 10
        `;

        const [rows] = await db.query(sql, [...params, minReviews]);
        return res.json({ alerts: rows });
    } catch (err) {
        console.error('Error fetching quality alerts:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
