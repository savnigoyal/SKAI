import React, { useState, useEffect } from 'react';
import {
  fetchPolls,
  createPoll,
  updatePollStatus,
  deletePoll
} from '../services/pollService';

export default function ManagerPolls({ isDemoMode = true }) {
  const [activeMeal, setActiveMeal] = useState('Breakfast');
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // New Poll Form State
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollMeal, setNewPollMeal] = useState('Breakfast');
  const [newPollOpens, setNewPollOpens] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
  });
  const [newPollCloses, setNewPollCloses] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 16);
  });
  const [newOptions, setNewOptions] = useState([
    { food_name: '', image_url: '' },
    { food_name: '', image_url: '' }
  ]);

  useEffect(() => {
    loadPolls();
  }, [activeMeal, isDemoMode]);

  async function loadPolls() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPolls({
        meal_type: activeMeal,
        isDemoMode
      });
      setPolls(data.polls || []);
    } catch (err) {
      console.error('Error fetching manager polls:', err);
      setError(err.message || 'Failed to load manager polls');
    } finally {
      setLoading(false);
    }
  }

  const handleAddOptionField = () => {
    setNewOptions(prev => [...prev, { food_name: '', image_url: '' }]);
  };

  const handleRemoveOptionField = (index) => {
    if (newOptions.length <= 2) {
      alert('A poll must have at least 2 food options.');
      return;
    }
    setNewOptions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index, field, value) => {
    setNewOptions(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!newPollTitle.trim()) {
      alert('Please provide a poll title.');
      return;
    }

    const filledOptions = newOptions.filter(o => o.food_name.trim().length > 0);
    if (filledOptions.length < 2) {
      alert('Please provide at least 2 food options with valid names.');
      return;
    }

    if (new Date(newPollOpens) >= new Date(newPollCloses)) {
      alert('Closing date/time must be strictly after the opening date/time.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createPoll({
        title: newPollTitle.trim(),
        meal_type: newPollMeal,
        opens_at: newPollOpens,
        closes_at: newPollCloses,
        options: filledOptions,
        created_by: 'Mess Manager'
      }, { isDemoMode });

      setActionMessage('✓ New poll published successfully!');
      setShowCreateModal(false);
      // Reset form
      setNewPollTitle('');
      setNewOptions([
        { food_name: '', image_url: '' },
        { food_name: '', image_url: '' }
      ]);
      await loadPolls();
    } catch (err) {
      alert(err.message || 'Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (pollId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await updatePollStatus(pollId, nextStatus, { isDemoMode });
      setActionMessage(`✓ Poll marked as ${nextStatus}!`);
      await loadPolls();
    } catch (err) {
      alert(err.message || 'Failed to update poll status');
    }
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll and all its cast votes?')) {
      return;
    }
    try {
      await deletePoll(pollId, { isDemoMode });
      setActionMessage('✓ Poll deleted successfully.');
      await loadPolls();
    } catch (err) {
      alert(err.message || 'Failed to delete poll');
    }
  };

  return (
    <div className="manager-polls-page" data-testid="manager-polls-page">
      {/* Top Header */}
      <div className="top-header">
        <div className="module-header">
          <h1>Menu Poll Management 📋</h1>
          <p>Create food polls, set voting windows, and review student meal preference results.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              setNewPollMeal(activeMeal);
              setShowCreateModal(true);
            }}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
            data-testid="create-poll-btn"
          >
            <span>+</span>
            <span>Create New Poll</span>
          </button>

          <div className="profile-pill">
            <div className="avatar-circle" style={{ background: '#0284C7' }}>M</div>
            <div className="profile-info">
              <div className="profile-name">Mess Manager</div>
              <div className="profile-role">Admin Staff</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className="alert-box success"
          style={{
            marginBottom: '20px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Meal Selection Tabs */}
      <div className="meal-tabs-container" role="tablist">
        {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
          <button
            key={meal}
            role="tab"
            aria-selected={activeMeal === meal}
            className={`meal-tab-btn ${activeMeal === meal ? 'active' : ''}`}
            onClick={() => setActiveMeal(meal)}
            data-testid={`manager-poll-tab-${meal.toLowerCase()}`}
          >
            {meal === 'Breakfast' ? '🍳 Breakfast Polls' : meal === 'Lunch' ? '🍲 Lunch Polls' : '🍛 Dinner Polls'}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Loading polls for {activeMeal}...</div>
        </div>
      ) : error ? (
        <div className="card" style={{ borderColor: 'var(--accent-red)', background: '#FEF2F2' }}>
          <div style={{ color: 'var(--accent-red)', fontWeight: 700 }}>⚠️ {error}</div>
        </div>
      ) : polls.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🗳️</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>No polls created for {activeMeal}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px', marginBottom: '20px' }}>
            Get student feedback on upcoming menus by publishing a new poll with food options.
          </p>
          <button
            onClick={() => {
              setNewPollMeal(activeMeal);
              setShowCreateModal(true);
            }}
            className="btn-primary"
            style={{ padding: '8px 20px' }}
          >
            + Create First Poll
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {polls.map((poll) => {
            return (
              <div key={poll.poll_id} className="card" data-testid={`manager-poll-card-${poll.poll_id}`}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: poll.status === 'active' ? 'var(--bg-sage-light)' : '#F1F5F9',
                          color: poll.status === 'active' ? 'var(--primary-green)' : 'var(--text-muted)'
                        }}
                      >
                        ● {poll.status === 'active' ? 'Active Poll' : 'Closed Poll'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Opens: {new Date(poll.opens_at).toLocaleDateString()} • Closes: {new Date(poll.closes_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {poll.title}
                    </h2>
                  </div>

                  {/* Actions (Close/Reopen, Delete) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleStatus(poll.poll_id, poll.status)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                      data-testid={`toggle-status-btn-${poll.poll_id}`}
                    >
                      {poll.status === 'active' ? '🔒 Close Poll' : '🔓 Reopen Poll'}
                    </button>
                    <button
                      onClick={() => handleDelete(poll.poll_id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #FCA5A5',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                      data-testid={`delete-poll-btn-${poll.poll_id}`}
                      title="Delete poll"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Participation stats banner */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                    padding: '14px 18px',
                    background: 'var(--bg-soft-cream)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Votes Cast</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {poll.total_votes}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Eligible Voters</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {poll.eligible_voters || 120} students
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Turnout Rate</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                      {poll.participation_rate}%
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Current Winner / Standing</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-green)', marginTop: '2px' }}>
                      {poll.is_tie ? '⚖️ Tie between top dishes' : poll.winner ? `🏆 ${poll.winner.food_name}` : 'No votes yet'}
                    </div>
                  </div>
                </div>

                {/* Food Options breakdown */}
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Options & Live Vote Tally
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {poll.options.map((option) => {
                    const isWinner = poll.winner && poll.winner.option_id === option.option_id;
                    const isTied = poll.is_tie && poll.winners?.some(w => w.option_id === option.option_id);

                    return (
                      <div
                        key={option.option_id}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${isWinner ? 'var(--primary-green)' : 'var(--border-light)'}`,
                          background: isWinner ? 'var(--bg-sage-subtle)' : 'var(--bg-surface)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {option.image_url && (
                              <img
                                src={option.image_url}
                                alt={option.food_name}
                                style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                              />
                            )}
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {option.food_name}
                            </span>
                            {isWinner && (
                              <span style={{ fontSize: '0.72rem', background: 'var(--primary-green)', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                                👑 Leading / Winner
                              </span>
                            )}
                            {isTied && (
                              <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                                ⚖️ Tied Leader
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {option.votes_count} votes <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({option.percentage}%)</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${option.percentage}%`,
                              height: '100%',
                              background: isWinner
                                ? 'var(--primary-green)'
                                : 'linear-gradient(90deg, #0D9488 0%, #10B981 100%)',
                              borderRadius: '999px'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE POLL MODAL */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          data-testid="create-poll-modal"
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Create New Menu Poll</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePoll}>
              {/* Poll Title */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Poll Title *
                </label>
                <input
                  type="text"
                  value={newPollTitle}
                  onChange={(e) => setNewPollTitle(e.target.value)}
                  placeholder="e.g., Vote for Next Sunday's Special Breakfast"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-light)',
                    fontSize: '0.9rem'
                  }}
                  data-testid="input-poll-title"
                />
              </div>

              {/* Meal Type */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Meal Category *
                </label>
                <select
                  value={newPollMeal}
                  onChange={(e) => setNewPollMeal(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-light)',
                    fontSize: '0.9rem',
                    background: '#fff'
                  }}
                  data-testid="select-poll-meal"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              {/* Date Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Opens At *
                  </label>
                  <input
                    type="datetime-local"
                    value={newPollOpens}
                    onChange={(e) => setNewPollOpens(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-light)',
                      fontSize: '0.85rem'
                    }}
                    data-testid="input-poll-opens"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Closes At *
                  </label>
                  <input
                    type="datetime-local"
                    value={newPollCloses}
                    onChange={(e) => setNewPollCloses(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-light)',
                      fontSize: '0.85rem'
                    }}
                    data-testid="input-poll-closes"
                  />
                </div>
              </div>

              {/* Dynamic Options List */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    Food Dish Options (Minimum 2) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOptionField}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-green)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Another Option
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {newOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--bg-soft-cream)',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        placeholder="Food / Dish Name (e.g., Paneer Butter Masala)"
                        value={opt.food_name}
                        onChange={(e) => handleOptionChange(idx, 'food_name', e.target.value)}
                        required
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)',
                          fontSize: '0.85rem'
                        }}
                        data-testid={`input-option-name-${idx}`}
                      />
                      <input
                        type="url"
                        placeholder="Image URL (optional)"
                        value={opt.image_url}
                        onChange={(e) => handleOptionChange(idx, 'image_url', e.target.value)}
                        style={{
                          width: '160px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)',
                          fontSize: '0.82rem'
                        }}
                      />
                      {newOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionField(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            fontSize: '1rem'
                          }}
                          title="Remove option"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-surface)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.88rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: '0.88rem' }}
                  data-testid="submit-create-poll-btn"
                >
                  {isSubmitting ? 'Publishing Poll...' : 'Publish Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
