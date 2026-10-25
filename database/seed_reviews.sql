-- ==============================================================
-- Hostel Mess Management System - Repeatable Demo Seed Script
-- Module: Food Reviews & Quality Analytics
-- Description: Inserts 42 realistic student review records spanning
--              the last 30 days with a realistic spread of ratings and comments.
-- Safe: Uses INSERT IGNORE to prevent duplicate entries if run multiple times.
-- ==============================================================

USE hostel_mess_db;

INSERT IGNORE INTO food_reviews
(student_id, student_name, hostel_block, room_no, meal_type, rating, comment, review_date, created_at)
VALUES
-- Today (Breakfast, Lunch, Dinner)
('23CS101', 'Aarav Sharma', 'Block A', 'A-102', 'Breakfast', 5, 'Poha was hot and fresh, loved the crunchy peanuts!', CURDATE(), NOW() - INTERVAL 12 HOUR),
('23CS105', 'Ananya Verma', 'Block B', 'B-206', 'Breakfast', 4, 'Good breakfast, but tea was slightly too sweet.', CURDATE(), NOW() - INTERVAL 11 HOUR),
('23CS112', 'Kabir Patel', 'Block A', 'A-304', 'Breakfast', 4, 'Very filling poha and good tea.', CURDATE(), NOW() - INTERVAL 11 HOUR),
('23CS118', 'Diya Nair', 'Block C', 'C-105', 'Breakfast', 2, 'Poha was too oily and tea was cold.', CURDATE(), NOW() - INTERVAL 10 HOUR),
('23CS123', 'Ananya Sharma', 'Block B', 'B-206', 'Lunch', 4, 'Dal tadka and paneer curry were well seasoned.', CURDATE(), NOW() - INTERVAL 6 HOUR),
('23CS128', 'Rohan Mehta', 'Block A', 'A-104', 'Lunch', 5, 'Great lunch today! Fresh curd and soft rotis.', CURDATE(), NOW() - INTERVAL 5 HOUR),
('23CS130', 'Priya Iyer', 'Block B', 'B-110', 'Lunch', 3, 'Average taste. Rice was slightly overcooked.', CURDATE(), NOW() - INTERVAL 5 HOUR),
('23CS134', 'Vivek Reddy', 'Block C', 'C-208', 'Dinner', 5, 'Paneer curry was delicious and fresh.', CURDATE(), NOW() - INTERVAL 2 HOUR),
('23CS140', 'Tanvi Deshmukh', 'Block B', 'B-302', 'Dinner', 4, 'Nice dinner, good quality rice and salad.', CURDATE(), NOW() - INTERVAL 1 HOUR),

-- Yesterday (CURDATE() - 1 DAY)
('23CS102', 'Ishan Gupta', 'Block A', 'A-201', 'Breakfast', 4, 'Upma was good, coconut chutney was fresh.', CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 35 HOUR),
('23CS107', 'Sneha Kulkarni', 'Block B', 'B-108', 'Breakfast', 5, 'Tasty upma and ginger tea!', CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 34 HOUR),
('23CS115', 'Aditya Singh', 'Block C', 'C-310', 'Lunch', 4, 'Rajma chawal was flavorful and satisfying.', CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 29 HOUR),
('23CS121', 'Meera Joshi', 'Block B', 'B-204', 'Lunch', 4, 'Good quantity and well balanced spice.', CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 28 HOUR),
('23CS124', 'Rohan Mehta', 'Block A', 'A-104', 'Dinner', 5, 'Chole and jeera rice were top quality. Kheer was amazing!', CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 24 HOUR),
('23CS132', 'Karan Malhotra', 'Block A', 'A-402', 'Dinner', 3, 'Kheer was good, but chole could have been hotter.', CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 23 HOUR),

-- 2 Days Ago (CURDATE() - 2 DAY)
('23CS103', 'Neha Sen', 'Block C', 'C-112', 'Breakfast', 5, 'Soft idlis and aromatic sambhar. 10/10.', CURDATE() - INTERVAL 2 DAY, NOW() - INTERVAL 59 HOUR),
('23CS108', 'Siddharth Rao', 'Block A', 'A-115', 'Breakfast', 4, 'Good breakfast overall.', CURDATE() - INTERVAL 2 DAY, NOW() - INTERVAL 58 HOUR),
('23CS116', 'Pooja Hegde', 'Block B', 'B-305', 'Lunch', 3, 'Veg pulao was okay, raita was fresh.', CURDATE() - INTERVAL 2 DAY, NOW() - INTERVAL 53 HOUR),
('23CS122', 'Arjun Saxena', 'Block C', 'C-201', 'Lunch', 4, 'Papad and curd were good additions.', CURDATE() - INTERVAL 2 DAY, NOW() - INTERVAL 52 HOUR),
('23CS127', 'Sneha Roy', 'Block C', 'C-108', 'Dinner', 5, 'Special egg curry was awesome.', CURDATE() - INTERVAL 2 DAY, NOW() - INTERVAL 48 HOUR),
('23CS133', 'Gaurav Yadav', 'Block A', 'A-214', 'Dinner', 4, 'Good dinner, timely service.', CURDATE() - INTERVAL 2 DAY, NOW() - INTERVAL 47 HOUR),

-- 3 Days Ago (CURDATE() - 3 DAY)
('23CS104', 'Rhea Pillai', 'Block B', 'B-209', 'Breakfast', 5, 'Hot aloo parathas with butter and fresh curd!', CURDATE() - INTERVAL 3 DAY, NOW() - INTERVAL 83 HOUR),
('23CS109', 'Aryan Kapoor', 'Block A', 'A-301', 'Breakfast', 4, 'Parathas were stuffed nicely.', CURDATE() - INTERVAL 3 DAY, NOW() - INTERVAL 82 HOUR),
('23CS117', 'Kavita Pillai', 'Block B', 'B-103', 'Lunch', 4, 'Dal makhani was creamy and rich.', CURDATE() - INTERVAL 3 DAY, NOW() - INTERVAL 77 HOUR),
('23CS125', 'Amit Kumar', 'Block B', 'B-101', 'Lunch', 2, 'Roti was quite rubbery and dry today.', CURDATE() - INTERVAL 3 DAY, NOW() - INTERVAL 76 HOUR),
('23CS129', 'Devendra Bose', 'Block C', 'C-102', 'Dinner', 4, 'Mix veg curry had good vegetables.', CURDATE() - INTERVAL 3 DAY, NOW() - INTERVAL 71 HOUR),

-- 4 Days Ago (CURDATE() - 4 DAY)
('23CS105', 'Ananya Verma', 'Block B', 'B-206', 'Breakfast', 4, 'Puri bhaji was crispy and non-greasy.', CURDATE() - INTERVAL 4 DAY, NOW() - INTERVAL 107 HOUR),
('23CS110', 'Manish Tiwari', 'Block A', 'A-205', 'Breakfast', 5, 'Very tasty breakfast!', CURDATE() - INTERVAL 4 DAY, NOW() - INTERVAL 106 HOUR),
('23CS119', 'Nidhi Agarwal', 'Block B', 'B-212', 'Lunch', 4, 'Chana masala had authentic flavor.', CURDATE() - INTERVAL 4 DAY, NOW() - INTERVAL 101 HOUR),
('23CS126', 'Vikram Choudhary', 'Block A', 'A-108', 'Lunch', 3, 'Decent food, could use less oil.', CURDATE() - INTERVAL 4 DAY, NOW() - INTERVAL 100 HOUR),
('23CS135', 'Sunita Murthy', 'Block C', 'C-203', 'Dinner', 5, 'Paneer bhurji was flavorful and healthy.', CURDATE() - INTERVAL 4 DAY, NOW() - INTERVAL 95 HOUR),

-- 5 Days Ago (CURDATE() - 5 DAY)
('23CS106', 'Tarun Nambiar', 'Block C', 'C-305', 'Breakfast', 3, 'Masala dosa was okay, chutney ran out quickly.', CURDATE() - INTERVAL 5 DAY, NOW() - INTERVAL 131 HOUR),
('23CS111', 'Simran Kaur', 'Block B', 'B-107', 'Breakfast', 4, 'Dosa was crispy and hot.', CURDATE() - INTERVAL 5 DAY, NOW() - INTERVAL 130 HOUR),
('23CS120', 'Harsh Vardhan', 'Block A', 'A-312', 'Lunch', 5, 'Kadhi pakoda and rice tasted like home food!', CURDATE() - INTERVAL 5 DAY, NOW() - INTERVAL 125 HOUR),
('23CS136', 'Ritika Sen', 'Block C', 'C-114', 'Dinner', 4, 'Nutritious dinner with fresh salad.', CURDATE() - INTERVAL 5 DAY, NOW() - INTERVAL 119 HOUR),

-- 6 Days Ago (CURDATE() - 6 DAY)
('23CS113', 'Zoya Khan', 'Block B', 'B-315', 'Breakfast', 5, 'Sunday special chole bhature was incredible!', CURDATE() - INTERVAL 6 DAY, NOW() - INTERVAL 155 HOUR),
('23CS114', 'Kunal Shah', 'Block A', 'A-120', 'Lunch', 4, 'Biryani was aromatic with generous raita.', CURDATE() - INTERVAL 6 DAY, NOW() - INTERVAL 149 HOUR),
('23CS137', 'Deepak Chauhan', 'Block C', 'C-215', 'Dinner', 5, 'Ice cream and gulab jamun dessert topped it off.', CURDATE() - INTERVAL 6 DAY, NOW() - INTERVAL 143 HOUR),

-- Older Historical Sample Reviews (Last 10 - 25 days)
('23CS101', 'Aarav Sharma', 'Block A', 'A-102', 'Lunch', 4, 'Good quality lunch.', CURDATE() - INTERVAL 10 DAY, NOW() - INTERVAL 245 HOUR),
('23CS105', 'Ananya Verma', 'Block B', 'B-206', 'Dinner', 5, 'Excellent paneer preparation.', CURDATE() - INTERVAL 14 DAY, NOW() - INTERVAL 340 HOUR),
('23CS112', 'Kabir Patel', 'Block A', 'A-304', 'Breakfast', 4, 'Standard good breakfast.', CURDATE() - INTERVAL 18 DAY, NOW() - INTERVAL 435 HOUR),
('23CS118', 'Diya Nair', 'Block C', 'C-105', 'Lunch', 3, 'Average dal and rice.', CURDATE() - INTERVAL 22 DAY, NOW() - INTERVAL 530 HOUR),
('23CS123', 'Ananya Sharma', 'Block B', 'B-206', 'Dinner', 5, 'Special feast was very memorable.', CURDATE() - INTERVAL 26 DAY, NOW() - INTERVAL 625 HOUR);
