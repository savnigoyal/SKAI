import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Plus,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  Calendar,
  Vote,
  Sparkles,
  Info,
  Clock,
  X,
  ChefHat,
  Tag,
  ArrowRight
} from 'lucide-react';
import { MEALS_CONFIG, DAYS_CONFIG } from '../services/menuData';

export default function MenuItems({
  catalog,
  onAddCustomItem,
  onNominateForVoting,
  onAddToWeeklyMenu,
  votingData,
  onNavigateToVoting,
}) {
  const [activeMealTab, setActiveMealTab] = useState('all'); // 'all' | 'breakfast' | 'lunch' | 'highTea' | 'dinner'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [nominateModalItem, setNominateModalItem] = useState(null);
  const [nominateDay, setNominateDay] = useState('Monday');
  const [scheduleModalItem, setScheduleModalItem] = useState(null);
  const [scheduleDay, setScheduleDay] = useState('Monday');

  // Form state for adding custom dish
  const [newDishName, setNewDishName] = useState('');
  const [newDishMeal, setNewDishMeal] = useState('breakfast');
  const [newDishCategory, setNewDishCategory] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishTags, setNewDishTags] = useState('Vegetarian, Chef Special');

  // Flattened list of all items with their mealType
  const allItems = useMemo(() => {
    const list = [];
    Object.keys(catalog).forEach((mealKey) => {
      catalog[mealKey].forEach((item) => {
        list.push({ ...item, mealKey });
      });
    });
    return list;
  }, [catalog]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set();
    allItems.forEach((item) => {
      item.tags?.forEach((t) => set.add(t));
    });
    return ['All', ...Array.from(set)];
  }, [allItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesMeal = activeMealTab === 'all' || item.mealKey === activeMealTab;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = selectedTag === 'All' || (item.tags && item.tags.includes(selectedTag));
      return matchesMeal && matchesSearch && matchesTag;
    });
  }, [allItems, activeMealTab, searchQuery, selectedTag]);

  // Check if item is currently in voting for any day
  const getItemVotingInfo = (itemName) => {
    if (!votingData) return null;
    let totalVotes = 0;
    let daysFound = [];
    DAYS_CONFIG.forEach((day) => {
      if (votingData[day]) {
        Object.keys(votingData[day]).forEach((mealId) => {
          const match = votingData[day][mealId]?.find((cand) => cand.name.toLowerCase() === itemName.toLowerCase());
          if (match) {
            totalVotes += match.votes;
            daysFound.push({ day, mealId, votes: match.votes, leading: match.leading });
          }
        });
      }
    });
    if (daysFound.length > 0) {
      return { totalVotes, days: daysFound };
    }
    return null;
  };

  const handleCreateDish = (e) => {
    e.preventDefault();
    if (!newDishName.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      name: newDishName.trim(),
      category: newDishCategory.trim() || 'Special',
      icon: newDishMeal === 'breakfast' ? '🍳' : newDishMeal === 'lunch' ? '🍛' : newDishMeal === 'highTea' ? '☕' : '🍽️',
      desc: newDishDesc.trim() || 'Freshly prepared specialty dish.',
      tags: newDishTags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    onAddCustomItem(newDishMeal, newItem);
    setShowAddModal(false);
    setNewDishName('');
    setNewDishCategory('');
    setNewDishDesc('');
  };

  const handleConfirmNomination = () => {
    if (!nominateModalItem) return;
    onNominateForVoting(nominateDay, nominateModalItem.mealKey, nominateModalItem);
    setNominateModalItem(null);
  };

  const handleConfirmSchedule = () => {
    if (!scheduleModalItem) return;
    onAddToWeeklyMenu(scheduleDay, scheduleModalItem.mealKey, scheduleModalItem);
    setScheduleModalItem(null);
  };

  return (
    <div className="menu-items-page" style={{ paddingBottom: '50px' }}>
      {/* Top Header */}
      <section className="page-heading" style={{ marginBottom: '20px' }}>
        <div>
          <div className="eyebrow" style={{ color: '#2f785b' }}>MESS MANAGER CATALOG</div>
          <h1>Menu Items & Dish Master</h1>
          <p>Explore, customize, and add delicious menu dishes for weekly meal planning and student voting.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="button button-primary"
            style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} /> Add New Dish
          </button>
          <button
            className="button button-secondary"
            style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={onNavigateToVoting}
          >
            <Vote size={16} /> View Voting Results
          </button>
        </div>
      </section>

      {/* Catalog KPI Summary */}
      <section className="summary-grid" style={{ marginBottom: '24px' }}>
        <article className="summary-card">
          <span className="summary-icon green"><Utensils size={18} /></span>
          <div className="summary-copy">
            <span>Total Catalog Dishes</span>
            <strong>{allItems.length}</strong>
            <small>Across 4 meal slots</small>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon amber"><Flame size={18} /></span>
          <div className="summary-copy">
            <span>Dishes in Active Polls</span>
            <strong>
              {allItems.filter((it) => getItemVotingInfo(it.name) !== null).length}
            </strong>
            <small>Open for student voting</small>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon sage"><ChefHat size={18} /></span>
          <div className="summary-copy">
            <span>Categories Available</span>
            <strong>Breakfast, Lunch, Hi Tea, Dinner</strong>
            <small>15+ items per category</small>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon green"><Sparkles size={18} /></span>
          <div className="summary-copy">
            <span>Weekly Integration</span>
            <strong>Ready to Schedule</strong>
            <small>Click any dish to add</small>
          </div>
        </article>
      </section>

      {/* Controls: Search, Meal Tabs, and Tags Filter */}
      <div className="menu-section" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Meal Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid #e7ebe4', paddingBottom: '12px' }}>
            <button
              onClick={() => setActiveMealTab('all')}
              className={`pill-filter-btn ${activeMealTab === 'all' ? 'active' : ''}`}
            >
              All Items ({allItems.length})
            </button>
            {MEALS_CONFIG.map((m) => {
              const count = catalog[m.id]?.length || 0;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMealTab(m.id)}
                  className={`pill-filter-btn ${activeMealTab === m.id ? 'active' : ''}`}
                >
                  <span style={{ marginRight: '5px' }}>{m.icon}</span>
                  {m.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search bar and Tag selector */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#829087' }} />
              <input
                type="text"
                placeholder="Search dishes by name, cuisine, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  borderRadius: '7px',
                  border: '1px solid #e0e5de',
                  background: '#fcfdfa',
                  fontSize: '11px',
                  color: '#2d4035',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#888' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Tags Pills */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto', padding: '4px 0' }}>
              <span style={{ fontSize: '10px', color: '#829087', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} /> Filter:
              </span>
              {allTags.slice(0, 8).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(t)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: selectedTag === t ? '#2f785b' : '#e2e7e0',
                    background: selectedTag === t ? '#eff6ef' : '#ffffff',
                    color: selectedTag === t ? '#2f785b' : '#64746d',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dishes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredItems.map((item) => {
          const votingInfo = getItemVotingInfo(item.name);
          const mealConfig = MEALS_CONFIG.find((m) => m.id === item.mealKey) || MEALS_CONFIG[0];

          return (
            <div
              key={`${item.mealKey}-${item.id}`}
              style={{
                background: '#ffffff',
                border: '1px solid #e5eae2',
                borderRadius: '9px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(21, 61, 50, 0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                {/* Card Top: Icon & Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#eff5ed',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '1.25rem',
                      }}
                    >
                      {item.icon || mealConfig.icon}
                    </span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 650, color: '#273c31' }}>{item.name}</h3>
                      <span style={{ fontSize: '9px', color: '#88988e', fontWeight: 500 }}>
                        {item.category || mealConfig.label} • {mealConfig.label}
                      </span>
                    </div>
                  </div>

                  {votingInfo && (
                    <span
                      style={{
                        background: '#fef3c7',
                        color: '#b45309',
                        border: '1px solid #fde68a',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title="Item is active in student voting!"
                    >
                      🗳️ {votingInfo.totalVotes} votes
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{ fontSize: '10px', color: '#68776f', margin: '8px 0 12px', lineHeight: 1.5, minHeight: '30px' }}>
                  {item.desc}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {item.tags?.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: '#f3f6f2',
                        color: '#55695e',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '8.5px',
                        fontWeight: 600,
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f0f3ee',
                }}
              >
                <button
                  className="button button-secondary"
                  style={{
                    flex: 1,
                    fontSize: '9.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    height: '32px',
                    borderColor: '#d8e2d7',
                  }}
                  onClick={() => {
                    setNominateModalItem(item);
                    setNominateDay('Monday');
                  }}
                  title="Put this item on the voting ballot for students"
                >
                  <Vote size={13} style={{ color: '#2f785b' }} /> Put for Vote
                </button>

                <button
                  className="button button-primary"
                  style={{
                    flex: 1,
                    fontSize: '9.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    height: '32px',
                  }}
                  onClick={() => {
                    setScheduleModalItem(item);
                    setScheduleDay('Monday');
                  }}
                  title="Assign this item to a day in the weekly menu"
                >
                  <Calendar size={13} /> Add to Day
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: '8px', marginTop: '20px' }}>
          <p style={{ color: '#88988e', fontSize: '13px', margin: 0 }}>No menu items match your search or filter.</p>
          <button
            className="button button-secondary"
            style={{ marginTop: '12px' }}
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('All');
              setActiveMealTab('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Modal: Add New Custom Dish */}
      {showAddModal && (
        <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <section className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="add-title">
            <header className="editor-header">
              <div>
                <span className="eyebrow">NEW DISH ENTRY</span>
                <h2 id="add-title">Add Menu Item</h2>
                <p>Add a new dish to the mess master database so it can be scheduled or voted on.</p>
              </div>
              <button className="icon-button" aria-label="Close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleCreateDish} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="editor-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10px', color: '#526659', fontWeight: 600 }}>
                    Dish Name *
                    <input
                      required
                      value={newDishName}
                      placeholder="e.g. Paneer Tikka Masala with Naan"
                      onChange={(e) => setNewDishName(e.target.value)}
                      style={{ height: '36px', padding: '0 10px', borderRadius: '5px', border: '1px solid #d9e1d8', fontSize: '11px' }}
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10px', color: '#526659', fontWeight: 600 }}>
                    Meal Slot *
                    <select
                      value={newDishMeal}
                      onChange={(e) => setNewDishMeal(e.target.value)}
                      style={{ height: '36px', padding: '0 10px', borderRadius: '5px', border: '1px solid #d9e1d8', fontSize: '11px', background: '#fff' }}
                    >
                      {MEALS_CONFIG.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label} ({m.time})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10px', color: '#526659', fontWeight: 600 }}>
                    Category / Sub-genre
                    <input
                      value={newDishCategory}
                      placeholder="e.g. North Indian Special, Chaat, High Protein"
                      onChange={(e) => setNewDishCategory(e.target.value)}
                      style={{ height: '36px', padding: '0 10px', borderRadius: '5px', border: '1px solid #d9e1d8', fontSize: '11px' }}
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10px', color: '#526659', fontWeight: 600 }}>
                    Description & Serving Style
                    <textarea
                      rows={3}
                      value={newDishDesc}
                      placeholder="e.g. Served hot with butter naan, sliced onions, and roasted cumin raita."
                      onChange={(e) => setNewDishDesc(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '5px', border: '1px solid #d9e1d8', fontSize: '11px', resize: 'vertical' }}
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10px', color: '#526659', fontWeight: 600 }}>
                    Tags (comma separated)
                    <input
                      value={newDishTags}
                      placeholder="e.g. Vegetarian, High Protein, Weekend Treat"
                      onChange={(e) => setNewDishTags(e.target.value)}
                      style={{ height: '36px', padding: '0 10px', borderRadius: '5px', border: '1px solid #d9e1d8', fontSize: '11px' }}
                    />
                  </label>
                </div>
              </div>

              <footer className="editor-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  <CheckCircle2 size={16} /> Save to Master Catalog
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* Modal: Nominate for Voting */}
      {nominateModalItem && (
        <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setNominateModalItem(null)}>
          <section className="confirm-dialog" role="dialog" aria-modal="true" style={{ maxWidth: '440px' }}>
            <div className="confirm-icon" style={{ background: '#f5edd9', color: '#94743d' }}>
              <Vote size={22} />
            </div>
            <h2 style={{ fontSize: '18px', marginTop: '12px' }}>Put up for Student Voting</h2>
            <p style={{ fontSize: '11px', color: '#68776f', margin: '6px 0 16px' }}>
              Add <strong>"{nominateModalItem.name}"</strong> to the student ballot so students can vote for it.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: '#4a5d51' }}>
                Select Voting Day:
                <select
                  value={nominateDay}
                  onChange={(e) => setNominateDay(e.target.value)}
                  style={{ width: '100%', height: '36px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cfd9cd', padding: '0 10px' }}
                >
                  {DAYS_CONFIG.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ background: '#f6f8f5', padding: '10px 12px', borderRadius: '6px', fontSize: '10px', color: '#56695e' }}>
                <span>Meal Slot: </span>
                <strong style={{ textTransform: 'capitalize' }}>{nominateModalItem.mealKey}</strong>
              </div>
            </div>

            <div className="confirm-actions">
              <button className="button button-secondary" onClick={() => setNominateModalItem(null)}>
                Cancel
              </button>
              <button className="button button-primary" onClick={handleConfirmNomination}>
                Add to Ballot
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Modal: Schedule into Weekly Menu */}
      {scheduleModalItem && (
        <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setScheduleModalItem(null)}>
          <section className="confirm-dialog" role="dialog" aria-modal="true" style={{ maxWidth: '440px' }}>
            <div className="confirm-icon" style={{ background: '#eaf4eb', color: '#38775b' }}>
              <Calendar size={22} />
            </div>
            <h2 style={{ fontSize: '18px', marginTop: '12px' }}>Schedule into Weekly Menu</h2>
            <p style={{ fontSize: '11px', color: '#68776f', margin: '6px 0 16px' }}>
              Directly assign <strong>"{scheduleModalItem.name}"</strong> to a specific day in this week's mess schedule.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: '#4a5d51' }}>
                Select Day:
                <select
                  value={scheduleDay}
                  onChange={(e) => setScheduleDay(e.target.value)}
                  style={{ width: '100%', height: '36px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cfd9cd', padding: '0 10px' }}
                >
                  {DAYS_CONFIG.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ background: '#f6f8f5', padding: '10px 12px', borderRadius: '6px', fontSize: '10px', color: '#56695e' }}>
                <span>Target Meal Slot: </span>
                <strong style={{ textTransform: 'capitalize' }}>{scheduleModalItem.mealKey}</strong>
              </div>
            </div>

            <div className="confirm-actions">
              <button className="button button-secondary" onClick={() => setScheduleModalItem(null)}>
                Cancel
              </button>
              <button className="button button-primary" onClick={handleConfirmSchedule}>
                Add to Menu
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
