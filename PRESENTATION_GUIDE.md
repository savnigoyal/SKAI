# 🎓 Shatakshi's Final Presentation & Individual Defense Guide
## Project: Hostel Mess Management System
## Module: Inventory Management & Food Waste Analytics

---

## 📌 Executive Summary (Your 30-Second Opening Pitch)
> *"Respected evaluators, my assigned individual module in the Hostel Mess Management System is **Inventory Management and Food Waste Analytics** for the Mess Manager role.*
> *In our hostel, each student pays ₹75,000 annually, yet students routinely outsource meals due to poor food availability and sudden menu compromises. On the management side, there was zero visibility into grocery depletion and meal wastage.*
> *I designed and implemented an end-to-end full-stack solution featuring **real-time inventory tracking with reorder thresholds**, an **immutable stock-movement audit trail**, **meal-session food waste logging**, and **data analytics with visual trend charts**. To guarantee software quality, I authored an automated test suite using **Playwright** covering all business rules and edge cases."*

---

## ⏱️ Step-by-Step 3-Minute Live Demo Walkthrough

### Step 1: Show the Analytics & Dashboard KPIs (30 seconds)
1. Open `http://localhost:3000`.
2. Point to the **KPI summary cards**:
   - *"Here you can see the high-level operational overview: Total Store Items, Critical Low Stock alerts, Total Kilograms of food wasted, and the calculated financial loss."*
3. Point to the **Red Reorder Banner**:
   - *"The system automatically runs a query checking `quantity <= min_threshold`. Items like Moong Dal and Fresh Milk are highlighted immediately so the manager can reorder before meals are disrupted."*
4. Explain the **Charts**:
   - *"The 14-day trend line allows the mess committee to observe whether waste is increasing. The Reason Breakdown doughnut reveals that plate leftovers and surplus preparation constitute over 70% of kitchen losses."*

### Step 2: Demonstrate Inventory Store & Real-Time Stock Adjustment (60 seconds)
1. Click on the **Stock Inventory** tab.
2. Demonstrate **Search & Filter**: Type "Rice" or select "Pulses" in the category dropdown.
3. Click **➕ Add Inventory Item**:
   - Add an item, e.g., Name: `Refined Mustard Oil`, Category: `Oils & Fats`, Quantity: `30 L`, Threshold: `15`, Unit Cost: `140`.
   - Click **Save Item**. Show the success toast and that it appears in the table.
4. Click **⚡ Adjust** on any item:
   - Select `➕ Restock` or `🍳 Kitchen Consumption`.
   - Enter quantity `10` and note `Batch preparation for dinner`.
   - Click **Confirm Update**.
5. Switch to **Stock Movements Log** tab:
   - *"Every single stock increase or deduction is permanently recorded in our SQLite database with before/after stock levels for audit compliance."*

### Step 3: Demonstrate Food Waste Logging & CSV Export (45 seconds)
1. Switch to the **Food Waste Log** tab.
2. Click **➕ Log Food Waste Entry**:
   - Date: Today's date
   - Meal: `Dinner`
   - Dish: `Paneer Makhani`
   - Quantity Wasted: `6.5 kg`
   - Estimated Loss: `₹520`
   - Reason: `Plate Leftovers`
   - Notes: `High unconsumed portions reported`
   - Click **Record Wastage**.
3. Show that the entry appears in the table and the dashboard waste total updates automatically.
4. Filter by **Dinner** or **Breakfast** in the dropdown to show meal-specific queries.
5. Click **📥 Export CSV Report** and show the downloaded CSV report:
   - *"This report can be submitted directly to the college administration or mess contractor for weekly review."*

### Step 4: Run Playwright Automated Tests Live (45 seconds)
1. Open terminal and run:
   ```bash
   npm test
   ```
2. Explain to the evaluator:
   - *"As per project requirements, Playwright was chosen as our compulsory testing automation tool. My test suite tests 7 critical end-to-end browser workflows: initial KPI calculations, low-stock threshold triggers, inventory creation, stock movements, waste submission, meal filters, and input validation bounds."*
3. Show all 7 passing tests in green:
   - `✓ 7 passed`

---

## 🛡️ Defending Your Individual Contribution (Answers to Professor Questions)

### Q1: "Why did you build this full-stack instead of just making a basic database or UI?"
> **Your Answer:** *"Because an isolated database or UI has no standalone business value. By owning the module end-to-end, I designed the normalized database schema in SQLite, implemented the REST API routes in Express with proper validation, constructed a responsive dashboard with Chart.js, and wrote automated Playwright tests. This ensures my feature is fully functioning and ready for deployment without waiting on other team members."*

### Q2: "How does your database handle stock accuracy and prevent invalid states?"
> **Your Answer:** *"I implemented two safeguards: First, in the database layer, negative stock reductions are prevented by checking current stock before executing changes. Second, instead of overwriting quantities blindly, every adjustment creates an immutable record in `stock_movements` storing previous stock, new stock, timestamp, and reason, ensuring complete traceability."*

### Q3: "How does your waste analytics actually help solve the student food problem?"
> **Your Answer:** *"Students are forced to outsource meals because mess funds are wasted on excess preparation of dishes students dislike. By tracking waste by meal and reason, the manager sees exactly how many kilograms of specific dishes are returned on plates. This directly informs Kashish's weekly menu planning and correlates with Savni's food review ratings, allowing the mess to reduce portions of unpopular dishes and reinvest the saved budget into higher quality ingredients."*

### Q4: "Why did you choose Playwright over Selenium or Postman?"
> **Your Answer:** *"Postman only tests backend endpoints without verifying UI interactivity or DOM updates. Selenium requires heavier driver management and can be brittle with dynamic elements. Playwright provides built-in auto-waiting, headless browser execution, and native support for end-to-end user workflows like modal interactions and table re-rendering."*
