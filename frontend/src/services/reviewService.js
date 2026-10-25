/**
 * Review & Analytics API Service
 * Handles all network requests for Savni's Food Reviews and Quality Analytics module.
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

/**
 * Submit a student's food review
 * @param {Object} reviewData
 * @param {string} reviewData.student_id
 * @param {string} [reviewData.student_name]
 * @param {string} [reviewData.hostel_block]
 * @param {string} [reviewData.room_no]
 * @param {'Breakfast'|'Lunch'|'Dinner'} reviewData.meal_type
 * @param {number} reviewData.rating (1-5)
 * @param {string} [reviewData.comment] (max 200 chars)
 * @param {string} [reviewData.review_date] (YYYY-MM-DD)
 */
export async function submitReview(reviewData) {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
    }
    return data;
}

/**
 * Check if the student has already submitted a review for a meal today
 * @param {string} studentId
 * @param {'Breakfast'|'Lunch'|'Dinner'} mealType
 * @param {string} [date] (YYYY-MM-DD)
 */
export async function checkMealReviewStatus(studentId, mealType, date) {
    const params = new URLSearchParams({
        student_id: studentId,
        meal_type: mealType
    });
    if (date) params.append('date', date);

    const response = await fetch(`${API_BASE_URL}/reviews/check?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to check review status');
    }
    return data; // { hasReviewed: boolean, review: object | null }
}

/**
 * Fetch reviews with optional filtering for Mess Manager Reviews page
 * @param {Object} [filters]
 * @param {'Breakfast'|'Lunch'|'Dinner'} [filters.meal_type]
 * @param {string} [filters.date] (YYYY-MM-DD)
 * @param {number} [filters.rating] (1-5)
 * @param {number} [filters.limit=50]
 * @param {number} [filters.offset=0]
 */
export async function fetchReviews(filters = {}) {
    const params = new URLSearchParams();
    if (filters.meal_type) params.append('meal_type', filters.meal_type);
    if (filters.date) params.append('date', filters.date);
    if (filters.rating) params.append('rating', filters.rating);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const response = await fetch(`${API_BASE_URL}/reviews?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
    }
    return data; // { total, limit, offset, reviews: [] }
}

/**
 * Fetch overview analytics metrics (Avg rating, total reviews, meal breakdown, star distribution)
 */
export async function fetchAnalyticsSummary() {
    const response = await fetch(`${API_BASE_URL}/analytics/summary`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics summary');
    }
    return data;
}

/**
 * Fetch 7-day rating trends for manager ratings chart
 * @param {number} [days=7]
 */
export async function fetchRatingTrends(days = 7) {
    const response = await fetch(`${API_BASE_URL}/analytics/trends?days=${days}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch rating trends');
    }
    return data; // { trends: [ { date, day, avgRating, reviewCount } ] }
}

/**
 * Fetch low rating quality alerts (< 3.0 stars)
 */
export async function fetchQualityAlerts() {
    const response = await fetch(`${API_BASE_URL}/analytics/alerts`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quality alerts');
    }
    return data;
}
