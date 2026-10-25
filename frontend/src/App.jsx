import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Coffee,
  FilePenLine,
  LayoutDashboard,
  Leaf,
  Menu as MenuIcon,
  Plus,
  Settings,
  Utensils,
  X,
} from 'lucide-react';
import FoodReview from './pages/FoodReview';
import ManagerReviews from './pages/ManagerReviews';
import QualityAnalytics from './pages/QualityAnalytics';
import StudentDashboardPreview from './components/StudentDashboardPreview';
import ManagerDashboardPreview from './components/ManagerDashboardPreview';
import { DEMO_STUDENT } from './services/mockData';

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', time: '7:30 - 9:30 AM', icon: Coffee },
  { id: 'lunch', label: 'Lunch', time: '12:30 - 2:30 PM', icon: Utensils },
  { id: 'highTea', label: 'High Tea', time: '4:30 - 5:30 PM', icon: Clock3 },
  { id: 'dinner', label: 'Dinner', time: '7:30 - 9:30 PM', icon: Utensils },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CATEGORIES = {
  breakfast: ['Main Breakfast', 'Accompaniments', 'Beverages'],
  lunch: ['Dal / Pulse', 'Main Dish / Vegetable', 'Rice', 'Roti / Bread', 'Sides / Salad / Curd', 'Dessert'],
  highTea: ['Snacks', 'Beverages'],
  dinner: ['Dal / Pulse', 'Main Dish / Vegetable', 'Rice', 'Roti / Bread', 'Sides / Salad / Curd', 'Dessert'],
};
const SAMPLES = {
  breakfast: ['Poha', 'Idli', 'Tea'],
  lunch: ['Dal Tadka', 'Paneer Butter Masala', 'Steamed Rice', 'Roti', 'Salad & Curd', 'Seasonal dessert'],
  highTea: ['Samosa', 'Tea'],
  dinner: ['Dal Fry', 'Mix Veg', 'Rice', 'Roti', 'Salad & Curd', 'Kheer'],
};
const STORAGE_KEY = 'skai.weekly-menu.v1';
const NAV_ITEMS = [
  { label: "Rate Today's Food", icon: Coffee, testId: 'nav-rate-food' },
  { label: 'Student Dashboard', icon: LayoutDashboard, testId: 'nav-student-dashboard' },
  { label: 'Weekly Menu', icon: CalendarDays },
  { label: 'Quality Analytics', icon: LayoutDashboard, testId: 'nav-analytics' },
  { label: 'Student Food Reviews', icon: FilePenLine, testId: 'nav-manager-reviews' },
  { label: 'Manager Overview', icon: LayoutDashboard, testId: 'nav-manager-dashboard' },
  { label: 'Menu Items', icon: Utensils, soon: true },
  { label: 'Voting Results', icon: CircleHelp, soon: true },
  { label: 'Settings', icon: Settings, soon: true },
];

function mondayOf(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() - ((value.getDay() + 6) % 7));
  return value;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function makeWeek(date, withSample = false) {
  const days = {};
  DAYS.forEach((day) => {
    days[day] = {};
    MEALS.forEach((meal) => {
      days[day][meal.id] = CATEGORIES[meal.id].map((name, index) => ({
        name,
        optional: name === 'Dessert',
        items: withSample ? [{ name: SAMPLES[meal.id][index], description: '' }] : [],
      }));
    });
  });
  return { days, published: false, updatedAt: null };
}

function loadMenus() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return stored && typeof stored === 'object' ? stored : {};
  } catch {
    return {};
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function getMealCompletion(meal) {
  return meal.reduce((count, category) => count + category.items.filter((item) => item.name.trim()).length, 0);
}

function App() {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [menus, setMenus] = useState(loadMenus);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealDraft, setMealDraft] = useState(null);
  const [notice, setNotice] = useState(null);
  const [activeNav, setActiveNav] = useState("Rate Today's Food");
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const weekId = dateKey(weekStart);
  const currentMenu = menus[weekId] || makeWeek(weekStart, weekId === dateKey(mondayOf(new Date())));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
    } catch {
      setNotice({ type: 'error', text: 'Could not save to this browser. Check available storage and try again.' });
    }
  }, [menus]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const mealsForDay = currentMenu.days[selectedDay];
  const completedMeals = useMemo(() => DAYS.reduce((total, day) => total + MEALS.filter((meal) => getMealCompletion(currentMenu.days[day][meal.id]) > 0).length, 0), [currentMenu]);
  const configuredCategories = useMemo(() => DAYS.reduce((total, day) => total + MEALS.reduce((mealTotal, meal) => mealTotal + currentMenu.days[day][meal.id].filter((category) => category.items.some((item) => item.name.trim())).length, 0), 0), [currentMenu]);
  const isPublished = currentMenu.published;

  function updateWeek(nextMenu) {
    setMenus((previous) => ({ ...previous, [weekId]: nextMenu }));
  }

  function moveWeek(offset) {
    setWeekStart((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() + offset * 7);
      return next;
    });
    setSelectedDay(DAYS[0]);
  }

  function startEditing(meal) {
    setEditingMeal(meal);
    setMealDraft(structuredClone(mealsForDay[meal.id]));
  }

  function updateCategory(index, updater) {
    setMealDraft((previous) => previous.map((category, categoryIndex) => categoryIndex === index ? updater(category) : category));
  }

  function updateItem(categoryIndex, itemIndex, patch) {
    updateCategory(categoryIndex, (category) => ({
      ...category,
      items: category.items.map((item, index) => index === itemIndex ? { ...item, ...patch } : item),
    }));
  }

  function addItem(categoryIndex) {
    updateCategory(categoryIndex, (category) => ({ ...category, items: [...category.items, { name: '', description: '' }] }));
  }

  function removeItem(categoryIndex, itemIndex) {
    updateCategory(categoryIndex, (category) => ({ ...category, items: category.items.filter((_, index) => index !== itemIndex) }));
  }

  function saveMeal() {
    const duplicate = mealDraft.find((category) => {
      const names = category.items.map((item) => item.name.trim().toLocaleLowerCase()).filter(Boolean);
      return new Set(names).size !== names.length;
    });
    if (duplicate) {
      setNotice({ type: 'error', text: `Remove duplicate items from ${duplicate.name}.` });
      return;
    }
    const days = { ...currentMenu.days, [selectedDay]: { ...currentMenu.days[selectedDay], [editingMeal.id]: mealDraft } };
    updateWeek({ ...currentMenu, days, published: false, updatedAt: new Date().toISOString() });
    setEditingMeal(null);
    setMealDraft(null);
    setNotice({ type: 'success', text: `${selectedDay} ${editingMeal.label} saved as a draft.` });
  }

  function saveDraft() {
    updateWeek({ ...currentMenu, published: false, updatedAt: new Date().toISOString() });
    setNotice({ type: 'success', text: 'Draft saved on this device.' });
  }

  function publishMenu() {
    const incomplete = DAYS.flatMap((day) => MEALS.flatMap((meal) => currentMenu.days[day][meal.id]
      .filter((category) => !category.optional && !category.items.some((item) => item.name.trim()))
      .map((category) => `${day} ${meal.label}: ${category.name}`)));
    if (incomplete.length) {
      setNotice({ type: 'error', text: `Add items to required categories before publishing. First: ${incomplete[0]}.` });
      return;
    }
    setPublishConfirm(true);
  }

  function confirmPublish() {
    updateWeek({ ...currentMenu, published: true, updatedAt: new Date().toISOString() });
    setPublishConfirm(false);
    setNotice({ type: 'success', text: 'Menu published on this device. It is not shared with students yet.' });
  }

  function handleNav(label, soon) {
    if (soon) {
      setNotice({ type: 'info', text: `${label} will be available in a later phase.` });
      return;
    }
    setActiveNav(label);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#weekly-menu" onClick={() => setActiveNav('Weekly Menu')}>
          <span className="brand-mark"><Leaf size={20} /></span>
          <span><strong>SKAI</strong><small>MESS MANAGEMENT</small></span>
        </a>
        <button
          onClick={() => setIsDemoMode((enabled) => !enabled)}
          className={`nav-item ${isDemoMode ? 'active' : ''}`}
          aria-pressed={isDemoMode}
        >
          <CircleHelp size={18} />
          <span>{isDemoMode ? 'Demo Mode: ON' : 'Live DB Mode'}</span>
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {NAV_ITEMS.map(({ label, icon: Icon, soon, testId }) => (
            <button className={`nav-item ${activeNav === label ? 'active' : ''}`} key={label} data-testid={testId} onClick={() => { handleNav(label, soon); setMobileNavOpen(false); }}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {soon && <span className="soon-tag">SOON</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="manager-avatar">M</span>
          <span className="manager-meta"><strong>Mess Manager</strong><small>Administrator</small></span>
          <ChevronDown size={16} />
        </div>
      </aside>

      <main className="main-content" id="weekly-menu">
        <header className="mobile-header"><button className="icon-button" aria-label="Open navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><MenuIcon size={20} /></button><strong>SKAI</strong><span>MESS MANAGEMENT</span></header>
        <div className="page-topline">
          <div className="breadcrumbs">Mess Manager <span>/</span> <strong>{activeNav}</strong></div>
          <div className="topline-actions"><span className="local-indicator"><span /> Local preview</span><button className="icon-button" aria-label="Settings" onClick={() => handleNav('Settings', true)}><Settings size={18} /></button></div>
        </div>

        {activeNav === 'Weekly Menu' && (
          <>
        <section className="page-heading">
          <div>
            <div className="eyebrow">MENU PLANNING</div>
            <h1>Weekly Menu Management</h1>
            <p>Plan and publish the mess menu for your campus community.</p>
          </div>
          <div className="week-tools">
            <div className="week-picker">
              <button className="icon-button" aria-label="Previous week" onClick={() => moveWeek(-1)}><ArrowLeft size={17} /></button>
              <div><span className="week-caption">MENU FOR</span><strong>{formatDate(weekStart)} – {formatDate(weekEnd)}, {weekEnd.getFullYear()}</strong></div>
              <button className="icon-button" aria-label="Next week" onClick={() => moveWeek(1)}><ArrowRight size={17} /></button>
            </div>
            <div className={`status-pill ${isPublished ? 'published' : 'draft'}`}><span />{isPublished ? 'Published' : 'Draft'}</div>
          </div>
        </section>

        <section className="summary-grid" aria-label="Weekly menu summary">
          <SummaryCard icon={CalendarDays} label="Total meal slots" value="28" detail="7 days × 4 meals" tone="green" />
          <SummaryCard icon={Check} label="Completed slots" value={`${completedMeals} / 28`} detail={completedMeals === 28 ? 'Every meal has a menu' : `${28 - completedMeals} meals still need items`} tone="sage" />
          <SummaryCard icon={FilePenLine} label="Publication status" value={isPublished ? 'Published' : 'Draft'} detail={currentMenu.updatedAt ? 'Saved on this device' : 'Not saved yet'} tone={isPublished ? 'green' : 'amber'} />
          <SummaryCard icon={Utensils} label="Categories configured" value={String(configuredCategories)} detail="Across this week" tone="sage" />
        </section>

        <section className="menu-section">
          <div className="section-heading">
            <div><h2>Weekly schedule</h2><p>Choose a day to review and edit each meal.</p></div>
            <div className="header-actions"><button className="button button-secondary" onClick={saveDraft}><FilePenLine size={16} /> Save draft</button><button className="button button-primary" onClick={publishMenu}><Check size={16} /> Publish menu</button></div>
          </div>
          <div className="day-tabs" role="tablist" aria-label="Days of the week">
            {DAYS.map((day, index) => {
              const slots = MEALS.filter((meal) => getMealCompletion(currentMenu.days[day][meal.id]) > 0).length;
              return <button key={day} role="tab" aria-selected={selectedDay === day} className={`day-tab ${selectedDay === day ? 'selected' : ''}`} onClick={() => setSelectedDay(day)}><span className="day-short">{day.slice(0, 3)}</span><strong>{index + 1}</strong><small>{slots}/4 meals</small></button>;
            })}
          </div>
          <div className="day-title"><div><span className="day-kicker">{formatDate(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + DAYS.indexOf(selectedDay)))}</span><h3>{selectedDay}</h3></div><span className="meal-count">{MEALS.filter((meal) => getMealCompletion(mealsForDay[meal.id]) > 0).length} of 4 meals planned</span></div>
          <div className="meal-grid">
            {MEALS.map((meal) => <MealCard key={meal.id} meal={meal} categories={mealsForDay[meal.id]} onEdit={() => startEditing(meal)} />)}
          </div>
          <p className="local-note"><CircleHelp size={15} /> Drafts and published status are stored in this browser only. Publishing here does not share the menu with students.</p>
        </section>
          </>
        )}

        {activeNav === "Rate Today's Food" && <FoodReview student={DEMO_STUDENT} />}
        {activeNav === 'Student Dashboard' && <StudentDashboardPreview onRateFoodClick={() => setActiveNav("Rate Today's Food")} />}
        {activeNav === 'Quality Analytics' && <QualityAnalytics isDemoMode={isDemoMode} />}
        {activeNav === 'Student Food Reviews' && <ManagerReviews isDemoMode={isDemoMode} />}
        {activeNav === 'Manager Overview' && (
          <ManagerDashboardPreview
            onReviewsClick={() => setActiveNav('Student Food Reviews')}
            onAnalyticsClick={() => setActiveNav('Quality Analytics')}
          />
        )}
      </main>

      {notice && <div className={`toast toast-${notice.type}`} role="status"><span>{notice.text}</span><button className="toast-close" aria-label="Dismiss message" onClick={() => setNotice(null)}><X size={15} /></button></div>}

      {editingMeal && mealDraft && <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingMeal(null); }}>
        <section className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="editor-title">
          <header className="editor-header"><div><span className="eyebrow">{selectedDay.toUpperCase()} MENU</span><h2 id="editor-title">Edit {editingMeal.label}</h2><p>Configure the planned food items for this meal.</p></div><button className="icon-button" aria-label="Close editor" onClick={() => setEditingMeal(null)}><X size={19} /></button></header>
          <div className="editor-body">
            {mealDraft.map((category, categoryIndex) => <section className="category-editor" key={category.name}>
              <div className="category-title"><div><h3>{category.name}</h3><label className="optional-toggle"><input type="checkbox" checked={category.optional} onChange={(event) => updateCategory(categoryIndex, (value) => ({ ...value, optional: event.target.checked }))} /><span>Optional</span></label></div><button className="add-item-button" onClick={() => addItem(categoryIndex)}><Plus size={15} /> Add item</button></div>
              {category.items.length === 0 && <div className="empty-category">No items added yet. Add the planned food for this category.</div>}
              {category.items.map((item, itemIndex) => <div className="food-item-editor" key={`${category.name}-${itemIndex}`}>
                <div className="food-fields"><label>Food item<input autoFocus={item.name === ''} value={item.name} placeholder="Enter menu item" onChange={(event) => updateItem(categoryIndex, itemIndex, { name: event.target.value })} /></label><label>Optional description<input value={item.description} placeholder="e.g. served with mint chutney" onChange={(event) => updateItem(categoryIndex, itemIndex, { description: event.target.value })} /></label></div>
                <button className="remove-button" aria-label={`Remove ${item.name || 'food item'}`} title="Remove item" onClick={() => removeItem(categoryIndex, itemIndex)}><X size={17} /></button>
              </div>)}
            </section>)}
          </div>
          <footer className="editor-footer"><button className="button button-secondary" onClick={() => setEditingMeal(null)}>Cancel</button><button className="button button-primary" onClick={saveMeal}><Check size={16} /> Save meal</button></footer>
        </section>
      </div>}

      {publishConfirm && <div className="overlay" role="presentation"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-title"><div className="confirm-icon"><Check size={21} /></div><h2 id="publish-title">Publish this week's menu?</h2><p>This saves a published status on this device only. It will not be visible to students or other devices until backend publishing is connected.</p><div className="confirm-actions"><button className="button button-secondary" onClick={() => setPublishConfirm(false)}>Keep editing</button><button className="button button-primary" onClick={confirmPublish}>Confirm publish</button></div></section></div>}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, detail, tone }) {
  return <article className="summary-card"><span className={`summary-icon ${tone}`}><Icon size={18} /></span><div className="summary-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>;
}

function MealCard({ meal, categories, onEdit }) {
  const Icon = meal.icon;
  const items = categories.flatMap((category) => category.items.filter((item) => item.name.trim()).map((item) => ({ ...item, category: category.name })));
  return <article className="meal-card">
    <div className="meal-card-top"><span className="meal-icon"><Icon size={17} /></span><button className="edit-link" onClick={onEdit}><FilePenLine size={14} /> Edit</button></div>
    <div className="meal-title-row"><h4>{meal.label}</h4><span className="meal-time">{meal.time}</span></div>
    {items.length ? <div className="meal-items">{items.slice(0, 4).map((item, index) => <div className="meal-item" key={`${item.category}-${index}`}><span className="item-dot" /><span><strong>{item.name}</strong><small>{item.category}</small></span></div>)}{items.length > 4 && <span className="more-items">+{items.length - 4} more items</span>}</div> : <div className="meal-empty"><span className="empty-icon"><Utensils size={16} /></span><span><strong>No menu yet</strong><small>Add food items to plan this meal.</small></span></div>}
    <div className="meal-card-footer"><span>{items.length} {items.length === 1 ? 'item' : 'items'} planned</span><span className={items.length ? 'planned-badge' : 'empty-badge'}>{items.length ? 'Planned' : 'Empty'}</span></div>
  </article>;
}

export default App;