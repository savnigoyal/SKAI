import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { submitReview, checkMealReviewStatus } from '../services/reviewService';

export default function ReviewForm({
  mealType = 'Breakfast',
  selectedDate,
  student = {
    student_id: '23CS123',
    student_name: 'Ananya Sharma',
    hostel_block: 'Block B',
    room_no: 'B-206'
  },
  onSuccess
}) {
  const [rating, setRating] = useState(4); // Default to 4 as shown in reference UI
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingReview, setExistingReview] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const targetDate = selectedDate || new Date().toISOString().split('T')[0];

  // Check if student already submitted a review for this meal and date
  useEffect(() => {
    let isMounted = true;
    async function verifyReviewStatus() {
      setChecking(true);
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const res = await checkMealReviewStatus(student.student_id, mealType, targetDate);
        if (isMounted) {
          if (res.hasReviewed) {
            setExistingReview(res.review);
            setRating(res.review.rating);
            setComment(res.review.comment || '');
          } else {
            setExistingReview(null);
            setRating(4);
            setComment('');
          }
        }
      } catch (err) {
        // Non-blocking in case backend is offline or student has no prior review
        if (isMounted) setExistingReview(null);
      } finally {
        if (isMounted) setChecking(false);
      }
    }

    verifyReviewStatus();
    return () => { isMounted = false; };
  }, [student.student_id, mealType, targetDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      setErrorMsg('Please select a star rating before submitting.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        student_id: student.student_id,
        student_name: student.student_name,
        hostel_block: student.hostel_block,
        room_no: student.room_no,
        meal_type: mealType,
        rating,
        comment: comment.trim(),
        review_date: targetDate
      };

      const res = await submitReview(payload);
      setSuccessMsg('Thank you! Your feedback helps us improve.');
      setExistingReview(res.review);
      if (onSuccess) onSuccess(res.review);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" data-testid="review-form-card">
      <h2 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
        How would you rate today's {mealType.toLowerCase()}?
      </h2>

      {successMsg && (
        <div className="alert-box success" data-testid="success-banner">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert-box error" data-testid="error-banner">
          <span>⚠</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {existingReview && !successMsg && (
        <div className="alert-box success" style={{ marginBottom: '18px' }}>
          <span>✓ You already reviewed this {mealType.toLowerCase()} on {targetDate}.</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <StarRating
          value={rating}
          onChange={(newVal) => setRating(newVal)}
          readOnly={!!existingReview || submitting}
          showLabel={true}
          size={36}
        />

        <div className="form-group">
          <label className="form-label" htmlFor="review-comment">
            Additional comments (optional)
          </label>
          <textarea
            id="review-comment"
            className="form-textarea"
            placeholder="E.g. Taste was good, but could be less oily..."
            maxLength={200}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={!!existingReview || submitting}
            data-testid="comment-textarea"
          />
          <div className="textarea-footer">
            <span>{comment.length}/200</span>
          </div>
        </div>

        {!existingReview ? (
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || checking}
            data-testid="submit-review-btn"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        ) : (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Review recorded for {student.student_name} ({student.student_id}).
          </p>
        )}
      </form>
    </div>
  );
}
