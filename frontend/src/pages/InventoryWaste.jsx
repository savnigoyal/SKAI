import React, { useState, useMemo } from 'react';
import {
  Package,
  Trash2,
  AlertTriangle,
  TrendingDown,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Edit,
  X
} from 'lucide-react';

export default function InventoryWaste() {
  // Active sub-tab inside Shatakshi's module
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'waste' | 'analytics' | 'movements'

  // 1. Inventory State
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Basmati Rice', category: 'Grains', quantity: 150, unit: 'kg', minThreshold: 50, unitPrice: 48, supplier: 'Punjab Agro Wholesale' },
    { id: 2, name: 'Wheat Flour (Atta)', category: 'Grains', quantity: 200, unit: 'kg', minThreshold: 60, unitPrice: 36, supplier: 'Ashirwad Mill Depot' },
    { id: 3, name: 'Arhar / Toor Dal', category: 'Pulses', quantity: 45, unit: 'kg', minThreshold: 30, unitPrice: 140, supplier: 'Desi Mandi Suppliers' },
    { id: 4, name: 'Moong Dal', category: 'Pulses', quantity: 18, unit: 'kg', minThreshold: 25, unitPrice: 115, supplier: 'Desi Mandi Suppliers' }, // LOW STOCK
    { id: 5, name: 'Refined Sunflower Oil', category: 'Oils & Fats', quantity: 80, unit: 'L', minThreshold: 30, unitPrice: 135, supplier: 'Fortune Depot' },
    { id: 6, name: 'Fresh Toned Milk', category: 'Dairy', quantity: 20, unit: 'L', minThreshold: 35, unitPrice: 56, supplier: 'Amul Dairy Booth' }, // LOW STOCK
    { id: 7, name: 'Fresh Paneer', category: 'Dairy', quantity: 8, unit: 'kg', minThreshold: 12, unitPrice: 340, supplier: 'Amul Dairy Booth' }, // LOW STOCK
    { id: 8, name: 'Onions', category: 'Vegetables', quantity: 120, unit: 'kg', minThreshold: 40, unitPrice: 32, supplier: 'APMC Mandi Yard' },
    { id: 9, name: 'Potatoes', category: 'Vegetables', quantity: 180, unit: 'kg', minThreshold: 50, unitPrice: 24, supplier: 'APMC Mandi Yard' },
    { id: 10, name: 'Tomatoes', category: 'Vegetables', quantity: 35, unit: 'kg', minThreshold: 20, unitPrice: 28, supplier: 'APMC Mandi Yard' },
    { id: 11, name: 'CTC Tea Leaves', category: 'Beverages', quantity: 15, unit: 'kg', minThreshold: 8, unitPrice: 280, supplier: 'Tata Tea Distribution' },
    { id: 12, name: 'Table Salt & Spices', category: 'Spices', quantity: 25, unit: 'kg', minThreshold: 10, unitPrice: 65, supplier: 'MDH Spices Hub' }
  ]);

  // 2. Food Waste Records State
  const [wasteRecords, setWasteRecords] = useState([
    { id: 1, date: '2026-10-25', meal: 'Lunch', dish: 'Chole Bhature', qtyKg: 11.2, reason: 'Plate Leftovers', cost: 784, notes: 'Heavy leftover portions on student plates' },
    { id: 2, date: '2026-10-25', meal: 'Breakfast', dish: 'Upma & Chutney', qtyKg: 5.0, reason: 'Surplus Preparation', cost: 250, notes: 'Surplus prepared for early shift' },
    { id: 3, date: '2026-10-24', meal: 'Dinner', dish: 'Aloo Gobi & Roti', qtyKg: 9.5, reason: 'Surplus Preparation', cost: 475, notes: 'Excess preparation by night staff' },
    { id: 4, date: '2026-10-23', meal: 'Lunch', dish: 'Dal Tadka & Steamed Rice', qtyKg: 12.0, reason: 'Plate Leftovers', cost: 600, notes: 'Student turnout dropped, high wastage' },
    { id: 5, date: '2026-10-22', meal: 'Dinner', dish: 'Paneer Butter Masala', qtyKg: 4.5, reason: 'Burnt / Quality Rejection', cost: 680, notes: 'One batch scorched on heavy flame' },
    { id: 6, date: '2026-10-21', meal: 'Breakfast', dish: 'Poha & Sambhar', qtyKg: 6.2, reason: 'Plate Leftovers', cost: 310, notes: 'Sambhar was slightly sour, portions discarded' },
    { id: 7, date: '2026-10-20', meal: 'Lunch', dish: 'Rajma Masala', qtyKg: 8.0, reason: 'Surplus Preparation', cost: 520, notes: 'Cooked for 350 students, only 280 turned up' },
    { id: 8, date: '2026-10-19', meal: 'Dinner', dish: 'Mixed Veg Curry & Rice', qtyKg: 14.5, reason: 'Plate Leftovers', cost: 870, notes: 'Low attendance due to weekend outing' }
  ]);

  // 3. Stock Movements Audit Log State
  const [movements, setMovements] = useState([
    { id: 1, time: '2026-10-25 17:21', item: 'Fresh Paneer', type: 'RESTOCK', change: '+20 kg', before: '8 kg', after: '28 kg', reason: 'Fresh dairy procurement' },
    { id: 2, time: '2026-10-25 12:45', item: 'Basmati Rice', type: 'CONSUMED', change: '-35 kg', before: '185 kg', after: '150 kg', reason: 'Sunday Lunch Biryani batch' },
    { id: 3, time: '2026-10-24 19:30', item: 'Wheat Flour (Atta)', type: 'CONSUMED', change: '-25 kg', before: '225 kg', after: '200 kg', reason: 'Dinner Roti batch' },
    { id: 4, time: '2026-10-24 09:15', item: 'Moong Dal', type: 'CONSUMED', change: '-12 kg', before: '30 kg', after: '18 kg', reason: 'Moong Dal Khichdi preparation' },
    { id: 5, time: '2026-10-23 15:00', item: 'Tomatoes', type: 'WASTE_DISPOSAL', change: '-5 kg', before: '40 kg', after: '35 kg', reason: 'Overripe lot discarded' }
  ]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [wasteMealFilter, setWasteMealFilter] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Grains');
  const [formQty, setFormQty] = useState('');
  const [formUnit, setFormUnit] = useState('kg');
  const [formThreshold, setFormThreshold] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSupplier, setFormSupplier] = useState('');

  // Adjust Form
  const [adjustType, setAdjustType] = useState('RESTOCK');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Waste Form
  const [wasteDate, setWasteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [wasteMeal, setWasteMeal] = useState('Dinner');
  const [wasteDish, setWasteDish] = useState('');
  const [wasteQty, setWasteQty] = useState('');
  const [wasteReason, setWasteReason] = useState('Plate Leftovers');
  const [wasteCost, setWasteCost] = useState('');
  const [wasteNotes, setWasteNotes] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPI Calculations
  const totalItemsCount = inventory.length;
  const lowStockItems = useMemo(() => inventory.filter(i => i.quantity <= i.minThreshold), [inventory]);
  const lowStockCount = lowStockItems.length;
  const totalWasteKg = useMemo(() => Math.round(wasteRecords.reduce((acc, r) => acc + r.qtyKg, 0) * 10) / 10, [wasteRecords]);
  const totalWasteCost = useMemo(() => wasteRecords.reduce((acc, r) => acc + (r.cost || 0), 0), [wasteRecords]);

  // Waste by reason breakdown
  const wasteByReason = useMemo(() => {
    const map = {};
    wasteRecords.forEach(r => {
      map[r.reason] = (map[r.reason] || 0) + r.qtyKg;
    });
    return Object.entries(map).map(([reason, kg]) => ({ reason, kg: Math.round(kg * 10) / 10 }));
  }, [wasteRecords]);

  // Waste by meal breakdown
  const wasteByMeal = useMemo(() => {
    const map = { Breakfast: 0, Lunch: 0, Dinner: 0, Snacks: 0 };
    wasteRecords.forEach(r => {
      if (map[r.meal] !== undefined) map[r.meal] += r.qtyKg;
    });
    return Object.entries(map).map(([meal, kg]) => ({ meal, kg: Math.round(kg * 10) / 10 }));
  }, [wasteRecords]);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const isLow = item.quantity <= item.minThreshold;
      const matchesStock = stockStatusFilter === 'ALL' || (stockStatusFilter === 'LOW' && isLow) || (stockStatusFilter === 'NORMAL' && !isLow);
      return matchesSearch && matchesCat && matchesStock;
    });
  }, [inventory, searchQuery, categoryFilter, stockStatusFilter]);

  // Filtered Waste Records
  const filteredWaste = useMemo(() => {
    if (wasteMealFilter === 'ALL') return wasteRecords;
    return wasteRecords.filter(r => r.meal === wasteMealFilter);
  }, [wasteRecords, wasteMealFilter]);

  // Handlers
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formQty || !formThreshold) return;

    if (activeItem) {
      // Edit
      setInventory(prev => prev.map(item => item.id === activeItem.id ? {
        ...item,
        name: formName.trim(),
        category: formCategory,
        quantity: parseFloat(formQty),
        unit: formUnit,
        minThreshold: parseFloat(formThreshold),
        unitPrice: parseFloat(formPrice || 0),
        supplier: formSupplier.trim() || 'General Mandi'
      } : item));
      showToast(`Updated '${formName}'`);
    } else {
      // Add
      const newItem = {
        id: Date.now(),
        name: formName.trim(),
        category: formCategory,
        quantity: parseFloat(formQty),
        unit: formUnit,
        minThreshold: parseFloat(formThreshold),
        unitPrice: parseFloat(formPrice || 0),
        supplier: formSupplier.trim() || 'General Mandi'
      };
      setInventory(prev => [newItem, ...prev]);
      showToast(`Added '${formName}' to inventory`);
    }

    setShowAddModal(false);
    setActiveItem(null);
  };

  const handleConfirmAdjust = (e) => {
    e.preventDefault();
    if (!activeItem || !adjustQty) return;
    const qty = parseFloat(adjustQty);
    if (isNaN(qty) || qty <= 0) return;

    const prevQty = activeItem.quantity;
    let newQty = prevQty;

    if (adjustType === 'RESTOCK') {
      newQty = prevQty + qty;
    } else {
      if (prevQty < qty) {
        alert(`Cannot deduct ${qty} ${activeItem.unit}. Only ${prevQty} ${activeItem.unit} available in store!`);
        return;
      }
      newQty = prevQty - qty;
    }

    // Update item stock
    setInventory(prev => prev.map(i => i.id === activeItem.id ? { ...i, quantity: newQty } : i));

    // Add to audit trail
    const newMovement = {
      id: Date.now(),
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      item: activeItem.name,
      type: adjustType,
      change: `${adjustType === 'RESTOCK' ? '+' : '-'}${qty} ${activeItem.unit}`,
      before: `${prevQty} ${activeItem.unit}`,
      after: `${newQty} ${activeItem.unit}`,
      reason: adjustReason.trim() || 'Manual stock update'
    };
    setMovements(prev => [newMovement, ...prev]);

    setShowAdjustModal(false);
    setActiveItem(null);
    setAdjustQty('');
    setAdjustReason('');
    showToast(`Stock updated: ${activeItem.name} now ${newQty} ${activeItem.unit}`);
  };

  const handleDeleteItem = (id, name) => {
    if (!confirm(`Are you sure you want to remove '${name}' from inventory?`)) return;
    setInventory(prev => prev.filter(i => i.id !== id));
    showToast(`Removed '${name}' from store`);
  };

  const handleSaveWaste = (e) => {
    e.preventDefault();
    if (!wasteDish.trim() || !wasteQty) return;

    const newRecord = {
      id: Date.now(),
      date: wasteDate,
      meal: wasteMeal,
      dish: wasteDish.trim(),
      qtyKg: parseFloat(wasteQty),
      reason: wasteReason,
      cost: parseFloat(wasteCost || 0),
      notes: wasteNotes.trim()
    };

    setWasteRecords(prev => [newRecord, ...prev]);
    setShowWasteModal(false);
    setWasteDish('');
    setWasteQty('');
    setWasteCost('');
    setWasteNotes('');
    showToast(`Logged ${wasteQty} kg waste for ${wasteDish}`);
  };

  const handleDeleteWaste = (id) => {
    if (!confirm('Remove this food waste record?')) return;
    setWasteRecords(prev => prev.filter(r => r.id !== id));
    showToast('Waste record removed');
  };

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Meal', 'Dish Name', 'Quantity (kg)', 'Reason', 'Cost Loss (INR)', 'Notes'];
    const rows = wasteRecords.map(r => [
      r.id,
      r.date,
      `"${r.meal}"`,
      `"${r.dish.replace(/"/g, '""')}"`,
      r.qtyKg,
      `"${r.reason.replace(/"/g, '""')}"`,
      r.cost,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Hostel_Mess_Food_Waste_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded Food Waste CSV Report');
  };

  return (
    <div className="inventory-module-container" style={{ padding: '0 0 40px 0', width: '100%' }}>

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Module 4 Lead: Shatakshi
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Hostel Mess Logistics & Food Waste Analytics
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            Inventory Control & Food Waste Analytics
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Real-time grocery store monitoring, automatic reorder threshold notices, and meal-wise wastage accountability.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {activeTab === 'waste' && (
            <button
              onClick={exportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <Download size={15} /> Export CSV
            </button>
          )}

          {activeTab === 'inventory' && (
            <button
              onClick={() => {
                setActiveItem(null);
                setFormName('');
                setFormCategory('Grains');
                setFormQty('');
                setFormUnit('kg');
                setFormThreshold('');
                setFormPrice('');
                setFormSupplier('');
                setShowAddModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#2f785b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Add Inventory Item
            </button>
          )}

          {activeTab === 'waste' && (
            <button
              onClick={() => setShowWasteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#ea580c',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Log Meal Wastage
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Total Stocked */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Total Store Items</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{totalItemsCount}</div>
            <div style={{ fontSize: '11px', color: '#10b981' }}>Active pantry supplies</div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: '#fef2f2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Low Stock Alerts</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: lowStockCount > 0 ? '#dc2626' : '#0f172a' }}>
              {lowStockCount} Items
            </div>
            <div style={{ fontSize: '11px', color: '#dc2626' }}>Below threshold alert</div>
          </div>
        </div>

        {/* Total Food Wasted */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: '#fff7ed',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Trash2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Total Food Wasted</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{totalWasteKg} kg</div>
            <div style={{ fontSize: '11px', color: '#ea580c' }}>Recorded kitchen loss</div>
          </div>
        </div>

        {/* Financial Loss */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: '#f0fdf4',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: '800'
          }}>
            ₹
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Est. Wastage Cost</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>₹{totalWasteCost.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Avoidable mess deficit</div>
          </div>
        </div>
      </div>

      {/* Critical Reorder Banner */}
      {lowStockCount > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} /> Critical Reorder Notice: Immediate Kitchen Procurement Needed
            </div>
            <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '2px' }}>
              {lowStockItems.map(i => `${i.name} (${i.quantity} ${i.unit} left, min threshold: ${i.minThreshold})`).join(' • ')}
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('inventory');
              setStockStatusFilter('LOW');
            }}
            style={{
              padding: '6px 14px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            View Low Stock
          </button>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px'
      }}>
        {[
          { id: 'inventory', label: '📦 Stock & Pantry Store', count: inventory.length },
          { id: 'waste', label: '🗑️ Food Waste Log', count: wasteRecords.length },
          { id: 'analytics', label: '📊 Waste Analytics & Trends' },
          { id: 'movements', label: '📋 Stock Movements Audit Trail', count: movements.length }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: '700',
              color: activeTab === t.id ? '#2f785b' : '#64748b',
              borderBottom: activeTab === t.id ? '3px solid #2f785b' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span style={{
                background: activeTab === t.id ? '#dcfce7' : '#f1f5f9',
                color: activeTab === t.id ? '#15803d' : '#64748b',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: INVENTORY STORE */}
      {activeTab === 'inventory' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    width: '200px'
                  }}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="ALL">All Categories</option>
                <option value="Grains">Grains & Flour</option>
                <option value="Pulses">Pulses & Dals</option>
                <option value="Oils & Fats">Oils & Fats</option>
                <option value="Dairy">Dairy</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Spices">Spices</option>
                <option value="Beverages">Beverages</option>
              </select>

              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="ALL">All Stock Levels</option>
                <option value="LOW">Low Stock Only</option>
                <option value="NORMAL">Sufficient Stock</option>
              </select>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Showing <strong>{filteredInventory.length}</strong> items
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Item Name</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Category</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Current Stock</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Min. Threshold</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Unit Cost</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Supplier</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const isLow = item.quantity <= item.minThreshold;
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>{item.name}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '800', color: isLow ? '#dc2626' : '#0f172a' }}>
                        {item.quantity} {item.unit}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{item.minThreshold} {item.unit}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>₹{item.unitPrice}</td>
                      <td style={{ padding: '12px 14px' }}>
                        {isLow ? (
                          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700' }}>
                            ⚠️ Low Stock
                          </span>
                        ) : (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700' }}>
                            ✓ In Stock
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>{item.supplier}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setActiveItem(item);
                            setAdjustType('RESTOCK');
                            setAdjustQty('');
                            setAdjustReason('');
                            setShowAdjustModal(true);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            marginRight: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          ⚡ Adjust
                        </button>
                        <button
                          onClick={() => {
                            setActiveItem(item);
                            setFormName(item.name);
                            setFormCategory(item.category);
                            setFormQty(item.quantity);
                            setFormUnit(item.unit);
                            setFormThreshold(item.minThreshold);
                            setFormPrice(item.unitPrice);
                            setFormSupplier(item.supplier);
                            setShowAddModal(true);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            marginRight: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          style={{
                            padding: '4px 8px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FOOD WASTE LOG */}
      {activeTab === 'waste' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Filter Meal Session:</span>
              <select
                value={wasteMealFilter}
                onChange={(e) => setWasteMealFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="ALL">All Meals</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Showing <strong>{filteredWaste.length}</strong> logged incidents
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Date</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Meal Session</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Dish / Item Name</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Quantity Wasted</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Waste Cause</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Estimated Cost Loss</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Kitchen Observation</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredWaste.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{r.date}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: r.meal === 'Dinner' ? '#fdf2f8' : r.meal === 'Lunch' ? '#eff6ff' : '#fffbeb',
                        color: r.meal === 'Dinner' ? '#9d174d' : r.meal === 'Lunch' ? '#1d4ed8' : '#b45309',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {r.meal}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>{r.dish}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '800', color: '#ea580c' }}>{r.qtyKg} kg</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{r.reason}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '600' }}>₹{r.cost}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>{r.notes || '—'}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteWaste(r.id)}
                        style={{
                          padding: '4px 8px',
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WASTE ANALYTICS & TRENDS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          {/* Reason Breakdown Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
              Food Waste by Root Cause (kg)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {wasteByReason.map(({ reason, kg }) => {
                const pct = Math.round((kg / totalWasteKg) * 100) || 0;
                return (
                  <div key={reason}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: '#334155' }}>{reason}</span>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>{kg} kg ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: reason === 'Plate Leftovers' ? '#ea580c' : reason === 'Surplus Preparation' ? '#eab308' : '#ef4444',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meal Breakdown Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
              Wastage Across Meal Sessions (kg)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {wasteByMeal.map(({ meal, kg }) => {
                const pct = Math.round((kg / totalWasteKg) * 100) || 0;
                return (
                  <div key={meal}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: '#334155' }}>{meal}</span>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>{kg} kg ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: '#2f785b',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Kitchen Recommendation */}
          <div style={{
            gridColumn: '1 / -1',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>
              <strong>Mess Operations Recommendation:</strong> Dinner and Lunch account for over <strong>78%</strong> of unconsumed plate leftovers.
              Cross-referencing with student voting results and food reviews indicates that reducing rice batch sizes by 12% on weekends directly recovers ₹3,200/week in food expenditure.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'movements' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
            Pantry Movement & Audit Trail
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Item Name</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Action Type</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Quantity Changed</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Stock Level (Before &rarr; After)</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Reason / Notes</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{m.time}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>{m.item}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: m.type === 'RESTOCK' ? '#dcfce7' : m.type === 'CONSUMED' ? '#eff6ff' : '#fee2e2',
                        color: m.type === 'RESTOCK' ? '#15803d' : m.type === 'CONSUMED' ? '#1d4ed8' : '#b91c1c',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {m.type === 'RESTOCK' ? '➕ RESTOCK' : m.type === 'CONSUMED' ? '🍳 CONSUMED' : '🗑️ WASTE DISPOSAL'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '800' }}>{m.change}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{m.before} &rarr; <strong>{m.after}</strong></td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ITEM */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{activeItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Item Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Basmati Rice, Moong Dal"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="Grains">Grains & Flour</option>
                    <option value="Pulses">Pulses & Dals</option>
                    <option value="Oils & Fats">Oils & Fats</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Spices">Spices</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Unit *</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="L">L (Litre)</option>
                    <option value="bags">Bags</option>
                    <option value="packets">Packets</option>
                    <option value="units">Units / Pieces</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    placeholder="e.g. 50"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Min Threshold *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                    placeholder="e.g. 20"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 45"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Supplier / Mandi</label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="e.g. Wholesale Mandi"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#2f785b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST STOCK */}
      {showAdjustModal && activeItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '420px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Adjust Stock: {activeItem.name}</h3>
              <button onClick={() => setShowAdjustModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleConfirmAdjust}>
              <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                Current Store Quantity: <strong>{activeItem.quantity} {activeItem.unit}</strong>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Adjustment Action *</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="RESTOCK">➕ Restock (Add Stock to Store)</option>
                  <option value="CONSUMED">🍳 Kitchen Consumption (Deduct Stock)</option>
                  <option value="WASTE_DISPOSAL">🗑️ Waste / Spoilage Disposal (Deduct Stock)</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Quantity to Adjust ({activeItem.unit}) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Enter amount"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Reason / Batch Reference</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Fresh Mandi delivery, Dinner batch"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAdjustModal(false)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#2f785b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Confirm Stock Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG FOOD WASTE */}
      {showWasteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Log Food Wastage Incident</h3>
              <button onClick={() => setShowWasteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveWaste}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Date *</label>
                  <input
                    type="date"
                    required
                    value={wasteDate}
                    onChange={(e) => setWasteDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Meal Session *</label>
                  <select
                    value={wasteMeal}
                    onChange={(e) => setWasteMeal(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Dish / Food Item *</label>
                <input
                  type="text"
                  required
                  value={wasteDish}
                  onChange={(e) => setWasteDish(e.target.value)}
                  placeholder="e.g. Mixed Veg & Rice, Dal Makhani"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Quantity Wasted (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={wasteQty}
                    onChange={(e) => setWasteQty(e.target.value)}
                    placeholder="e.g. 7.5"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Estimated Loss (₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={wasteCost}
                    onChange={(e) => setWasteCost(e.target.value)}
                    placeholder="e.g. 450"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Root Cause *</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Plate Leftovers">Plate Leftovers (Student unconsumed portion)</option>
                  <option value="Surplus Preparation">Surplus Preparation (Cooked excess quantity)</option>
                  <option value="Spoiled Ingredients">Spoiled Ingredients (Storage breakdown)</option>
                  <option value="Burnt / Quality Rejection">Burnt / Quality Rejection (Kitchen defect)</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>Kitchen Notes</label>
                <input
                  type="text"
                  value={wasteNotes}
                  onChange={(e) => setWasteNotes(e.target.value)}
                  placeholder="e.g. Low student turnout due to holiday weekend"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowWasteModal(false)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#ea580c', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Record Wastage</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Message */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10000
        }}>
          <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          {toastMessage}
        </div>
      )}

    </div>
  );
}
