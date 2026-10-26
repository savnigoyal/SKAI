import React, { useState, useEffect } from 'react';
import { fetchPolls, submitVote } from '../services/pollService';

export default function StudentVoting({ student, isDemoMode = true }) {
  const [activeMeal, setActiveMeal] = useState('Breakfast');
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const studentData = student || {
    student_id: '23CS123',
    student_name: 'Ananya Sharma',
    hostel_block: 'Block B',
    room_no: 'B-206'
  };

  // Load polls for active meal
  useEffect(() => {
    loadPolls();
  }, [activeMeal, isDemoMode]);

  async function loadPolls() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setSelectedOptionId(null);
    try {
      const data = await fetchPolls({
        meal_type: activeMeal,
        student_id: studentData.student_id,
        isDemoMode
      });
      setPolls(data.polls || []);
    } catch (err) {
      console.error('Error loading polls:', err);
      setError(err.message || 'Unable to load menu polls');
    } finally {
      setLoading(false);
    }
  }

  // Active poll for current meal
  const currentPoll = polls.length > 0 ? polls[0] : null;

  // Format date helper
  const formatDeadline = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOptionId) {
      alert('Please select an option before submitting.');
      return;
    }
    if (!currentPoll) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await submitVote({
        pollId: currentPoll.poll_id,
        optionId: selectedOptionId,
        studentId: studentData.student_id,
        isDemoMode
      });

      setSuccessMessage('🎉 Your vote has been recorded successfully! Thank you for helping shape our hostel menu.');
      // Refresh polls to show updated results and voted state
      await loadPolls();
    } catch (err) {
      setError(err.message || 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="student-voting-page" data-testid="student-voting-page">
      {/* Top Header */}
      <div className="top-header">
        <div className="module-header">
          <h1>Menu Polling & Voting 🗳️</h1>
          <p>Vote for your favorite dishes. The mess menu is crafted by student choices!</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              background: isDemoMode ? '#FEF3C7' : '#E0F2FE',
              color: isDemoMode ? '#B45309' : '#0369A1',
              border: `1px solid ${isDemoMode ? '#FDE68A' : '#BAE6FD'}`,
              padding: '4px 12px',
              borderRadius: '999px',
              fontWeight: 700
            }}
          >
            {isDemoMode ? '🧪 Demo Mode Active' : '🔌 Live MySQL Database'}
          </span>
          <div className="profile-pill">
            <div className="avatar-circle">A</div>
            <div className="profile-info">
              <div className="profile-name">{studentData.student_name}</div>
              <div className="profile-role">{studentData.hostel_block} • {studentData.room_no}</div>
            </div>
          </div>
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
            data-testid={`poll-tab-${meal.toLowerCase()}`}
          >
            {meal === 'Breakfast' ? '🍳 Breakfast' : meal === 'Lunch' ? '🍲 Lunch' : '🍛 Dinner'}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>Loading poll details...</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Connecting to menu polling service</p>
        </div>
      ) : error ? (
        <div className="card" style={{ borderColor: 'var(--accent-red)', background: '#FEF2F2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-red)' }}>
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700 }}>Unable to load poll</div>
              <div style={{ fontSize: '0.85rem' }}>{error}</div>
            </div>
          </div>
          <button
            onClick={loadPolls}
            className="btn-primary"
            style={{ marginTop: '16px', padding: '6px 16px', fontSize: '0.82rem' }}
          >
            Retry
          </button>
        </div>
      ) : !currentPoll ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🍽️</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>No active poll for {activeMeal}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            The mess manager hasn't opened a poll for {activeMeal.toLowerCase()} right now. Please check back soon or explore other meals!
          </p>
        </div>
      ) : (
        <div className="review-grid">
          {/* Left Column: Poll & Voting Form */}
          <div className="card">
            {/* Poll Status & Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: currentPoll.status === 'active' ? 'var(--bg-sage-light)' : '#F1F5F9',
                      color: currentPoll.status === 'active' ? 'var(--primary-green)' : 'var(--text-muted)'
                    }}
                    data-testid="poll-status-badge"
                  >
                    ● {currentPoll.status === 'active' ? 'Voting Open' : 'Poll Closed'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Created by {currentPoll.created_by}
                  </span>
                </div>
                <h2 className="card-title" style={{ margin: 0, fontSize: '1.3rem' }} data-testid="poll-title">
                  {currentPoll.title}
                </h2>
              </div>

              {/* Deadline Indicator */}
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-soft-cream)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-muted)'
                }}
              >
                <span>⏰</span>
                <span>
                  {currentPoll.status === 'active' ? 'Deadline: ' : 'Closed on: '}
                  <strong>{formatDeadline(currentPoll.closes_at)}</strong>
                </span>
              </div>
            </div>

            {/* Success Banner */}
            {successMessage && (
              <div
                className="alert-box success"
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
                data-testid="vote-success-message"
              >
                {successMessage}
              </div>
            )}

            {/* Voted or Closed Info Banner */}
            {currentPoll.has_voted && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-sage-subtle)',
                  border: '1.5px solid var(--primary-border)',
                  color: 'var(--primary-green)',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                data-testid="already-voted-banner"
              >
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <div>
                  <strong>You have already voted in this poll.</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Your preference is locked in. Below are the current live vote standings!
                  </div>
                </div>
              </div>
            )}

            {currentPoll.status === 'closed' && !currentPoll.has_voted && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: '#FFFBEB',
                  border: '1.5px solid #FDE68A',
                  color: '#B45309',
                  fontSize: '0.88rem'
                }}
                data-testid="poll-closed-banner"
              >
                🔒 <strong>This poll is now closed.</strong> Voting has ended and final results are displayed below.
              </div>
            )}

            {/* Voting Form / Options List */}
            <form onSubmit={handleVoteSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {currentPoll.options.map((option) => {
                  const isSelected = selectedOptionId === option.option_id;
                  const isUserVote = currentPoll.voted_option_id === option.option_id;
                  const canSelect = currentPoll.status === 'active' && !currentPoll.has_voted;

                  return (
                    <label
                      key={option.option_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${
                          isUserVote
                            ? 'var(--primary-green)'
                            : isSelected
                            ? 'var(--accent-teal)'
                            : 'var(--border-light)'
                        }`,
                        background: isUserVote
                          ? 'var(--bg-sage-light)'
                          : isSelected
                          ? 'var(--bg-teal-subtle)'
                          : 'var(--bg-surface)',
                        cursor: canSelect ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      data-testid={`poll-option-${option.option_id}`}
                    >
                      {/* Radio button selection */}
                      <input
                        type="radio"
                        name="poll_selection"
                        value={option.option_id}
                        checked={isSelected || isUserVote}
                        onChange={() => canSelect && setSelectedOptionId(option.option_id)}
                        disabled={!canSelect}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: 'var(--primary-green)',
                          cursor: canSelect ? 'pointer' : 'default'
                        }}
                      />

                      {/* Food Image thumbnail if present */}
                      {option.image_url && (
                        <img
                          src={option.image_url}
                          alt={option.food_name}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-sm)',
                            objectFit: 'cover',
                            border: '1px solid var(--border-light)'
                          }}
                        />
                      )}

                      {/* Food Option Details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                            {option.food_name}
                          </span>
                          {isUserVote && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                background: 'var(--primary-green)',
                                color: '#fff',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontWeight: 700
                              }}
                            >
                              Your Choice ✓
                            </span>
                          )}
                        </div>

                        {/* Progress Bar (Visible if user voted or poll closed) */}
                        {(currentPoll.has_voted || currentPoll.status === 'closed') && (
                          <div style={{ marginTop: '8px' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.78rem',
                                color: 'var(--text-muted)',
                                marginBottom: '4px'
                              }}
                            >
                              <span>{option.votes_count} student votes</span>
                              <strong>{option.percentage}%</strong>
                            </div>
                            <div
                              style={{
                                width: '100%',
                                height: '8px',
                                background: '#E2E8F0',
                                borderRadius: '999px',
                                overflow: 'hidden'
                              }}
                            >
                              <div
                                style={{
                                  width: `${option.percentage}%`,
                                  height: '100%',
                                  background: isUserVote
                                    ? 'var(--primary-green)'
                                    : 'linear-gradient(90deg, #0D9488 0%, #10B981 100%)',
                                  borderRadius: '999px',
                                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Submit Vote Button */}
              {currentPoll.status === 'active' && !currentPoll.has_voted && (
                <button
                  type="submit"
                  disabled={!selectedOptionId || isSubmitting}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px 24px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    opacity: !selectedOptionId || isSubmitting ? 0.6 : 1,
                    cursor: !selectedOptionId || isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                  data-testid="submit-vote-btn"
                >
                  {isSubmitting ? 'Submitting Vote...' : 'Submit Vote 🗳️'}
                </button>
              )}
            </form>
          </div>

          {/* Right Column: Poll Analytics & Winner Highlight */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Participation Overview Card */}
            <div className="card" style={{ background: 'var(--bg-soft-cream)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--primary-green)' }}>
                📊 Poll Participation
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {currentPoll.total_votes}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Votes Cast</div>
                </div>

                <div style={{ background: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                    {currentPoll.participation_rate}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hostel Turnout</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Based on <strong>{currentPoll.eligible_voters || 120}</strong> eligible mess boarders across Hostel Blocks A, B, & C.
              </div>
            </div>

            {/* Winner / Standing Highlight Card */}
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
                🏆 {currentPoll.status === 'closed' ? 'Winning Choice' : 'Currently Leading'}
              </h3>

              {currentPoll.is_tie ? (
                <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: 700, fontSize: '0.9rem' }}>
                    <span>⚖️</span>
                    <span>Tied Result!</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#92400E', marginTop: '6px' }}>
                    The following options share the highest vote count ({currentPoll.winners[0]?.votes_count} votes each):
                  </p>
                  <ul style={{ paddingLeft: '20px', marginTop: '8px', fontSize: '0.82rem', color: '#78350F' }}>
                    {currentPoll.winners.map((w) => (
                      <li key={w.option_id} style={{ fontWeight: 600 }}>
                        {w.food_name} ({w.percentage}%)
                      </li>
                    ))}
                  </ul>
                </div>
              ) : currentPoll.winner ? (
                <div style={{ background: 'var(--bg-sage-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.6rem' }}>👑</span>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--primary-green)', fontSize: '1.05rem' }}>
                        {currentPoll.winner.food_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Leading with <strong>{currentPoll.winner.votes_count} votes</strong> ({currentPoll.winner.percentage}%)
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No votes cast yet. Be the first to cast your preference!
                </div>
              )}

              {/* Voting Guidelines Pill */}
              <div
                style={{
                  marginTop: '18px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}
              >
                🔒 <strong>Fair Voting System:</strong> Each student is allowed 1 vote per poll. Duplicate votes are strictly blocked by hostel ID constraints.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
