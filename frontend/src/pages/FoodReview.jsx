import React, { useState, useEffect } from 'react';
import { submitReview, checkMealReviewStatus } from '../services/reviewService';
import StarRating from '../components/StarRating';

const MEAL_OPTIONS = [
  { id: 'Breakfast', label: 'Breakfast', emoji: '🍳', time: '7:30 – 9:30 AM' },
  { id: 'Lunch',     label: 'Lunch',     emoji: '🍛', time: '12:30 – 2:30 PM' },
  { id: 'Hi Tea',    label: 'Hi Tea',    emoji: '☕', time: '4:30 – 5:30 PM' },
  { id: 'Dinner',    label: 'Dinner',    emoji: '🌙', time: '7:30 – 9:30 PM' },
];

const CATEGORIES = {
  Breakfast: ['Overall Taste', 'Freshness & Quality', 'Portion Size', 'Service Speed'],
  Lunch:     ['Overall Taste', 'Dal & Curry', 'Roti / Rice Quality', 'Portion Size'],
  'Hi Tea':  ['Overall Taste', 'Snack Quality', 'Beverages'],
  Dinner:    ['Overall Taste', 'Dal & Curry', 'Roti / Rice Quality', 'Portion Size'],
};

const TIPS = [
  '"Good food is the foundation of genuine happiness."',
  '"Your honest feedback helps the mess team improve every meal."',
  '"Great food comes from great feedback — thank you!"',
  '"Even small suggestions lead to big improvements."',
];

function toDisplayDate(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function toShortDate(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export default function FoodReview({ student }) {
  const today = new Date().toISOString().split('T')[0];

  const studentData = student || {
    student_id: '23CS123',
    student_name: 'Ananya Sharma',
    hostel_block: 'Block B',
    room_no: 'B-206',
  };

  const [reviewDate, setReviewDate] = useState(today);
  const [activeMeal, setActiveMeal] = useState('Breakfast');
  const [ratings, setRatings] = useState({});       // { category: 0-5 }
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingReview, setExistingReview] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const tip = TIPS[Math.floor((new Date(reviewDate).getDate()) % TIPS.length)];

  // Reset form when meal or date changes
  useEffect(() => {
    setRatings({});
    setOverallRating(0);
    setComment('');
    setErrorMsg('');
    setSuccessMsg('');
    setExistingReview(null);

    let mounted = true;
    setChecking(true);
    checkMealReviewStatus(studentData.student_id, activeMeal, reviewDate)
      .then((res) => {
        if (!mounted) return;
        if (res.hasReviewed) {
          setExistingReview(res.review);
          setOverallRating(res.review.rating || 0);
          setComment(res.review.comment || '');
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setChecking(false); });
    return () => { mounted = false; };
  }, [activeMeal, reviewDate, studentData.student_id]);

  function shiftDay(delta) {
    const d = new Date(reviewDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setReviewDate(d.toISOString().split('T')[0]);
  }

  function setRatingFor(cat, val) {
    setRatings((prev) => ({ ...prev, [cat]: val }));
  }

  // Compute average of all category ratings as the default overall if user hasn't set it
  const cats = CATEGORIES[activeMeal] || [];
  const ratedCats = cats.filter((c) => (ratings[c] || 0) > 0);
  const catAvg = ratedCats.length > 0
    ? Math.round(ratedCats.reduce((sum, c) => sum + ratings[c], 0) / ratedCats.length)
    : 0;
  const effectiveOverall = overallRating || catAvg;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!effectiveOverall || effectiveOverall < 1) {
      setErrorMsg('Please select at least an overall star rating before submitting.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        student_id: studentData.student_id,
        student_name: studentData.student_name,
        hostel_block: studentData.hostel_block,
        room_no: studentData.room_no,
        meal_type: activeMeal,
        rating: effectiveOverall,
        comment: comment.trim(),
        review_date: reviewDate,
        category_ratings: ratings,
      };
      const res = await submitReview(payload);
      setSuccessMsg('Thank you! Your feedback has been recorded.');
      setExistingReview(res.review || payload);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const isLocked = !!existingReview || submitting;
  const isToday = reviewDate === today;

  return (
    <div className="fr-page" data-testid="food-review-page">
      {/* Page Header */}
      <div className="fr-header">
        <div className="fr-header-left">
          <div className="eyebrow">STUDENT FEEDBACK</div>
          <h1 className="fr-title">Rate Today's Food</h1>
          <p className="fr-subtitle">Help us improve by sharing your honest experience after each meal.</p>
        </div>

        {/* Date Navigator */}
        <div className="fr-date-nav">
          <button
            className="fr-date-arrow"
            onClick={() => shiftDay(-1)}
            title="Previous day"
            aria-label="Previous day"
          >
            ←
          </button>
          <div className="fr-date-center">
            <span className="fr-date-label">{isToday ? 'TODAY' : 'REVIEWING'}</span>
            <strong className="fr-date-value">{toShortDate(reviewDate)}</strong>
          </div>
          <button
            className="fr-date-arrow"
            onClick={() => shiftDay(1)}
            title="Next day"
            aria-label="Next day"
            disabled={reviewDate >= today}
          >
            →
          </button>
        </div>
      </div>

      {/* Meal Tabs */}
      <div className="fr-meal-tabs" role="tablist" aria-label="Select meal">
        {MEAL_OPTIONS.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={activeMeal === m.id}
            className={`fr-meal-tab ${activeMeal === m.id ? 'fr-meal-tab--active' : ''}`}
            onClick={() => setActiveMeal(m.id)}
            data-testid={`tab-${m.id.toLowerCase().replace(' ', '-')}`}
          >
            <span className="fr-meal-emoji">{m.emoji}</span>
            <span className="fr-meal-name">{m.label}</span>
            <span className="fr-meal-time">{m.time}</span>
          </button>
        ))}
      </div>

      {/* Body Grid */}
      <div className="fr-body">
        {/* Left Column: Rating Form */}
        <div className="fr-form-col">
          {/* Status Banners */}
          {successMsg && (
            <div className="fr-banner fr-banner--success" data-testid="success-banner">
              <span className="fr-banner-icon">✓</span>
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="fr-banner fr-banner--error" data-testid="error-banner">
              <span className="fr-banner-icon">⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}
          {existingReview && !successMsg && (
            <div className="fr-banner fr-banner--info">
              <span className="fr-banner-icon">ℹ</span>
              <span>You already reviewed <strong>{activeMeal}</strong> on {toDisplayDate(reviewDate)}.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Category Ratings */}
            <div className="fr-card">
              <div className="fr-card-header">
                <span className="fr-card-emoji">
                  {MEAL_OPTIONS.find((m) => m.id === activeMeal)?.emoji}
                </span>
                <div>
                  <h2 className="fr-card-title">Rate your {activeMeal}</h2>
                  <p className="fr-card-desc">Rate each aspect of the meal</p>
                </div>
              </div>

              <div className="fr-categories">
                {cats.map((cat) => (
                  <div key={cat} className="fr-cat-row">
                    <span className="fr-cat-label">{cat}</span>
                    <StarRating
                      value={ratings[cat] || 0}
                      onChange={(v) => !isLocked && setRatingFor(cat, v)}
                      readOnly={isLocked}
                      showLabel={false}
                      size={22}
                    />
                    <span className="fr-cat-val">
                      {ratings[cat] ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratings[cat]] : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Rating */}
            <div className="fr-card">
              <h3 className="fr-section-label">Overall Rating</h3>
              <div className="fr-overall-row">
                <StarRating
                  value={effectiveOverall}
                  onChange={(v) => !isLocked && setOverallRating(v)}
                  readOnly={isLocked}
                  showLabel={true}
                  size={34}
                />
              </div>
            </div>

            {/* Comment */}
            <div className="fr-card">
              <label className="fr-section-label" htmlFor="review-comment">
                Additional Comments <span style={{ fontWeight: 400, color: 'var(--text-subtle)' }}>(optional)</span>
              </label>
              <textarea
                id="review-comment"
                className="fr-textarea"
                placeholder="Share anything specific — taste, freshness, service speed, temperature…"
                maxLength={280}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isLocked}
                data-testid="comment-textarea"
                rows={4}
              />
              <div className="fr-textarea-footer">
                <span>{comment.length} / 280</span>
              </div>
            </div>

            {/* Submit */}
            {!existingReview ? (
              <button
                type="submit"
                className="fr-submit-btn"
                disabled={submitting || checking}
                data-testid="submit-review-btn"
              >
                {submitting ? (
                  <><span className="fr-spinner" /> Submitting…</>
                ) : (
                  <><span>✓</span> Submit Feedback</>
                )}
              </button>
            ) : (
              <div className="fr-submitted-note">
                Review recorded for <strong>{studentData.student_name}</strong> ({studentData.student_id})
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Info Sidebar */}
        <aside className="fr-sidebar">
          {/* Student Info Card */}
          <div className="fr-info-card">
            <div className="fr-info-avatar">{studentData.student_name.charAt(0)}</div>
            <div>
              <strong className="fr-info-name">{studentData.student_name}</strong>
              <span className="fr-info-id">{studentData.student_id}</span>
              <span className="fr-info-meta">{studentData.hostel_block} · Room {studentData.room_no}</span>
            </div>
          </div>

          {/* Plate Illustration */}
          <div className="fr-plate-card">
            <svg width="110" height="110" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <radialGradient id="plateGrad" cx="50%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="50" cy="50" r="40" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="50" cy="50" r="32" fill="url(#plateGrad)" />
              <circle cx="43" cy="42" r="3.5" fill="#10b981" />
              <circle cx="57" cy="46" r="3.5" fill="#10b981" />
              <circle cx="49" cy="57" r="3.5" fill="#10b981" />
              <circle cx="61" cy="37" r="2.5" fill="#ef4444" />
              <circle cx="38" cy="54" r="2.5" fill="#ef4444" />
              <path d="M48 46 C45 42, 48 35, 54 36 C54 42, 51 46, 48 46 Z" fill="#047857" />
            </svg>
            <p className="fr-plate-quote">{tip}</p>
          </div>

          {/* Feedback Tips */}
          <div className="fr-tips-card">
            <h4 className="fr-tips-title">Rating Guide</h4>
            <ul className="fr-tips-list">
              <li><span className="fr-tip-star">⭐</span><span><strong>1 – Poor:</strong> Unacceptable, inedible</span></li>
              <li><span className="fr-tip-star">⭐⭐</span><span><strong>2 – Fair:</strong> Below expectations</span></li>
              <li><span className="fr-tip-star">⭐⭐⭐</span><span><strong>3 – Good:</strong> Meets standards</span></li>
              <li><span className="fr-tip-star">⭐⭐⭐⭐</span><span><strong>4 – Very Good:</strong> Above average</span></li>
              <li><span className="fr-tip-star">⭐⭐⭐⭐⭐</span><span><strong>5 – Excellent:</strong> Outstanding</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
