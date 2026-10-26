-- ==============================================================
-- Hostel Mess Management System
-- Module: Menu Polling and Voting
-- Database Engine: MySQL
-- ==============================================================

-- 1. Create table for Polls
CREATE TABLE IF NOT EXISTS polls (
    poll_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner') NOT NULL,
    opens_at DATETIME NOT NULL,
    closes_at DATETIME NOT NULL,
    status ENUM('active', 'closed', 'upcoming') DEFAULT 'active',
    created_by VARCHAR(100) DEFAULT 'Mess Manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints & Indexes
    INDEX idx_polls_meal_status (meal_type, status),
    INDEX idx_polls_window (opens_at, closes_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create table for Poll Food Options
CREATE TABLE IF NOT EXISTS poll_options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    food_name VARCHAR(150) NOT NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints & Indexes
    FOREIGN KEY (poll_id) REFERENCES polls(poll_id) ON DELETE CASCADE,
    INDEX idx_options_poll (poll_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create table for Student Poll Votes
CREATE TABLE IF NOT EXISTS poll_votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    option_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    FOREIGN KEY (poll_id) REFERENCES polls(poll_id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(option_id) ON DELETE CASCADE,
    -- Prevent duplicate votes: One student can vote at most ONCE per poll
    CONSTRAINT uq_student_poll_vote UNIQUE (poll_id, student_id),
    -- Indexes
    INDEX idx_votes_poll_option (poll_id, option_id),
    INDEX idx_votes_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
