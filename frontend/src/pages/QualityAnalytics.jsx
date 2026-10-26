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
      // Graceful fallback to demo data so the user can test the UI without backend running
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

  // Best performing meal calculation
  const sortedMeals = [...mealComparison].sort((a, b) => b.avg_rating - a.avg_rating);
  const topMeal = sortedMeals[0]?.avg_rating > 0 ? sortedMeals[0] : null;

  // Meal icons lookup
  const getMealIcon = (mealType) => {
    const m = (mealType || '').toLowerCase();
    if (m.includes('breakfast')) return '🍳';
    if (m.includes('lunch')) return '🍲';
    if (m.includes('tea')) return '☕';
    return '🌙';
  };

  return (
    <div className="qa-page quality-analytics-page" data-testid="quality-analytics-page">
      {/* Top Header */}
      <div className="qa-header">
        <div className="qa-header-left">
          <div className="eyebrow">CAMPUS ANALYTICS • QUALITY ASSURANCE</div>
          <h1 className="qa-title">Food Quality Analytics</h1>
          <p className="qa-subtitle">Real-time rating trends, meal comparisons, and student satisfaction metrics.</p>
        </div>

        <button
          className="qa-refresh-btn"
          onClick={loadAnalytics}
          disabled={loading}
          title="Refresh metrics from database"
        >
          {loading ? (
            <>
              <span className="qa-spinner" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <span>↻</span>
              <span>Refresh Data</span>
            </>
          )}
        </button>
      </div>

      {/* Demo / Sample Data Notice Banner */}
      {(isDemoMode || usingFallbackDemo) && (
        <div className="qa-demo-banner">
          <div className="qa-demo-banner-content">
            <span className="qa-demo-banner-icon">ℹ️</span>
            <div>
              <div className="qa-demo-banner-title">Sample Demo Data Active</div>
              <div className="qa-demo-banner-text">
                {usingFallbackDemo
                  ? 'Server database is offline; displaying calculated analytics from realistic campus sample reviews.'
                  : 'Demonstrating analytics with 31 realistic student reviews calculated across breakfast, lunch, and dinner.'}
              </div>
            </div>
          </div>
          <span className="qa-demo-badge">DEMO DATA</span>
        </div>
      )}

      {/* Date Range Filter Bar */}
      <div className="qa-filter-panel">
        <div className="qa-filter-left">
          <span className="qa-filter-label">Timeframe:</span>
          <div className="qa-pill-group">
            <button
              className={`qa-pill-btn ${filterType === '7' ? 'active' : ''}`}
              onClick={() => handlePresetChange(7)}
              data-testid="filter-last-7-days"
            >
              Last 7 Days
            </button>
            <button
              className={`qa-pill-btn ${filterType === '30' ? 'active' : ''}`}
              onClick={() => handlePresetChange(30)}
              data-testid="filter-last-30-days"
            >
              Last 30 Days
            </button>
            <button
              className={`qa-pill-btn ${filterType === 'custom' ? 'active' : ''}`}
              onClick={() => setFilterType('custom')}
              data-testid="filter-custom-range"
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {filterType === 'custom' && (
          <form onSubmit={handleApplyCustom} className="qa-custom-form">
            <div className="qa-date-field">
              <label>From:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                required
              />
            </div>
            <div className="qa-date-field">
              <label>To:</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="qa-apply-btn">
              Apply
            </button>
          </form>
        )}

        {/* Active Filter Indicator */}
        <div className="qa-filter-indicator">
          📅 {filterType === '7' ? 'Showing data for the last 7 days' : filterType === '30' ? 'Showing data for the last 30 days' : `Custom: ${appliedFilters.startDate || ''} to ${appliedFilters.endDate || ''}`}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert-box error" data-testid="analytics-error-banner" style={{ marginBottom: '20px' }}>
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
        <div className="qa-state-card">
          <div className="qa-state-spinner" />
          <h3 className="qa-state-title">Loading food quality metrics...</h3>
          <p className="qa-state-desc">Fetching review distributions, satisfaction scores, and meal trends.</p>
        </div>
      ) : totalReviews === 0 ? (
        /* Empty State */
        <div className="qa-state-card" data-testid="analytics-empty-state">
          <div className="qa-state-icon">📊</div>
          <h3 className="qa-state-title">No Review Data Available</h3>
          <p className="qa-state-desc">
            There are no student food reviews recorded for the selected timeframe. Students will see their ratings calculated here once reviews are submitted.
          </p>
          <button
            className="qa-apply-btn"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            onClick={() => handlePresetChange(30)}
          >
            View Last 30 Days
          </button>
        </div>
      ) : (
        <>
          {/* Top 4 Equal-Height KPI Cards */}
          <div className="qa-kpi-grid stats-grid" data-testid="analytics-stats-grid">
            {/* Card 1: Average Student Rating */}
            <div className="qa-kpi-card stat-card">
              <div className="qa-kpi-header">
                <span className="qa-kpi-label">Average Student Rating</span>
                <span className="qa-kpi-icon qa-kpi-icon--amber">★</span>
              </div>
              <div className="qa-kpi-body">
                <div className="qa-kpi-value-row">
                  <span className="qa-kpi-value">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
                  <span className="qa-kpi-subval">/ 5.0</span>
                </div>
                <div className="qa-kpi-rating-visual">
                  <span className="qa-kpi-stars">
                    {'★'.repeat(Math.round(avgRating || 0))}
                    {'☆'.repeat(Math.max(0, 5 - Math.round(avgRating || 0)))}
                  </span>
                  <span className="qa-kpi-caption">Across all meals</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Student Reviews */}
            <div className="qa-kpi-card stat-card">
              <div className="qa-kpi-header">
                <span className="qa-kpi-label">Total Student Reviews</span>
                <span className="qa-kpi-icon qa-kpi-icon--green">👥</span>
              </div>
              <div className="qa-kpi-body">
                <div className="qa-kpi-value-row">
                  <span className="qa-kpi-value">{totalReviews}</span>
                  <span className="qa-kpi-subval">entries</span>
                </div>
                <div className="qa-kpi-caption">Verified campus submissions</div>
              </div>
            </div>

            {/* Card 3: Quality Alerts */}
            <div className={`qa-kpi-card stat-card ${alerts.length > 0 ? 'qa-kpi-card--alert' : ''}`}>
              <div className="qa-kpi-header">
                <span className="qa-kpi-label">Quality Alerts (&lt;3.0 ★)</span>
                <span className={`qa-kpi-icon ${alerts.length > 0 ? 'qa-kpi-icon--red' : 'qa-kpi-icon--sage'}`}>
                  {alerts.length > 0 ? '⚠' : '✓'}
                </span>
              </div>
              <div className="qa-kpi-body">
                <div className="qa-kpi-value-row">
                  <span className={`qa-kpi-value ${alerts.length > 0 ? 'qa-kpi-value--red' : 'qa-kpi-value--green'}`}>
                    {alerts.length}
                  </span>
                  <span className="qa-kpi-subval">{alerts.length === 1 ? 'flag' : 'flags'}</span>
                </div>
                <div className={`qa-kpi-caption ${alerts.length > 0 ? 'qa-text--red' : 'qa-text--green'}`}>
                  {alerts.length > 0 ? 'Requires supervisor review' : 'All meals meet standards'}
                </div>
              </div>
            </div>

            {/* Card 4: Top-Rated Meal */}
            <div className="qa-kpi-card stat-card">
              <div className="qa-kpi-header">
                <span className="qa-kpi-label">Top Rated Meal</span>
                <span className="qa-kpi-icon qa-kpi-icon--blue">🏆</span>
              </div>
              <div className="qa-kpi-body">
                <div className="qa-kpi-value-row">
                  <span className="qa-kpi-value qa-kpi-value--text">
                    {topMeal ? topMeal.meal_type : '—'}
                  </span>
                </div>
                <div className="qa-kpi-caption">
                  {topMeal
                    ? `${topMeal.avg_rating.toFixed(1)} / 5.0 ★ • ${topMeal.satisfaction_rate}% satisfied`
                    : 'No ratings in this period'}
                </div>
              </div>
            </div>
          </div>

          {/* Meal Comparison Section */}
          <div className="qa-section-card card" data-testid="meal-comparison-card">
            <div className="qa-section-header">
              <div>
                <h2 className="qa-section-title">Meal Comparison</h2>
                <p className="qa-section-subtitle">
                  Student satisfaction and rating scores across breakfast, lunch, and dinner.
                </p>
              </div>
              <span className="qa-badge-pill">
                {totalReviews} Total Submissions
              </span>
            </div>

            <div className="qa-meal-grid">
              {mealComparison.map((m) => {
                const pct = m.avg_rating > 0 ? Math.round((m.avg_rating / 5) * 100) : 0;
                const isPositive = m.avg_rating >= 3.5;
                const icon = getMealIcon(m.meal_type);

                return (
                  <div key={m.meal_type} className="qa-meal-card">
                    <div className="qa-meal-header">
                      <div className="qa-meal-title-group">
                        <span className="qa-meal-icon">{icon}</span>
                        <div>
                          <div className="qa-meal-name">{m.meal_type}</div>
                          <div className="qa-meal-count">{m.total_reviews} reviews recorded</div>
                        </div>
                      </div>

                      <div className="qa-meal-score-box">
                        <div className="qa-meal-score">
                          {m.avg_rating > 0 ? m.avg_rating.toFixed(1) : '—'}
                          <span className="qa-meal-score-denom">/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Star Visual */}
                    <div className="qa-meal-stars-row">
                      <StarRating value={Math.round(m.avg_rating)} readOnly={true} showLabel={false} size={15} />
                      <span className="qa-meal-pct-label" style={{ color: isPositive ? '#2f785b' : '#b45309' }}>
                        {m.satisfaction_rate}% Positive
                      </span>
                    </div>

                    {/* Progress score bar */}
                    <div className="qa-progress-wrap">
                      <div
                        className="qa-progress-fill"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isPositive ? '#2f785b' : '#d97706'
                        }}
                      />
                    </div>

                    {/* Breakdown stats */}
                    <div className="qa-meal-footer">
                      <span>👍 Positive (4–5★): <strong>{m.positive_reviews}</strong></span>
                      <span>👎 Low (1–2★): <strong>{m.negative_reviews}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rating Distribution & Daily Trends */}
          <div className="qa-charts-row">
            {/* Rating Distribution Card */}
            <div className="qa-section-card card" data-testid="rating-distribution-card">
              <div className="qa-section-header">
                <div>
                  <h2 className="qa-section-title">Rating Distribution</h2>
                  <p className="qa-section-subtitle">Breakdown of star ratings across all meals</p>
                </div>
              </div>

              <div className="qa-distribution-list">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = summary?.ratingDistribution?.[stars] || 0;
                  const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                  const barColor = stars >= 4 ? '#2f785b' : stars === 3 ? '#d97706' : '#dc2626';

                  return (
                    <div key={stars} className="qa-dist-row">
                      <span className="qa-dist-stars">
                        {stars} <span style={{ color: '#e5a93b' }}>★</span>
                      </span>

                      <div className="qa-dist-bar-track">
                        <div
                          className="qa-dist-bar-fill"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: barColor
                          }}
                        />
                      </div>

                      <span className="qa-dist-pct">{percent}%</span>
                      <span className="qa-dist-count">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Ratings Trend Chart */}
            <div className="qa-section-card card" data-testid="daily-trends-card">
              <div className="qa-section-header">
                <div>
                  <h2 className="qa-section-title">Student Rating Trend</h2>
                  <p className="qa-section-subtitle">Daily average score (1–5 scale)</p>
                </div>
              </div>

              {trends.length === 0 ? (
                <div className="qa-empty-chart">
                  No daily trend data available for this range.
                </div>
              ) : (
                <div className="qa-trend-bars-wrap chart-bars-wrap">
                  {trends.map((t, idx) => {
                    const heightPercent = Math.min(100, Math.max(16, (t.avgRating / 5) * 100));
                    return (
                      <div key={idx} className="qa-trend-col chart-column">
                        <span className="qa-trend-val chart-val-label">{t.avgRating.toFixed(1)}</span>
                        <div
                          className="qa-trend-bar chart-bar"
                          style={{ height: `${heightPercent}%` }}
                          title={`${t.date} (${t.day}): ${t.avgRating.toFixed(1)} stars (${t.reviewCount} reviews)`}
                        />
                        <span className="qa-trend-day chart-day-label">{t.day}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quality Watchlist & Alerts Section */}
          <div className="qa-section-card card" data-testid="quality-alerts-card">
            <div className="qa-section-header">
              <div>
                <h2 className="qa-section-title">Quality Watchlist & Alerts</h2>
                <p className="qa-section-subtitle">
                  Flagged meals with average rating &lt; 3.0 ★ and ≥ 2 student reviews (avoids single outlier skew).
                </p>
              </div>
              <span className="qa-badge-subtle">
                Threshold: ≥ 2 reviews
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="qa-alert-positive">
                <span className="qa-alert-positive-icon">✓</span>
                <div>
                  <strong>All meals meet target quality standards.</strong> No meal had an average below 3.0 stars with 2+ reviews in this timeframe.
                </div>
              </div>
            ) : (
              <div className="qa-alerts-grid">
                {alerts.map((alert, i) => (
                  <div key={i} className="qa-alert-item alert-box error">
                    <div className="qa-alert-item-header">
                      <span className="qa-alert-meal">{alert.meal_type}</span>
                      <span className="qa-alert-score-badge">
                        {alert.avg_rating} / 5.0 ★
                      </span>
                    </div>
                    <div className="qa-alert-meta">
                      Date: {alert.review_date} ({alert.review_count} student reviews)
                    </div>
                    <div className="qa-alert-action">
                      👉 Action Recommended: Review seasoning, food temperature, and feedback comments with mess kitchen supervisor.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Student Feedback Section */}
          <div className="qa-section-card card" data-testid="recent-feedback-card">
            <div className="qa-section-header">
              <div>
                <h2 className="qa-section-title">Recent Student Feedback</h2>
                <p className="qa-section-subtitle">
                  Written feedback and suggestions submitted by students.
                </p>
              </div>
              <span className="qa-badge-subtle">
                Showing latest {recentFeedback.length} comments
              </span>
            </div>

            {recentFeedback.length === 0 ? (
              <div className="qa-empty-feedback">
                No student comments submitted for this period yet.
              </div>
            ) : (
              <div className="qa-feedback-grid">
                {recentFeedback.map((fb) => (
                  <div key={fb.id} className="qa-feedback-card">
                    <div className="qa-feedback-top">
                      <div className="qa-feedback-author">
                        <span className="qa-feedback-name">{fb.student_name || 'Student'}</span>
                        <span className="qa-feedback-meal-badge">{fb.meal_type}</span>
                      </div>
                      <StarRating value={fb.rating} readOnly={true} showLabel={false} size={14} />
                    </div>

                    <p className="qa-feedback-quote">
                      "{fb.comment}"
                    </p>

                    <div className="qa-feedback-footer">
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
