import React, { useState, useEffect, useCallback } from 'react';
import StarRating from '../components/StarRating';
import {
  fetchAnalyticsSummary,
  fetchRatingTrends,
  fetchMealComparison,
  fetchRecentFeedback,
  fetchQualityAlerts
} from '../services/reviewService';
import {
  DEMO_REVIEWS,
  calculateDemoAnalytics,
  calculateDemoMealComparison
} from '../services/mockData';

export default function QualityAnalytics({ isDemoMode = false }) {
  // Filter state: '7', '30', or 'custom'
  const [filterType, setFilterType] = useState('7');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ days: 7 });

  // Data states
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [mealComparison, setMealComparison] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallbackDemo, setUsingFallbackDemo] = useState(false);

  // Apply preset filter
  const handlePresetChange = (days) => {
    setFilterType(String(days));
    setAppliedFilters({ days });
  };

  // Apply custom date range
  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      setError('Please select both a start date and an end date.');
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setError('Start date cannot be after end date.');
      return;
    }
    setError(null);
    setAppliedFilters({ startDate: customStart, endDate: customEnd });
  };

  // Filter demo reviews locally based on appliedFilters
  const getFilteredDemoData = useCallback(() => {
    let filtered = [...DEMO_REVIEWS];
    if (appliedFilters.days === 7) {
      filtered = DEMO_REVIEWS.slice(0, 26); // last 7 days
    } else if (appliedFilters.days === 30) {
      filtered = DEMO_REVIEWS; // full 30 days
    } else if (appliedFilters.startDate && appliedFilters.endDate) {
      filtered = DEMO_REVIEWS.filter(r => r.review_date >= appliedFilters.startDate && r.review_date <= appliedFilters.endDate);
    }

    const calculatedSummary = calculateDemoAnalytics(filtered);
    const calculatedMeals = calculateDemoMealComparison(filtered).meals;

    // Daily trend aggregation
    const trendMap = {};
    filtered.forEach(r => {
      if (!trendMap[r.review_date]) {
        trendMap[r.review_date] = { sum: 0, count: 0 };
      }
      trendMap[r.review_date].sum += r.rating;
      trendMap[r.review_date].count += 1;
    });

    const calculatedTrends = Object.keys(trendMap).sort().map(d => {
      const dateObj = new Date(d + 'T00:00:00');
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date: d,
        day: weekday,
        avgRating: Number((trendMap[d].sum / trendMap[d].count).toFixed(1)),
        reviewCount: trendMap[d].count
      };
    });

    // Quality alerts (< 3.0 stars)
    const alertList = [];
    const mealDateMap = {};
    filtered.forEach(r => {
      const k = `${r.review_date}_${r.meal_type}`;
      if (!mealDateMap[k]) mealDateMap[k] = { sum: 0, count: 0, meal: r.meal_type, date: r.review_date };
      mealDateMap[k].sum += r.rating;
      mealDateMap[k].count += 1;
    });

    Object.values(mealDateMap).forEach(v => {
      const avg = Number((v.sum / v.count).toFixed(1));
      if (avg < 3.0 && v.count >= 2) {
        alertList.push({ review_date: v.date, meal_type: v.meal, avg_rating: avg, review_count: v.count });
      }
    });

    return {
      summary: calculatedSummary,
      trends: calculatedTrends,
      meals: calculatedMeals,
      feedback: filtered.filter(r => r.comment).slice(0, 6),
      alerts: alertList
    };
  }, [appliedFilters]);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If explicit demo mode is enabled, compute from realistic sample data
    if (isDemoMode) {
      const demoResult = getFilteredDemoData();
      setSummary(demoResult.summary);
      setTrends(demoResult.trends);
      setMealComparison(demoResult.meals);
      setRecentFeedback(demoResult.feedback);
      setAlerts(demoResult.alerts);
      setUsingFallbackDemo(false);
      setLoading(false);
      return;
    }

    // Try fetching from live database API
    try {
      const [sumRes, trendRes, mealRes, feedRes, alertRes] = await Promise.all([
        fetchAnalyticsSummary(appliedFilters),
        fetchRatingTrends(appliedFilters),
        fetchMealComparison(appliedFilters),
        fetchRecentFeedback({ ...appliedFilters, limit: 6 }),
        fetchQualityAlerts({ ...appliedFilters, minReviews: 2 })
      ]);

      setSummary(sumRes);
      setTrends(trendRes.trends || []);
      setMealComparison(mealRes.meals || []);
      setRecentFeedback(feedRes.feedback || []);
      setAlerts(alertRes.alerts || []);
      setUsingFallbackDemo(false);
    } catch (err) {
      console.warn('Backend database not reachable, falling back to realistic sample data:', err.message);
      // Graceful fallback to demo data so the user can test the UI without MySQL running
      const demoResult = getFilteredDemoData();
      setSummary(demoResult.summary);
      setTrends(demoResult.trends);
      setMealComparison(demoResult.meals);
      setRecentFeedback(demoResult.feedback);
      setAlerts(demoResult.alerts);
      setUsingFallbackDemo(true);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, appliedFilters, getFilteredDemoData]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const totalReviews = summary?.totalReviews || 0;
  const avgRating = summary?.averageRating || 0;

  return (
    <div className="quality-analytics-page" data-testid="quality-analytics-page">
      {/* Top Header */}
      <div className="top-header">
        <div className="module-header">
          <h1>Food Quality Analytics</h1>
          <p>Real-time rating trends, meal comparisons, and student satisfaction metrics.</p>
        </div>

        <button
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          onClick={loadAnalytics}
          disabled={loading}
          title="Refresh metrics"
        >
          {loading ? 'Refreshing...' : '↻ Refresh Data'}
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
                  ? 'MySQL database is currently offline; displaying calculated metrics from 31 realistic sample reviews.'
                  : 'Demonstrating analytics with 31 realistic student reviews calculated across breakfast, lunch, and dinner.'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', background: '#92400E', color: '#FFFFFF', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
            DEMO DATA
          </span>
        </div>
      )}

      {/* Date Range Filter Bar */}
      <div className="analytics-filter-toolbar card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '6px' }}>
              Timeframe:
            </span>
            <button
              className={`pill-filter-btn ${filterType === '7' ? 'active' : ''}`}
              onClick={() => handlePresetChange(7)}
              data-testid="filter-last-7-days"
            >
              Last 7 Days
            </button>
            <button
              className={`pill-filter-btn ${filterType === '30' ? 'active' : ''}`}
              onClick={() => handlePresetChange(30)}
              data-testid="filter-last-30-days"
            >
              Last 30 Days
            </button>
            <button
              className={`pill-filter-btn ${filterType === 'custom' ? 'active' : ''}`}
              onClick={() => setFilterType('custom')}
              data-testid="filter-custom-range"
            >
              Custom Range
            </button>
          </div>

          {/* Custom Date Picker Controls */}
          {filterType === 'custom' && (
            <form onSubmit={handleApplyCustom} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>From:</label>
              <input
                type="date"
                className="filter-select"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                required
              />
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>To:</label>
              <input
                type="date"
                className="filter-select"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '6px 16px', fontSize: '0.82rem' }}
              >
                Apply
              </button>
            </form>
          )}

          {/* Active Filter Indicator */}
          <div style={{ fontSize: '0.82rem', color: 'var(--primary-green)', fontWeight: 600, marginLeft: 'auto' }}>
            📅 {filterType === '7' ? 'Showing data for the last 7 days' : filterType === '30' ? 'Showing data for the last 30 days' : `Custom: ${appliedFilters.startDate || ''} to ${appliedFilters.endDate || ''}`}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert-box error" data-testid="analytics-error-banner" style={{ marginBottom: '24px' }}>
          <span>⚠</span>
          <div style={{ flex: 1 }}>{error}</div>
          <button
            onClick={loadAnalytics}
            style={{ background: 'none', border: '1px solid currentColor', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>Loading food quality metrics...</p>
          <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Fetching review distributions and trends from database.</p>
        </div>
      ) : totalReviews === 0 ? (
        /* Empty State */
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }} data-testid="analytics-empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            No Review Data Available
          </h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 20px auto' }}>
            There are no student food reviews recorded for the selected timeframe. Students will see their ratings calculated here once reviews are submitted.
          </p>
          <button
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            onClick={() => handlePresetChange(30)}
          >
            View Last 30 Days
          </button>
        </div>
      ) : (
        <>
          {/* Top Overview Stat Cards */}
          <div className="stats-grid" data-testid="analytics-stats-grid">
            <div className="stat-card">
              <div className="stat-icon amber">★</div>
              <div>
                <div className="stat-value">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
                <div className="stat-label">Average Student Rating</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div>
                <div className="stat-value">{totalReviews}</div>
                <div className="stat-label">Total Student Reviews</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: alerts.length > 0 ? '#FEE2E2' : '#EAF3ED', color: alerts.length > 0 ? '#EF4444' : '#1B5E44' }}>
                {alerts.length > 0 ? '⚠' : '✓'}
              </div>
              <div>
                <div className="stat-value">{alerts.length}</div>
                <div className="stat-label">Quality Alerts (&lt;3.0 ★)</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>🏆</div>
              <div>
                <div className="stat-value" style={{ fontSize: '1.3rem' }}>
                  {(() => {
                    const sorted = [...mealComparison].sort((a, b) => b.avg_rating - a.avg_rating);
                    return sorted[0]?.avg_rating > 0 ? sorted[0].meal_type : '—';
                  })()}
                </div>
                <div className="stat-label">Top Rated Meal</div>
              </div>
            </div>
          </div>

          {/* 1. Meal Comparison Chart (Breakfast, Lunch, Dinner) */}
          <div className="card" style={{ marginBottom: '28px' }} data-testid="meal-comparison-card">
            <div className="chart-header" style={{ marginBottom: '16px' }}>
              <div>
                <h3 className="card-title" style={{ marginBottom: '4px' }}>Meal Comparison</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Performance and satisfaction rates across breakfast, lunch, and dinner.
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', background: 'var(--bg-sage-light)', color: 'var(--primary-green)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                {totalReviews} Total Submissions
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {mealComparison.map((m) => {
                const isBreakfast = m.meal_type === 'Breakfast';
                const isLunch = m.meal_type === 'Lunch';
                const accentColor = isBreakfast ? '#D97706' : isLunch ? '#0284C7' : '#7C3AED';
                const bgColor = isBreakfast ? '#FEF3C7' : isLunch ? '#E0F2FE' : '#EDE9FE';
                const pct = m.avg_rating > 0 ? (m.avg_rating / 5) * 100 : 0;

                return (
                  <div
                    key={m.meal_type}
                    style={{
                      background: 'var(--bg-soft-cream)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem', padding: '6px 10px', background: bgColor, borderRadius: '8px' }}>
                          {isBreakfast ? '🍳' : isLunch ? '🍲' : '🍛'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{m.meal_type}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.total_reviews} reviews</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {m.avg_rating > 0 ? m.avg_rating.toFixed(1) : '—'}
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress score bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>Satisfaction Score</span>
                        <span style={{ color: m.avg_rating >= 3.5 ? 'var(--primary-green)' : 'var(--accent-red)' }}>
                          {m.satisfaction_rate}% Positive
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--border-light)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: accentColor,
                            borderRadius: '999px',
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                      <span>👍 Positive (4-5★): <strong>{m.positive_reviews}</strong></span>
                      <span>👎 Low (1-2★): <strong>{m.negative_reviews}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Rating Distribution & Daily Trends */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            {/* Rating Distribution Chart (1 to 5 Stars) */}
            <div className="card" data-testid="rating-distribution-card">
              <div className="chart-header" style={{ marginBottom: '14px' }}>
                <div>
                  <h3 className="card-title" style={{ marginBottom: '4px' }}>Rating Distribution</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Breakdown of star ratings across all meals</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = summary?.ratingDistribution?.[stars] || 0;
                  const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                  const barColor = stars >= 4 ? 'var(--primary-green)' : stars === 3 ? 'var(--accent-amber)' : 'var(--accent-red)';

                  return (
                    <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                      <span style={{ width: '60px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stars} <span style={{ color: 'var(--accent-star)', fontSize: '0.9rem' }}>★</span>
                      </span>

                      <div style={{ flex: 1, height: '12px', background: 'var(--bg-sage-light)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: barColor,
                            borderRadius: '999px',
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>

                      <span style={{ width: '40px', textAlign: 'right', fontWeight: 700, fontSize: '0.82rem' }}>
                        {percent}%
                      </span>
                      <span style={{ width: '45px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        ({count})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Ratings Trend Chart */}
            <div className="card" data-testid="daily-trends-card">
              <div className="chart-header" style={{ marginBottom: '14px' }}>
                <div>
                  <h3 className="card-title" style={{ marginBottom: '4px' }}>Student Rating Trend</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Daily average score (1–5 scale)</p>
                </div>
              </div>

              {trends.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No daily trend data available for this range.
                </div>
              ) : (
                <div className="chart-bars-wrap" style={{ height: '160px' }}>
                  {trends.map((t, idx) => {
                    const heightPercent = Math.min(100, Math.max(15, (t.avgRating / 5) * 100));
                    return (
                      <div key={idx} className="chart-column">
                        <span className="chart-val-label">{t.avgRating.toFixed(1)}</span>
                        <div
                          className="chart-bar"
                          style={{ height: `${heightPercent}%` }}
                          title={`${t.date} (${t.day}): ${t.avgRating.toFixed(1)} stars (${t.reviewCount} reviews)`}
                        />
                        <span className="chart-day-label">{t.day}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. Low Rating Quality Alerts & Action Items */}
          <div className="card" style={{ marginBottom: '28px' }} data-testid="quality-alerts-card">
            <div className="chart-header" style={{ marginBottom: '12px' }}>
              <div>
                <h3 className="card-title" style={{ marginBottom: '4px' }}>Quality Watchlist & Alerts</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Flagged meals with average rating &lt; 3.0 ★ and $\ge 2$ student reviews (avoids single outlier skew).
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                Threshold: $\ge 2$ reviews
              </span>
            </div>

            {alerts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--primary-green)', background: 'var(--bg-sage-light)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '1.4rem', marginRight: '8px' }}>✓</span>
                <strong>All meals meet target quality standards.</strong> No meal had an average below 3.0 stars with 2+ reviews.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {alerts.map((alert, i) => (
                  <div key={i} className="alert-box error" style={{ margin: 0, padding: '14px 18px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{alert.meal_type}</span>
                      <span style={{ fontSize: '0.78rem', background: '#FFFFFF', color: 'var(--accent-red)', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                        {alert.avg_rating} / 5.0 ★
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#7F1D1D' }}>
                      Date: {alert.review_date} ({alert.review_count} student reviews)
                    </div>
                    <div style={{ fontSize: '0.78rem', marginTop: '4px', fontStyle: 'italic' }}>
                      👉 Action Recommended: Review seasoning, food temperature, and feedback comments with mess kitchen supervisor.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Recent Student Feedback Section */}
          <div className="card" data-testid="recent-feedback-card">
            <div className="chart-header" style={{ marginBottom: '16px' }}>
              <div>
                <h3 className="card-title" style={{ marginBottom: '4px' }}>Recent Student Feedback</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Written feedback and suggestions submitted by students.
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Showing latest {recentFeedback.length} comments
              </span>
            </div>

            {recentFeedback.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No student comments submitted for this period yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {recentFeedback.map((fb) => (
                  <div
                    key={fb.id}
                    style={{
                      background: 'var(--bg-soft-cream)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-green)' }}>
                            {fb.student_name || 'Student'}
                          </span>
                          <span className={`meal-badge ${fb.meal_type}`} style={{ fontSize: '0.7rem' }}>
                            {fb.meal_type}
                          </span>
                        </div>
                        <StarRating value={fb.rating} readOnly={true} showLabel={false} size={16} />
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.4, fontStyle: 'italic' }}>
                        "{fb.comment}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                      <span>{fb.hostel_block ? `${fb.hostel_block} • ${fb.room_no || ''}` : fb.student_id}</span>
                      <span>📅 {fb.review_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
