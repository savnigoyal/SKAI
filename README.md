# Hostel Mess Management System
## Module: Inventory Management & Food Waste Analytics
**Assigned Module Lead:** Shatakshi  
**Compulsory Testing Automation Framework:** Playwright  
**Tech Stack:** Node.js, Express.js, SQLite (Native), HTML5/CSS3/Vanilla JS, Chart.js

---

## 🎯 Problem Statement Solved by this Module
Hostel messes suffer from serious food quality deterioration and financial waste. Students pay high mandatory fees (₹75k/year) while frequently having to outsource meals because food runs out or quality is compromised. On the management side:
1. **Unmonitored Raw Material Depletion:** Mess cooks run out of essential ingredients (e.g., pulses, milk, oil) unannounced, leading to emergency low-quality substitutes.
2. **Food Wastage Blindspots:** Without daily recording of meal surplus and plate leftovers, managers over-cook repeatedly, leading to thousands of rupees in preventable daily food waste.
3. **Lack of Accountability:** There is no audit trail showing who consumed stock or why batches were discarded.

This module provides **real-time store tracking with minimum threshold alerts**, **meal-session food waste recording**, **financial loss analytics**, and **automated testing with Playwright**.

---

## 🏗️ Architecture & Individual Deliverables

### 1. Database Layer (`database.js`)
- **Tables Built & Managed:**
  - `inventory_items`: Tracks grocery/provisions, unit quantities, unit costs, suppliers, and reorder thresholds.
  - `stock_movements`: Immutable transaction log for every stock addition (`RESTOCK`), usage (`CONSUMED`), or write-off (`WASTE_DISPOSAL`).
  - `food_waste_records`: Logs daily waste incidents per meal (`Breakfast`, `Lunch`, `Dinner`, `Snacks`), dish name, kilograms lost, cause, and estimated ₹ cost.
- **Data Integrity:** Foreign key constraints, default timestamps, and parameterized queries to prevent SQL injection.

### 2. Backend REST API Layer (`server.js`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/inventory` | Fetch all items, automatically flagged with `is_low_stock` |
| `POST` | `/api/inventory` | Add new grocery item with input validation |
| `PUT` | `/api/inventory/:id` | Update grocery specifications |
| `POST` | `/api/inventory/:id/adjust` | Adjust stock (+ Restock / - Consume) with audit record |
| `DELETE` | `/api/inventory/:id` | Remove discontinued item |
| `GET` | `/api/inventory-movements` | View audit trail of stock changes |
| `GET` | `/api/waste` | View waste log (filterable by meal session & dates) |
| `POST` | `/api/waste` | Log food waste incident with cost calculations |
| `DELETE` | `/api/waste/:id` | Delete incorrect waste entry |
| `GET` | `/api/analytics/summary` | Aggregated analytics for KPI cards & Chart.js graphs |

### 3. Frontend Dashboard Layer (`public/`)
- **KPI Summary Cards:** Total Items, Low-Stock Alert Count, Total Food Wasted (kg), and Financial Loss (₹).
- **Interactive Visualizations (Chart.js):**
  - 14-day daily food wastage trend line chart.
  - Waste reason distribution doughnut chart (Surplus prep vs plate leftovers vs spoilage vs burnt).
  - Wastage across meal sessions bar chart (Breakfast vs Lunch vs Dinner).
- **Inventory Store Interface:** Search bar, category filter, stock level filter, "Low Stock" red badge alerts, and Add/Edit modals.
- **Quick Stock Adjustment:** One-click Restock or Kitchen Consumption with reason notes.
- **Waste Log & Report Exporter:** Form to record waste, filterable history table, and 1-click **Export CSV** for the hostel mess committee.

### 4. Compulsory Automated Testing (`tests/inventory-waste.spec.js`)
Configured using **Playwright** with Chromium:
- Verifies initial KPI counters and low-stock banners.
- Tests creating new inventory items and verifies instant table rendering.
- Tests stock adjustments and verifies audit trail logging.
- Tests logging food waste incidents and checks calculation accuracy.
- Tests filter functionality by meal session.
- Tests input validation edge cases (e.g. empty item names, negative numbers).

---

## 🚀 How to Run the Project

### 1. Start the Application
```bash
npm start
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 2. Run Playwright Automated Tests
```bash
# Run headless tests (command-line output)
npm test

# Run tests in headed browser mode (watch the browser open and click automatically)
npm run test:headed

# Open Playwright Interactive UI test runner
npm run test:ui

# View full HTML test execution report
npm run test:report
```

---

## 🤝 Team Integration Guide (For Adya, Kashish, and Savni)
This module is modular and designed to plug directly into the shared project:
- **With Adya (Auth & Student Portal):** Ensure manager logins route to this dashboard (`/index.html` or `/manager/inventory`), while students are restricted.
- **With Kashish (Menu Planning):** Kashish's planned dishes can directly reference inventory ingredients to warn the manager if ingredients are insufficient before publishing next week's menu.
- **With Savni (Food Reviews & Ratings):** When students give low ratings for a meal (e.g., "Food was burnt" or "Poor taste"), the manager can cross-reference high plate leftovers logged in this module.
