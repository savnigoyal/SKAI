import React, { useState } from 'react';
import { Package, Trash2, AlertTriangle, TrendingDown, Plus, Check, RefreshCw } from 'lucide-react';
import { DEMO_INVENTORY, DEMO_FOOD_WASTE_STATS } from '../services/mockData';

export default function InventoryWaste() {
  const [inventory, setInventory] = useState([
    ...DEMO_INVENTORY,
    { id: 6, item: 'Toor Dal', category: 'Pulses', quantity: '35 kg', status: 'In Stock' },
    { id: 7, item: 'Basmati Rice', category: 'Grains', quantity: '80 kg', status: 'In Stock' },
    { id: 8, item: 'Butter & Ghee', category: 'Dairy', quantity: '4 kg', status: 'Low Stock' },
    { id: 9, item: 'Spices & Masalas', category: 'Grocery', quantity: '12 kg', status: 'In Stock' },
    { id: 10, item: 'Fresh Milk', category: 'Dairy', quantity: '40 L', status: 'In Stock' },
  ]);

  const [wasteLogs, setWasteLogs] = useState(DEMO_FOOD_WASTE_STATS.dailyWastage);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Grains');
  const [showAddModal, setShowAddModal] = useState(false);

  const totalWaste = wasteLogs.reduce((acc, curr) => acc + curr.kg, 0);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemQty.trim()) return;

    setInventory((prev) => [
      ...prev,
      {
        id: Date.now(),
        item: newItemName.trim(),
        category: newItemCategory,
        quantity: newItemQty.trim(),
        status: 'In Stock',
      },
    ]);
    setShowAddModal(false);
    setNewItemName('');
    setNewItemQty('');
  };

  return (
    <div className="inventory-waste-page" style={{ paddingBottom: '60px' }}>
      <section className="page-heading" style={{ marginBottom: '20px' }}>
        <div>
          <div className="eyebrow" style={{ color: '#2f785b' }}>LOGISTICS & SUSTAINABILITY</div>
          <h1>Inventory & Waste Management</h1>
          <p>Monitor mess pantry supplies, track low-stock thresholds, and analyze food waste reductions.</p>
        </div>

        <button
          className="button button-primary"
          onClick={() => setShowAddModal(true)}
          style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Add Inventory Item
        </button>
      </section>

      {/* KPI Cards */}
      <section className="summary-grid" style={{ marginBottom: '24px' }}>
        <article className="summary-card">
          <span className="summary-icon green"><Package size={18} /></span>
          <div className="summary-copy">
            <span>Total Stocked Items</span>
            <strong>{inventory.length}</strong>
            <small>Active pantry supplies</small>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon amber"><AlertTriangle size={18} /></span>
          <div className="summary-copy">
            <span>Low Stock Alerts</span>
            <strong>{inventory.filter((i) => i.status === 'Low Stock').length} Items</strong>
            <small>Re-order recommended</small>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon sage"><Trash2 size={18} /></span>
          <div className="summary-copy">
            <span>Weekly Waste Recorded</span>
            <strong>{totalWaste} kg</strong>
            <small>Avg {Math.round(totalWaste / 7)} kg / day</small>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon green"><TrendingDown size={18} /></span>
          <div className="summary-copy">
            <span>Waste Reduction Trend</span>
            <strong>-14.2%</strong>
            <small>Compared to last month</small>
          </div>
        </article>
      </section>

      {/* Two Column Section: Inventory Table & Food Waste Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '22px' }}>
        {/* Pantry Stock Table */}
        <div className="card" style={{ background: '#fff', border: '1px solid #e5eae2', borderRadius: '9px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="card-title" style={{ margin: 0, fontSize: '16px', color: '#273b30' }}>
              Current Pantry & Grocery Stock
            </h2>
            <span style={{ fontSize: '11px', color: '#7a8c81' }}>Live Stock Levels</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#eff5ed', color: '#2f785b' }}>
                  <th style={{ padding: '10px 12px', borderRadius: '6px 0 0 6px' }}>Item Name</th>
                  <th style={{ padding: '10px 12px' }}>Category</th>
                  <th style={{ padding: '10px 12px' }}>Quantity</th>
                  <th style={{ padding: '10px 12px', borderRadius: '0 6px 6px 0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0f3ee' }}>
                    <td style={{ padding: '11px 12px', fontWeight: 600, color: '#273b30' }}>{item.item}</td>
                    <td style={{ padding: '11px 12px', color: '#66776e' }}>{item.category}</td>
                    <td style={{ padding: '11px 12px', fontWeight: 700, color: '#273b30' }}>{item.quantity}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <span
                        style={{
                          background: item.status === 'In Stock' ? '#eaf4eb' : '#fef3c7',
                          color: item.status === 'In Stock' ? '#2f785b' : '#b45309',
                          border: `1px solid ${item.status === 'In Stock' ? '#c7ddcb' : '#fde68a'}`,
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Food Waste Daily Analysis */}
        <div className="card" style={{ background: '#fff', border: '1px solid #e5eae2', borderRadius: '9px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="card-title" style={{ margin: 0, fontSize: '16px', color: '#273b30' }}>
              Daily Food Waste Tracking (kg)
            </h2>
            <span style={{ fontSize: '11px', color: '#7a8c81' }}>Measured post-service</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {wasteLogs.map((log) => {
              const maxWaste = 25;
              const pct = Math.min(Math.round((log.kg / maxWaste) * 100), 100);

              return (
                <div key={log.day}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <strong style={{ color: '#273b30' }}>{log.day}</strong>
                    <span style={{ color: log.kg > 16 ? '#b45309' : '#2f785b', fontWeight: 700 }}>
                      {log.kg} kg {log.kg > 16 && '⚠️ High'}
                    </span>
                  </div>
                  <div style={{ height: '7px', background: '#e9ece7', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: log.kg > 16 ? '#d97706' : '#2f785b',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: '#f8faf7', borderRadius: '6px', fontSize: '11px', color: '#5b6d62', lineHeight: 1.5 }}>
            💡 <strong>Insight:</strong> Aligning daily meal production with the student voting results directly lowered Sunday and Tuesday plate wastage by 18%!
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <section className="confirm-dialog" role="dialog" aria-modal="true" style={{ maxWidth: '420px' }}>
            <div className="confirm-icon">
              <Package size={22} />
            </div>
            <h2 style={{ fontSize: '18px', marginTop: '12px' }}>Add Inventory Item</h2>
            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px', textAlign: 'left' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: '#4a5d51' }}>
                Item Name:
                <input
                  required
                  value={newItemName}
                  placeholder="e.g. Mustard Seeds"
                  onChange={(e) => setNewItemName(e.target.value)}
                  style={{ width: '100%', height: '34px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cfd9cd', padding: '0 8px', fontSize: '11px' }}
                />
              </label>

              <label style={{ fontSize: '10px', fontWeight: 600, color: '#4a5d51' }}>
                Category:
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  style={{ width: '100%', height: '34px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cfd9cd', padding: '0 8px', fontSize: '11px' }}
                >
                  <option value="Grains">Grains & Flour</option>
                  <option value="Pulses">Pulses & Lentils</option>
                  <option value="Dairy">Dairy Products</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Grocery">Grocery & Spices</option>
                </select>
              </label>

              <label style={{ fontSize: '10px', fontWeight: 600, color: '#4a5d51' }}>
                Quantity:
                <input
                  required
                  value={newItemQty}
                  placeholder="e.g. 15 kg"
                  onChange={(e) => setNewItemQty(e.target.value)}
                  style={{ width: '100%', height: '34px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cfd9cd', padding: '0 8px', fontSize: '11px' }}
                />
              </label>

              <div className="confirm-actions" style={{ marginTop: '16px' }}>
                <button type="button" className="button button-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Add Item
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
