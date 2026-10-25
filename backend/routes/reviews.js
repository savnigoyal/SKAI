const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * POST /api/reviews
 * Submit a student food review
 */
router.post('/', async (req, res) => {
    try {
        const {
            student_id,
            student_name,
            hostel_block,
            room_no,
            meal_type,
            rating,
            comment,
            review_date
        } = req.body;

        // Validation
        if (!student_id || !student_id.trim()) {
            return res.status(400).json({ error: 'student_id is required' });
        }

        const validMeals = ['Breakfast', 'Lunch', 'Dinner'];
        if (!meal_type || !validMeals.includes(meal_type)) {
            return res.status(400).json({ error: 'meal_type must be one of Breakfast, Lunch, or Dinner' });
        }

        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
        }

        const trimmedComment = comment ? comment.trim() : null;
        if (trimmedComment && trimmedComment.length > 200) {
            return res.status(400).json({ error: 'comment cannot exceed 200 characters' });
        }

        // Default review date to YYYY-MM-DD
        const targetDate = review_date || new Date().toISOString().split('T')[0];

        // Insert into database
        const sql = `
            INSERT INTO food_reviews 
            (student_id, student_name, hostel_block, room_no, meal_type, rating, comment, review_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            student_id.trim(),
            student_name || null,
            hostel_block || null,
            room_no || null,
            meal_type,
            numericRating,
            trimmedComment,
            targetDate
        ]);

        return res.status(201).json({
            message: 'Review submitted successfully',
            review: {
                id: result.insertId,
                student_id: student_id.trim(),
                student_name,
                meal_type,
                rating: numericRating,
                comment: trimmedComment,
                review_date: targetDate
            }
        });
    } catch (err) {
        // MySQL duplicate entry error code (ER_DUP_ENTRY)
        if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'You have already submitted a review for this meal on this date.'
            });
        }
        console.error('Error submitting review:', err);
        return res.status(500).json({ error: 'Internal server error while submitting review' });
    }
});

/**
 * GET /api/reviews
 * Retrieve reviews with optional filters (for Manager Reviews screen)
 * Query params: meal_type, date, rating, limit, offset
 */
router.get('/', async (req, res) => {
    try {
        const { meal_type, date, rating, limit = 50, offset = 0 } = req.query;

        let conditions = [];
        let params = [];

        if (meal_type) {
            conditions.push('meal_type = ?');
            params.push(meal_type);
        }
        if (date) {
            conditions.push('review_date = ?');
            params.push(date);
        }
        if (rating) {
            conditions.push('rating = ?');
            params.push(Number(rating));
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Query total count
        const countSql = `SELECT COUNT(*) AS total FROM food_reviews ${whereClause}`;
        const [countRows] = await db.query(countSql, params);
        const total = countRows[0].total;

        // Query records
        const dataSql = `
            SELECT id, student_id, student_name, hostel_block, room_no, meal_type, rating, comment, review_date, created_at
            FROM food_reviews
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        const queryParams = [...params, parseInt(limit, 10), parseInt(offset, 10)];
        const [rows] = await db.query(dataSql, queryParams);

        return res.json({
            total,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            reviews: rows
        });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        return res.status(500).json({ error: 'Internal server error while fetching reviews' });
    }
});

/**
 * GET /api/reviews/check
 * Check if a student already reviewed a specific meal on a date
 */
router.get('/check', async (req, res) => {
    try {
        const { student_id, meal_type, date } = req.query;
        if (!student_id || !meal_type) {
            return res.status(400).json({ error: 'student_id and meal_type are required' });
        }

        const targetDate = date || new Date().toISOString().split('T')[0];
        const sql = `
            SELECT id, student_id, meal_type, rating, comment, review_date
            FROM food_reviews
            WHERE student_id = ? AND meal_type = ? AND review_date = ?
            LIMIT 1
        `;

        const [rows] = await db.query(sql, [student_id, meal_type, targetDate]);

        if (rows.length > 0) {
            return res.json({ hasReviewed: true, review: rows[0] });
        } else {
            return res.json({ hasReviewed: false, review: null });
        }
    } catch (err) {
        console.error('Error checking review status:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/reviews/student/:studentId
 * Get history of reviews for a specific student
 */
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const sql = `
            SELECT id, meal_type, rating, comment, review_date, created_at
            FROM food_reviews
            WHERE student_id = ?
            ORDER BY review_date DESC, created_at DESC
            LIMIT 50
        `;
        const [rows] = await db.query(sql, [studentId]);
        return res.json({ reviews: rows });
    } catch (err) {
        console.error('Error fetching student reviews:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
