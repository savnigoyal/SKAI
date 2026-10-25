import React, { useState } from 'react';
import { DEMO_STUDENT, DEMO_TODAYS_MENU, DEMO_WEEKLY_MENU, DEMO_VOTING_OPTIONS } from '../services/mockData';

export default function StudentDashboardPreview({ onRateFoodClick }) {
  const [votes, setVotes] = useState(DEMO_VOTING_OPTIONS);
  const [selectedOption, setSelectedOption] = useState(2); // Aloo Paratha leading
  const [hasVoted, setHasVoted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'weekly' | 'voting' | 'profile'

  const handleVote = (e) => {
    e.preventDefault();
    setVotes(prev => prev.map(opt => opt.id === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt));
    setHasVoted(true);
  };

  return (
    <div className="student-dashboard-preview" data-testid="student-dashboard-preview">
      {/* Top Welcome Greeting */}
      <div className="top-header">
        <div className="module-header">
          <h1>Good Morning, {DEMO_STUDENT.student_name.split(' ')[0]}! ☀️</h1>
          <p>Hope you have a great day! Here is your mess schedule and updates.</p>
        </div>

        {/* Demo Data Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '4px 12px', borderRadius: '999px', fontWeight: 700 }}>
            Sample / Demo Data
          </span>
          <div className="profile-pill">
            <div className="avatar-circle">A</div>
            <div className="profile-info">
              <div className="profile-name">{DEMO_STUDENT.student_name}</div>
              <div className="profile-role">{DEMO_STUDENT.year}, {DEMO_STUDENT.hostel_block}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs matching Reference Design */}
      <div className="meal-tabs-container" style={{ marginBottom: '24px' }}>
        <button className={`meal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Dashboard Overview
        </button>
        <button className={`meal-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>
          Weekly Menu
        </button>
        <button className={`meal-tab-btn ${activeTab === 'voting' ? 'active' : ''}`} onClick={() => setActiveTab('voting')}>
          Vote for Menu
        </button>
        <button className={`meal-tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          My Profile
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Today's Menu Cards */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title" style={{ margin: 0 }}>Today's Menu</h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                📅 {DEMO_TODAYS_MENU.date}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              {['breakfast', 'lunch', 'dinner'].map((mealKey) => {
                const meal = DEMO_TODAYS_MENU[mealKey];
                return (
                  <div
                    key={mealKey}
                    style={{
                      background: 'var(--bg-soft-cream)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{ fontSize: '2rem' }}>{meal.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {meal.title}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                        {meal.items}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('weekly')}>
              <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>📅</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>View Weekly Menu</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Check upcoming meals for the week.</p>
              <div style={{ marginTop: '14px', color: 'var(--primary-green)', fontWeight: 700, fontSize: '0.85rem' }}>
                View schedule →
              </div>
            </div>

            <div className="card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('voting')}>
              <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>🗳️</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>Vote for Menu</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Let your voice be heard for next week's specials.</p>
              <div style={{ marginTop: '14px', color: 'var(--primary-green)', fontWeight: 700, fontSize: '0.85rem' }}>
                Cast vote →
              </div>
            </div>

            <div className="card" style={{ cursor: 'pointer', borderColor: 'var(--primary-border)', background: 'var(--bg-sage-subtle)' }} onClick={onRateFoodClick}>
              <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>⭐</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>Rate Today's Food</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Share your feedback to help us improve.</p>
              <div style={{ marginTop: '14px', color: 'var(--primary-green)', fontWeight: 700, fontSize: '0.85rem' }}>
                Open Review Form →
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. WEEKLY MENU TAB */}
      {activeTab === 'weekly' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 className="card-title" style={{ margin: 0 }}>Weekly Mess Menu</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Full schedule for 12 Aug – 18 Aug 2024</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-sage-light)', color: 'var(--primary-green)' }}>
                  <th style={{ padding: '12px 16px', borderRadius: '8px 0 0 8px' }}>Day</th>
                  <th style={{ padding: '12px 16px' }}>Breakfast</th>
                  <th style={{ padding: '12px 16px' }}>Lunch</th>
                  <th style={{ padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>Dinner</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_WEEKLY_MENU.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {item.day} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>({item.date})</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{item.breakfast}</td>
                    <td style={{ padding: '14px 16px' }}>{item.lunch}</td>
                    <td style={{ padding: '14px 16px' }}>{item.dinner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MENU VOTING TAB */}
      {activeTab === 'voting' && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '6px' }}>Vote for Next Week's Breakfast Special</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Voting closes on Sunday at 11:59 PM. Choose your top preference.
          </p>

          {hasVoted && (
            <div className="alert-box success" style={{ marginBottom: '20px' }}>
              <span>✓ Your vote has been recorded! Thank you for participating.</span>
            </div>
          )}

          <form onSubmit={handleVote}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {votes.map((option) => (
                <label
                  key={option.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${selectedOption === option.id ? 'var(--primary-green)' : 'var(--border-light)'}`,
                    background: selectedOption === option.id ? 'var(--bg-sage-subtle)' : 'var(--bg-surface)',
                    cursor: hasVoted ? 'default' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="menu_vote"
                    checked={selectedOption === option.id}
                    onChange={() => !hasVoted && setSelectedOption(option.id)}
                    disabled={hasVoted}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{option.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {option.votes} student votes {option.leading && '🔥 Leading'}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {!hasVoted && (
              <button type="submit" className="btn-primary">
                Submit Vote
              </button>
            )}
          </form>
        </div>
      )}

      {/* 4. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h2 className="card-title" style={{ marginBottom: '18px' }}>Student Profile</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div className="avatar-circle" style={{ width: '64px', height: '64px', fontSize: '1.8rem' }}>
              A
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{DEMO_STUDENT.student_name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{DEMO_STUDENT.year} • Computer Science</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-soft-cream)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Roll Number</span>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{DEMO_STUDENT.student_id}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</span>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{DEMO_STUDENT.email}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hostel Block</span>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{DEMO_STUDENT.hostel_block}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Room Number</span>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{DEMO_STUDENT.room_no}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
