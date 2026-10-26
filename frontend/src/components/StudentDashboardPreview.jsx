import React, { useState } from 'react';
import { DEMO_STUDENT } from '../services/mockData';
import { DAYS_CONFIG, MEALS_CONFIG, generateFullWeekSchedule } from '../services/menuData';
import { Vote, Trophy, CheckCircle2, Calendar, Coffee, Utensils, Clock3 } from 'lucide-react';

export default function StudentDashboardPreview({
  onRateFoodClick,
  votingData,
  onCastVote,
  onNavigateToVoting,
  currentWeekMenu,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'weekly' | 'voting' | 'profile'
  const [selectedVoteDay, setSelectedVoteDay] = useState('Monday');
  const [selectedVoteMeal, setSelectedVoteMeal] = useState('breakfast');
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [userVotedSlots, setUserVotedSlots] = useState({}); // { 'Monday-breakfast': itemId }

  // Current candidates for selected Day and Meal
  const currentSlotKey = `${selectedVoteDay}-${selectedVoteMeal}`;
  const candidates = votingData?.[selectedVoteDay]?.[selectedVoteMeal] || [];
  const totalVotesInSlot = candidates.reduce((sum, item) => sum + item.votes, 0);
  const hasVotedThisSlot = Boolean(userVotedSlots[currentSlotKey]);

  const handleVoteSubmit = (e) => {
    e.preventDefault();
    if (!selectedOptionId || hasVotedThisSlot) return;

    if (onCastVote) {
      onCastVote(selectedVoteDay, selectedVoteMeal, selectedOptionId);
    }
    setUserVotedSlots((prev) => ({ ...prev, [currentSlotKey]: selectedOptionId }));
  };

  // 7-day schedule for table
  const fullWeekDays = currentWeekMenu?.days || generateFullWeekSchedule();

  return (
    <div className="student-dashboard-preview" data-testid="student-dashboard-preview">
      {/* Top Welcome Greeting */}
      <div className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="module-header">
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 6px', color: '#1f3529' }}>Good Morning, {DEMO_STUDENT.student_name.split(' ')[0]}! ☀️</h1>
          <p style={{ margin: 0, color: '#68776f', fontSize: '12px' }}>Welcome to SKAI Mess Portal. Check upcoming meals, vote for next specials, or review food.</p>
        </div>

        {/* Demo Data Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '4px 12px', borderRadius: '999px', fontWeight: 700 }}>
            Student Portal
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

      {/* Navigation Sub-tabs */}
      <div className="meal-tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #e2e8e0', paddingBottom: '12px' }}>
        <button className={`pill-filter-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Dashboard Overview
        </button>
        <button className={`pill-filter-btn ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>
          📅 Weekly Menu
        </button>
        <button className={`pill-filter-btn ${activeTab === 'voting' ? 'active' : ''}`} onClick={() => setActiveTab('voting')}>
          🗳️ Vote for Menu
        </button>
        <button className={`pill-filter-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          👤 My Profile
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Today's Menu Cards */}
          <div className="card" style={{ marginBottom: '24px', background: '#fff', border: '1px solid #e6eae3', borderRadius: '9px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title" style={{ margin: 0, fontSize: '17px', color: '#273b30' }}>Today's Planned Meals (Monday)</h2>
              <span style={{ fontSize: '0.82rem', color: '#2f785b', fontWeight: 600 }}>
                📅 Live Mess Service
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {MEALS_CONFIG.map((m) => {
                const dayMeal = fullWeekDays?.Monday?.[m.id];
                const itemsList = dayMeal
                  ? dayMeal.flatMap((cat) => cat.items.map((it) => it.name)).slice(0, 3).join(', ')
                  : 'Menu planned';

                return (
                  <div
                    key={m.id}
                    style={{
                      background: '#f9faf7',
                      border: '1px solid #e5eae2',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', background: '#eef5ec', width: '44px', height: '44px', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
                      {m.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7a8c81', fontWeight: 700 }}>
                        {m.label} ({m.time})
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 650, color: '#273b30', marginTop: '3px' }}>
                        {itemsList}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div
              className="card"
              style={{ cursor: 'pointer', background: '#fff', border: '1px solid #e6eae3', borderRadius: '9px', padding: '18px' }}
              onClick={() => setActiveTab('weekly')}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📅</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px', color: '#273b30' }}>View Weekly Menu</h3>
              <p style={{ fontSize: '0.8rem', color: '#6d7c73', margin: 0 }}>Check upcoming breakfast, lunch, high tea, and dinner.</p>
              <div style={{ marginTop: '12px', color: '#2f785b', fontWeight: 700, fontSize: '0.82rem' }}>
                Open schedule →
              </div>
            </div>

            <div
              className="card"
              style={{ cursor: 'pointer', background: '#fff', border: '1px solid #e6eae3', borderRadius: '9px', padding: '18px' }}
              onClick={() => setActiveTab('voting')}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🗳️</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px', color: '#273b30' }}>Vote for Menu Items</h3>
              <p style={{ fontSize: '0.8rem', color: '#6d7c73', margin: 0 }}>Cast your vote for everyday meal favorites.</p>
              <div style={{ marginTop: '12px', color: '#2f785b', fontWeight: 700, fontSize: '0.82rem' }}>
                Cast vote now →
              </div>
            </div>

            <div
              className="card"
              style={{ cursor: 'pointer', background: '#eff6ef', border: '1.5px solid #a9d4b6', borderRadius: '9px', padding: '18px' }}
              onClick={onRateFoodClick}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⭐</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px', color: '#1e4835' }}>Rate Today's Food</h3>
              <p style={{ fontSize: '0.8rem', color: '#4a6756', margin: 0 }}>Share feedback and rating for today's mess food.</p>
              <div style={{ marginTop: '12px', color: '#1e4835', fontWeight: 700, fontSize: '0.82rem' }}>
                Open review form →
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. WEEKLY MENU TAB */}
      {activeTab === 'weekly' && (
        <div className="card" style={{ background: '#fff', border: '1px solid #e6eae3', borderRadius: '9px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 className="card-title" style={{ margin: 0, fontSize: '18px', color: '#273b30' }}>Full Weekly Mess Schedule</h2>
              <p style={{ fontSize: '0.82rem', color: '#7a8c81', margin: '4px 0 0' }}>All 7 days across Breakfast, Lunch, High Tea, and Dinner</p>
            </div>
            <button
              onClick={() => setActiveTab('voting')}
              className="button button-primary"
              style={{ fontSize: '11px' }}
            >
              Vote for Menu Specials →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#eff5ed', color: '#2f785b' }}>
                  <th style={{ padding: '12px 14px', borderRadius: '6px 0 0 6px', width: '12%' }}>Day</th>
                  <th style={{ padding: '12px 14px', width: '22%' }}>🍳 Breakfast</th>
                  <th style={{ padding: '12px 14px', width: '24%' }}>🍛 Lunch</th>
                  <th style={{ padding: '12px 14px', width: '18%' }}>☕ High Tea</th>
                  <th style={{ padding: '12px 14px', borderRadius: '0 6px 6px 0', width: '24%' }}>🍽️ Dinner</th>
                </tr>
              </thead>
              <tbody>
                {DAYS_CONFIG.map((day) => {
                  const dayData = fullWeekDays[day] || {};
                  const getMealText = (mealId) => {
                    const categories = dayData[mealId] || [];
                    const names = categories.flatMap((c) => c.items.map((i) => i.name)).filter(Boolean);
                    return names.slice(0, 3).join(', ') || 'Planned';
                  };

                  return (
                    <tr key={day} style={{ borderBottom: '1px solid #edf1eb' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2b3f33' }}>{day}</td>
                      <td style={{ padding: '12px 14px', color: '#44564c' }}>{getMealText('breakfast')}</td>
                      <td style={{ padding: '12px 14px', color: '#44564c' }}>{getMealText('lunch')}</td>
                      <td style={{ padding: '12px 14px', color: '#44564c' }}>{getMealText('highTea')}</td>
                      <td style={{ padding: '12px 14px', color: '#44564c' }}>{getMealText('dinner')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MENU VOTING TAB */}
      {activeTab === 'voting' && (
        <div className="card" style={{ background: '#fff', border: '1px solid #e6eae3', borderRadius: '9px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-title" style={{ margin: '0 0 4px', fontSize: '18px', color: '#273b30' }}>
                Vote for Menu Dishes
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#7a8c81', margin: 0 }}>
                Pick a day and meal time below to choose your favorite dish. Your votes decide next week's menu!
              </p>
            </div>

            {onNavigateToVoting && (
              <button
                className="button button-secondary"
                onClick={onNavigateToVoting}
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Trophy size={14} style={{ color: '#b45309' }} /> View Live Results Board →
              </button>
            )}
          </div>

          {/* Day Selector Pills */}
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#7a8c81', display: 'block', marginBottom: '6px' }}>
              STEP 1: SELECT DAY OF WEEK
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DAYS_CONFIG.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setSelectedVoteDay(day);
                    setSelectedOptionId(null);
                  }}
                  className={`pill-filter-btn ${selectedVoteDay === day ? 'active' : ''}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Selector Pills */}
          <div style={{ marginBottom: '22px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#7a8c81', display: 'block', marginBottom: '6px' }}>
              STEP 2: SELECT MEAL TIME
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {MEALS_CONFIG.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedVoteMeal(m.id);
                    setSelectedOptionId(null);
                  }}
                  className={`pill-filter-btn ${selectedVoteMeal === m.id ? 'active' : ''}`}
                >
                  <span style={{ marginRight: '4px' }}>{m.icon}</span>
                  {m.label} ({m.time})
                </button>
              ))}
            </div>
          </div>

          {/* Voting Box */}
          <div style={{ background: '#fafbf9', border: '1px solid #e7ebe4', borderRadius: '8px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {MEALS_CONFIG.find((m) => m.id === selectedVoteMeal)?.icon}
                </span>
                <strong style={{ fontSize: '13px', color: '#273b30' }}>
                  {selectedVoteDay} — {MEALS_CONFIG.find((m) => m.id === selectedVoteMeal)?.label} Ballot
                </strong>
              </div>
              <span style={{ fontSize: '11px', color: '#798b80', fontWeight: 600 }}>
                {totalVotesInSlot} total votes cast
              </span>
            </div>

            {hasVotedThisSlot && (
              <div
                style={{
                  background: '#eaf4eb',
                  border: '1px solid #c8decb',
                  color: '#286348',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Your vote for this meal slot has been recorded! Thank you for participating.</span>
              </div>
            )}

            <form onSubmit={handleVoteSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                {candidates.map((option) => {
                  const percentage = totalVotesInSlot > 0 ? Math.round((option.votes / totalVotesInSlot) * 100) : 0;
                  const isSelected = selectedOptionId === option.id;

                  return (
                    <label
                      key={option.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '14px 16px',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? '#2f785b' : '#e0e7df'}`,
                        background: isSelected ? '#eff6ef' : '#ffffff',
                        cursor: hasVotedThisSlot ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="radio"
                          name="student_menu_vote"
                          value={option.id}
                          checked={isSelected || userVotedSlots[currentSlotKey] === option.id}
                          onChange={() => !hasVotedThisSlot && setSelectedOptionId(option.id)}
                          disabled={hasVotedThisSlot}
                          style={{ accentColor: '#2f785b', width: '16px', height: '16px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#273b30' }}>
                            {option.name}
                          </div>
                          <div style={{ fontSize: '10px', color: '#7a8c81', marginTop: '2px' }}>
                            {option.votes} student votes {option.leading && '🔥 Leading'}
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#2f785b' }}>
                          {percentage}%
                        </span>
                      </div>

                      {/* Vote Share mini-bar */}
                      <div style={{ height: '5px', background: '#e9eee8', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: option.leading ? '#2f785b' : '#8ea797',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </label>
                  );
                })}

                {candidates.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#88988e', fontSize: '12px', gridColumn: '1 / -1' }}>
                    No dishes are open for voting for this meal slot yet.
                  </div>
                )}
              </div>

              {!hasVotedThisSlot && candidates.length > 0 && (
                <button
                  type="submit"
                  disabled={!selectedOptionId}
                  className="button button-primary"
                  style={{
                    padding: '9px 20px',
                    fontSize: '11.5px',
                    opacity: selectedOptionId ? 1 : 0.6,
                    cursor: selectedOptionId ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Vote size={15} /> Submit My Vote
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 4. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: '600px', background: '#fff', border: '1px solid #e6eae3', borderRadius: '9px', padding: '24px' }}>
          <h2 className="card-title" style={{ marginBottom: '18px', fontSize: '18px', color: '#273b30' }}>Student Profile</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div className="avatar-circle" style={{ width: '60px', height: '60px', fontSize: '1.6rem', background: '#2f785b', color: '#fff', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
              A
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px', color: '#273b30' }}>{DEMO_STUDENT.student_name}</h3>
              <p style={{ color: '#7a8c81', fontSize: '0.85rem', margin: 0 }}>{DEMO_STUDENT.year} • Computer Science</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8faf7', padding: '18px', borderRadius: '8px', border: '1px solid #e9ede7' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#7a8c81', fontWeight: 600 }}>Roll Number</span>
              <div style={{ fontWeight: 700, marginTop: '2px', color: '#273b30' }}>{DEMO_STUDENT.student_id}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#7a8c81', fontWeight: 600 }}>Email Address</span>
              <div style={{ fontWeight: 700, marginTop: '2px', color: '#273b30' }}>{DEMO_STUDENT.email}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#7a8c81', fontWeight: 600 }}>Hostel Block</span>
              <div style={{ fontWeight: 700, marginTop: '2px', color: '#273b30' }}>{DEMO_STUDENT.hostel_block}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#7a8c81', fontWeight: 600 }}>Room Number</span>
              <div style={{ fontWeight: 700, marginTop: '2px', color: '#273b30' }}>{DEMO_STUDENT.room_no}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
