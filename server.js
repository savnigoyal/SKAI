const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { InventoryDB, WasteDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// INVENTORY API ROUTES (Shatakshi's Module)
// ==========================================

// Get all inventory items
app.get('/api/inventory', (req, res) => {
  try {
    const items = InventoryDB.getAllItems();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single inventory item
app.get('/api/inventory/:id', (req, res) => {
  try {
    const item = InventoryDB.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add new inventory item
app.post('/api/inventory', (req, res) => {
  try {
    const { name, category, quantity, unit, min_threshold, unit_price, supplier } = req.body;
    
    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Item name is required' });
    }
    if (!category) {
      return res.status(400).json({ success: false, error: 'Category is required' });
    }
    if (isNaN(quantity) || Number(quantity) < 0) {
      return res.status(400).json({ success: false, error: 'Valid non-negative quantity is required' });
    }
    if (isNaN(min_threshold) || Number(min_threshold) < 0) {
      return res.status(400).json({ success: false, error: 'Valid minimum threshold is required' });
    }

    const newId = InventoryDB.addItem({
      name: name.trim(),
      category: category.trim(),
      quantity: Number(quantity),
      unit: unit ? unit.trim() : 'kg',
      min_threshold: Number(min_threshold),
      unit_price: Number(unit_price || 0),
      supplier: supplier ? supplier.trim() : 'Wholesale Mandi'
    });

    const createdItem = InventoryDB.getItemById(newId);
    res.status(201).json({ success: true, message: 'Item added successfully', data: createdItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update existing inventory item
app.put('/api/inventory/:id', (req, res) => {
  try {
    const { name, category, quantity, unit, min_threshold, unit_price, supplier } = req.body;
    const id = req.params.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Item name is required' });
    }
    if (isNaN(quantity) || Number(quantity) < 0) {
      return res.status(400).json({ success: false, error: 'Valid non-negative quantity is required' });
    }

    const changes = InventoryDB.updateItem(id, {
      name: name.trim(),
      category: category.trim(),
      quantity: Number(quantity),
      unit: unit ? unit.trim() : 'kg',
      min_threshold: Number(min_threshold),
      unit_price: Number(unit_price || 0),
      supplier: supplier ? supplier.trim() : 'Wholesale Mandi'
    });

    if (changes === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const updated = InventoryDB.getItemById(id);
    res.json({ success: true, message: 'Item updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Adjust stock (Quick Restock or Consume)
app.post('/api/inventory/:id/adjust', (req, res) => {
  try {
    const { change_type, quantity, reason } = req.body;
    const id = req.params.id;

    if (!change_type || !['RESTOCK', 'CONSUMED', 'WASTE_DISPOSAL'].includes(change_type)) {
      return res.status(400).json({ success: false, error: 'Invalid change_type. Allowed: RESTOCK, CONSUMED, WASTE_DISPOSAL' });
    }
    if (isNaN(quantity) || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity to adjust must be a positive number' });
    }

    const result = InventoryDB.adjustStock(id, change_type, Number(quantity), reason);
    res.json({ success: true, message: 'Stock adjusted successfully', data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Delete inventory item
app.delete('/api/inventory/:id', (req, res) => {
  try {
    const changes = InventoryDB.deleteItem(req.params.id);
    if (changes === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get stock movements
app.get('/api/inventory-movements', (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const movements = InventoryDB.getMovements(limit);
    res.json({ success: true, data: movements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// FOOD WASTE API ROUTES (Shatakshi's Module)
// ==========================================

// Get all waste records
app.get('/api/waste', (req, res) => {
  try {
    const filters = {
      meal_type: req.query.meal_type,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const records = WasteDB.getAllWaste(filters);
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add new food waste entry
app.post('/api/waste', (req, res) => {
  try {
    const { record_date, meal_type, dish_name, quantity_kg, waste_reason, estimated_cost, notes } = req.body;

    if (!record_date) {
      return res.status(400).json({ success: false, error: 'Record date is required' });
    }
    if (!meal_type || !['Breakfast', 'Lunch', 'Dinner', 'Snacks'].includes(meal_type)) {
      return res.status(400).json({ success: false, error: 'Valid meal type is required (Breakfast, Lunch, Dinner, Snacks)' });
    }
    if (!dish_name || dish_name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Dish/Food item name is required' });
    }
    if (isNaN(quantity_kg) || Number(quantity_kg) <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity wasted must be greater than 0 kg' });
    }
    if (!waste_reason) {
      return res.status(400).json({ success: false, error: 'Waste reason is required' });
    }

    const id = WasteDB.addWasteRecord({
      record_date,
      meal_type,
      dish_name: dish_name.trim(),
      quantity_kg: Number(quantity_kg),
      waste_reason,
      estimated_cost: Number(estimated_cost || 0),
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({ success: true, message: 'Food waste logged successfully', data: { id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete food waste record
app.delete('/api/waste/:id', (req, res) => {
  try {
    const changes = WasteDB.deleteWasteRecord(req.params.id);
    if (changes === 0) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ANALYTICS SUMMARY ROUTE
// ==========================================

app.get('/api/analytics/summary', (req, res) => {
  try {
    const summary = WasteDB.getAnalyticsSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', module: 'Inventory & Food Waste Analytics', owner: 'Shatakshi' });
});

// Serve frontend for all other routes (fallback)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server if not imported by test
if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏨 Hostel Mess Management System`);
    console.log(`📦 Module: Inventory Management & Food Waste Analytics`);
    console.log(`👤 Module Lead: Shatakshi`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
