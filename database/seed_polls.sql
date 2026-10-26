-- ==============================================================
-- Hostel Mess Management System
-- Module: Menu Polling and Voting - Sample Demo Data
-- Safe & Idempotent (Avoids duplicate records upon re-execution)
-- ==============================================================

-- Sample Poll 1: Breakfast Special Poll (Active)
INSERT INTO polls (poll_id, title, meal_type, opens_at, closes_at, status, created_by)
VALUES (
    1,
    'Vote for Next Sunday Special Breakfast',
    'Breakfast',
    NOW() - INTERVAL 1 DAY,
    NOW() + INTERVAL 2 DAY,
    'active',
    'Mess Manager'
)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    meal_type = VALUES(meal_type),
    opens_at = VALUES(opens_at),
    closes_at = VALUES(closes_at),
    status = VALUES(status);

-- Options for Poll 1
INSERT INTO poll_options (option_id, poll_id, food_name, image_url)
VALUES 
    (1, 1, 'Aloo Paratha with Curd & Butter', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&q=80'),
    (2, 1, 'Masala Dosa with Sambar & Chutney', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80'),
    (3, 1, 'Chole Bhature with Pickled Onions', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80'),
    (4, 1, 'Poha with Sev & Masala Tea', 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&q=80')
ON DUPLICATE KEY UPDATE
    food_name = VALUES(food_name),
    image_url = VALUES(image_url);

-- Sample Poll 2: Lunch Special Poll (Active)
INSERT INTO polls (poll_id, title, meal_type, opens_at, closes_at, status, created_by)
VALUES (
    2,
    'Vote for Wednesday Feast Lunch',
    'Lunch',
    NOW() - INTERVAL 1 DAY,
    NOW() + INTERVAL 3 DAY,
    'active',
    'Mess Manager'
)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    meal_type = VALUES(meal_type),
    opens_at = VALUES(opens_at),
    closes_at = VALUES(closes_at),
    status = VALUES(status);

-- Options for Poll 2
INSERT INTO poll_options (option_id, poll_id, food_name, image_url)
VALUES 
    (5, 2, 'Paneer Butter Masala + Butter Naan', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80'),
    (6, 2, 'Hyderabadi Veg Biryani with Mirchi Salan', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80'),
    (7, 2, 'Rajma Chawal with Desi Ghee & Salad', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80')
ON DUPLICATE KEY UPDATE
    food_name = VALUES(food_name),
    image_url = VALUES(image_url);

-- Sample Poll 3: Dinner Special Poll (Closed / Completed)
INSERT INTO polls (poll_id, title, meal_type, opens_at, closes_at, status, created_by)
VALUES (
    3,
    'Weekend Dinner Dessert Special',
    'Dinner',
    NOW() - INTERVAL 4 DAY,
    NOW() - INTERVAL 1 DAY,
    'closed',
    'Mess Manager'
)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    meal_type = VALUES(meal_type),
    opens_at = VALUES(opens_at),
    closes_at = VALUES(closes_at),
    status = VALUES(status);

-- Options for Poll 3
INSERT INTO poll_options (option_id, poll_id, food_name, image_url)
VALUES 
    (8, 3, 'Hot Gulab Jamun with Rabri', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80'),
    (9, 3, 'Moong Dal Halwa', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80'),
    (10, 3, 'Kesar Rasmalai', 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&q=80')
ON DUPLICATE KEY UPDATE
    food_name = VALUES(food_name),
    image_url = VALUES(image_url);

-- Sample Initial Votes for Poll 1 (Breakfast)
INSERT IGNORE INTO poll_votes (vote_id, poll_id, option_id, student_id, voted_at)
VALUES
    (1, 1, 1, '23CS101', NOW() - INTERVAL 12 HOUR),
    (2, 1, 1, '23CS102', NOW() - INTERVAL 11 HOUR),
    (3, 1, 1, '23CS103', NOW() - INTERVAL 10 HOUR),
    (4, 1, 2, '23CS104', NOW() - INTERVAL 9 HOUR),
    (5, 1, 2, '23CS105', NOW() - INTERVAL 8 HOUR),
    (6, 1, 2, '23CS106', NOW() - INTERVAL 7 HOUR),
    (7, 1, 2, '23CS107', NOW() - INTERVAL 6 HOUR),
    (8, 1, 2, '23CS108', NOW() - INTERVAL 5 HOUR),
    (9, 1, 3, '23CS109', NOW() - INTERVAL 4 HOUR),
    (10, 1, 3, '23CS110', NOW() - INTERVAL 3 HOUR),
    (11, 1, 4, '23CS111', NOW() - INTERVAL 2 HOUR);

-- Sample Initial Votes for Poll 3 (Dinner - Closed)
INSERT IGNORE INTO poll_votes (vote_id, poll_id, option_id, student_id, voted_at)
VALUES
    (12, 3, 10, '23CS101', NOW() - INTERVAL 2 DAY),
    (13, 3, 10, '23CS102', NOW() - INTERVAL 2 DAY),
    (14, 3, 10, '23CS103', NOW() - INTERVAL 2 DAY),
    (15, 3, 10, '23CS104', NOW() - INTERVAL 2 DAY),
    (16, 3, 8, '23CS105', NOW() - INTERVAL 2 DAY),
    (17, 3, 8, '23CS106', NOW() - INTERVAL 2 DAY),
    (18, 3, 9, '23CS107', NOW() - INTERVAL 2 DAY);
