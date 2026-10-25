const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/analytics/summary
 * Overview metrics for Mess Manager Dashboard:
 * - overall average rating
 * - total reviews count
 * - breakdown by meal (Breakfast, Lunch, Dinner)
 * - breakdown by star (1 to 5 stars)
 */
router.get('/summary', async (req, res) => {
    try {
        // 1. Overall stats
        const overallSql = `
            SELECT 
                COUNT(*) AS total_reviews,
                COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating
            FROM food_reviews
        `;
        const [overallRows] = await db.query(overallSql);
        const { total_reviews, avg_rating } = overallRows[0];

        // 2. Meal breakdown
        const mealSql = `
            SELECT 
                meal_type,
                COUNT(*) AS review_count,
                ROUND(AVG(rating), 1) AS avg_rating
            FROM food_reviews
            GROUP BY meal_type
        `;
        const [mealRows] = await db.query(mealSql);

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
            GROUP BY rating
            ORDER BY rating DESC
        `;
        const [distRows] = await db.query(ratingDistributionSql);

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
 * Daily rating trends for the last 7 days (or custom range)
 * Used directly by the "Student Ratings (Last 7 Days)" chart
 */
router.get('/trends', async (req, res) => {
    try {
        const days = parseInt(req.query.days || '7', 10);

        // Fetch aggregated ratings grouped by review_date
        const sql = `
            SELECT 
                review_date,
                ROUND(AVG(rating), 1) AS avg_rating,
                COUNT(*) AS review_count
            FROM food_reviews
            WHERE review_date >= CURDATE() - INTERVAL ? DAY
            GROUP BY review_date
            ORDER BY review_date ASC
        `;

        const [rows] = await db.query(sql, [days]);

        // Format date to short weekday names for charting (e.g. Mon, Tue, Wed)
        const trends = rows.map(r => {
            const d = new Date(r.review_date);
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
 * GET /api/analytics/alerts
 * Highlights meals or dates with low average rating (< 3.0) for manager action
 */
router.get('/alerts', async (req, res) => {
    try {
        const sql = `
            SELECT 
                review_date,
                meal_type,
                ROUND(AVG(rating), 1) AS avg_rating,
                COUNT(*) AS review_count
            FROM food_reviews
            WHERE review_date >= CURDATE() - INTERVAL 7 DAY
            GROUP BY review_date, meal_type
            HAVING AVG(rating) < 3.0
            ORDER BY review_date DESC
        `;
        const [rows] = await db.query(sql);
        return res.json({ alerts: rows });
    } catch (err) {
        console.error('Error fetching low rating alerts:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
