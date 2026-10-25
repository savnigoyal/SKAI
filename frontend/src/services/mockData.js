/**
 * Realistic Demo / Mock Data for Hostel Mess Management
 * Used for offline demonstration, testing, and UI preview.
 * Clearly labeled as Demo Data.
 */

export const DEMO_STUDENT = {
  student_id: '23CS123',
  student_name: 'Ananya Sharma',
  year: '2nd Year',
  hostel_block: 'Block B',
  room_no: 'B-206',
  email: 'ananya@college.edu'
};

export const DEMO_TODAYS_MENU = {
  date: 'Mon, 12 Aug 2024',
  breakfast: { title: 'Breakfast', items: 'Poha + Tea', icon: '🍳' },
  lunch: { title: 'Lunch', items: 'Dal, Rice, Mix Veg, Roti, Curd', icon: '🍲' },
  dinner: { title: 'Dinner', items: 'Paneer Curry, Rice, Salad', icon: '🍛' }
};

export const DEMO_WEEKLY_MENU = [
  { day: 'Mon', date: '12 Aug', breakfast: 'Poha, Tea', lunch: 'Dal, Rice, Mix Veg, Roti, Curd', dinner: 'Paneer Curry, Rice, Salad' },
  { day: 'Tue', date: '13 Aug', breakfast: 'Upma, Tea', lunch: 'Rajma, Rice, Roti, Salad', dinner: 'Chole, Roti, Kheer' },
  { day: 'Wed', date: '14 Aug', breakfast: 'Idli, Sambhar', lunch: 'Veg Pulao, Raita, Papad', dinner: 'Egg Curry, Rice, Salad' },
  { day: 'Thu', date: '15 Aug', breakfast: 'Aloo Paratha', lunch: 'Dal Makhani, Roti, Salad', dinner: 'Mix Veg, Roti, Curd' },
  { day: 'Fri', date: '16 Aug', breakfast: 'Puri Bhaji', lunch: 'Chana Masala, Roti, Salad', dinner: 'Paneer Bhurji, Rice, Salad' },
  { day: 'Sat', date: '17 Aug', breakfast: 'Masala Dosa, Tea', lunch: 'Kadhi Pakoda, Rice, Roti', dinner: 'Dal Tadka, Jeera Rice, Salad' },
  { day: 'Sun', date: '18 Aug', breakfast: 'Chole Bhature', lunch: 'Special Veg/Chicken Biryani', dinner: 'Paneer Pulao, Gulab Jamun' }
];

export const DEMO_VOTING_OPTIONS = [
  { id: 1, name: 'Poha', meal: 'Breakfast', votes: 34, leading: false },
  { id: 2, name: 'Aloo Paratha', meal: 'Breakfast', votes: 78, leading: true },
  { id: 3, name: 'Idli Sambhar', meal: 'Breakfast', votes: 45, leading: false },
  { id: 4, name: 'Upma', meal: 'Breakfast', votes: 18, leading: false }
];

export const DEMO_INVENTORY = [
  { id: 1, item: 'Rice', category: 'Grains', quantity: '50 kg', status: 'In Stock' },
  { id: 2, item: 'Wheat Flour', category: 'Grains', quantity: '20 kg', status: 'Low Stock' },
  { id: 3, item: 'Tomatoes', category: 'Vegetables', quantity: '5 kg', status: 'Low Stock' },
  { id: 4, item: 'Onions', category: 'Vegetables', quantity: '30 kg', status: 'In Stock' },
  { id: 5, item: 'Paneer', category: 'Dairy', quantity: '10 kg', status: 'In Stock' }
];

export const DEMO_FOOD_WASTE_STATS = {
  totalWeeklyKg: 18,
  dailyWastage: [
    { day: 'Mon', kg: 14 },
    { day: 'Tue', kg: 18 },
    { day: 'Wed', kg: 12 },
    { day: 'Thu', kg: 15 },
    { day: 'Fri', kg: 20 },
    { day: 'Sat', kg: 16 },
    { day: 'Sun', kg: 11 }
  ]
};

// 42 Sample Reviews for Savni's Food Reviews and Quality Analytics
export const DEMO_REVIEWS = [
  { id: 1, student_id: '23CS101', student_name: 'Aarav Sharma', hostel_block: 'Block A', room_no: 'A-102', meal_type: 'Breakfast', rating: 5, comment: 'Poha was hot and fresh, loved the crunchy peanuts!', review_date: '2024-08-12', created_at: '2024-08-12T08:30:00Z' },
  { id: 2, student_id: '23CS105', student_name: 'Ananya Verma', hostel_block: 'Block B', room_no: 'B-206', meal_type: 'Breakfast', rating: 4, comment: 'Good breakfast, but tea was slightly too sweet.', review_date: '2024-08-12', created_at: '2024-08-12T08:45:00Z' },
  { id: 3, student_id: '23CS112', student_name: 'Kabir Patel', hostel_block: 'Block A', room_no: 'A-304', meal_type: 'Breakfast', rating: 4, comment: 'Very filling poha and good tea.', review_date: '2024-08-12', created_at: '2024-08-12T09:00:00Z' },
  { id: 4, student_id: '23CS118', student_name: 'Diya Nair', hostel_block: 'Block C', room_no: 'C-105', meal_type: 'Breakfast', rating: 2, comment: 'Poha was too oily and tea was cold.', review_date: '2024-08-12', created_at: '2024-08-12T09:15:00Z' },
  { id: 5, student_id: '23CS123', student_name: 'Ananya Sharma', hostel_block: 'Block B', room_no: 'B-206', meal_type: 'Lunch', rating: 4, comment: 'Dal tadka and paneer curry were well seasoned.', review_date: '2024-08-12', created_at: '2024-08-12T13:15:00Z' },
  { id: 6, student_id: '23CS128', student_name: 'Rohan Mehta', hostel_block: 'Block A', room_no: 'A-104', meal_type: 'Lunch', rating: 5, comment: 'Great lunch today! Fresh curd and soft rotis.', review_date: '2024-08-12', created_at: '2024-08-12T13:30:00Z' },
  { id: 7, student_id: '23CS130', student_name: 'Priya Iyer', hostel_block: 'Block B', room_no: 'B-110', meal_type: 'Lunch', rating: 3, comment: 'Average taste. Rice was slightly overcooked.', review_date: '2024-08-12', created_at: '2024-08-12T13:45:00Z' },
  { id: 8, student_id: '23CS134', student_name: 'Vivek Reddy', hostel_block: 'Block C', room_no: 'C-208', meal_type: 'Dinner', rating: 5, comment: 'Paneer curry was delicious and fresh.', review_date: '2024-08-12', created_at: '2024-08-12T20:15:00Z' },
  { id: 9, student_id: '23CS140', student_name: 'Tanvi Deshmukh', hostel_block: 'Block B', room_no: 'B-302', meal_type: 'Dinner', rating: 4, comment: 'Nice dinner, good quality rice and salad.', review_date: '2024-08-12', created_at: '2024-08-12T20:45:00Z' },
  { id: 10, student_id: '23CS102', student_name: 'Ishan Gupta', hostel_block: 'Block A', room_no: 'A-201', meal_type: 'Breakfast', rating: 4, comment: 'Upma was good, coconut chutney was fresh.', review_date: '2024-08-11', created_at: '2024-08-11T08:30:00Z' },
  { id: 11, student_id: '23CS107', student_name: 'Sneha Kulkarni', hostel_block: 'Block B', room_no: 'B-108', meal_type: 'Breakfast', rating: 5, comment: 'Tasty upma and ginger tea!', review_date: '2024-08-11', created_at: '2024-08-11T08:50:00Z' },
  { id: 12, student_id: '23CS115', student_name: 'Aditya Singh', hostel_block: 'Block C', room_no: 'C-310', meal_type: 'Lunch', rating: 4, comment: 'Rajma chawal was flavorful and satisfying.', review_date: '2024-08-11', created_at: '2024-08-11T13:20:00Z' },
  { id: 13, student_id: '23CS121', student_name: 'Meera Joshi', hostel_block: 'Block B', room_no: 'B-204', meal_type: 'Lunch', rating: 4, comment: 'Good quantity and well balanced spice.', review_date: '2024-08-11', created_at: '2024-08-11T13:40:00Z' },
  { id: 14, student_id: '23CS124', student_name: 'Rohan Mehta', hostel_block: 'Block A', room_no: 'A-104', meal_type: 'Dinner', rating: 5, comment: 'Chole and jeera rice were top quality. Kheer was amazing!', review_date: '2024-08-11', created_at: '2024-08-11T20:10:00Z' },
  { id: 15, student_id: '23CS132', student_name: 'Karan Malhotra', hostel_block: 'Block A', room_no: 'A-402', meal_type: 'Dinner', rating: 3, comment: 'Kheer was good, but chole could have been hotter.', review_date: '2024-08-11', created_at: '2024-08-11T20:30:00Z' },
  { id: 16, student_id: '23CS103', student_name: 'Neha Sen', hostel_block: 'Block C', room_no: 'C-112', meal_type: 'Breakfast', rating: 5, comment: 'Soft idlis and aromatic sambhar. 10/10.', review_date: '2024-08-10', created_at: '2024-08-10T08:35:00Z' },
  { id: 17, student_id: '23CS108', student_name: 'Siddharth Rao', hostel_block: 'Block A', room_no: 'A-115', meal_type: 'Breakfast', rating: 4, comment: 'Good breakfast overall.', review_date: '2024-08-10', created_at: '2024-08-10T08:55:00Z' },
  { id: 18, student_id: '23CS116', student_name: 'Pooja Hegde', hostel_block: 'Block B', room_no: 'B-305', meal_type: 'Lunch', rating: 3, comment: 'Veg pulao was okay, raita was fresh.', review_date: '2024-08-10', created_at: '2024-08-10T13:10:00Z' },
  { id: 19, student_id: '23CS122', student_name: 'Arjun Saxena', hostel_block: 'Block C', room_no: 'C-201', meal_type: 'Lunch', rating: 4, comment: 'Papad and curd were good additions.', review_date: '2024-08-10', created_at: '2024-08-10T13:35:00Z' },
  { id: 20, student_id: '23CS127', student_name: 'Sneha Roy', hostel_block: 'Block C', room_no: 'C-108', meal_type: 'Dinner', rating: 5, comment: 'Special egg curry was awesome.', review_date: '2024-08-10', created_at: '2024-08-10T20:15:00Z' },
  { id: 21, student_id: '23CS133', student_name: 'Gaurav Yadav', hostel_block: 'Block A', room_no: 'A-214', meal_type: 'Dinner', rating: 4, comment: 'Good dinner, timely service.', review_date: '2024-08-10', created_at: '2024-08-10T20:40:00Z' },
  { id: 22, student_id: '23CS104', student_name: 'Rhea Pillai', hostel_block: 'Block B', room_no: 'B-209', meal_type: 'Breakfast', rating: 5, comment: 'Hot aloo parathas with butter and fresh curd!', review_date: '2024-08-09', created_at: '2024-08-09T08:40:00Z' },
  { id: 23, student_id: '23CS109', student_name: 'Aryan Kapoor', hostel_block: 'Block A', room_no: 'A-301', meal_type: 'Breakfast', rating: 4, comment: 'Parathas were stuffed nicely.', review_date: '2024-08-09', created_at: '2024-08-09T09:05:00Z' },
  { id: 24, student_id: '23CS117', student_name: 'Kavita Pillai', hostel_block: 'Block B', room_no: 'B-103', meal_type: 'Lunch', rating: 4, comment: 'Dal makhani was creamy and rich.', review_date: '2024-08-09', created_at: '2024-08-09T13:25:00Z' },
  { id: 25, student_id: '23CS125', student_name: 'Amit Kumar', hostel_block: 'Block B', room_no: 'B-101', meal_type: 'Lunch', rating: 2, comment: 'Roti was quite rubbery and dry today.', review_date: '2024-08-09', created_at: '2024-08-09T13:50:00Z' },
  { id: 26, student_id: '23CS129', student_name: 'Devendra Bose', hostel_block: 'Block C', room_no: 'C-102', meal_type: 'Dinner', rating: 4, comment: 'Mix veg curry had good vegetables.', review_date: '2024-08-09', created_at: '2024-08-09T20:25:00Z' },
  { id: 27, student_id: '23CS105', student_name: 'Ananya Verma', hostel_block: 'Block B', room_no: 'B-206', meal_type: 'Breakfast', rating: 4, comment: 'Puri bhaji was crispy and non-greasy.', review_date: '2024-08-08', created_at: '2024-08-08T08:30:00Z' },
  { id: 28, student_id: '23CS110', student_name: 'Manish Tiwari', hostel_block: 'Block A', room_no: 'A-205', meal_type: 'Breakfast', rating: 5, comment: 'Very tasty breakfast!', review_date: '2024-08-08', created_at: '2024-08-08T08:50:00Z' },
  { id: 29, student_id: '23CS119', student_name: 'Nidhi Agarwal', hostel_block: 'Block B', room_no: 'B-212', meal_type: 'Lunch', rating: 4, comment: 'Chana masala had authentic flavor.', review_date: '2024-08-08', created_at: '2024-08-08T13:15:00Z' },
  { id: 30, student_id: '23CS126', student_name: 'Vikram Choudhary', hostel_block: 'Block A', room_no: 'A-108', meal_type: 'Lunch', rating: 3, comment: 'Decent food, could use less oil.', review_date: '2024-08-08', created_at: '2024-08-08T13:40:00Z' },
  { id: 31, student_id: '23CS135', student_name: 'Sunita Murthy', hostel_block: 'Block C', room_no: 'C-203', meal_type: 'Dinner', rating: 5, comment: 'Paneer bhurji was flavorful and healthy.', review_date: '2024-08-08', created_at: '2024-08-08T20:10:00Z' }
];

/**
 * Computes realistic summary metrics calculated dynamically from DEMO_REVIEWS.
 * Avoids any hardcoded numbers that contradict underlying records.
 */
export function calculateDemoAnalytics(reviews = DEMO_REVIEWS) {
  const total = reviews.length;
  if (total === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      mealBreakdown: { Breakfast: { avg_rating: 0, count: 0 }, Lunch: { avg_rating: 0, count: 0 }, Dinner: { avg_rating: 0, count: 0 } },
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const sumRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Number((sumRating / total).toFixed(1));

  const mealStats = {
    Breakfast: { sum: 0, count: 0 },
    Lunch: { sum: 0, count: 0 },
    Dinner: { sum: 0, count: 0 }
  };

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach(r => {
    if (mealStats[r.meal_type]) {
      mealStats[r.meal_type].sum += r.rating;
      mealStats[r.meal_type].count += 1;
    }
    dist[r.rating] = (dist[r.rating] || 0) + 1;
  });

  return {
    totalReviews: total,
    averageRating: avg,
    mealBreakdown: {
      Breakfast: {
        avg_rating: mealStats.Breakfast.count ? Number((mealStats.Breakfast.sum / mealStats.Breakfast.count).toFixed(1)) : 0,
        count: mealStats.Breakfast.count
      },
      Lunch: {
        avg_rating: mealStats.Lunch.count ? Number((mealStats.Lunch.sum / mealStats.Lunch.count).toFixed(1)) : 0,
        count: mealStats.Lunch.count
      },
      Dinner: {
        avg_rating: mealStats.Dinner.count ? Number((mealStats.Dinner.sum / mealStats.Dinner.count).toFixed(1)) : 0,
        count: mealStats.Dinner.count
      }
    },
    ratingDistribution: dist
  };
}

/**
 * Calculates meal comparison from demo reviews
 */
export function calculateDemoMealComparison(reviews = DEMO_REVIEWS) {
  const meals = ['Breakfast', 'Lunch', 'Dinner'].map(meal => {
    const list = reviews.filter(r => r.meal_type === meal);
    const total = list.length;
    const avg = total > 0 ? Number((list.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)) : 0;
    const pos = list.filter(r => r.rating >= 4).length;
    const neg = list.filter(r => r.rating <= 2).length;
    return {
      meal_type: meal,
      total_reviews: total,
      avg_rating: avg,
      positive_reviews: pos,
      negative_reviews: neg,
      satisfaction_rate: total > 0 ? Math.round((pos / total) * 100) : 0
    };
  });
  return { meals };
}
