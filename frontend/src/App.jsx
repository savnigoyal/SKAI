import React, { useState } from 'react';
import FoodReview from './pages/FoodReview';
import ManagerReviews from './pages/ManagerReviews';
import QualityAnalytics from './pages/QualityAnalytics';

export default function App() {
  const [currentTab, setCurrentTab] = useState('rate-food');

  // Active student context (can be provided by teammate's auth context)
  const [currentStudent] = useState({
    student_id: '23CS123',
    student_name: 'Ananya Sharma',
    hostel_block: 'Block B',
    room_no: 'B-206'
  });

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-logo-icon">🌿</div>
          <div>
            <div className="brand-title">Hostel Mess</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Management</div>
          </div>
        </div>

        <nav className="nav-section">
          <button
            className={`nav-item ${currentTab === 'rate-food' ? 'active' : ''}`}
            onClick={() => setCurrentTab('rate-food')}
            data-testid="nav-rate-food"
          >
            <span>⭐</span>
            <span>Rate Today's Food</span>
          </button>

          <button
            className={`nav-item ${currentTab === 'manager-reviews' ? 'active' : ''}`}
            onClick={() => setCurrentTab('manager-reviews')}
            data-testid="nav-manager-reviews"
          >
            <span>📋</span>
            <span>Food Reviews (Manager)</span>
          </button>

          <button
            className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentTab('analytics')}
            data-testid="nav-analytics"
          >
            <span>📊</span>
            <span>Quality Analytics</span>
          </button>
        </nav>

        {/* Student Profile Pill in Sidebar */}
        <div className="profile-pill" style={{ marginTop: 'auto' }}>
          <div className="avatar-circle">A</div>
          <div className="profile-info">
            <div className="profile-name">{currentStudent.student_name}</div>
            <div className="profile-role">{currentStudent.hostel_block} • {currentStudent.room_no}</div>
          </div>
        </div>
      </aside>

      {/* Main Page Content */}
      <main className="main-wrapper">
        {currentTab === 'rate-food' && <FoodReview student={currentStudent} />}
        {currentTab === 'manager-reviews' && <ManagerReviews />}
        {currentTab === 'analytics' && <QualityAnalytics />}
      </main>
    </div>
  );
}
