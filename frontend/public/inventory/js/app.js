// Hostel Mess Management - Inventory & Waste Control Frontend
// Module Owner: Shatakshi

const API_BASE = (typeof window !== 'undefined' && window.location.port !== '3000' && window.location.hostname === 'localhost') ? 'http://localhost:3000' : '';

const app = {
  inventoryData: [],
  wasteData: [],
  movementsData: [],
  charts: {},

  init: async function() {
    // Set default date for waste logging form to today
    const dateInput = document.getElementById('waste-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    await this.loadAll();
  },

  loadAll: async function() {
    await Promise.all([
      this.loadSummary(),
      this.loadInventory(),
      this.loadWasteRecords(),
      this.loadMovements()
    ]);
  },

  // Switch between tabs
  switchTab: function(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

    const targetBtn = document.getElementById(`tab-btn-${tabName}`);
    const targetContent = document.getElementById(`tab-${tabName}`);

    if (targetBtn) targetBtn.classList.add('active');
    if (targetContent) targetContent.style.display = 'block';

    if (tabName === 'analytics') {
      this.loadSummary();
    } else if (tabName === 'movements') {
      this.loadMovements();
    }
  },

  // 1. Analytics & Summary
  loadSummary: async function() {
    try {
      const res = await fetch('api/analytics/summary');
      const json = await res.json();
      if (!json.success) return;

      const data = json.data;

      // Update KPIs
      document.getElementById('kpi-total-items').textContent = data.inventory.total_items;
      document.getElementById('kpi-low-stock').textContent = data.inventory.low_stock_count;
      document.getElementById('kpi-total-waste').textContent = `${data.waste.total_waste_kg} kg`;
      document.getElementById('kpi-total-cost').textContent = `₹${data.waste.total_loss_cost.toLocaleString('en-IN')}`;

      // Update Low Stock Banner
      const banner = document.getElementById('low-stock-banner');
      const bannerText = document.getElementById('low-stock-items-text');
      if (data.inventory.low_stock_count > 0) {
        banner.style.display = 'flex';
        const itemNames = data.inventory.low_stock_items.map(i => `${i.name} (${i.quantity} ${i.unit} left, min: ${i.min_threshold})`).join(' • ');
        bannerText.textContent = itemNames;
      } else {
        banner.style.display = 'none';
      }

      this.renderCharts(data.waste);
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  },

  renderCharts: function(wasteStats) {
    // 1. Trend Chart
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      const labels = wasteStats.daily_trend.map(d => d.record_date.slice(5)); // MM-DD
      const values = wasteStats.daily_trend.map(d => d.daily_kg);

      if (this.charts.trend) this.charts.trend.destroy();
      this.charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: labels.length ? labels : ['No Data'],
          datasets: [{
            label: 'Waste (kg)',
            data: values.length ? values : [0],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: '#2563eb'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Kilograms (kg)' } }
          }
        }
      });
    }

    // 2. Reason Doughnut Chart
    const reasonCtx = document.getElementById('reasonChart');
    if (reasonCtx) {
      const labels = wasteStats.by_reason.map(r => r.waste_reason);
      const values = wasteStats.by_reason.map(r => r.total_kg);

      if (this.charts.reason) this.charts.reason.destroy();
      this.charts.reason = new Chart(reasonCtx, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['No Data'],
          datasets: [{
            data: values.length ? values : [1],
            backgroundColor: ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }

    // 3. Meal Session Bar Chart
    const mealCtx = document.getElementById('mealChart');
    if (mealCtx) {
      const labels = wasteStats.by_meal.map(m => m.meal_type);
      const values = wasteStats.by_meal.map(m => m.total_kg);

      if (this.charts.meal) this.charts.meal.destroy();
      this.charts.meal = new Chart(mealCtx, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['No Data'],
          datasets: [{
            label: 'Total Wasted (kg)',
            data: values.length ? values : [0],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'kg' } }
          }
        }
      });
    }
  },

  // 2. Inventory Operations
  loadInventory: async function() {
    try {
      const res = await fetch('api/inventory');
      const json = await res.json();
      if (json.success) {
        this.inventoryData = json.data;
        this.renderInventoryTable(this.inventoryData);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  },

  renderInventoryTable: function(items) {
    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No items found matching the selected filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => {
      const isLow = item.quantity <= item.min_threshold;
      return `
        <tr id="inventory-row-${item.id}">
          <td><strong>${this.escapeHtml(item.name)}</strong></td>
          <td><span class="badge badge-category">${this.escapeHtml(item.category)}</span></td>
          <td><strong style="color: ${isLow ? '#dc2626' : '#1e293b'}">${item.quantity} ${item.unit}</strong></td>
          <td>${item.min_threshold} ${item.unit}</td>
          <td>₹${item.unit_price}</td>
          <td>
            ${isLow 
              ? `<span class="badge badge-low-stock">⚠️ Low Stock</span>`
              : `<span class="badge badge-in-stock">✓ In Stock</span>`
            }
          </td>
          <td><small style="color: var(--text-muted)">${this.escapeHtml(item.supplier || 'Mandi')}</small></td>
          <td style="text-align: right;">
            <button class="btn btn-outline btn-sm" onclick="app.openAdjustStockModal(${item.id})">⚡ Adjust</button>
            <button class="btn btn-outline btn-sm" onclick="app.openEditItemModal(${item.id})">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="app.deleteItem(${item.id}, '${this.escapeHtml(item.name)}')">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterInventory: function() {
    const search = document.getElementById('inventory-search').value.toLowerCase().trim();
    const cat = document.getElementById('category-filter').value;
    const stock = document.getElementById('stock-filter').value;

    const filtered = this.inventoryData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search);
      const matchesCat = cat === 'ALL' || item.category === cat;
      const isLow = item.quantity <= item.min_threshold;
      const matchesStock = stock === 'ALL' || (stock === 'LOW' && isLow) || (stock === 'NORMAL' && !isLow);
      return matchesSearch && matchesCat && matchesStock;
    });

    this.renderInventoryTable(filtered);
  },

  filterLowStock: function() {
    document.getElementById('stock-filter').value = 'LOW';
    this.filterInventory();
  },

  openAddItemModal: function() {
    document.getElementById('modal-item-title').textContent = 'Add Inventory Item';
    document.getElementById('form-item').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('modal-item').classList.add('open');
  },

  openEditItemModal: function(id) {
    const item = this.inventoryData.find(i => i.id === id);
    if (!item) return;

    document.getElementById('modal-item-title').textContent = 'Edit Inventory Item';
    document.getElementById('item-id').value = item.id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-unit').value = item.unit;
    document.getElementById('item-quantity').value = item.quantity;
    document.getElementById('item-threshold').value = item.min_threshold;
    document.getElementById('item-price').value = item.unit_price;
    document.getElementById('item-supplier').value = item.supplier || '';

    document.getElementById('modal-item').classList.add('open');
  },

  handleSaveItem: async function(e) {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const payload = {
      name: document.getElementById('item-name').value.trim(),
      category: document.getElementById('item-category').value,
      unit: document.getElementById('item-unit').value,
      quantity: parseFloat(document.getElementById('item-quantity').value),
      min_threshold: parseFloat(document.getElementById('item-threshold').value),
      unit_price: parseFloat(document.getElementById('item-price').value || 0),
      supplier: document.getElementById('item-supplier').value.trim()
    };

    try {
      let res;
      if (id) {
        res = await fetch(`api/inventory/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (!json.success) {
        this.showToast(json.error || 'Failed to save item', 'error');
        return;
      }

      this.closeModals();
      this.showToast(id ? 'Item updated successfully' : 'Item added successfully', 'success');
      await this.loadAll();
    } catch (err) {
      this.showToast('Network error saving item', 'error');
    }
  },

  openAdjustStockModal: function(id) {
    const item = this.inventoryData.find(i => i.id === id);
    if (!item) return;

    document.getElementById('adjust-item-id').value = item.id;
    document.getElementById('adjust-item-name').value = item.name;
    document.getElementById('adjust-item-current').value = `${item.quantity} ${item.unit}`;
    document.getElementById('adjust-qty').value = '';
    document.getElementById('adjust-reason').value = '';
    document.getElementById('modal-adjust').classList.add('open');
  },

  handleAdjustStock: async function(e) {
    e.preventDefault();
    const id = document.getElementById('adjust-item-id').value;
    const change_type = document.getElementById('adjust-action').value;
    const quantity = parseFloat(document.getElementById('adjust-qty').value);
    const reason = document.getElementById('adjust-reason').value.trim();

    try {
      const res = await fetch(`api/inventory/${id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change_type, quantity, reason })
      });
      const json = await res.json();
      if (!json.success) {
        this.showToast(json.error || 'Adjustment failed', 'error');
        return;
      }

      this.closeModals();
      this.showToast('Stock quantity updated & logged', 'success');
      await this.loadAll();
    } catch (err) {
      this.showToast('Error adjusting stock', 'error');
    }
  },

  deleteItem: async function(id, name) {
    if (!confirm(`Are you sure you want to remove '${name}' from inventory?`)) return;

    try {
      const res = await fetch(`api/inventory/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        this.showToast(`Item '${name}' deleted`, 'success');
        await this.loadAll();
      } else {
        this.showToast(json.error, 'error');
      }
    } catch (err) {
      this.showToast('Error deleting item', 'error');
    }
  },

  // 3. Food Waste Operations
  loadWasteRecords: async function() {
    try {
      const meal = document.getElementById('waste-meal-filter').value;
      let url = 'api/waste';
      if (meal && meal !== 'ALL') {
        url += `?meal_type=${encodeURIComponent(meal)}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        this.wasteData = json.data;
        this.renderWasteTable(this.wasteData);
      }
    } catch (err) {
      console.error('Error fetching waste records:', err);
    }
  },

  renderWasteTable: function(records) {
    const tbody = document.getElementById('waste-tbody');
    if (!tbody) return;

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No waste records logged for this filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr id="waste-row-${r.id}">
        <td>${r.record_date}</td>
        <td><span class="badge badge-category">${r.meal_type}</span></td>
        <td><strong>${this.escapeHtml(r.dish_name)}</strong></td>
        <td><strong style="color: #ea580c;">${r.quantity_kg} kg</strong></td>
        <td>${this.escapeHtml(r.waste_reason)}</td>
        <td>₹${r.estimated_cost}</td>
        <td><small style="color: var(--text-muted)">${this.escapeHtml(r.notes || '-')}</small></td>
        <td style="text-align: right;">
          <button class="btn btn-danger btn-sm" onclick="app.deleteWasteRecord(${r.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  },

  openLogWasteModal: function() {
    document.getElementById('form-waste').reset();
    document.getElementById('waste-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('modal-waste').classList.add('open');
  },

  handleSaveWaste: async function(e) {
    e.preventDefault();
    const payload = {
      record_date: document.getElementById('waste-date').value,
      meal_type: document.getElementById('waste-meal').value,
      dish_name: document.getElementById('waste-dish').value.trim(),
      quantity_kg: parseFloat(document.getElementById('waste-qty').value),
      waste_reason: document.getElementById('waste-reason-select').value,
      estimated_cost: parseFloat(document.getElementById('waste-cost').value || 0),
      notes: document.getElementById('waste-notes').value.trim()
    };

    try {
      const res = await fetch('api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) {
        this.showToast(json.error || 'Failed to log waste', 'error');
        return;
      }

      this.closeModals();
      this.showToast('Food waste logged successfully', 'success');
      await this.loadAll();
    } catch (err) {
      this.showToast('Error recording waste', 'error');
    }
  },

  deleteWasteRecord: async function(id) {
    if (!confirm('Are you sure you want to remove this waste record?')) return;
    try {
      const res = await fetch(`api/waste/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        this.showToast('Waste record removed', 'success');
        await this.loadAll();
      } else {
        this.showToast(json.error, 'error');
      }
    } catch (err) {
      this.showToast('Error deleting record', 'error');
    }
  },

  exportWasteCSV: function() {
    if (this.wasteData.length === 0) {
      this.showToast('No waste data to export', 'error');
      return;
    }
    const headers = ['ID', 'Date', 'Meal', 'Dish Name', 'Quantity (kg)', 'Reason', 'Estimated Cost (INR)', 'Notes'];
    const rows = this.wasteData.map(r => [
      r.id,
      r.record_date,
      `"${r.meal_type}"`,
      `"${(r.dish_name || '').replace(/"/g, '""')}"`,
      r.quantity_kg,
      `"${(r.waste_reason || '').replace(/"/g, '""')}"`,
      r.estimated_cost,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hostel_Mess_Food_Waste_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('CSV Report Downloaded', 'success');
  },

  // 4. Stock Movements Audit
  loadMovements: async function() {
    try {
      const res = await fetch('api/inventory-movements?limit=30');
      const json = await res.json();
      if (json.success) {
        this.movementsData = json.data;
        this.renderMovementsTable(this.movementsData);
      }
    } catch (err) {
      console.error('Error fetching movements:', err);
    }
  },

  renderMovementsTable: function(movements) {
    const tbody = document.getElementById('movements-tbody');
    if (!tbody) return;

    if (movements.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No stock movement events recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = movements.map(m => {
      let badge = 'badge-category';
      let icon = '🔄';
      if (m.change_type === 'RESTOCK') {
        badge = 'badge-in-stock';
        icon = '➕';
      } else if (m.change_type === 'WASTE_DISPOSAL') {
        badge = 'badge-low-stock';
        icon = '🗑️';
      } else {
        icon = '🍳';
      }

      return `
        <tr>
          <td><small>${m.created_at}</small></td>
          <td><strong>${this.escapeHtml(m.item_name)}</strong></td>
          <td><span class="badge ${badge}">${icon} ${m.change_type}</span></td>
          <td><strong>${m.quantity} ${m.unit}</strong></td>
          <td>${m.previous_stock} ${m.unit} &rarr; <strong>${m.new_stock} ${m.unit}</strong></td>
          <td><small style="color: var(--text-muted)">${this.escapeHtml(m.reason || '-')}</small></td>
        </tr>
      `;
    }).join('');
  },

  // UI Utilities
  closeModals: function() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  },

  showToast: function(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  },

  escapeHtml: function(text) {
    if (!text) return '';
    return text.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// Auto start on page load
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
