/**
 * Review & Analytics API Service
 * Handles all network requests for Savni's Food Reviews and Quality Analytics module.
 * Includes safe JSON parsing so the app works gracefully when the backend is offline.
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

// ── Local-storage fallback store for demo / offline mode ──────────────────────
const LS_REVIEWS_KEY = 'skai_local_reviews';

function loadLocalReviews() {
  try { return JSON.parse(localStorage.getItem(LS_REVIEWS_KEY) || '[]'); } catch { return []; }
}
function saveLocalReviews(reviews) {
  try { localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(reviews)); } catch {}
}

// ── Safe fetch helpers ────────────────────────────────────────────────────────

/**
 * Attempt a fetch and parse JSON safely.
 * Returns { ok: boolean, data: any, networkError: boolean }
 */
async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch {
      // Server returned HTML / non-JSON (e.g. Vercel 404 page)
      data = null;
    }
    return { ok: res.ok && data !== null, data, networkError: false };
  } catch {
    // Network error — backend not reachable
    return { ok: false, data: null, networkError: true };
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Submit a student's food review.
 * Falls back to localStorage when the backend is unavailable.
 */
export async function submitReview(reviewData) {
  const { ok, data, networkError } = await safeFetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });

  if (ok) {
    if (!data.ok) throw new Error(data.error || 'Failed to submit review');
    return data;
  }

  // ── Offline / demo fallback ──
  const reviews = loadLocalReviews();
  const newReview = {
    id: `local-${Date.now()}`,
    ...reviewData,
    submitted_at: new Date().toISOString(),
    source: 'local',
  };
  reviews.push(newReview);
  saveLocalReviews(reviews);
  return { review: newReview, source: 'local' };
}

/**
 * Check if the student has already submitted a review for a meal on a given date.
 * Falls back to localStorage when the backend is unavailable.
 */
export async function checkMealReviewStatus(studentId, mealType, date) {
  const params = new URLSearchParams({ student_id: studentId, meal_type: mealType });
  if (date) params.append('date', date);

  const { ok, data } = await safeFetch(`${API_BASE_URL}/reviews/check?${params.toString()}`);

  if (ok) return data; // { hasReviewed: boolean, review: object | null }

  // ── Offline / demo fallback ──
  const targetDate = date || new Date().toISOString().split('T')[0];
  const reviews = loadLocalReviews();
  const found = reviews.find(
    (r) =>
      r.student_id === studentId &&
      r.meal_type === mealType &&
      r.review_date === targetDate
  );
  return { hasReviewed: !!found, review: found || null };
}

/**
 * Fetch reviews with optional filtering for Mess Manager Reviews page.
 */
export async function fetchReviews(filters = {}) {
  const params = new URLSearchParams();
  if (filters.meal_type) params.append('meal_type', filters.meal_type);
  if (filters.date) params.append('date', filters.date);
  if (filters.rating) params.append('rating', filters.rating);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const { ok, data } = await safeFetch(`${API_BASE_URL}/reviews?${params.toString()}`);
  if (ok) return data;

  // Offline fallback — return local reviews
  const local = loadLocalReviews();
  return { total: local.length, limit: 50, offset: 0, reviews: local, source: 'local' };
}

// ── Analytics helpers ─────────────────────────────────────────────────────────

function buildAnalyticsParams(filters = {}) {
  const params = new URLSearchParams();
  if (filters.days) params.append('days', filters.days);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.minReviews) params.append('min_reviews', filters.minReviews);
  if (filters.limit) params.append('limit', filters.limit);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function fetchAnalyticsEndpoint(path, filters) {
  const { ok, data } = await safeFetch(`${API_BASE_URL}${path}${buildAnalyticsParams(filters)}`);
  if (ok) return data;
  return null; // callers handle null as "no live data"
}

export async function fetchAnalyticsSummary(filters = {}) {
  return fetchAnalyticsEndpoint('/analytics/summary', filters);
}

export async function fetchRatingTrends(filters = {}) {
  return fetchAnalyticsEndpoint(
    '/analytics/trends',
    typeof filters === 'number' ? { days: filters } : filters
  );
}

export async function fetchMealComparison(filters = {}) {
  return fetchAnalyticsEndpoint('/analytics/meal-comparison', filters);
}

export async function fetchRecentFeedback(filters = {}) {
  return fetchAnalyticsEndpoint('/analytics/recent-feedback', filters);
}

export async function fetchQualityAlerts(filters = {}) {
  return fetchAnalyticsEndpoint('/analytics/alerts', filters);
}
