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
  Package,
  Plus,
  Settings,
  Utensils,
  X,
  Vote,
  Trophy,
  Sparkles,
} from 'lucide-react';
import FoodReview from './pages/FoodReview';
import ManagerReviews from './pages/ManagerReviews';
import QualityAnalytics from './pages/QualityAnalytics';
import StudentDashboardPreview from './components/StudentDashboardPreview';
import ManagerDashboardPreview from './components/ManagerDashboardPreview';
import MenuItems from './pages/MenuItems';
import VotingResults from './pages/VotingResults';
import InventoryWaste from './pages/InventoryWaste';
import { DEMO_STUDENT } from './services/mockData';
import {
  MEALS_CONFIG,
  DAYS_CONFIG,
  generateFullWeekSchedule,
  generateInitialVotingData,
  loadMasterMenuItems,
  saveMasterMenuItems,
  loadVotingState,
  saveVotingState,
  WEEKLY_MENU_KEY,
} from './services/menuData';

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', time: '7:30 - 9:30 AM', icon: Coffee },
  { id: 'lunch', label: 'Lunch', time: '12:30 - 2:30 PM', icon: Utensils },
  { id: 'highTea', label: 'Hi Tea', time: '4:30 - 5:30 PM', icon: Clock3 },
  { id: 'dinner', label: 'Dinner', time: '7:30 - 9:30 PM', icon: Utensils },
];

const DAYS = DAYS_CONFIG;

const CATEGORIES = {
  breakfast: ['Main Breakfast', 'Accompaniments', 'Beverages'],
  lunch: ['Dal / Pulse', 'Main Dish / Vegetable', 'Rice', 'Roti / Bread', 'Sides / Salad / Curd', 'Dessert'],
  highTea: ['Snacks', 'Beverages'],
  dinner: ['Dal / Pulse', 'Main Dish / Vegetable', 'Rice', 'Roti / Bread', 'Sides / Salad / Curd', 'Dessert'],
};

const NAV_ITEMS = [
  { label: "Rate Today's Food", icon: Coffee, testId: 'nav-rate-food' },
  { label: 'Student Dashboard', icon: LayoutDashboard, testId: 'nav-student-dashboard' },
  { label: 'Weekly Menu', icon: CalendarDays },
  { label: 'Quality Analytics', icon: LayoutDashboard, testId: 'nav-analytics' },
  { label: 'Student Food Reviews', icon: FilePenLine, testId: 'nav-manager-reviews' },
  { label: 'Manager Overview', icon: LayoutDashboard, testId: 'nav-manager-dashboard' },
  { label: 'Inventory & Waste', icon: Package, testId: 'nav-inventory', href: '/inventory/' },
  { label: 'Menu Items', icon: Utensils, testId: 'nav-menu-items' },
  { label: 'Voting Results', icon: Vote, testId: 'nav-voting-results' },
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

function makeWeek(date) {
  return { days: generateFullWeekSchedule(), published: false, updatedAt: null };
}

function loadMenus() {
  try {
    const stored = JSON.parse(localStorage.getItem(WEEKLY_MENU_KEY) || '{}');
    if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
      // Ensure stored weeks have all 7 days with planned meals
      const fullDefault = generateFullWeekSchedule();
      Object.keys(stored).forEach((k) => {
        if (!stored[k].days) {
          stored[k].days = fullDefault;
        } else {
          DAYS.forEach((day) => {
            if (!stored[k].days[day]) {
              stored[k].days[day] = fullDefault[day];
            } else {
              MEALS.forEach((meal) => {
                const cats = stored[k].days[day][meal.id];
                const hasItems = cats && cats.some((c) => c.items && c.items.some((it) => it.name.trim()));
                if (!hasItems) {
                  stored[k].days[day][meal.id] = fullDefault[day][meal.id];
                }
              });
            }
          });
        }
      });
      return stored;
    }
  } catch {
    // Ignore error
  }
  return {};
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function getMealCompletion(meal) {
  if (!meal) return 0;
  return meal.reduce((count, category) => count + (category.items ? category.items.filter((item) => item.name.trim()).length : 0), 0);
}

function App() {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [menus, setMenus] = useState(loadMenus);
  const [catalog, setCatalog] = useState(loadMasterMenuItems);
  const [votingData, setVotingData] = useState(loadVotingState);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealDraft, setMealDraft] = useState(null);
  const [notice, setNotice] = useState(null);
  const [activeNav, setActiveNav] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('weekly')) return 'Weekly Menu';
      if (hash.includes('item') || hash.includes('dish')) return 'Menu Items';
      if (hash.includes('vot') || hash.includes('poll')) return 'Voting Results';
      if (hash.includes('student')) return 'Student Dashboard';
      if (hash.includes('analytics')) return 'Quality Analytics';
      if (hash.includes('review')) return 'Student Food Reviews';
      if (hash.includes('manager')) return 'Manager Overview';
      if (hash.includes('rate')) return "Rate Today's Food";
    }
    return 'Weekly Menu';
  });
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('weekly')) setActiveNav('Weekly Menu');
      else if (hash.includes('item') || hash.includes('dish')) setActiveNav('Menu Items');
      else if (hash.includes('vot') || hash.includes('poll')) setActiveNav('Voting Results');
      else if (hash.includes('student')) setActiveNav('Student Dashboard');
      else if (hash.includes('analytics')) setActiveNav('Quality Analytics');
      else if (hash.includes('review')) setActiveNav('Student Food Reviews');
      else if (hash.includes('manager')) setActiveNav('Manager Overview');
      else if (hash.includes('rate')) setActiveNav("Rate Today's Food");
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const weekId = dateKey(weekStart);
  const currentMenu = menus[weekId] || makeWeek(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(WEEKLY_MENU_KEY, JSON.stringify(menus));
    } catch {
      setNotice({ type: 'error', text: 'Could not save menu to this browser.' });
    }
  }, [menus]);

  useEffect(() => {
    saveMasterMenuItems(catalog);
  }, [catalog]);

  useEffect(() => {
    saveVotingState(votingData);
  }, [votingData]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const mealsForDay = currentMenu.days[selectedDay] || generateFullWeekSchedule()[selectedDay];
  const completedMeals = useMemo(
    () =>
      DAYS.reduce(
        (total, day) =>
          total + MEALS.filter((meal) => getMealCompletion(currentMenu.days[day]?.[meal.id]) > 0).length,
        0
      ),
    [currentMenu]
  );
  const configuredCategories = useMemo(
    () =>
      DAYS.reduce(
        (total, day) =>
          total +
          MEALS.reduce(
            (mealTotal, meal) =>
              mealTotal +
              (currentMenu.days[day]?.[meal.id]
                ? currentMenu.days[day][meal.id].filter((category) =>
                    category.items.some((item) => item.name.trim())
                  ).length
                : 0),
            0
          ),
        0
      ),
    [currentMenu]
  );
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
    setMealDraft((previous) =>
      previous.map((category, categoryIndex) => (categoryIndex === index ? updater(category) : category))
    );
  }

  function updateItem(categoryIndex, itemIndex, patch) {
    updateCategory(categoryIndex, (category) => ({
      ...category,
      items: category.items.map((item, index) => (index === itemIndex ? { ...item, ...patch } : item)),
    }));
  }

  function addItem(categoryIndex) {
    updateCategory(categoryIndex, (category) => ({
      ...category,
      items: [...category.items, { name: '', description: '' }],
    }));
  }

  function addQuickItem(categoryIndex, dishName) {
    updateCategory(categoryIndex, (category) => ({
      ...category,
      items: [...category.items, { name: dishName, description: 'From Master Menu Catalog' }],
    }));
    setNotice({ type: 'success', text: `Added "${dishName}" to this meal.` });
  }

  function removeItem(categoryIndex, itemIndex) {
    updateCategory(categoryIndex, (category) => ({
      ...category,
      items: category.items.filter((_, index) => index !== itemIndex),
    }));
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
    const days = {
      ...currentMenu.days,
      [selectedDay]: { ...currentMenu.days[selectedDay], [editingMeal.id]: mealDraft },
    };
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
    const incomplete = DAYS.flatMap((day) =>
      MEALS.flatMap((meal) =>
        (currentMenu.days[day]?.[meal.id] || [])
          .filter((category) => !category.optional && !category.items.some((item) => item.name.trim()))
          .map((category) => `${day} ${meal.label}: ${category.name}`)
      )
    );
    if (incomplete.length) {
      setNotice({ type: 'error', text: `Add items to required categories before publishing. First: ${incomplete[0]}.` });
      return;
    }
    setPublishConfirm(true);
  }

  function confirmPublish() {
    updateWeek({ ...currentMenu, published: true, updatedAt: new Date().toISOString() });
    setPublishConfirm(false);
    setNotice({ type: 'success', text: 'Menu published! Live for hostel residents.' });
  }

  // Voting Handlers
  function handleCastVote(day, mealId, itemId) {
    setVotingData((prev) => {
      const dayData = prev[day] || {};
      const mealItems = dayData[mealId] || [];
      const updated = mealItems.map((item) => {
        if (item.id === itemId) {
          return { ...item, votes: item.votes + 1 };
        }
        return item;
      });

      // Recalculate leading
      const maxVotes = Math.max(...updated.map((i) => i.votes), 0);
      const withLeading = updated.map((i) => ({
        ...i,
        leading: i.votes === maxVotes && maxVotes > 0,
      }));

      return {
        ...prev,
        [day]: {
          ...dayData,
          [mealId]: withLeading,
        },
      };
    });
    setNotice({ type: 'success', text: 'Student vote recorded successfully!' });
  }

  function handleNominateForVoting(day, mealId, dishItem) {
    setVotingData((prev) => {
      const dayData = prev[day] || {};
      const mealItems = dayData[mealId] || [];
      const exists = mealItems.some((i) => i.name.toLowerCase() === dishItem.name.toLowerCase());
      if (exists) {
        setNotice({ type: 'info', text: `"${dishItem.name}" is already in the ${day} ${mealId} voting poll.` });
        return prev;
      }

      const newCand = {
        id: `vote-${day}-${mealId}-${Date.now()}`,
        name: dishItem.name,
        meal: MEALS.find((m) => m.id === mealId)?.label || mealId,
        votes: 1,
        leading: mealItems.length === 0,
      };

      setNotice({ type: 'success', text: `"${dishItem.name}" is now open for student voting on ${day}!` });

      return {
        ...prev,
        [day]: {
          ...dayData,
          [mealId]: [...mealItems, newCand],
        },
      };
    });
  }

  function handleAddCandidateToPoll(day, mealId, dishName) {
    const catalogList = catalog[mealId] || [];
    const found = catalogList.find((d) => d.name.toLowerCase() === dishName.toLowerCase());
    handleNominateForVoting(day, mealId, found || { name: dishName, mealKey: mealId });
  }

  function handleApplyWinnerToMenu(day, mealId, winnerItem) {
    const dayMeals = currentMenu.days[day] || generateFullWeekSchedule()[day];
    const mealCategories = dayMeals[mealId] || [];

    // Place winner in the first category (e.g. Main Breakfast / Dal / Snacks)
    const updatedCategories = mealCategories.map((cat, idx) => {
      if (idx === 0) {
        return {
          ...cat,
          items: [{ name: winnerItem.name, description: 'Student Voted Winner 🏆' }, ...cat.items.slice(1)],
        };
      }
      return cat;
    });

    const nextDays = {
      ...currentMenu.days,
      [day]: {
        ...currentMenu.days[day],
        [mealId]: updatedCategories,
      },
    };

    updateWeek({ ...currentMenu, days: nextDays, published: false, updatedAt: new Date().toISOString() });
    setNotice({ type: 'success', text: `Adopted "${winnerItem.name}" into ${day} ${mealId} Weekly Menu!` });
  }

  function handleAddToWeeklyMenu(day, mealId, dishItem) {
    const dayMeals = currentMenu.days[day] || generateFullWeekSchedule()[day];
    const mealCategories = dayMeals[mealId] || [];

    const updatedCategories = mealCategories.map((cat, idx) => {
      if (idx === 0) {
        return {
          ...cat,
          items: [...cat.items, { name: dishItem.name, description: dishItem.desc || 'From Catalog' }],
        };
      }
      return cat;
    });

    const nextDays = {
      ...currentMenu.days,
      [day]: {
        ...currentMenu.days[day],
        [mealId]: updatedCategories,
      },
    };

    updateWeek({ ...currentMenu, days: nextDays, published: false, updatedAt: new Date().toISOString() });
    setNotice({ type: 'success', text: `Added "${dishItem.name}" to ${day} ${mealId} schedule!` });
  }

  function handleAddCustomItem(mealType, newItem) {
    setCatalog((prev) => ({
      ...prev,
      [mealType]: [newItem, ...(prev[mealType] || [])],
    }));
    setNotice({ type: 'success', text: `Added "${newItem.name}" to Master Dishes Catalog!` });
  }

  function handleResetVotes() {
    const benchmark = generateInitialVotingData();
    setVotingData(benchmark);
    setNotice({ type: 'info', text: 'Voting benchmarks have been restored.' });
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
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#weekly-menu" onClick={() => setActiveNav('Weekly Menu')}>
          <span className="brand-mark"><Leaf size={20} /></span>
          <span><strong>SKAI</strong><small>MESS MANAGEMENT</small></span>
        </a>

        {/* Demo Mode Toggle */}
        <button
          onClick={() => setIsDemoMode((enabled) => !enabled)}
          className={`nav-item ${isDemoMode ? 'active' : ''}`}
          aria-pressed={isDemoMode}
          style={{ marginBottom: '12px' }}
        >
          <CircleHelp size={18} />
          <span>{isDemoMode ? 'Demo Mode: ON' : 'Live DB Mode'}</span>
        </button>

        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {NAV_ITEMS.map(({ label, icon: Icon, soon, testId, href }) =>
            href ? (
              <a className="nav-item" key={label} data-testid={testId} href={href}>
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
              </a>
            ) : (
              <button
                className={`nav-item ${activeNav === label ? 'active' : ''}`}
                key={label}
                data-testid={testId}
                onClick={() => {
                  handleNav(label, soon);
                  setMobileNavOpen(false);
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
                {soon && <span className="soon-tag">SOON</span>}
              </button>
            )
          )}
        </nav>

        <div className="sidebar-bottom">
          <span className="manager-avatar">M</span>
          <span className="manager-meta"><strong>Mess Manager</strong><small>Administrator</small></span>
          <ChevronDown size={16} />
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content" id="weekly-menu">
        <header className="mobile-header">
          <button className="icon-button" aria-label="Open navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}>
            <MenuIcon size={20} />
          </button>
          <strong>SKAI</strong><span>MESS MANAGEMENT</span>
        </header>

        <div className="page-topline">
          <div className="breadcrumbs">Mess Manager <span>/</span> <strong>{activeNav}</strong></div>
          <div className="topline-actions">
            <span className="local-indicator"><span /> Local preview</span>
            <button className="icon-button" aria-label="Settings" onClick={() => handleNav('Settings', true)}>
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* 1. WEEKLY MENU TAB */}
        {activeNav === 'Weekly Menu' && (
          <>
            <section className="page-heading">
              <div>
                <div className="eyebrow">MENU PLANNING</div>
                <h1>Weekly Menu Management</h1>
                <p>Plan, organize, and publish the complete 7-day mess menu with student-voted favorites.</p>
              </div>
              <div className="week-tools">
                <div className="week-picker">
                  <button className="icon-button" aria-label="Previous week" onClick={() => moveWeek(-1)}><ArrowLeft size={17} /></button>
                  <div>
                    <span className="week-caption">MENU FOR</span>
                    <strong>{formatDate(weekStart)} – {formatDate(weekEnd)}, {weekEnd.getFullYear()}</strong>
                  </div>
                  <button className="icon-button" aria-label="Next week" onClick={() => moveWeek(1)}><ArrowRight size={17} /></button>
                </div>
                <div className={`status-pill ${isPublished ? 'published' : 'draft'}`}>
                  <span />{isPublished ? 'Published' : 'Draft'}
                </div>
              </div>
            </section>

            <section className="summary-grid" aria-label="Weekly menu summary">
              <SummaryCard icon={CalendarDays} label="Total meal slots" value="28" detail="7 days × 4 meals" tone="green" />
              <SummaryCard icon={Check} label="Completed slots" value={`${completedMeals} / 28`} detail={completedMeals === 28 ? 'Every meal has a menu' : `${28 - completedMeals} meals still need items`} tone="sage" />
              <SummaryCard icon={FilePenLine} label="Publication status" value={isPublished ? 'Published' : 'Draft'} detail={currentMenu.updatedAt ? 'Saved on this device' : 'Active weekly draft'} tone={isPublished ? 'green' : 'amber'} />
              <SummaryCard icon={Utensils} label="Categories configured" value={String(configuredCategories)} detail="Across 7 full days" tone="sage" />
            </section>

            <section className="menu-section">
              <div className="section-heading">
                <div>
                  <h2>Weekly schedule</h2>
                  <p>Choose any day from Monday to Sunday to review, customize, and edit each meal.</p>
                </div>
                <div className="header-actions">
                  <button className="button button-secondary" onClick={() => setActiveNav('Menu Items')}>
                    <Utensils size={15} /> Open Dish Catalog
                  </button>
                  <button className="button button-secondary" onClick={saveDraft}>
                    <FilePenLine size={15} /> Save draft
                  </button>
                  <button className="button button-primary" onClick={publishMenu}>
                    <Check size={15} /> Publish menu
                  </button>
                </div>
              </div>

              {/* Day Tabs */}
              <div className="day-tabs" role="tablist" aria-label="Days of the week">
                {DAYS.map((day, index) => {
                  const slots = MEALS.filter((meal) => getMealCompletion(currentMenu.days[day]?.[meal.id]) > 0).length;
                  return (
                    <button
                      key={day}
                      role="tab"
                      aria-selected={selectedDay === day}
                      className={`day-tab ${selectedDay === day ? 'selected' : ''}`}
                      onClick={() => setSelectedDay(day)}
                    >
                      <span className="day-short">{day.slice(0, 3)}</span>
                      <strong>{index + 1}</strong>
                      <small>{slots}/4 meals</small>
                    </button>
                  );
                })}
              </div>

              {/* Day Title Row */}
              <div className="day-title">
                <div>
                  <span className="day-kicker">{formatDate(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + DAYS.indexOf(selectedDay)))}</span>
                  <h3>{selectedDay}</h3>
                </div>
                <span className="meal-count">
                  {MEALS.filter((meal) => getMealCompletion(mealsForDay[meal.id]) > 0).length} of 4 meals planned
                </span>
              </div>

              {/* Meals Grid (Breakfast, Lunch, High Tea, Dinner) */}
              <div className="meal-grid">
                {MEALS.map((meal) => {
                  const leadingCandidate = votingData?.[selectedDay]?.[meal.id]?.find((c) => c.leading);
                  return (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      categories={mealsForDay[meal.id] || []}
                      leadingCandidate={leadingCandidate}
                      onEdit={() => startEditing(meal)}
                    />
                  );
                })}
              </div>

              <p className="local-note">
                <CircleHelp size={15} /> All meal items can be edited, swapped with student-voted favorites, or enriched with the Menu Items catalog.
              </p>
            </section>
          </>
        )}

        {/* 2. MENU ITEMS CATALOG TAB */}
        {activeNav === 'Menu Items' && (
          <MenuItems
            catalog={catalog}
            onAddCustomItem={handleAddCustomItem}
            onNominateForVoting={handleNominateForVoting}
            onAddToWeeklyMenu={handleAddToWeeklyMenu}
            votingData={votingData}
            onNavigateToVoting={() => setActiveNav('Voting Results')}
          />
        )}

        {/* 3. VOTING RESULTS TAB */}
        {activeNav === 'Voting Results' && (
          <VotingResults
            votingData={votingData}
            onCastVote={handleCastVote}
            onApplyWinnerToMenu={handleApplyWinnerToMenu}
            onResetVotes={handleResetVotes}
            onAddCandidate={handleAddCandidateToPoll}
            catalog={catalog}
          />
        )}

        {/* 4. INVENTORY & WASTE TAB */}
        {activeNav === 'Inventory & Waste' && <InventoryWaste />}

        {/* 5. RATE FOOD TAB */}
        {activeNav === "Rate Today's Food" && <FoodReview student={DEMO_STUDENT} />}

        {/* 6. STUDENT DASHBOARD */}
        {activeNav === 'Student Dashboard' && (
          <StudentDashboardPreview
            onRateFoodClick={() => setActiveNav("Rate Today's Food")}
            votingData={votingData}
            onCastVote={handleCastVote}
            onNavigateToVoting={() => setActiveNav('Voting Results')}
            currentWeekMenu={currentMenu}
          />
        )}

        {/* 7. QUALITY ANALYTICS */}
        {activeNav === 'Quality Analytics' && <QualityAnalytics isDemoMode={isDemoMode} />}

        {/* 8. STUDENT FOOD REVIEWS */}
        {activeNav === 'Student Food Reviews' && <ManagerReviews isDemoMode={isDemoMode} />}

        {/* 9. MANAGER OVERVIEW */}
        {activeNav === 'Manager Overview' && (
          <ManagerDashboardPreview
            onReviewsClick={() => setActiveNav('Student Food Reviews')}
            onAnalyticsClick={() => setActiveNav('Quality Analytics')}
          />
        )}
      </main>

      {/* Global Toast Notice */}
      {notice && (
        <div className={`toast toast-${notice.type}`} role="status">
          <span>{notice.text}</span>
          <button className="toast-close" aria-label="Dismiss message" onClick={() => setNotice(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Meal Editor Modal Drawer */}
      {editingMeal && mealDraft && (
        <div
          className="overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditingMeal(null);
          }}
        >
          <section className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <header className="editor-header">
              <div>
                <span className="eyebrow">{selectedDay.toUpperCase()} MENU</span>
                <h2 id="editor-title">Edit {editingMeal.label}</h2>
                <p>Configure planned food dishes or quickly insert from the authentic dishes catalog.</p>
              </div>
              <button className="icon-button" aria-label="Close editor" onClick={() => setEditingMeal(null)}>
                <X size={19} />
              </button>
            </header>

            {/* Quick Catalog Bar */}
            <div style={{ background: '#f5f7f3', padding: '12px 25px', borderBottom: '1px solid #e7ebe4' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#566a5e', display: 'block', marginBottom: '6px' }}>
                QUICK PICK FROM {editingMeal.label.toUpperCase()} CATALOG:
              </span>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {(catalog[editingMeal.id] || []).slice(0, 8).map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => addQuickItem(0, dish.name)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #d4ded3',
                      borderRadius: '5px',
                      padding: '4px 8px',
                      fontSize: '9.5px',
                      color: '#273b30',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title={`Click to add ${dish.name} directly to this meal`}
                  >
                    <span>{dish.icon}</span> {dish.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="editor-body">
              {mealDraft.map((category, categoryIndex) => (
                <section className="category-editor" key={category.name}>
                  <div className="category-title">
                    <div>
                      <h3>{category.name}</h3>
                      <label className="optional-toggle">
                        <input
                          type="checkbox"
                          checked={category.optional}
                          onChange={(event) =>
                            updateCategory(categoryIndex, (value) => ({ ...value, optional: event.target.checked }))
                          }
                        />
                        <span>Optional</span>
                      </label>
                    </div>
                    <button className="add-item-button" onClick={() => addItem(categoryIndex)}>
                      <Plus size={15} /> Add item
                    </button>
                  </div>

                  {category.items.length === 0 && (
                    <div className="empty-category">No items added yet. Add the planned food for this category.</div>
                  )}

                  {category.items.map((item, itemIndex) => (
                    <div className="food-item-editor" key={`${category.name}-${itemIndex}`}>
                      <div className="food-fields">
                        <label>
                          Food item
                          <input
                            autoFocus={item.name === ''}
                            value={item.name}
                            placeholder="Enter menu item name"
                            onChange={(event) => updateItem(categoryIndex, itemIndex, { name: event.target.value })}
                          />
                        </label>
                        <label>
                          Optional description
                          <input
                            value={item.description}
                            placeholder="e.g. served with fresh curd & mint chutney"
                            onChange={(event) => updateItem(categoryIndex, itemIndex, { description: event.target.value })}
                          />
                        </label>
                      </div>
                      <button
                        className="remove-button"
                        aria-label={`Remove ${item.name || 'food item'}`}
                        title="Remove item"
                        onClick={() => removeItem(categoryIndex, itemIndex)}
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                </section>
              ))}
            </div>

            <footer className="editor-footer">
              <button className="button button-secondary" onClick={() => setEditingMeal(null)}>
                Cancel
              </button>
              <button className="button button-primary" onClick={saveMeal}>
                <Check size={16} /> Save meal
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* Confirm Publish Dialog */}
      {publishConfirm && (
        <div className="overlay" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-title">
            <div className="confirm-icon"><Check size={21} /></div>
            <h2 id="publish-title">Publish this week's menu?</h2>
            <p>
              This will update the active live menu across all 7 days for students and hostel residents.
            </p>
            <div className="confirm-actions">
              <button className="button button-secondary" onClick={() => setPublishConfirm(false)}>
                Keep editing
              </button>
              <button className="button button-primary" onClick={confirmPublish}>
                Confirm publish
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <article className="summary-card">
      <span className={`summary-icon ${tone}`}><Icon size={18} /></span>
      <div className="summary-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function MealCard({ meal, categories, leadingCandidate, onEdit }) {
  const Icon = meal.icon;
  const items = categories.flatMap((category) =>
    category.items.filter((item) => item.name.trim()).map((item) => ({ ...item, category: category.name }))
  );

  return (
    <article className="meal-card">
      <div className="meal-card-top">
        <span className="meal-icon"><Icon size={17} /></span>
        <button className="edit-link" onClick={onEdit}>
          <FilePenLine size={14} /> Edit
        </button>
      </div>

      <div className="meal-title-row">
        <h4>{meal.label}</h4>
        <span className="meal-time">{meal.time}</span>
      </div>

      {leadingCandidate && (
        <div
          style={{
            background: '#FEF3C7',
            color: '#B45309',
            border: '1px solid #FDE68A',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '9px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '8px',
          }}
        >
          <span>🗳️ Student Choice:</span>
          <span>{leadingCandidate.name} ({leadingCandidate.votes} votes)</span>
        </div>
      )}

      {items.length ? (
        <div className="meal-items">
          {items.slice(0, 4).map((item, index) => (
            <div className="meal-item" key={`${item.category}-${index}`}>
              <span className="item-dot" />
              <span>
                <strong>{item.name}</strong>
                <small>{item.category}</small>
              </span>
            </div>
          ))}
          {items.length > 4 && <span className="more-items">+{items.length - 4} more items</span>}
        </div>
      ) : (
        <div className="meal-empty">
          <span className="empty-icon"><Utensils size={16} /></span>
          <span>
            <strong>No menu yet</strong>
            <small>Add food items to plan this meal.</small>
          </span>
        </div>
      )}

      <div className="meal-card-footer">
        <span>{items.length} {items.length === 1 ? 'item' : 'items'} planned</span>
        <span className={items.length ? 'planned-badge' : 'empty-badge'}>
          {items.length ? 'Planned' : 'Empty'}
        </span>
      </div>
    </article>
  );
}

export default App;