-- ==============================================================
-- Hostel Mess Management System
-- Module: Food Reviews & Quality Analytics (Savni's Module)
-- Database Engine: MySQL
-- ==============================================================

-- 1. Create table for Food Reviews
CREATE TABLE IF NOT EXISTS food_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,                    -- Student roll number or unique ID (e.g. '23CS123')
    student_name VARCHAR(100),                          -- Student name (e.g. 'Ananya Sharma')
    hostel_block VARCHAR(50),                           -- Hostel block (e.g. 'Block B')
    room_no VARCHAR(20),                                -- Room number (e.g. 'B-206')
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner') NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,                   -- 1 to 5 stars
    comment VARCHAR(200),                               -- Optional comments (max 200 chars)
    review_date DATE NOT NULL,                          -- Date of the meal being reviewed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
    -- Ensure one review per student per meal per day
    CONSTRAINT uq_student_meal_date UNIQUE (student_id, review_date, meal_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Indexes for fast aggregation and analytics queries
CREATE INDEX idx_reviews_date_meal ON food_reviews (review_date, meal_type);
CREATE INDEX idx_reviews_rating ON food_reviews (rating);
CREATE INDEX idx_reviews_student ON food_reviews (student_id);
