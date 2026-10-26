/**
 * Comprehensive Menu Items, Weekly Schedules & Voting Engine
 * for SKAI Hostel Mess Management System.
 */

export const MEALS_CONFIG = [
  { id: 'breakfast', label: 'Breakfast', time: '7:30 - 9:30 AM', icon: '🍳', tone: 'amber' },
  { id: 'lunch', label: 'Lunch', time: '12:30 - 2:30 PM', icon: '🍛', tone: 'green' },
  { id: 'highTea', label: 'High Tea', time: '4:30 - 5:30 PM', icon: '☕', tone: 'orange' },
  { id: 'dinner', label: 'Dinner', time: '7:30 - 9:30 PM', icon: '🍽️', tone: 'purple' },
];

export const DAYS_CONFIG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Master item catalog with the exact items provided by the user
export const INITIAL_MENU_CATALOG = {
  breakfast: [
    { id: 'b-1', name: 'Aloo Paratha with Curd', category: 'Parathas', icon: '🫓', tags: ['North Indian', 'Popular', 'Vegetarian'], desc: 'Golden roasted whole wheat flatbread stuffed with spiced mashed potatoes, served with fresh churned curd.' },
    { id: 'b-2', name: 'Paneer Paratha', category: 'Parathas', icon: '🧀', tags: ['High Protein', 'North Indian', 'Vegetarian'], desc: 'Stuffed paratha filled with seasoned grated cottage cheese, green chillies, and fresh coriander.' },
    { id: 'b-3', name: 'Poha', category: 'Light Breakfast', icon: '🥣', tags: ['Healthy', 'Quick', 'Vegetarian'], desc: 'Flattened rice tossed with roasted peanuts, mustard seeds, curry leaves, and a dash of fresh lemon juice.' },
    { id: 'b-4', name: 'Vegetable Upma', category: 'Light Breakfast', icon: '🍲', tags: ['South Indian', 'Low Calorie', 'Vegetarian'], desc: 'Traditional semolina porridge infused with finely chopped carrots, peas, beans, and tempered ginger.' },
    { id: 'b-5', name: 'Idli Sambhar', category: 'South Indian', icon: '🥟', tags: ['Steamed', 'South Indian', 'Healthy'], desc: 'Steamed fluffy rice-lentil cakes served with steaming drumstick sambhar and coconut chutney.' },
    { id: 'b-6', name: 'Masala Dosa', category: 'South Indian', icon: '🥞', tags: ['Crispy', 'Popular', 'South Indian'], desc: 'Crispy golden crepe prepared from fermented batter filled with spiced potato masala.' },
    { id: 'b-7', name: 'Plain Dosa', category: 'South Indian', icon: '🥞', tags: ['Light', 'South Indian', 'Vegetarian'], desc: 'Crisp and delicate plain fermented crepe accompanied with red tomato and coconut chutney.' },
    { id: 'b-8', name: 'Chole Bhature', category: 'North Indian Special', icon: '🥘', tags: ['Weekend Favorite', 'Rich', 'Vegetarian'], desc: 'Spicy Punjabi chickpea curry paired with deep-fried fluffy sourdough bread and pickled onions.' },
    { id: 'b-9', name: 'Puri Bhaji', category: 'North Indian Special', icon: '🫓', tags: ['Classic', 'Popular', 'Vegetarian'], desc: 'Puffy deep-fried whole wheat puris served with comforting spiced potato tomato curry.' },
    { id: 'b-10', name: 'Bread Butter and Jam', category: 'Continental', icon: '🍞', tags: ['Quick', 'Sweet', 'Continental'], desc: 'Fresh toasted white or brown bread slices with creamy dairy butter and mixed fruit jam.' },
    { id: 'b-11', name: 'Veg Sandwich', category: 'Continental', icon: '🥪', tags: ['Fresh', 'Grilled', 'Vegetarian'], desc: 'Double-decker toasted sandwich layered with crisp cucumbers, tomatoes, mint chutney, and spices.' },
    { id: 'b-12', name: 'Besan Chilla', category: 'High Protein', icon: '🥞', tags: ['Gram Flour', 'Diet Friendly', 'High Protein'], desc: 'Nutritious savoury gram flour pancakes studded with onions, green chillies, and ajwain.' },
    { id: 'b-13', name: 'Aloo Puri', category: 'North Indian Special', icon: '🫓', tags: ['Traditional', 'North Indian', 'Vegetarian'], desc: 'Crispy hot puris served with aromatic hing-tempered potato curry.' },
    { id: 'b-14', name: 'Pav Bhaji', category: 'Street Special', icon: '🥖', tags: ['Mumbai Style', 'Buttery', 'Popular'], desc: 'Mashed spiced mixed vegetable bhaji topped with a generous dollop of butter and warm toasted buns.' },
    { id: 'b-15', name: 'Cornflakes with Milk', category: 'Continental', icon: '🥛', tags: ['Cereal', 'High Energy', 'Quick'], desc: 'Crispy toasted golden cornflakes served with warm or chilled sweetened milk.' },
  ],
  lunch: [
    { id: 'l-1', name: 'Dal Tadka with Rice', category: 'Lentils & Rice', icon: '🍛', tags: ['Comfort Food', 'Classic', 'Vegetarian'], desc: 'Yellow toor dal tempered with garlic, cumin, and dried red chillies, paired with steamed basmati rice.' },
    { id: 'l-2', name: 'Rajma Chawal', category: 'North Indian Special', icon: '🫘', tags: ['All Time Hit', 'High Protein', 'North Indian'], desc: 'Slow-simmered Kashmiri red kidney beans in thick onion-tomato gravy over fragrant basmati rice.' },
    { id: 'l-3', name: 'Chole Rice', category: 'North Indian Special', icon: '🍲', tags: ['Spicy', 'Popular', 'Vegetarian'], desc: 'Tangy spiced Amritsari chickpeas in roasted masala gravy accompanied by steamed rice.' },
    { id: 'l-4', name: 'Kadhi Pakora with Rice', category: 'Traditional', icon: '🥘', tags: ['Tangy', 'Comfort Food', 'Vegetarian'], desc: 'Tangy gram flour and spiced yogurt curry with crispy onion pakoras, served with piping hot rice.' },
    { id: 'l-5', name: 'Shahi Paneer with Roti', category: 'Royal Curry', icon: '🧀', tags: ['Mughlai', 'Rich Gravy', 'High Protein'], desc: 'Soft paneer cubes simmered in a creamy cashewnut and saffron aromatic tomato sauce with butter rotis.' },
    { id: 'l-6', name: 'Paneer Butter Masala', category: 'Royal Curry', icon: '🧀', tags: ['Rich', 'Top Rated', 'Vegetarian'], desc: 'Classic restaurant style cottage cheese in buttery satin tomato-makhani gravy with tawa rotis.' },
    { id: 'l-7', name: 'Aloo Gobi with Roti', category: 'Dry Vegetables', icon: '🥦', tags: ['Homestyle', 'Classic', 'Vegetarian'], desc: 'Tender cauliflower florets and baby potatoes sauteed with ginger, cumin, and fresh turmeric.' },
    { id: 'l-8', name: 'Mix Veg with Roti', category: 'Dry Vegetables', icon: '🥕', tags: ['Nutritious', 'Seasonal', 'Vegetarian'], desc: 'Assortment of carrots, peas, beans, paneer, and bell peppers tossed in mild dry spices.' },
    { id: 'l-9', name: 'Kadai Paneer', category: 'Spicy Curry', icon: '🌶️', tags: ['Spicy', 'Bell Peppers', 'Vegetarian'], desc: 'Paneer pieces tossed with crunchy capsicum, onions, and freshly pounded coriander-chilli kadai spices.' },
    { id: 'l-10', name: 'Dal Makhani with Rice', category: 'Lentils & Rice', icon: '🫘', tags: ['Slow Cooked', 'Rich', 'Vegetarian'], desc: 'Overnight slow-simmered whole black lentils and kidney beans finished with white butter and fresh cream.' },
    { id: 'l-11', name: 'Veg Pulao with Raita', category: 'Rice Specialties', icon: '🍚', tags: ['Aromatic', 'Mild Spice', 'Vegetarian'], desc: 'Fragrant basmati rice gently cooked with whole spices, garden green peas, and cooling cucumber raita.' },
    { id: 'l-12', name: 'Chole Bhature', category: 'North Indian Special', icon: '🥘', tags: ['Festive', 'Punjabi Style', 'Vegetarian'], desc: 'Robust pindi chole cooked in black tea masala served with hot puffed balloon bhaturas.' },
    { id: 'l-13', name: 'Masala Khichdi with Curd', category: 'Comfort Food', icon: '🥣', tags: ['Wholesome', 'Easy Digest', 'Vegetarian'], desc: 'Comforting one-pot moong dal and rice porridge cooked with ghee, cumin, and mild spices with curd.' },
    { id: 'l-14', name: 'Soya Chaap Curry with Roti', category: 'High Protein', icon: '🍢', tags: ['High Protein', 'Rich', 'Vegetarian'], desc: 'Juicy roasted soya chaap pieces cooked in a spiced dhaba-style rich onion-tomato gravy.' },
    { id: 'l-15', name: 'Veg Biryani with Raita', category: 'Rice Specialties', icon: '🍛', tags: ['Hyderabadi', 'Dum Cooked', 'Vegetarian'], desc: 'Layered dum basmati rice with marinated vegetables, mint, caramelized onions, and roasted cumin raita.' },
  ],
  highTea: [
    { id: 'h-1', name: 'Samosa', category: 'Crispy Snacks', icon: '🥟', tags: ['Campus Favorite', 'Crispy', 'Vegetarian'], desc: 'Golden triangular flaky pastry filled with spiced potato and green peas, served with sweet tamarind chutney.' },
    { id: 'h-2', name: 'Bread Pakora', category: 'Fried Snacks', icon: '🥪', tags: ['Monsoon Special', 'Filling', 'Vegetarian'], desc: 'Bread stuffed with spiced potato masala, dipped in seasoned gram flour batter and deep-fried till golden.' },
    { id: 'h-3', name: 'Aloo Tikki', category: 'Chaat Specialties', icon: '🫓', tags: ['Crisp Patties', 'Street Food', 'Vegetarian'], desc: 'Crispy pan-fried potato cutlets garnished with sweet date chutney, spicy mint sauce, and sev.' },
    { id: 'h-4', name: 'Veg Sandwich', category: 'Sandwiches', icon: '🥪', tags: ['Light', 'Grilled', 'Vegetarian'], desc: 'Toasted or cold sandwich with mint mayonnaise, garden veggies, and chatpata masala.' },
    { id: 'h-5', name: 'Paneer Pakora', category: 'Fried Snacks', icon: '🧀', tags: ['High Protein', 'Rich', 'Vegetarian'], desc: 'Thick succulent cottage cheese slices coated with ajwain-spiced chickpea batter and fried crisp.' },
    { id: 'h-6', name: 'French Fries', category: 'Continental Snacks', icon: '🍟', tags: ['Crispy', 'Classic', 'Western'], desc: 'Golden potato finger chips sprinkled with sea salt and peri-peri seasoning with ketchup.' },
    { id: 'h-7', name: 'Veg Momos', category: 'Asian Snacks', icon: '🥟', tags: ['Steamed', 'Popular', 'Vegetarian'], desc: 'Delicate steamed dumplings stuffed with shredded cabbage, carrots, and spring onions with fiery red sauce.' },
    { id: 'h-8', name: 'Spring Rolls', category: 'Asian Snacks', icon: '🌯', tags: ['Crisp Shell', 'Asian', 'Vegetarian'], desc: 'Crisp rolled wrappers packed with stir-fried Chinese vegetables and glass noodles.' },
    { id: 'h-9', name: 'Pav Bhaji', category: 'Chaat Specialties', icon: '🥖', tags: ['Butter Loaded', 'Street Food', 'Popular'], desc: 'Quick snack portion of spiced vegetable mash garnished with raw diced onions, cilantro, and warm pav.' },
    { id: 'h-10', name: 'Bhel Puri', category: 'Chaat Specialties', icon: '🥣', tags: ['Light', 'Crunchy', 'Tangy'], desc: 'Puffed rice tossed with boiled potatoes, onions, crispy sev, and sweet-tangy tamarind chutney.' },
    { id: 'h-11', name: 'Dhokla', category: 'Steamed Snacks', icon: '🟨', tags: ['Gujarati', 'Low Calorie', 'Steamed'], desc: 'Spongy steamed fermented besan squares tempered with mustard seeds, green chillies, and fresh coconut.' },
    { id: 'h-12', name: 'Kachori', category: 'Crispy Snacks', icon: '🥠', tags: ['Khasta', 'Traditional', 'Spicy'], desc: 'Crispy flaky puffed khasta pastry stuffed with spiced yellow moong dal and asafoetida.' },
    { id: 'h-13', name: 'Chilli Potato', category: 'Asian Snacks', icon: '🥔', tags: ['Indo-Chinese', 'Spicy', 'Crispy'], desc: 'Crispy fried potato fingers coated in honey-chilli-garlic sauce with toasted sesame seeds.' },
    { id: 'h-14', name: 'Maggi', category: 'Campus Essentials', icon: '🍜', tags: ['Hostel Classic', 'Comfort', 'Quick'], desc: 'Two-minute classic masala noodles cooked with diced onions, carrots, and sweet green peas.' },
    { id: 'h-15', name: 'Tea, Coffee and Biscuits', category: 'Beverages & Bakery', icon: '☕', tags: ['Daily Essential', 'Refreshing', 'Sweet'], desc: 'Aromatic ginger-cardamom tea or hot filter coffee served with crisp Marie and Bourbon biscuits.' },
  ],
  dinner: [
    { id: 'd-1', name: 'Dal Fry with Jeera Rice', category: 'Lentils & Rice', icon: '🍲', tags: ['Comforting', 'Homestyle', 'Vegetarian'], desc: 'Yellow lentils cooked with sauteed tomatoes and cumin, paired with aromatic cumin basmati rice.' },
    { id: 'd-2', name: 'Paneer Lababdar with Roti', category: 'Rich Curries', icon: '🧀', tags: ['Chef Special', 'Creamy', 'High Protein'], desc: 'Grated and cubed cottage cheese cooked in luscious tomato-onion gravy with a hint of kasuri methi.' },
    { id: 'd-3', name: 'Malai Kofta with Roti', category: 'Rich Curries', icon: '🧆', tags: ['Royal Treat', 'Melt in Mouth', 'Vegetarian'], desc: 'Crisp paneer and potato dumplings swimming in silky, sweet-spiced cashew nut gravy.' },
    { id: 'd-4', name: 'Aloo Matar with Roti', category: 'Homestyle Curries', icon: '🥔', tags: ['Homestyle', 'Classic', 'Vegetarian'], desc: 'Comforting North Indian potato and tender green pea curry with whole wheat phulkas.' },
    { id: 'd-5', name: 'Chana Masala with Rice', category: 'High Protein', icon: '🫘', tags: ['Tangy', 'Punjabi Style', 'High Protein'], desc: 'Hearty chickpeas braised with roasted cumin, anardana, and fragrant garam masala.' },
    { id: 'd-6', name: 'Veg Manchurian with Fried Rice', category: 'Indo-Chinese Special', icon: '🥡', tags: ['Chinese', 'Popular', 'Vegetarian'], desc: 'Vegetable dumplings tossed in dark soya-garlic gravy paired with wok-tossed vegetable fried rice.' },
    { id: 'd-7', name: 'Hakka Noodles', category: 'Indo-Chinese Special', icon: '🥢', tags: ['Indo-Chinese', 'Wok Tossed', 'Vegetarian'], desc: 'Stir-fried noodles with crunchy cabbage, julienned carrots, capsicum, and oriental sauces.' },
    { id: 'd-8', name: 'Veg Pulao with Dal', category: 'Rice & Lentil', icon: '🍚', tags: ['Balanced', 'Simple', 'Vegetarian'], desc: 'Lightly spiced garden vegetable pulao paired with homestyle yellow toor dal.' },
    { id: 'd-9', name: 'Matar Paneer with Roti', category: 'Homestyle Curries', icon: '🧀', tags: ['Classic Pair', 'Homestyle', 'High Protein'], desc: 'Fresh cottage cheese cubes and sweet peas in spiced tomato onion gravy with hot phulkas.' },
    { id: 'd-10', name: 'Dal Makhani with Naan', category: 'Royal Curries', icon: '🫓', tags: ['Dhaba Style', 'Rich', 'Vegetarian'], desc: 'Creamy slow-simmered black urad dal served with soft butter garlic naan.' },
    { id: 'd-11', name: 'Mix Veg Curry with Roti', category: 'Homestyle Curries', icon: '🥕', tags: ['Healthy', 'Mild Gravy', 'Vegetarian'], desc: 'Cauliflower, green beans, carrots, and sweet peas simmered in mild spiced onion-tomato curry.' },
    { id: 'd-12', name: 'Masala Dosa', category: 'South Indian Special', icon: '🥞', tags: ['Crispy Crepe', 'South Indian', 'Vegetarian'], desc: 'Crisp golden crepe filled with mustard-curry leaf spiced mashed potatoes and sambhar.' },
    { id: 'd-13', name: 'Veg Biryani with Raita', category: 'Rice Specialties', icon: '🍛', tags: ['Special Dinner', 'Dum Style', 'Aromatic'], desc: 'Slow-cooked royal biryani with basmati rice, paneer chunks, vegetables, and mint raita.' },
    { id: 'd-14', name: 'Kadhi Chawal', category: 'Comfort Food', icon: '🥘', tags: ['Tangy Curry', 'Comfort', 'Vegetarian'], desc: 'Authentic Punjabi kadhi with soft methi pakoras served over steamed basmati rice.' },
    { id: 'd-15', name: 'Palak Paneer with Roti', category: 'High Protein', icon: '🥬', tags: ['Iron Rich', 'Creamy Spinach', 'High Protein'], desc: 'Fresh spinach puree tempered with garlic and cumin, finished with tender paneer cubes.' },
  ],
};

// Storage Keys
export const MASTER_ITEMS_KEY = 'skai.master-menu-items.v2';
export const VOTING_DATA_KEY = 'skai.voting-data.v2';
export const WEEKLY_MENU_KEY = 'skai.weekly-menu.v1';

// Full 7-day default schedule populated with the user's authentic dishes
export function generateFullWeekSchedule() {
  return {
    Monday: {
      breakfast: [
        { name: 'Main Breakfast', optional: false, items: [{ name: 'Aloo Paratha with Curd', description: 'Served with fresh churned curd and pickle' }] },
        { name: 'Accompaniments', optional: false, items: [{ name: 'Bread Butter and Jam', description: 'Toasted white/brown bread' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Ginger tea and filter coffee' }] },
      ],
      lunch: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Dal Tadka with Rice', description: 'Tempered yellow dal with steamed rice' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Paneer Butter Masala', description: 'Rich makhani gravy' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Steamed Rice', description: 'Basmati rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Tawa Roti with Butter', description: 'Whole wheat phulkas' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Fresh Salad & Curd', description: 'Cucumber, tomato and onion salad' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Gulab Jamun', description: 'Warm syrupy dumplings' }] },
      ],
      highTea: [
        { name: 'Snacks', optional: false, items: [{ name: 'Samosa', description: 'Crispy aloo samosa with mint & tamarind chutney' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Hot masala tea' }] },
      ],
      dinner: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Dal Fry with Jeera Rice', description: 'Garlic tempered yellow dal' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Mix Veg Curry with Roti', description: 'Seasonal mixed vegetables' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Jeera Rice', description: 'Cumin flavored rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Roti', description: 'Fresh hot rotis' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Salad & Boondi Raita', description: 'Crisp boondi raita' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Kheer', description: 'Cardamom rice pudding' }] },
      ],
    },
    Tuesday: {
      breakfast: [
        { name: 'Main Breakfast', optional: false, items: [{ name: 'Poha', description: 'Indori poha with roasted peanuts & sev' }] },
        { name: 'Accompaniments', optional: false, items: [{ name: 'Vegetable Upma', description: 'Semolina upma with coconut chutney' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Ginger tea & milk' }] },
      ],
      lunch: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Rajma Chawal', description: 'Kashmiri slow simmered red kidney beans' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Aloo Gobi with Roti', description: 'Homestyle dry aloo gobi' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Jeera Rice', description: 'Steamed basmati rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Phulka Roti', description: 'Soft wheat rotis' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Onion Salad & Green Chutney', description: 'Sliced onions with lemon' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Suji Halwa', description: 'Ghee roasted semolina dessert' }] },
      ],
      highTea: [
        { name: 'Snacks', optional: false, items: [{ name: 'Bread Pakora', description: 'Spiced potato stuffed bread pakora' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Masala chai' }] },
      ],
      dinner: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Dal Makhani with Naan', description: 'Creamy black dal slow cooked' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Kadai Paneer', description: 'Capsicum & paneer in kadai masala' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Steamed Basmati Rice', description: 'Plain rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Butter Naan / Roti', description: 'Soft butter rotis' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Salad & Plain Curd', description: 'Fresh curd' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Fruit Custard', description: 'Chilled mixed fruit custard' }] },
      ],
    },
    Wednesday: {
      breakfast: [
        { name: 'Main Breakfast', optional: false, items: [{ name: 'Idli Sambhar', description: 'Soft steamed idlis with piping hot sambhar' }] },
        { name: 'Accompaniments', optional: false, items: [{ name: 'Plain Dosa', description: 'Crisp dosa with coconut & tomato chutney' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'South Indian filter coffee' }] },
      ],
      lunch: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Chole Rice', description: 'Punjabi chickpea curry with fragrant rice' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Shahi Paneer with Roti', description: 'Creamy saffron cashew gravy' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Steamed Rice', description: 'White rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Tandoori Roti', description: 'Crisp whole wheat rotis' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Cucumber Raita & Salad', description: 'Cooling yogurt raita' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Rasgulla', description: 'Soft spongy sweet' }] },
      ],
      highTea: [
        { name: 'Snacks', optional: false, items: [{ name: 'French Fries', description: 'Crispy salted fries with dip' }, { name: 'Veg Sandwich', description: 'Grilled cucumber mint sandwich' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Cold coffee & hot tea' }] },
      ],
      dinner: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Veg Pulao with Dal', description: 'Aromatic vegetable pulao with yellow dal' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Matar Paneer with Roti', description: 'Tender peas and paneer curry' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Peas Pulao', description: 'Green pea basmati pulao' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Roti with Butter', description: 'Fresh rotis' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Roasted Papad & Salad', description: 'Crispy urad dal papad' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Jalebi', description: 'Crispy hot jalebis' }] },
      ],
    },
    Thursday: {
      breakfast: [
        { name: 'Main Breakfast', optional: false, items: [{ name: 'Paneer Paratha', description: 'Seasoned paneer paratha with mint curd' }] },
        { name: 'Accompaniments', optional: false, items: [{ name: 'Cornflakes with Milk', description: 'Crunchy cereal with warm milk' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Cardamom tea' }] },
      ],
      lunch: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Kadhi Pakora with Rice', description: 'Tangy dahi kadhi with crispy onion pakoras' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Mix Veg with Roti', description: 'Dry spiced homestyle vegetables' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Steamed Rice', description: 'Hot steamed basmati rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Phulka Roti', description: 'Ghee-smeared rotis' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Green Salad & Achaar', description: 'Mixed pickle & salad' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Moong Dal Halwa', description: 'Rich lentils dessert' }] },
      ],
      highTea: [
        { name: 'Snacks', optional: false, items: [{ name: 'Dhokla', description: 'Spongy steamed Gujarati nylon dhokla' }, { name: 'Kachori', description: 'Khasta moong dal kachori' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Special masala chai' }] },
      ],
      dinner: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Chana Masala with Rice', description: 'Spiced chickpea curry with jeera rice' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Paneer Lababdar with Roti', description: 'Grated paneer in rich tomato gravy' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Jeera Rice', description: 'Fragrant cumin rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Tawa Roti', description: 'Whole wheat bread' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Onion Raita', description: 'Yogurt with diced onions' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Gajar Halwa', description: 'Warm seasonal carrot pudding' }] },
      ],
    },
    Friday: {
      breakfast: [
        { name: 'Main Breakfast', optional: false, items: [{ name: 'Masala Dosa', description: 'Crispy fermented crepe with potato masala' }] },
        { name: 'Accompaniments', optional: false, items: [{ name: 'Besan Chilla', description: 'Nutritious gram flour vegetable pancake' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Filter coffee & tea' }] },
      ],
      lunch: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Dal Makhani with Rice', description: 'Slow cooked creamy black lentils' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Soya Chaap Curry with Roti', description: 'Dhaba style rich gravy chaap' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Steamed Rice', description: 'Basmati rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Soft Rotis', description: 'Fresh wheat rotis' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Boondi Raita & Salad', description: 'Mint boondi curd' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Ice Cream Cup', description: 'Vanilla / butterscotch' }] },
      ],
      highTea: [
        { name: 'Snacks', optional: false, items: [{ name: 'Veg Momos', description: 'Steamed momos with spicy garlic chili sauce' }, { name: 'Chilli Potato', description: 'Crisp honey chili potato fingers' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Lemon iced tea & hot tea' }] },
      ],
      dinner: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Veg Manchurian with Fried Rice', description: 'Indo-Chinese wok-tossed fried rice & manchurian gravy' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Hakka Noodles', description: 'Tossed noodles with crunchy bell peppers & cabbage' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Vegetable Fried Rice', description: 'Scallion & soy fried rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Spring Rolls', description: 'Crispy fried veg rolls' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Kimchi Salad', description: 'Spiced shredded cabbage' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Chocolate Brownie', description: 'Warm fudgy slice' }] },
      ],
    },
    Saturday: {
      breakfast: [
        { name: 'Main Breakfast', optional: false, items: [{ name: 'Chole Bhature', description: 'Weekend special fluffy bhature with spicy chole' }] },
        { name: 'Accompaniments', optional: false, items: [{ name: 'Veg Sandwich', description: 'Toasted veggie sandwich' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Special Punjabi masala chai' }] },
      ],
      lunch: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Veg Pulao with Raita', description: 'Rich vegetable pulao with mix veg raita' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Malai Kofta with Roti', description: 'Creamy cashew gravy with paneer kofta' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Pulao Rice', description: 'Fragrant basmati rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Butter Roti', description: 'Hot phulkas' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Roasted Papad & Chutney', description: 'Papad' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Shahi Tukda', description: 'Crispy sweetened bread with rabri' }] },
      ],
      highTea: [
        { name: 'Snacks', optional: false, items: [{ name: 'Aloo Tikki', description: 'Crispy tikki chaat with curd and chutneys' }, { name: 'Bhel Puri', description: 'Tangy crunchy street bhel' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Adrak chai' }] },
      ],
      dinner: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Veg Biryani with Raita', description: 'Royal dum biryani with burani raita' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Paneer Butter Masala', description: 'Rich tomato gravy paneer' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Dum Biryani Rice', description: 'Saffron spiced rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Garlic Naan / Roti', description: 'Soft naan bread' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Salad & Mirchi Ka Salan', description: 'Hyderabadi gravy side' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Kulfi', description: 'Traditional malai kulfi' }] },
      ],
    },
    Sunday: {
      breakfast: [
        { name: 'Main Breakfast', optional: false, items: [{ name: 'Puri Bhaji', description: 'Sunday feast golden puffed puris with spiced potato sabzi' }, { name: 'Aloo Puri', description: 'Halwai style aloo curry' }] },
        { name: 'Accompaniments', optional: false, items: [{ name: 'Pav Bhaji', description: 'Mumbai butter pav bhaji' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Filter coffee and chai' }] },
      ],
      lunch: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Veg Biryani with Raita', description: 'Grand Sunday special biryani' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Palak Paneer with Roti', description: 'Rich garlicky spinach cottage cheese' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Jeera Rice', description: 'Cumin rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Missi Roti & Butter Naan', description: 'Assorted breads' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Pineapple Raita & Green Salad', description: 'Sweet-tangy curd' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Gulab Jamun with Ice Cream', description: 'Hot gulab jamun with vanilla ice cream' }] },
      ],
      highTea: [
        { name: 'Snacks', optional: false, items: [{ name: 'Paneer Pakora', description: 'Crispy cottage cheese fritters' }, { name: 'Maggi', description: 'Special hostel vegetable maggi' }] },
        { name: 'Beverages', optional: false, items: [{ name: 'Tea, Coffee and Biscuits', description: 'Fresh tea & coffee' }] },
      ],
      dinner: [
        { name: 'Dal / Pulse', optional: false, items: [{ name: 'Dal Fry with Jeera Rice', description: 'Comforting dhaba dal fry' }] },
        { name: 'Main Dish / Vegetable', optional: false, items: [{ name: 'Aloo Matar with Roti', description: 'Homestyle potato green pea curry' }] },
        { name: 'Rice', optional: false, items: [{ name: 'Steamed Rice', description: 'Basmati rice' }] },
        { name: 'Roti / Bread', optional: false, items: [{ name: 'Hot Tawa Phulkas', description: 'Soft rotis' }] },
        { name: 'Sides / Salad / Curd', optional: false, items: [{ name: 'Kadhi Chawal', description: 'Side of tangy kadhi pakora' }] },
        { name: 'Dessert', optional: true, items: [{ name: 'Sev Tamatar & Sevian Kheer', description: 'Vermicelli milk pudding' }] },
      ],
    },
  };
}

// Initial Candidate Voting items for each Day and Meal
export function generateInitialVotingData() {
  return {
    Monday: {
      breakfast: [
        { id: 'v-mon-b-1', name: 'Aloo Paratha with Curd', meal: 'Breakfast', votes: 88, leading: true },
        { id: 'v-mon-b-2', name: 'Poha', meal: 'Breakfast', votes: 42, leading: false },
        { id: 'v-mon-b-3', name: 'Idli Sambhar', meal: 'Breakfast', votes: 36, leading: false },
        { id: 'v-mon-b-4', name: 'Bread Butter and Jam', meal: 'Breakfast', votes: 19, leading: false },
      ],
      lunch: [
        { id: 'v-mon-l-1', name: 'Paneer Butter Masala', meal: 'Lunch', votes: 94, leading: true },
        { id: 'v-mon-l-2', name: 'Dal Tadka with Rice', meal: 'Lunch', votes: 55, leading: false },
        { id: 'v-mon-l-3', name: 'Aloo Gobi with Roti', meal: 'Lunch', votes: 24, leading: false },
      ],
      highTea: [
        { id: 'v-mon-h-1', name: 'Samosa', meal: 'High Tea', votes: 112, leading: true },
        { id: 'v-mon-h-2', name: 'Bread Pakora', meal: 'High Tea', votes: 64, leading: false },
        { id: 'v-mon-h-3', name: 'Bhel Puri', meal: 'High Tea', votes: 31, leading: false },
      ],
      dinner: [
        { id: 'v-mon-d-1', name: 'Dal Fry with Jeera Rice', meal: 'Dinner', votes: 76, leading: true },
        { id: 'v-mon-d-2', name: 'Mix Veg Curry with Roti', meal: 'Dinner', votes: 48, leading: false },
        { id: 'v-mon-d-3', name: 'Aloo Matar with Roti', meal: 'Dinner', votes: 33, leading: false },
      ],
    },
    Tuesday: {
      breakfast: [
        { id: 'v-tue-b-1', name: 'Poha', meal: 'Breakfast', votes: 68, leading: false },
        { id: 'v-tue-b-2', name: 'Vegetable Upma', meal: 'Breakfast', votes: 39, leading: false },
        { id: 'v-tue-b-3', name: 'Paneer Paratha', meal: 'Breakfast', votes: 95, leading: true },
      ],
      lunch: [
        { id: 'v-tue-l-1', name: 'Rajma Chawal', meal: 'Lunch', votes: 135, leading: true },
        { id: 'v-tue-l-2', name: 'Kadhi Pakora with Rice', meal: 'Lunch', votes: 62, leading: false },
        { id: 'v-tue-l-3', name: 'Mix Veg with Roti', meal: 'Lunch', votes: 21, leading: false },
      ],
      highTea: [
        { id: 'v-tue-h-1', name: 'French Fries', meal: 'High Tea', votes: 89, leading: true },
        { id: 'v-tue-h-2', name: 'Aloo Tikki', meal: 'High Tea', votes: 52, leading: false },
        { id: 'v-tue-h-3', name: 'Veg Sandwich', meal: 'High Tea', votes: 44, leading: false },
      ],
      dinner: [
        { id: 'v-tue-d-1', name: 'Kadai Paneer', meal: 'Dinner', votes: 104, leading: true },
        { id: 'v-tue-d-2', name: 'Dal Makhani with Naan', meal: 'Dinner', votes: 88, leading: false },
        { id: 'v-tue-d-3', name: 'Chana Masala with Rice', meal: 'Dinner', votes: 37, leading: false },
      ],
    },
    Wednesday: {
      breakfast: [
        { id: 'v-wed-b-1', name: 'Idli Sambhar', meal: 'Breakfast', votes: 74, leading: false },
        { id: 'v-wed-b-2', name: 'Masala Dosa', meal: 'Breakfast', votes: 122, leading: true },
        { id: 'v-wed-b-3', name: 'Plain Dosa', meal: 'Breakfast', votes: 31, leading: false },
      ],
      lunch: [
        { id: 'v-wed-l-1', name: 'Chole Rice', meal: 'Lunch', votes: 84, leading: false },
        { id: 'v-wed-l-2', name: 'Shahi Paneer with Roti', meal: 'Lunch', votes: 110, leading: true },
        { id: 'v-wed-l-3', name: 'Masala Khichdi with Curd', meal: 'Lunch', votes: 26, leading: false },
      ],
      highTea: [
        { id: 'v-wed-h-1', name: 'Veg Momos', meal: 'High Tea', votes: 128, leading: true },
        { id: 'v-wed-h-2', name: 'Chilli Potato', meal: 'High Tea', votes: 84, leading: false },
        { id: 'v-wed-h-3', name: 'Dhokla', meal: 'High Tea', votes: 29, leading: false },
      ],
      dinner: [
        { id: 'v-wed-d-1', name: 'Matar Paneer with Roti', meal: 'Dinner', votes: 79, leading: true },
        { id: 'v-wed-d-2', name: 'Veg Pulao with Dal', meal: 'Dinner', votes: 53, leading: false },
        { id: 'v-wed-d-3', name: 'Kadhi Chawal', meal: 'Dinner', votes: 41, leading: false },
      ],
    },
    Thursday: {
      breakfast: [
        { id: 'v-thu-b-1', name: 'Paneer Paratha', meal: 'Breakfast', votes: 92, leading: true },
        { id: 'v-thu-b-2', name: 'Besan Chilla', meal: 'Breakfast', votes: 45, leading: false },
        { id: 'v-thu-b-3', name: 'Cornflakes with Milk', meal: 'Breakfast', votes: 22, leading: false },
      ],
      lunch: [
        { id: 'v-thu-l-1', name: 'Kadhi Pakora with Rice', meal: 'Lunch', votes: 76, leading: true },
        { id: 'v-thu-l-2', name: 'Soya Chaap Curry with Roti', meal: 'Lunch', votes: 68, leading: false },
        { id: 'v-thu-l-3', name: 'Dal Tadka with Rice', meal: 'Lunch', votes: 44, leading: false },
      ],
      highTea: [
        { id: 'v-thu-h-1', name: 'Paneer Pakora', meal: 'High Tea', votes: 97, leading: true },
        { id: 'v-thu-h-2', name: 'Kachori', meal: 'High Tea', votes: 61, leading: false },
        { id: 'v-thu-h-3', name: 'Spring Rolls', meal: 'High Tea', votes: 54, leading: false },
      ],
      dinner: [
        { id: 'v-thu-d-1', name: 'Paneer Lababdar with Roti', meal: 'Dinner', votes: 115, leading: true },
        { id: 'v-thu-d-2', name: 'Chana Masala with Rice', meal: 'Dinner', votes: 62, leading: false },
        { id: 'v-thu-d-3', name: 'Palak Paneer with Roti', meal: 'Dinner', votes: 57, leading: false },
      ],
    },
    Friday: {
      breakfast: [
        { id: 'v-fri-b-1', name: 'Masala Dosa', meal: 'Breakfast', votes: 108, leading: true },
        { id: 'v-fri-b-2', name: 'Veg Sandwich', meal: 'Breakfast', votes: 51, leading: false },
        { id: 'v-fri-b-3', name: 'Aloo Puri', meal: 'Breakfast', votes: 67, leading: false },
      ],
      lunch: [
        { id: 'v-fri-l-1', name: 'Dal Makhani with Rice', meal: 'Lunch', votes: 118, leading: true },
        { id: 'v-fri-l-2', name: 'Soya Chaap Curry with Roti', meal: 'Lunch', votes: 72, leading: false },
        { id: 'v-fri-l-3', name: 'Veg Pulao with Raita', meal: 'Lunch', votes: 49, leading: false },
      ],
      highTea: [
        { id: 'v-fri-h-1', name: 'Chilli Potato', meal: 'High Tea', votes: 106, leading: true },
        { id: 'v-fri-h-2', name: 'Spring Rolls', meal: 'High Tea', votes: 82, leading: false },
        { id: 'v-fri-h-3', name: 'Maggi', meal: 'High Tea', votes: 95, leading: false },
      ],
      dinner: [
        { id: 'v-fri-d-1', name: 'Veg Manchurian with Fried Rice', meal: 'Dinner', votes: 142, leading: true },
        { id: 'v-fri-d-2', name: 'Hakka Noodles', meal: 'Dinner', votes: 98, leading: false },
        { id: 'v-fri-d-3', name: 'Malai Kofta with Roti', meal: 'Dinner', votes: 47, leading: false },
      ],
    },
    Saturday: {
      breakfast: [
        { id: 'v-sat-b-1', name: 'Chole Bhature', meal: 'Breakfast', votes: 156, leading: true },
        { id: 'v-sat-b-2', name: 'Puri Bhaji', meal: 'Breakfast', votes: 71, leading: false },
        { id: 'v-sat-b-3', name: 'Pav Bhaji', meal: 'Breakfast', votes: 84, leading: false },
      ],
      lunch: [
        { id: 'v-sat-l-1', name: 'Veg Biryani with Raita', meal: 'Lunch', votes: 138, leading: true },
        { id: 'v-sat-l-2', name: 'Chole Bhature', meal: 'Lunch', votes: 92, leading: false },
        { id: 'v-sat-l-3', name: 'Shahi Paneer with Roti', meal: 'Lunch', votes: 64, leading: false },
      ],
      highTea: [
        { id: 'v-sat-h-1', name: 'Maggi', meal: 'High Tea', votes: 130, leading: true },
        { id: 'v-sat-h-2', name: 'Aloo Tikki', meal: 'High Tea', votes: 67, leading: false },
        { id: 'v-sat-h-3', name: 'Bhel Puri', meal: 'High Tea', votes: 42, leading: false },
      ],
      dinner: [
        { id: 'v-sat-d-1', name: 'Dal Makhani with Naan', meal: 'Dinner', votes: 126, leading: true },
        { id: 'v-sat-d-2', name: 'Malai Kofta with Roti', meal: 'Dinner', votes: 89, leading: false },
        { id: 'v-sat-d-3', name: 'Veg Biryani with Raita', meal: 'Dinner', votes: 112, leading: false },
      ],
    },
    Sunday: {
      breakfast: [
        { id: 'v-sun-b-1', name: 'Pav Bhaji', meal: 'Breakfast', votes: 148, leading: true },
        { id: 'v-sun-b-2', name: 'Aloo Puri', meal: 'Breakfast', votes: 93, leading: false },
        { id: 'v-sun-b-3', name: 'Chole Bhature', meal: 'Breakfast', votes: 122, leading: false },
      ],
      lunch: [
        { id: 'v-sun-l-1', name: 'Veg Biryani with Raita', meal: 'Lunch', votes: 165, leading: true },
        { id: 'v-sun-l-2', name: 'Paneer Butter Masala', meal: 'Lunch', votes: 114, leading: false },
        { id: 'v-sun-l-3', name: 'Palak Paneer with Roti', meal: 'Lunch', votes: 53, leading: false },
      ],
      highTea: [
        { id: 'v-sun-h-1', name: 'Pav Bhaji', meal: 'High Tea', votes: 119, leading: true },
        { id: 'v-sun-h-2', name: 'Paneer Pakora', meal: 'High Tea', votes: 85, leading: false },
        { id: 'v-sun-h-3', name: 'French Fries', meal: 'High Tea', votes: 72, leading: false },
      ],
      dinner: [
        { id: 'v-sun-d-1', name: 'Palak Paneer with Roti', meal: 'Dinner', votes: 102, leading: true },
        { id: 'v-sun-d-2', name: 'Kadhi Chawal', meal: 'Dinner', votes: 78, leading: false },
        { id: 'v-sun-d-3', name: 'Dal Fry with Jeera Rice', meal: 'Dinner', votes: 64, leading: false },
      ],
    },
  };
}

// Data loaders and persist helpers
export function loadMasterMenuItems() {
  try {
    const raw = localStorage.getItem(MASTER_ITEMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.breakfast) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read master menu items from localStorage:', e);
  }
  return INITIAL_MENU_CATALOG;
}

export function saveMasterMenuItems(catalog) {
  try {
    localStorage.setItem(MASTER_ITEMS_KEY, JSON.stringify(catalog));
  } catch (e) {
    console.error('Error saving master menu items:', e);
  }
}

export function loadVotingState() {
  try {
    const raw = localStorage.getItem(VOTING_DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.Monday) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read voting state from localStorage:', e);
  }
  return generateInitialVotingData();
}

export function saveVotingState(state) {
  try {
    localStorage.setItem(VOTING_DATA_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving voting state:', e);
  }
}
