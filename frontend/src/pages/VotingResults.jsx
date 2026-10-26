import React, { useState, useMemo } from 'react';
import {
  Vote,
  Trophy,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  RotateCcw,
  Plus,
  Flame,
  Check,
  ChevronRight
} from 'lucide-react';
import { DAYS_CONFIG, MEALS_CONFIG } from '../services/menuData';

export default function VotingResults({
  votingData,
  onCastVote,
  onApplyWinnerToMenu,
  onResetVotes,
  onAddCandidate,
  catalog,
}) {
  const [selectedDayFilter, setSelectedDayFilter] = useState('All');
  const [selectedMealFilter, setSelectedMealFilter] = useState('All');
  const [candidateModal, setCandidateModal] = useState(null); // { day, mealId }
  const [selectedDishToAdd, setSelectedDishToAdd] = useState('');
  const [justVotedId, setJustVotedId] = useState(null);

  // Compute aggregate metrics
  const stats = useMemo(() => {
    let totalVotes = 0;
    let highestVotedItem = { name: 'None', votes: 0, day: '', meal: '' };
    let pollCount = 0;
    let votesByMeal = { breakfast: 0, lunch: 0, highTea: 0, dinner: 0 };

    DAYS_CONFIG.forEach((day) => {
      if (votingData[day]) {
        Object.keys(votingData[day]).forEach((mealId) => {
          pollCount += 1;
          const items = votingData[day][mealId] || [];
          items.forEach((item) => {
            totalVotes += item.votes;
            votesByMeal[mealId] = (votesByMeal[mealId] || 0) + item.votes;
            if (item.votes > highestVotedItem.votes) {
              highestVotedItem = {
                name: item.name,
                votes: item.votes,
                day,
                meal: mealId,
              };
            }
          });
        });
      }
    });

    return { totalVotes, highestVotedItem, pollCount, votesByMeal };
  }, [votingData]);

  // Filtered poll groups to display
  const pollGroups = useMemo(() => {
    const list = [];
    const daysToShow = selectedDayFilter === 'All' ? DAYS_CONFIG : [selectedDayFilter];
    const mealsToShow = selectedMealFilter === 'All' ? MEALS_CONFIG.map((m) => m.id) : [selectedMealFilter];

    daysToShow.forEach((day) => {
      mealsToShow.forEach((mealId) => {
        const mealConfig = MEALS_CONFIG.find((m) => m.id === mealId) || MEALS_CONFIG[0];
        const rawItems = votingData[day]?.[mealId] || [];
        const totalSlotVotes = rawItems.reduce((acc, curr) => acc + curr.votes, 0);

        // Sort items by votes descending
        const sortedItems = [...rawItems].sort((a, b) => b.votes - a.votes);

        list.push({
          day,
          mealId,
          mealLabel: mealConfig.label,
          mealTime: mealConfig.time,
          mealIcon: mealConfig.icon,
          mealTone: mealConfig.tone,
          items: sortedItems,
          totalVotes: totalSlotVotes,
          winner: sortedItems.length > 0 ? sortedItems[0] : null,
        });
      });
    });

    return list;
  }, [votingData, selectedDayFilter, selectedMealFilter]);

  const handleVoteClick = (day, mealId, itemId) => {
    onCastVote(day, mealId, itemId);
    setJustVotedId(itemId);
    setTimeout(() => setJustVotedId(null), 1800);
  };

  const handleAddCandidateConfirm = () => {
    if (!candidateModal || !selectedDishToAdd) return;
    onAddCandidate(candidateModal.day, candidateModal.mealId, selectedDishToAdd);
    setCandidateModal(null);
    setSelectedDishToAdd('');
  };

  const exportReport = () => {
    const summary = [];
    summary.push(['Day', 'Meal Slot', 'Rank', 'Dish Name', 'Student Votes', 'Vote Share %'].join(','));
    DAYS_CONFIG.forEach((d) => {
      MEALS_CONFIG.forEach((m) => {
        const items = votingData[d]?.[m.id] || [];
        const total = items.reduce((sum, i) => sum + i.votes, 0);
        items.forEach((it, idx) => {
          const pct = total > 0 ? Math.round((it.votes / total) * 100) : 0;
          summary.push([d, m.label, idx + 1, `"${it.name}"`, it.votes, `${pct}%`].join(','));
        });
      });
    });

    const blob = new Blob([summary.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SKAI_Student_Voting_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="voting-results-page" style={{ paddingBottom: '60px' }}>
      {/* Top Heading */}
      <section className="page-heading" style={{ marginBottom: '20px' }}>
        <div>
          <div className="eyebrow" style={{ color: '#2f785b' }}>STUDENT OPINION POLLS</div>
          <h1>Student Menu Voting Results</h1>
          <p>
            Detailed tally of student votes for every food item, categorized by day of the week and meal time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="button button-secondary"
            onClick={exportReport}
            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Download CSV breakdown of all student voting data"
          >
            <Download size={14} /> Export Report
          </button>
          <button
            className="button button-secondary"
            onClick={onResetVotes}
            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Reset votes to balanced benchmark data"
          >
            <RotateCcw size={14} /> Reset Benchmarks
          </button>
        </div>
      </section>

      {/* KPI Overview Summary Cards */}
      <section className="summary-grid" style={{ marginBottom: '24px' }}>
        <article className="summary-card">
          <span className="summary-icon green"><Vote size={18} /></span>
          <div className="summary-copy">
            <span>Total Student Votes Cast</span>
            <strong>{stats.totalVotes.toLocaleString()}</strong>
            <small>Across active week polls</small>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon amber"><Trophy size={18} /></span>
          <div className="summary-copy">
            <span>Campus #1 Favorite</span>
            <strong style={{ fontSize: '15px' }}>{stats.highestVotedItem.name}</strong>
            <small>
              {stats.highestVotedItem.votes} votes ({stats.highestVotedItem.day})
            </small>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon sage"><Users size={18} /></span>
          <div className="summary-copy">
            <span>Student Participation</span>
            <strong>86.4%</strong>
            <small>High voter turnout</small>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon green"><CheckCircle2 size={18} /></span>
          <div className="summary-copy">
            <span>Meal Slots Covered</span>
            <strong>{stats.pollCount} Sessions</strong>
            <small>Mon – Sun polls open</small>
          </div>
        </article>
      </section>

      {/* Filter Toolbar */}
      <div className="menu-section" style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Day Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#74867c', minWidth: '75px' }}>
              SELECT DAY:
            </span>
            <button
              onClick={() => setSelectedDayFilter('All')}
              className={`pill-filter-btn ${selectedDayFilter === 'All' ? 'active' : ''}`}
            >
              All 7 Days
            </button>
            {DAYS_CONFIG.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDayFilter(day)}
                className={`pill-filter-btn ${selectedDayFilter === day ? 'active' : ''}`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Meal Time Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #edf0eb' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#74867c', minWidth: '75px' }}>
              MEAL TIME:
            </span>
            <button
              onClick={() => setSelectedMealFilter('All')}
              className={`pill-filter-btn ${selectedMealFilter === 'All' ? 'active' : ''}`}
            >
              All Meal Times
            </button>
            {MEALS_CONFIG.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMealFilter(m.id)}
                className={`pill-filter-btn ${selectedMealFilter === m.id ? 'active' : ''}`}
              >
                <span style={{ marginRight: '4px' }}>{m.icon}</span>
                {m.label} ({m.time})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Poll Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '18px' }}>
        {pollGroups.map((group) => {
          return (
            <div
              key={`${group.day}-${group.mealId}`}
              style={{
                background: '#ffffff',
                border: '1px solid #e5eae2',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(21, 61, 50, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Header row for Day & Meal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: '#eff5ed',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '1.3rem',
                      }}
                    >
                      {group.mealIcon}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#273c31' }}>
                          {group.day} — {group.mealLabel}
                        </h3>
                      </div>
                      <span style={{ fontSize: '10px', color: '#88988e' }}>
                        Time: {group.mealTime} • {group.totalVotes} total student votes
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      background: '#eaf4eb',
                      color: '#2f785b',
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      border: '1px solid #c9decb',
                    }}
                  >
                    Active Poll
                  </span>
                </div>

                {/* Items & Votes Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
                  {group.items.map((item, index) => {
                    const percentage = group.totalVotes > 0 ? Math.round((item.votes / group.totalVotes) * 100) : 0;
                    const isWinner = index === 0 && item.votes > 0;
                    const isJustVoted = justVotedId === item.id;

                    return (
                      <div
                        key={item.id}
                        style={{
                          background: isWinner ? '#f8fbf8' : '#fcfdfb',
                          border: `1.5px solid ${isWinner ? '#a9d4b6' : '#eaf0e8'}`,
                          borderRadius: '8px',
                          padding: '12px 14px',
                          transition: 'all 0.2s ease',
                          transform: isJustVoted ? 'scale(1.02)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: isWinner ? '#2f785b' : '#e0e7df',
                                color: isWinner ? '#ffffff' : '#5b6d61',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: '10px',
                                fontWeight: 700,
                              }}
                            >
                              {index + 1}
                            </span>
                            <strong style={{ fontSize: '12px', color: '#273b30' }}>{item.name}</strong>
                            {isWinner && (
                              <span
                                style={{
                                  background: '#FEF3C7',
                                  color: '#B45309',
                                  fontSize: '8.5px',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: '999px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                🏆 Leading Choice
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#273b30' }}>
                              {item.votes} <span style={{ fontSize: '9px', fontWeight: 500, color: '#798b80' }}>votes</span>
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: isWinner ? '#2f785b' : '#697a70',
                                minWidth: '36px',
                                textAlign: 'right',
                              }}
                            >
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div
                          style={{
                            height: '7px',
                            background: '#e9ede7',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            marginBottom: '6px',
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: '100%',
                              background: isWinner
                                ? 'linear-gradient(90deg, #2f785b, #559f7e)'
                                : '#8ea797',
                              borderRadius: '999px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>

                        {/* Bottom Row: Quick student vote simulate & indicator */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '8.5px', color: '#88988e' }}>
                            {item.votes} students chose this dish
                          </span>
                          <button
                            onClick={() => handleVoteClick(group.day, group.mealId, item.id)}
                            style={{
                              border: '1px solid #d4ded3',
                              background: '#ffffff',
                              color: '#2f785b',
                              fontSize: '9px',
                              fontWeight: 600,
                              borderRadius: '4px',
                              padding: '2px 8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Simulate casting a student vote for this food item"
                          >
                            <Vote size={11} /> Vote (+1)
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {group.items.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#88988e', fontSize: '11px' }}>
                      No dishes added to this poll yet. Add candidate items below.
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Mess Manager Action to apply winning food to Weekly Schedule */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '14px',
                  borderTop: '1px solid #edf0eb',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {group.winner ? (
                  <button
                    className="button button-primary"
                    style={{
                      flex: 1,
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                    onClick={() => onApplyWinnerToMenu(group.day, group.mealId, group.winner)}
                    title={`Adopt the winning choice (${group.winner.name}) into ${group.day}'s official Weekly Menu`}
                  >
                    <Check size={14} /> Apply "{group.winner.name}" to Weekly Menu
                  </button>
                ) : (
                  <div style={{ flex: 1, fontSize: '10px', color: '#88988e' }}>Waiting for candidates...</div>
                )}

                <button
                  className="button button-secondary"
                  style={{
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderColor: '#d6dfd5',
                  }}
                  onClick={() => {
                    setCandidateModal({ day: group.day, mealId: group.mealId });
                    setSelectedDishToAdd('');
                  }}
                  title="Add another dish from the catalog to this poll"
                >
                  <Plus size={13} /> Add Option
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Candidate Option to a Poll */}
      {candidateModal && (
        <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setCandidateModal(null)}>
          <section className="confirm-dialog" role="dialog" aria-modal="true" style={{ maxWidth: '460px' }}>
            <div className="confirm-icon" style={{ background: '#eaf4eb', color: '#2f785b' }}>
              <Vote size={22} />
            </div>
            <h2 style={{ fontSize: '18px', marginTop: '12px' }}>
              Add Dish to {candidateModal.day} {candidateModal.mealId} Poll
            </h2>
            <p style={{ fontSize: '11px', color: '#68776f', margin: '6px 0 16px' }}>
              Choose a dish from the authentic menu catalog to put up for voting.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: '#4a5d51' }}>
                Select Dish:
                <select
                  value={selectedDishToAdd}
                  onChange={(e) => setSelectedDishToAdd(e.target.value)}
                  style={{ width: '100%', height: '36px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cfd9cd', padding: '0 10px', fontSize: '11px' }}
                >
                  <option value="">-- Choose a dish from catalog --</option>
                  {(catalog[candidateModal.mealId] || []).map((dish) => (
                    <option key={dish.id} value={dish.name}>
                      {dish.icon} {dish.name} ({dish.category})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="confirm-actions">
              <button className="button button-secondary" onClick={() => setCandidateModal(null)}>
                Cancel
              </button>
              <button
                className="button button-primary"
                disabled={!selectedDishToAdd}
                onClick={handleAddCandidateConfirm}
              >
                Add to Ballot
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
