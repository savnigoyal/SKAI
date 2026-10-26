const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Standard hostel eligible student count for participation rate denominator.
 * Clearly labeled to avoid inventing undocumented denominators.
 */
const TOTAL_ELIGIBLE_STUDENTS = 120;

/**
 * Helper to determine current status based on opens_at, closes_at and DB status
 */
function resolvePollStatus(poll) {
    const now = new Date();
    const opensAt = new Date(poll.opens_at);
    const closesAt = new Date(poll.closes_at);

    if (poll.status === 'closed') {
        return 'closed';
    }
    if (now < opensAt) {
        return 'upcoming';
    }
    if (now > closesAt) {
        return 'closed';
    }
    return 'active';
}

/**
 * Helper to compute poll winner or tie
 */
function determineWinnerOrTie(options, totalVotes) {
    if (!options || options.length === 0 || totalVotes === 0) {
        return { isTie: false, winner: null, winners: [] };
    }

    let maxVotes = -1;
    options.forEach(opt => {
        if (opt.votes_count > maxVotes) {
            maxVotes = opt.votes_count;
        }
    });

    if (maxVotes <= 0) {
        return { isTie: false, winner: null, winners: [] };
    }

    const topOptions = options.filter(opt => opt.votes_count === maxVotes);
    if (topOptions.length > 1) {
        return {
            isTie: true,
            winner: null,
            winners: topOptions
        };
    }

    return {
        isTie: false,
        winner: topOptions[0],
        winners: [topOptions[0]]
    };
}

/**
 * Middleware to check manager authorization
 */
function requireManager(req, res, next) {
    const role = req.headers['x-user-role'] || req.query.role || req.body?.role;
    // In college project environment, manager role indicator is passed via header or body
    if (role && role.toLowerCase() === 'manager') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied: Manager authorization required' });
}

/**
 * GET /api/polls
 * Retrieve list of polls with options, filtered optionally by meal_type or status.
 * If x-student-id header or student_id query is provided, includes student's voting status.
 */
router.get('/', async (req, res) => {
    try {
        const { meal_type, status } = req.query;
        const studentId = req.headers['x-student-id'] || req.query.student_id;

        let conditions = [];
        let params = [];

        if (meal_type) {
            conditions.push('p.meal_type = ?');
            params.push(meal_type);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
            SELECT 
                p.poll_id,
                p.title,
                p.meal_type,
                p.opens_at,
                p.closes_at,
                p.status,
                p.created_by,
                p.created_at,
                COUNT(DISTINCT v.vote_id) AS total_votes
            FROM polls p
            LEFT JOIN poll_votes v ON p.poll_id = v.poll_id
            ${whereClause}
            GROUP BY p.poll_id
            ORDER BY p.created_at DESC
        `;

        const [polls] = await db.query(sql, params);

        // Fetch options and student voting status for each poll
        const populatedPolls = await Promise.all(polls.map(async (poll) => {
            const currentStatus = resolvePollStatus(poll);

            // Fetch options and vote counts for this poll
            const optionsSql = `
                SELECT 
                    o.option_id,
                    o.food_name,
                    o.image_url,
                    COUNT(v.vote_id) AS votes_count
                FROM poll_options o
                LEFT JOIN poll_votes v ON o.option_id = v.option_id
                WHERE o.poll_id = ?
                GROUP BY o.option_id
                ORDER BY o.option_id ASC
            `;
            const [options] = await db.query(optionsSql, [poll.poll_id]);

            const totalVotes = Number(poll.total_votes) || 0;
            const optionsWithPercentages = options.map(opt => {
                const votesCount = Number(opt.votes_count) || 0;
                const percentage = totalVotes > 0 ? Number(((votesCount / totalVotes) * 100).toFixed(1)) : 0;
                return {
                    option_id: opt.option_id,
                    food_name: opt.food_name,
                    image_url: opt.image_url,
                    votes_count: votesCount,
                    percentage
                };
            });

            // Check if student has voted
            let hasVoted = false;
            let votedOptionId = null;

            if (studentId) {
                const [userVotes] = await db.query(
                    'SELECT option_id FROM poll_votes WHERE poll_id = ? AND student_id = ?',
                    [poll.poll_id, studentId.trim()]
                );
                if (userVotes.length > 0) {
                    hasVoted = true;
                    votedOptionId = userVotes[0].option_id;
                }
            }

            const winResult = determineWinnerOrTie(optionsWithPercentages, totalVotes);
            const participationRate = TOTAL_ELIGIBLE_STUDENTS > 0
                ? Number(((totalVotes / TOTAL_ELIGIBLE_STUDENTS) * 100).toFixed(1))
                : 0;

            return {
                poll_id: poll.poll_id,
                title: poll.title,
                meal_type: poll.meal_type,
                opens_at: poll.opens_at,
                closes_at: poll.closes_at,
                status: currentStatus,
                created_by: poll.created_by,
                created_at: poll.created_at,
                total_votes: totalVotes,
                eligible_voters: TOTAL_ELIGIBLE_STUDENTS,
                participation_rate: participationRate,
                options: optionsWithPercentages,
                has_voted: hasVoted,
                voted_option_id: votedOptionId,
                winner: winResult.winner,
                is_tie: winResult.isTie,
                winners: winResult.winners
            };
        }));

        // Filter by resolved status if requested (e.g. status=active)
        const finalPolls = status && status !== 'all'
            ? populatedPolls.filter(p => p.status === status)
            : populatedPolls;

        return res.json({ polls: finalPolls });
    } catch (err) {
        console.error('Error fetching polls:', err);
        return res.status(500).json({ error: 'Internal server error while fetching polls' });
    }
});

/**
 * GET /api/polls/:id
 * Retrieve a single poll by ID with full options and details
 */
router.get('/:id', async (req, res) => {
    try {
        const pollId = parseInt(req.params.id, 10);
        if (isNaN(pollId)) {
            return res.status(400).json({ error: 'Invalid poll_id parameter' });
        }

        const studentId = req.headers['x-student-id'] || req.query.student_id;

        const [polls] = await db.query('SELECT * FROM polls WHERE poll_id = ?', [pollId]);
        if (polls.length === 0) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        const poll = polls[0];
        const currentStatus = resolvePollStatus(poll);

        // Fetch options and vote counts
        const [options] = await db.query(`
            SELECT 
                o.option_id,
                o.food_name,
                o.image_url,
                COUNT(v.vote_id) AS votes_count
            FROM poll_options o
            LEFT JOIN poll_votes v ON o.option_id = v.option_id
            WHERE o.poll_id = ?
            GROUP BY o.option_id
            ORDER BY o.option_id ASC
        `, [pollId]);

        const [totalVoteRows] = await db.query(
            'SELECT COUNT(*) AS total FROM poll_votes WHERE poll_id = ?',
            [pollId]
        );
        const totalVotes = Number(totalVoteRows[0].total) || 0;

        const optionsWithPercentages = options.map(opt => {
            const votesCount = Number(opt.votes_count) || 0;
            const percentage = totalVotes > 0 ? Number(((votesCount / totalVotes) * 100).toFixed(1)) : 0;
            return {
                option_id: opt.option_id,
                food_name: opt.food_name,
                image_url: opt.image_url,
                votes_count: votesCount,
                percentage
            };
        });

        let hasVoted = false;
        let votedOptionId = null;

        if (studentId) {
            const [userVotes] = await db.query(
                'SELECT option_id FROM poll_votes WHERE poll_id = ? AND student_id = ?',
                [pollId, studentId.trim()]
            );
            if (userVotes.length > 0) {
                hasVoted = true;
                votedOptionId = userVotes[0].option_id;
            }
        }

        const winResult = determineWinnerOrTie(optionsWithPercentages, totalVotes);
        const participationRate = TOTAL_ELIGIBLE_STUDENTS > 0
            ? Number(((totalVotes / TOTAL_ELIGIBLE_STUDENTS) * 100).toFixed(1))
            : 0;

        return res.json({
            poll: {
                poll_id: poll.poll_id,
                title: poll.title,
                meal_type: poll.meal_type,
                opens_at: poll.opens_at,
                closes_at: poll.closes_at,
                status: currentStatus,
                created_by: poll.created_by,
                created_at: poll.created_at,
                total_votes: totalVotes,
                eligible_voters: TOTAL_ELIGIBLE_STUDENTS,
                participation_rate: participationRate,
                options: optionsWithPercentages,
                has_voted: hasVoted,
                voted_option_id: votedOptionId,
                winner: winResult.winner,
                is_tie: winResult.isTie,
                winners: winResult.winners
            }
        });
    } catch (err) {
        console.error('Error fetching poll details:', err);
        return res.status(500).json({ error: 'Internal server error while fetching poll details' });
    }
});

/**
 * POST /api/polls/:id/vote
 * Submit a student's vote on a poll
 */
router.post('/:id/vote', async (req, res) => {
    try {
        const pollId = parseInt(req.params.id, 10);
        if (isNaN(pollId)) {
            return res.status(400).json({ error: 'Invalid poll_id parameter' });
        }

        const studentId = req.headers['x-student-id'] || req.body.student_id;
        const optionId = parseInt(req.body.option_id, 10);

        if (!studentId || !studentId.trim()) {
            return res.status(400).json({ error: 'student_id is required to cast a vote' });
        }

        if (isNaN(optionId)) {
            return res.status(400).json({ error: 'A valid option_id is required' });
        }

        // 1. Fetch poll and verify existence
        const [polls] = await db.query('SELECT * FROM polls WHERE poll_id = ?', [pollId]);
        if (polls.length === 0) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        const poll = polls[0];
        const status = resolvePollStatus(poll);

        // 2. Voting rule: A student may not vote before a poll opens or after it closes
        if (status === 'closed') {
            return res.status(403).json({ error: 'Voting is closed for this poll' });
        }
        if (status === 'upcoming') {
            return res.status(403).json({ error: 'Voting has not yet opened for this poll' });
        }

        // 3. Voting rule: A student cannot submit an option that does not belong to the selected poll
        const [matchingOptions] = await db.query(
            'SELECT option_id FROM poll_options WHERE option_id = ? AND poll_id = ?',
            [optionId, pollId]
        );
        if (matchingOptions.length === 0) {
            return res.status(400).json({ error: 'Selected food option does not belong to this poll' });
        }

        // 4. Voting rule: A student may cast one vote per poll (duplicate prevention)
        const [existingVotes] = await db.query(
            'SELECT vote_id FROM poll_votes WHERE poll_id = ? AND student_id = ?',
            [pollId, studentId.trim()]
        );
        if (existingVotes.length > 0) {
            return res.status(409).json({ error: 'You have already voted in this poll' });
        }

        // 5. Insert vote record using parameterized query
        const [insertResult] = await db.query(
            'INSERT INTO poll_votes (poll_id, option_id, student_id) VALUES (?, ?, ?)',
            [pollId, optionId, studentId.trim()]
        );

        // 6. Return updated vote counts and results
        const [updatedOptions] = await db.query(`
            SELECT 
                o.option_id,
                o.food_name,
                o.image_url,
                COUNT(v.vote_id) AS votes_count
            FROM poll_options o
            LEFT JOIN poll_votes v ON o.option_id = v.option_id
            WHERE o.poll_id = ?
            GROUP BY o.option_id
            ORDER BY o.option_id ASC
        `, [pollId]);

        const [updatedTotalRow] = await db.query(
            'SELECT COUNT(*) AS total FROM poll_votes WHERE poll_id = ?',
            [pollId]
        );
        const totalVotes = Number(updatedTotalRow[0].total) || 0;

        const optionsWithPercentages = updatedOptions.map(opt => {
            const votesCount = Number(opt.votes_count) || 0;
            const percentage = totalVotes > 0 ? Number(((votesCount / totalVotes) * 100).toFixed(1)) : 0;
            return {
                option_id: opt.option_id,
                food_name: opt.food_name,
                image_url: opt.image_url,
                votes_count: votesCount,
                percentage
            };
        });

        const winResult = determineWinnerOrTie(optionsWithPercentages, totalVotes);

        return res.status(201).json({
            message: 'Vote submitted successfully',
            vote: {
                vote_id: insertResult.insertId,
                poll_id: pollId,
                option_id: optionId,
                student_id: studentId.trim()
            },
            total_votes: totalVotes,
            options: optionsWithPercentages,
            winner: winResult.winner,
            is_tie: winResult.isTie,
            winners: winResult.winners
        });
    } catch (err) {
        // Enforce DB unique constraint check
        if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'You have already voted in this poll' });
        }
        console.error('Error submitting vote:', err);
        return res.status(500).json({ error: 'Internal server error while submitting vote' });
    }
});

/**
 * GET /api/polls/:id/results
 * Retrieve detailed results, participation rates, and winner/tie info
 */
router.get('/:id/results', async (req, res) => {
    try {
        const pollId = parseInt(req.params.id, 10);
        if (isNaN(pollId)) {
            return res.status(400).json({ error: 'Invalid poll_id parameter' });
        }

        const [polls] = await db.query('SELECT * FROM polls WHERE poll_id = ?', [pollId]);
        if (polls.length === 0) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        const poll = polls[0];
        const status = resolvePollStatus(poll);

        const [options] = await db.query(`
            SELECT 
                o.option_id,
                o.food_name,
                o.image_url,
                COUNT(v.vote_id) AS votes_count
            FROM poll_options o
            LEFT JOIN poll_votes v ON o.option_id = v.option_id
            WHERE o.poll_id = ?
            GROUP BY o.option_id
            ORDER BY o.option_id ASC
        `, [pollId]);

        const [totalVoteRows] = await db.query(
            'SELECT COUNT(*) AS total FROM poll_votes WHERE poll_id = ?',
            [pollId]
        );
        const totalVotes = Number(totalVoteRows[0].total) || 0;

        const optionsWithPercentages = options.map(opt => {
            const votesCount = Number(opt.votes_count) || 0;
            const percentage = totalVotes > 0 ? Number(((votesCount / totalVotes) * 100).toFixed(1)) : 0;
            return {
                option_id: opt.option_id,
                food_name: opt.food_name,
                image_url: opt.image_url,
                votes_count: votesCount,
                percentage
            };
        });

        const winResult = determineWinnerOrTie(optionsWithPercentages, totalVotes);
        const participationRate = TOTAL_ELIGIBLE_STUDENTS > 0
            ? Number(((totalVotes / TOTAL_ELIGIBLE_STUDENTS) * 100).toFixed(1))
            : 0;

        return res.json({
            poll_id: poll.poll_id,
            title: poll.title,
            meal_type: poll.meal_type,
            status,
            total_votes: totalVotes,
            eligible_voters: TOTAL_ELIGIBLE_STUDENTS,
            participation_rate: participationRate,
            options: optionsWithPercentages,
            winner: winResult.winner,
            is_tie: winResult.isTie,
            winners: winResult.winners
        });
    } catch (err) {
        console.error('Error fetching poll results:', err);
        return res.status(500).json({ error: 'Internal server error while fetching poll results' });
    }
});

/**
 * POST /api/polls
 * Create a new poll with food options (Manager Only)
 * Uses a safe MySQL Transaction
 */
router.post('/', requireManager, async (req, res) => {
    let connection;
    try {
        const { title, meal_type, opens_at, closes_at, options, created_by } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Poll title is required' });
        }

        const validMeals = ['Breakfast', 'Lunch', 'Dinner'];
        if (!meal_type || !validMeals.includes(meal_type)) {
            return res.status(400).json({ error: 'meal_type must be one of Breakfast, Lunch, or Dinner' });
        }

        if (!opens_at || !closes_at) {
            return res.status(400).json({ error: 'Both opens_at and closes_at date-times are required' });
        }

        if (new Date(opens_at) >= new Date(closes_at)) {
            return res.status(400).json({ error: 'opens_at must be earlier than closes_at' });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ error: 'A poll must have at least 2 food options' });
        }

        for (const opt of options) {
            if (!opt.food_name || !opt.food_name.trim()) {
                return res.status(400).json({ error: 'All food options must have a valid food_name' });
            }
        }

        // Get dedicated connection for transaction
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        const insertPollSql = `
            INSERT INTO polls (title, meal_type, opens_at, closes_at, status, created_by)
            VALUES (?, ?, ?, ?, 'active', ?)
        `;
        const [pollResult] = await connection.execute(insertPollSql, [
            title.trim(),
            meal_type,
            opens_at,
            closes_at,
            created_by || 'Mess Manager'
        ]);

        const pollId = pollResult.insertId;

        // Insert options
        for (const opt of options) {
            await connection.execute(
                'INSERT INTO poll_options (poll_id, food_name, image_url) VALUES (?, ?, ?)',
                [pollId, opt.food_name.trim(), opt.image_url ? opt.image_url.trim() : null]
            );
        }

        await connection.commit();

        return res.status(201).json({
            message: 'Poll created successfully',
            poll_id: pollId,
            title: title.trim(),
            meal_type,
            opens_at,
            closes_at
        });
    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error creating poll:', err);
        return res.status(500).json({ error: 'Internal server error while creating poll' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

/**
 * PUT /api/polls/:id
 * Edit poll details (Manager only)
 */
router.put('/:id', requireManager, async (req, res) => {
    try {
        const pollId = parseInt(req.params.id, 10);
        if (isNaN(pollId)) {
            return res.status(400).json({ error: 'Invalid poll_id' });
        }

        const { title, meal_type, opens_at, closes_at } = req.body;

        const [polls] = await db.query('SELECT * FROM polls WHERE poll_id = ?', [pollId]);
        if (polls.length === 0) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        const sql = `
            UPDATE polls 
            SET title = COALESCE(?, title),
                meal_type = COALESCE(?, meal_type),
                opens_at = COALESCE(?, opens_at),
                closes_at = COALESCE(?, closes_at)
            WHERE poll_id = ?
        `;

        await db.query(sql, [
            title ? title.trim() : null,
            meal_type || null,
            opens_at || null,
            closes_at || null,
            pollId
        ]);

        return res.json({ message: 'Poll updated successfully', poll_id: pollId });
    } catch (err) {
        console.error('Error updating poll:', err);
        return res.status(500).json({ error: 'Internal server error while updating poll' });
    }
});

/**
 * PATCH /api/polls/:id/status
 * Manually close or reopen a poll (Manager only)
 */
router.patch('/:id/status', requireManager, async (req, res) => {
    try {
        const pollId = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (!status || !['active', 'closed'].includes(status)) {
            return res.status(400).json({ error: 'status must be "active" or "closed"' });
        }

        const [result] = await db.query(
            'UPDATE polls SET status = ? WHERE poll_id = ?',
            [status, pollId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        return res.json({ message: `Poll status updated to ${status}`, poll_id: pollId, status });
    } catch (err) {
        console.error('Error updating poll status:', err);
        return res.status(500).json({ error: 'Internal server error while updating poll status' });
    }
});

/**
 * DELETE /api/polls/:id
 * Delete a poll and its associated options and votes (Manager only)
 */
router.delete('/:id', requireManager, async (req, res) => {
    try {
        const pollId = parseInt(req.params.id, 10);
        if (isNaN(pollId)) {
            return res.status(400).json({ error: 'Invalid poll_id' });
        }

        const [result] = await db.query('DELETE FROM polls WHERE poll_id = ?', [pollId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        return res.json({ message: 'Poll deleted successfully', poll_id: pollId });
    } catch (err) {
        console.error('Error deleting poll:', err);
        return res.status(500).json({ error: 'Internal server error while deleting poll' });
    }
});

module.exports = router;
