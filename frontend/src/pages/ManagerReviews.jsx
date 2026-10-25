import React, { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';
import { fetchReviews } from '../services/reviewService';

export default function ManagerReviews() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [mealFilter, setMealFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (mealFilter) filters.meal_type = mealFilter;
      if (ratingFilter) filters.rating = ratingFilter;
      if (dateFilter) filters.date = dateFilter;

      const res = await fetchReviews(filters);
      setReviews(res.reviews || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [mealFilter, ratingFilter, dateFilter]);

  return (
    <div className="manager-reviews-page" data-testid="manager-reviews-page">
      <div className="top-header">
        <div className="module-header">
          <h1>Student Food Reviews</h1>
          <p>Inspect student feedback, ratings, and meal-wise experiences.</p>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          onClick={loadReviews}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="reviews-filter-bar">
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, marginRight: '8px' }}>Meal:</label>
          <select
            className="filter-select"
            value={mealFilter}
            onChange={(e) => setMealFilter(e.target.value)}
            data-testid="filter-meal"
          >
            <option value="">All Meals</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, marginRight: '8px' }}>Rating:</label>
          <select
            className="filter-select"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            data-testid="filter-rating"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, marginRight: '8px' }}>Date:</label>
          <input
            type="date"
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            data-testid="filter-date"
          />
        </div>

        {(mealFilter || ratingFilter || dateFilter) && (
          <button
            onClick={() => {
              setMealFilter('');
              setRatingFilter('');
              setDateFilter('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-red)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Showing <strong>{reviews.length}</strong> of <strong>{total}</strong> reviews
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert-box error">
          <span>⚠ {error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>No reviews found matching the selected criteria.</p>
          <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Try clearing filters or check back after meal times.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((r) => (
            <div key={r.id} className="review-item-card" data-testid="review-card">
              <div className="review-item-header">
                <div className="student-meta">
                  <span className="student-badge">{r.student_name || 'Anonymous Student'}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({r.student_id})</span>
                  {r.hostel_block && (
                    <span className="room-badge">{r.hostel_block} • {r.room_no || 'Room'}</span>
                  )}
                  <span className={`meal-badge ${r.meal_type}`}>{r.meal_type}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <StarRating value={r.rating} readOnly={true} showLabel={false} size={20} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {r.review_date}
                  </span>
                </div>
              </div>

              {r.comment ? (
                <p className="review-comment-text">"{r.comment}"</p>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontStyle: 'italic', marginTop: '6px' }}>
                  No comment provided.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
