import React, { useState } from 'react';
import ReviewForm from '../components/ReviewForm';

export default function FoodReview({ student }) {
  const [activeMeal, setActiveMeal] = useState('Breakfast');
  const [reviewDate, setReviewDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const studentData = student || {
    student_id: '23CS123',
    student_name: 'Ananya Sharma',
    hostel_block: 'Block B',
    room_no: 'B-206'
  };

  // Format date for display like "Mon, 12 Aug 2024"
  const formattedDate = new Date(reviewDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handlePrevDay = () => {
    const d = new Date(reviewDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setReviewDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(reviewDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setReviewDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="food-review-page" data-testid="food-review-page">
      {/* Top Header */}
      <div className="top-header">
        <div className="module-header">
          <h1>Rate Today's Food</h1>
          <p>Tell us about your experience. Your feedback helps us improve.</p>
        </div>

        {/* Date Selector Navigation */}
        <div className="profile-pill" style={{ padding: '6px 16px', gap: '14px' }}>
          <button
            onClick={handlePrevDay}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}
            title="Previous Day"
          >
            ←
          </button>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📅 {formattedDate}
          </span>
          <button
            onClick={handleNextDay}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}
            title="Next Day"
          >
            →
          </button>
        </div>
      </div>

      {/* Meal Selection Tabs */}
      <div className="meal-tabs-container" role="tablist">
        {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
          <button
            key={meal}
            role="tab"
            aria-selected={activeMeal === meal}
            className={`meal-tab-btn ${activeMeal === meal ? 'active' : ''}`}
            onClick={() => setActiveMeal(meal)}
            data-testid={`tab-${meal.toLowerCase()}`}
          >
            {meal}
          </button>
        ))}
      </div>

      {/* Two Column Grid */}
      <div className="review-grid">
        {/* Left Column: Form */}
        <ReviewForm
          key={`${activeMeal}-${reviewDate}`}
          mealType={activeMeal}
          selectedDate={reviewDate}
          student={studentData}
        />

        {/* Right Column: Promotional Illustration & Quote */}
        <div className="side-food-card">
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            {/* Vector food plate illustration matching the dish in reference image */}
            <svg width="150" height="150" viewBox="0 0 100 100" className="food-circle-img">
              <defs>
                <radialGradient id="riceGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="70%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </radialGradient>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15" />
                </filter>
              </defs>
              {/* Outer Plate */}
              <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" filter="url(#shadow)" />
              <circle cx="50" cy="50" r="42" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
              {/* Rice Bowl */}
              <circle cx="50" cy="50" r="36" fill="url(#riceGrad)" />
              {/* Peas & Spices Garnish */}
              <circle cx="42" cy="40" r="3.5" fill="#10B981" />
              <circle cx="58" cy="45" r="3.5" fill="#10B981" />
              <circle cx="48" cy="56" r="3.5" fill="#10B981" />
              <circle cx="62" cy="36" r="2.5" fill="#EF4444" />
              <circle cx="38" cy="54" r="2.5" fill="#EF4444" />
              <circle cx="52" cy="38" r="3" fill="#047857" />
              {/* Leaf garnish */}
              <path d="M48 46 C45 42, 48 35, 54 36 C54 42, 51 46, 48 46 Z" fill="#047857" />
            </svg>
          </div>

          <div className="quote-bubble">
            <span style={{ display: 'inline-block', marginRight: '6px' }}>🌱</span>
            Your feedback makes a healthier and happier mess for everyone!
          </div>

          <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Reviewing as: <strong>{studentData.student_name}</strong> ({studentData.student_id})
          </div>
        </div>
      </div>
    </div>
  );
}
