import React, { useState } from 'react';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  showLabel = true,
  size = 32
}) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const displayRating = hoveredRating || value;

  const handleClick = (rating) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readOnly) {
      setHoveredRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoveredRating(0);
    }
  };

  return (
    <div className="star-rating-container" data-testid="star-rating">
      <div className="stars-row" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          return (
            <button
              key={star}
              type="button"
              className={`star-button ${isFilled ? 'active' : ''} ${readOnly ? 'disabled' : ''}`}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              disabled={readOnly}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              data-testid={`star-${star}`}
            >
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill={isFilled ? '#FBBF24' : '#E2E8F0'}
                stroke={isFilled ? '#F59E0B' : '#CBD5E1'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>
      {showLabel && (
        <span className="rating-label" data-testid="rating-label">
          {displayRating > 0 ? RATING_LABELS[displayRating] : 'Select your rating'}
        </span>
      )}
    </div>
  );
}
