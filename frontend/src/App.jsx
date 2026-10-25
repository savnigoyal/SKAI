import React, { useState } from 'react';
import FoodReview from './pages/FoodReview';
import ManagerReviews from './pages/ManagerReviews';
import QualityAnalytics from './pages/QualityAnalytics';
import StudentDashboardPreview from './components/StudentDashboardPreview';
import ManagerDashboardPreview from './components/ManagerDashboardPreview';
import { DEMO_STUDENT } from './services/mockData';

export default function App() {
  const [currentTab, setCurrentTab] = useState('rate-food');
  const [isDemoMode, setIsDemoMode] = useState(true);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-logo-icon">🌿</div>
          <div>
            <div className="brand-title">Hostel Mess</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Management System</div>
          </div>
        </div>

        {/* Global Demo Mode Toggle */}
        <div style={{ padding: '0 12px 16px 12px' }}>
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${isDemoMode ? '#FBBF24' : 'var(--border-light)'}`,
              background: isDemoMode ? '#FEF3C7' : 'var(--bg-surface)',
              color: isDemoMode ? '#B45309' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Toggle between Live Database and Sample Demo Data"
          >
            <span>{isDemoMode ? '🧪 Demo Mode: ON' : '🔌 Live DB Mode'}</span>
            <span style={{ fontSize: '0.7rem' }}>{isDemoMode ? 'Active' : 'Offline'}</span>
          </button>
        </div>

        <nav className="nav-section">
          {/* Student Section */}
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '8px 12px 4px 12px', letterSpacing: '0.5px' }}>
            Student Portal
          </div>

          <button
            className={`nav-item ${currentTab === 'rate-food' ? 'active' : ''}`}
            onClick={() => setCurrentTab('rate-food')}
            data-testid="nav-rate-food"
          >
            <span>⭐</span>
            <span>Rate Today's Food</span>
            <span className="nav-badge">Savni</span>
          </button>

          <button
            className={`nav-item ${currentTab === 'student-dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('student-dashboard')}
            data-testid="nav-student-dashboard"
          >
            <span>🏠</span>
            <span>Student Dashboard</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Demo</span>
          </button>

          {/* Manager Section */}
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '16px 12px 4px 12px', letterSpacing: '0.5px' }}>
            Manager Portal
          </div>

          <button
            className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentTab('analytics')}
            data-testid="nav-analytics"
          >
            <span>📊</span>
            <span>Quality Analytics</span>
            <span className="nav-badge">Savni</span>
          </button>

          <button
            className={`nav-item ${currentTab === 'manager-reviews' ? 'active' : ''}`}
            onClick={() => setCurrentTab('manager-reviews')}
            data-testid="nav-manager-reviews"
          >
            <span>📋</span>
            <span>Student Food Reviews</span>
            <span className="nav-badge">Savni</span>
          </button>

          <button
            className={`nav-item ${currentTab === 'manager-dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('manager-dashboard')}
            data-testid="nav-manager-dashboard"
          >
            <span>📈</span>
            <span>Manager Overview</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Demo</span>
          </button>
        </nav>

        {/* User Identity Indicator */}
        <div className="profile-pill" style={{ marginTop: 'auto' }}>
          <div className="avatar-circle">A</div>
          <div className="profile-info">
            <div className="profile-name">{DEMO_STUDENT.student_name}</div>
            <div className="profile-role">{DEMO_STUDENT.hostel_block} • {DEMO_STUDENT.room_no}</div>
          </div>
        </div>
      </aside>

      {/* Main Screen Content */}
      <main className="main-wrapper">
        {currentTab === 'rate-food' && (
          <FoodReview student={DEMO_STUDENT} />
        )}

        {currentTab === 'student-dashboard' && (
          <StudentDashboardPreview onRateFoodClick={() => setCurrentTab('rate-food')} />
        )}

        {currentTab === 'analytics' && (
          <QualityAnalytics isDemoMode={isDemoMode} />
        )}

        {currentTab === 'manager-reviews' && (
          <ManagerReviews isDemoMode={isDemoMode} />
        )}

        {currentTab === 'manager-dashboard' && (
          <ManagerDashboardPreview
            onReviewsClick={() => setCurrentTab('manager-reviews')}
            onAnalyticsClick={() => setCurrentTab('analytics')}
          />
        )}
      </main>
    </div>
  );
}
