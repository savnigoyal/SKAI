const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(__dirname, 'mess_data.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'kg',
      min_threshold REAL NOT NULL DEFAULT 10,
      unit_price REAL NOT NULL DEFAULT 0,
      supplier TEXT DEFAULT 'Local Mandi / Wholesale Vendor',
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      change_type TEXT NOT NULL, -- 'RESTOCK', 'CONSUMED', 'WASTE_DISPOSAL'
      quantity REAL NOT NULL,
      previous_stock REAL NOT NULL,
      new_stock REAL NOT NULL,
      reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS food_waste_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_date TEXT NOT NULL,
      meal_type TEXT NOT NULL, -- 'Breakfast', 'Lunch', 'Dinner', 'Snacks'
      dish_name TEXT NOT NULL,
      quantity_kg REAL NOT NULL,
      waste_reason TEXT NOT NULL, -- 'Surplus Preparation', 'Spoiled Ingredients', 'Plate Leftovers', 'Burnt / Quality Rejection'
      estimated_cost REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed sample data if table is empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM inventory_items').get();
  if (countRow.count === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  const insertItem = db.prepare(`
    INSERT INTO inventory_items (name, category, quantity, unit, min_threshold, unit_price, supplier)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const initialItems = [
    ['Basmati Rice', 'Grains', 150, 'kg', 50, 48, 'Punjab Agro Wholesale'],
    ['Wheat Flour (Atta)', 'Grains', 200, 'kg', 60, 36, 'Ashirwad Mill Depot'],
    ['Arhar / Toor Dal', 'Pulses', 45, 'kg', 30, 140, 'Desi Mandi Suppliers'],
    ['Moong Dal', 'Pulses', 18, 'kg', 25, 115, 'Desi Mandi Suppliers'], // Below threshold!
    ['Refined Sunflower Oil', 'Oils & Fats', 80, 'L', 30, 135, 'Fortune Depot'],
    ['Fresh Toned Milk', 'Dairy', 20, 'L', 35, 56, 'Amul Dairy Booth'], // Below threshold!
    ['Fresh Paneer', 'Dairy', 8, 'kg', 12, 340, 'Amul Dairy Booth'], // Below threshold!
    ['Onions', 'Vegetables', 120, 'kg', 40, 32, 'APMC Mandi Yard'],
    ['Potatoes', 'Vegetables', 180, 'kg', 50, 24, 'APMC Mandi Yard'],
    ['Tomatoes', 'Vegetables', 35, 'kg', 20, 28, 'APMC Mandi Yard'],
    ['CTC Tea Leaves', 'Beverages', 15, 'kg', 8, 280, 'Tata Tea Distribution'],
    ['Table Salt & Spices', 'Spices', 25, 'kg', 10, 65, 'MDH Spices Hub']
  ];

  for (const item of initialItems) {
    insertItem.run(...item);
  }

  // Seed waste records (last 7 days)
  const insertWaste = db.prepare(`
    INSERT INTO food_waste_records (record_date, meal_type, dish_name, quantity_kg, waste_reason, estimated_cost, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const getDateStr = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  const initialWaste = [
    [getDateStr(6), 'Dinner', 'Mixed Veg Curry & Rice', 14.5, 'Plate Leftovers', 870, 'Low attendance due to weekend outing'],
    [getDateStr(5), 'Lunch', 'Rajma Masala', 8.0, 'Surplus Preparation', 520, 'Cooked for 350 students, only 280 turned up'],
    [getDateStr(4), 'Breakfast', 'Poha & Sambhar', 6.2, 'Plate Leftovers', 310, 'Sambhar was slightly sour, students left portions'],
    [getDateStr(3), 'Dinner', 'Paneer Butter Masala', 4.5, 'Burnt / Quality Rejection', 680, 'One batch scorched on heavy flame'],
    [getDateStr(2), 'Lunch', 'Dal Tadka & Steamed Rice', 12.0, 'Plate Leftovers', 600, 'Student turnout dropped, high wastage'],
    [getDateStr(1), 'Dinner', 'Aloo Gobi & Roti', 9.5, 'Surplus Preparation', 475, 'Excess preparation by night staff'],
    [getDateStr(0), 'Breakfast', 'Upma & Chutney', 5.0, 'Surplus Preparation', 250, 'Surplus prepared for early shift'],
    [getDateStr(0), 'Lunch', 'Chole Bhature', 11.2, 'Plate Leftovers', 784, 'Heavily wasted on plates']
  ];

  for (const waste of initialWaste) {
    insertWaste.run(...waste);
  }
}

// Database helper queries
const InventoryDB = {
  getAllItems: () => {
    return db.prepare(`
      SELECT *, 
        CASE WHEN quantity <= min_threshold THEN 1 ELSE 0 END AS is_low_stock
      FROM inventory_items 
      ORDER BY is_low_stock DESC, name ASC
    `).all();
  },

  getItemById: (id) => {
    return db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(id);
  },

  addItem: ({ name, category, quantity, unit, min_threshold, unit_price, supplier }) => {
    const stmt = db.prepare(`
      INSERT INTO inventory_items (name, category, quantity, unit, min_threshold, unit_price, supplier)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, category, Number(quantity), unit, Number(min_threshold), Number(unit_price), supplier || 'General Vendor');
    return info.lastInsertRowid;
  },

  updateItem: (id, { name, category, quantity, unit, min_threshold, unit_price, supplier }) => {
    const stmt = db.prepare(`
      UPDATE inventory_items 
      SET name = ?, category = ?, quantity = ?, unit = ?, min_threshold = ?, unit_price = ?, supplier = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(name, category, Number(quantity), unit, Number(min_threshold), Number(unit_price), supplier, id);
    return result.changes;
  },

  adjustStock: (id, changeType, deltaQty, reason) => {
    const item = InventoryDB.getItemById(id);
    if (!item) throw new Error('Item not found');

    const previousStock = Number(item.quantity);
    let newStock = previousStock;

    if (changeType === 'RESTOCK') {
      newStock += Number(deltaQty);
    } else if (changeType === 'CONSUMED' || changeType === 'WASTE_DISPOSAL') {
      if (previousStock < Number(deltaQty)) {
        throw new Error(`Insufficient stock. Current: ${previousStock} ${item.unit}, attempted reduction: ${deltaQty} ${item.unit}`);
      }
      newStock -= Number(deltaQty);
    } else {
      throw new Error('Invalid change type');
    }

    // Update item stock
    db.prepare('UPDATE inventory_items SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStock, id);

    // Record movement
    db.prepare(`
      INSERT INTO stock_movements (item_id, change_type, quantity, previous_stock, new_stock, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, changeType, Number(deltaQty), previousStock, newStock, reason || 'Manual stock update');

    return { id, previousStock, newStock, unit: item.unit };
  },

  deleteItem: (id) => {
    const result = db.prepare('DELETE FROM inventory_items WHERE id = ?').run(id);
    return result.changes;
  },

  getMovements: (limit = 20) => {
    return db.prepare(`
      SELECT m.*, i.name as item_name, i.unit 
      FROM stock_movements m
      JOIN inventory_items i ON m.item_id = i.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(limit);
  }
};

const WasteDB = {
  getAllWaste: (filters = {}) => {
    let query = 'SELECT * FROM food_waste_records';
    const params = [];
    const conditions = [];

    if (filters.meal_type && filters.meal_type !== 'ALL') {
      conditions.push('meal_type = ?');
      params.push(filters.meal_type);
    }

    if (filters.startDate) {
      conditions.push('record_date >= ?');
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('record_date <= ?');
      params.push(filters.endDate);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY record_date DESC, id DESC';
    return db.prepare(query).all(...params);
  },

  addWasteRecord: ({ record_date, meal_type, dish_name, quantity_kg, waste_reason, estimated_cost, notes }) => {
    const stmt = db.prepare(`
      INSERT INTO food_waste_records (record_date, meal_type, dish_name, quantity_kg, waste_reason, estimated_cost, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      record_date,
      meal_type,
      dish_name,
      Number(quantity_kg),
      waste_reason,
      Number(estimated_cost || 0),
      notes || ''
    );
    return info.lastInsertRowid;
  },

  deleteWasteRecord: (id) => {
    const result = db.prepare('DELETE FROM food_waste_records WHERE id = ?').run(id);
    return result.changes;
  },

  getAnalyticsSummary: () => {
    // Inventory summary
    const invCount = db.prepare('SELECT COUNT(*) as total_items FROM inventory_items').get().total_items;
    const lowStock = db.prepare('SELECT COUNT(*) as low_count FROM inventory_items WHERE quantity <= min_threshold').get().low_count;
    const lowStockList = db.prepare('SELECT id, name, category, quantity, unit, min_threshold FROM inventory_items WHERE quantity <= min_threshold').all();

    // Waste summary
    const wasteTotals = db.prepare(`
      SELECT 
        COALESCE(SUM(quantity_kg), 0) as total_waste_kg,
        COALESCE(SUM(estimated_cost), 0) as total_loss_cost,
        COUNT(*) as total_incidents
      FROM food_waste_records
    `).get();

    // Waste by meal type
    const wasteByMeal = db.prepare(`
      SELECT meal_type, COALESCE(SUM(quantity_kg), 0) as total_kg
      FROM food_waste_records
      GROUP BY meal_type
      ORDER BY total_kg DESC
    `).all();

    // Waste by reason
    const wasteByReason = db.prepare(`
      SELECT waste_reason, COALESCE(SUM(quantity_kg), 0) as total_kg, COALESCE(SUM(estimated_cost), 0) as total_cost
      FROM food_waste_records
      GROUP BY waste_reason
      ORDER BY total_kg DESC
    `).all();

    // 7-day trend
    const dailyTrend = db.prepare(`
      SELECT record_date, COALESCE(SUM(quantity_kg), 0) as daily_kg
      FROM food_waste_records
      GROUP BY record_date
      ORDER BY record_date ASC
      LIMIT 14
    `).all();

    return {
      inventory: {
        total_items: invCount,
        low_stock_count: lowStock,
        low_stock_items: lowStockList
      },
      waste: {
        total_waste_kg: Math.round(wasteTotals.total_waste_kg * 10) / 10,
        total_loss_cost: Math.round(wasteTotals.total_loss_cost),
        total_incidents: wasteTotals.total_incidents,
        by_meal: wasteByMeal,
        by_reason: wasteByReason,
        daily_trend: dailyTrend
      }
    };
  }
};

// Initialize DB schema & seed on module load
initDatabase();

module.exports = {
  db,
  InventoryDB,
  WasteDB
};
