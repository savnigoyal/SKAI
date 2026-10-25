import React, { useState } from 'react';
import { DEMO_INVENTORY, DEMO_FOOD_WASTE_STATS, DEMO_WEEKLY_MENU } from '../services/mockData';

export default function ManagerDashboardPreview({ onReviewsClick, onAnalyticsClick }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'menu' | 'inventory'

  return (
    <div className="manager-dashboard-preview" data-testid="manager-dashboard-preview">
      {/* Top Header */}
      <div className="top-header">
        <div className="module-header">
          <h1>Welcome, Mess Manager! 📋</h1>
          <p>Here is a quick overview of your mess operations, food quality, and inventory.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '4px 12px', borderRadius: '999px', fontWeight: 700 }}>
            Sample / Demo Data
          </span>
          <div className="profile-pill">
            <div className="avatar-circle" style={{ background: '#0284C7' }}>M</div>
            <div className="profile-info">
              <div className="profile-name">Mess Manager</div>
              <div className="profile-role">Admin Staff</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="meal-tabs-container" style={{ marginBottom: '24px' }}>
        <button className={`meal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Dashboard Overview
        </button>
        <button className={`meal-tab-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
          Menu Management
        </button>
        <button className={`meal-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
          Inventory Management
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Top 4 Stat Overview Cards */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={onAnalyticsClick}>
              <div className="stat-icon amber">★</div>
              <div>
                <div className="stat-value">4.2</div>
                <div className="stat-label">Avg. Student Rating</div>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={onReviewsClick}>
              <div className="stat-icon">👥</div>
              <div>
                <div className="stat-value">123</div>
                <div className="stat-label">Total Reviews</div>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('inventory')}>
              <div className="stat-icon" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>📦</div>
              <div>
                <div className="stat-value">24</div>
                <div className="stat-label">Inventory Items</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>🗑️</div>
              <div>
                <div className="stat-value">{DEMO_FOOD_WASTE_STATS.totalWeeklyKg} kg</div>
                <div className="stat-label">Food Wastage (This Week)</div>
              </div>
            </div>
          </div>

          {/* Two-Column Charts: Student Ratings & Food Wastage */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            {/* Student Ratings Chart */}
            <div className="card">
              <div className="chart-header">
                <div>
                  <h3 className="card-title" style={{ marginBottom: '2px' }}>Student Ratings (Last 7 Days)</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average rating per day (1–5 scale)</p>
                </div>
                <button
                  onClick={onAnalyticsClick}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  View Full Analytics →
                </button>
              </div>

              <div className="chart-bars-wrap" style={{ height: '150px' }}>
                {[
                  { day: 'Mon', val: 3.8 },
                  { day: 'Tue', val: 4.0 },
                  { day: 'Wed', val: 4.1 },
                  { day: 'Thu', val: 3.6 },
                  { day: 'Fri', val: 4.3 },
                  { day: 'Sat', val: 4.5 },
                  { day: 'Sun', val: 4.2 }
                ].map((d, i) => (
                  <div key={i} className="chart-column">
                    <span className="chart-val-label">{d.val}</span>
                    <div className="chart-bar" style={{ height: `${(d.val / 5) * 100}%` }} />
                    <span className="chart-day-label">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Food Wastage Chart */}
            <div className="card">
              <div className="chart-header">
                <div>
                  <h3 className="card-title" style={{ marginBottom: '2px' }}>Food Wastage (Last 7 Days)</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Measured in kilograms (kg)</p>
                </div>
                <span style={{ fontSize: '0.78rem', background: '#FEE2E2', color: '#B91C1C', padding: '3px 8px', borderRadius: '999px', fontWeight: 600 }}>
                  Weekly Target: &lt; 20 kg
                </span>
              </div>

              <div className="chart-bars-wrap" style={{ height: '150px' }}>
                {DEMO_FOOD_WASTE_STATS.dailyWastage.map((d, i) => (
                  <div key={i} className="chart-column">
                    <span className="chart-val-label" style={{ color: '#059669' }}>{d.kg}kg</span>
                    <div
                      className="chart-bar"
                      style={{
                        height: `${(d.kg / 25) * 100}%`,
                        background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
                      }}
                    />
                    <span className="chart-day-label">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. MENU MANAGEMENT TAB */}
      {activeTab === 'menu' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 className="card-title" style={{ margin: 0 }}>Manage Weekly Menu</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Add, edit, or publish the weekly hostel menu</p>
            </div>
            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              + Add Meal
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-sage-light)', color: 'var(--primary-green)' }}>
                  <th style={{ padding: '12px 16px' }}>Day</th>
                  <th style={{ padding: '12px 16px' }}>Breakfast</th>
                  <th style={{ padding: '12px 16px' }}>Lunch</th>
                  <th style={{ padding: '12px 16px' }}>Dinner</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_WEEKLY_MENU.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{item.day} {item.date}</td>
                    <td style={{ padding: '14px 16px' }}>{item.breakfast}</td>
                    <td style={{ padding: '14px 16px' }}>{item.lunch}</td>
                    <td style={{ padding: '14px 16px' }}>{item.dinner}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }} title="Edit">✏️</button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. INVENTORY MANAGEMENT TAB */}
      {activeTab === 'inventory' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 className="card-title" style={{ margin: 0 }}>Stock & Inventory Management</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Track raw material stock and reorder levels</p>
            </div>
            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              + Add Item
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-sage-light)', color: 'var(--primary-green)' }}>
                  <th style={{ padding: '12px 16px' }}>Item Name</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Quantity</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_INVENTORY.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{inv.item}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{inv.category}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{inv.quantity}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: inv.status === 'In Stock' ? 'var(--bg-sage-light)' : '#FEF3C7',
                          color: inv.status === 'In Stock' ? 'var(--primary-green)' : '#B45309'
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}>✏️</button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
