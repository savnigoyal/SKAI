import React, { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';
import { fetchReviews } from '../services/reviewService';
import { DEMO_REVIEWS } from '../services/mockData';

export default function ManagerReviews({ isDemoMode = false }) {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingFallbackDemo, setUsingFallbackDemo] = useState(false);

  // Filters
  const [mealFilter, setMealFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    setError('');

    // If explicit Demo Mode is ON
    if (isDemoMode) {
      filterDemoReviews();
      setUsingFallbackDemo(false);
      setLoading(false);
      return;
    }

    try {
      const filters = {};
      if (mealFilter) filters.meal_type = mealFilter;
      if (ratingFilter) filters.rating = ratingFilter;
      if (dateFilter) filters.date = dateFilter;

      const res = await fetchReviews(filters);
      setReviews(res.reviews || []);
      setTotal(res.total || 0);
      setUsingFallbackDemo(false);
    } catch (err) {
      console.warn('Backend database unreachable, displaying sample demo reviews:', err.message);
      // Fallback to sample demo reviews
      filterDemoReviews();
      setUsingFallbackDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const filterDemoReviews = () => {
    let list = [...DEMO_REVIEWS];
    if (mealFilter) list = list.filter(r => r.meal_type === mealFilter);
    if (ratingFilter) list = list.filter(r => r.rating === Number(ratingFilter));
    if (dateFilter) list = list.filter(r => r.review_date === dateFilter);
    setReviews(list);
    setTotal(list.length);
  };

  useEffect(() => {
    loadReviews();
  }, [isDemoMode, mealFilter, ratingFilter, dateFilter]);

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

      {/* Demo / Sample Data Notice Banner */}
      {(isDemoMode || usingFallbackDemo) && (
        <div
          style={{
            background: '#FEF3C7',
            border: '1.5px solid #FCD34D',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>🧪</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#92400E' }}>
                Sample Demo Data Active
              </div>
              <div style={{ fontSize: '0.8rem', color: '#B45309' }}>
                {usingFallbackDemo 
                  ? 'Database is offline; displaying realistic sample student reviews for demonstration.'
                  : 'Demonstrating manager reviews feed with realistic student sample reviews.'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', background: '#92400E', color: '#FFFFFF', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
            DEMO DATA
          </span>
        </div>
      )}

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
      {error && !usingFallbackDemo && (
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
