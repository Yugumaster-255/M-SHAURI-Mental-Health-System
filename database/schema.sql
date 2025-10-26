-- M-SHAURI Mental Health Counseling System Database Schema
-- Created for MySQL/MariaDB

-- Create database
CREATE DATABASE IF NOT EXISTS mshauri_mental_health;
USE mshauri_mental_health;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    language_preference ENUM('en', 'sw') DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    privacy_settings JSON,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- User sessions table
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);

-- Mental health assessments table
CREATE TABLE assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    assessment_type ENUM('depression', 'anxiety', 'stress', 'general', 'custom') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSON NOT NULL,
    scoring_rules JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_assessment_type (assessment_type),
    INDEX idx_is_active (is_active)
);

-- User assessment responses table
CREATE TABLE user_assessment_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    assessment_id INT NOT NULL,
    response_data JSON NOT NULL,
    total_score DECIMAL(10,2),
    risk_level ENUM('low', 'moderate', 'high', 'critical') DEFAULT 'low',
    recommendations JSON,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_assessment_id (assessment_id),
    INDEX idx_risk_level (risk_level),
    INDEX idx_completed_at (completed_at)
);

-- AI counseling sessions table
CREATE TABLE counseling_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_type ENUM('chat', 'voice', 'video') DEFAULT 'chat',
    session_data JSON NOT NULL,
    ai_responses JSON,
    user_satisfaction_rating INT CHECK (user_satisfaction_rating >= 1 AND user_satisfaction_rating <= 5),
    session_duration INT, -- in minutes
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_type (session_type),
    INDEX idx_started_at (started_at),
    INDEX idx_is_active (is_active)
);

-- Mental health resources table
CREATE TABLE resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    resource_type ENUM('article', 'video', 'audio', 'pdf', 'link', 'exercise') NOT NULL,
    category ENUM('depression', 'anxiety', 'stress', 'trauma', 'relationships', 'general', 'emergency') NOT NULL,
    language ENUM('en', 'sw', 'both') DEFAULT 'both',
    file_path VARCHAR(500),
    external_url VARCHAR(500),
    tags JSON,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_resource_type (resource_type),
    INDEX idx_category (category),
    INDEX idx_language (language),
    INDEX idx_is_featured (is_featured),
    INDEX idx_is_active (is_active),
    FULLTEXT idx_content_search (title, content)
);

-- User progress tracking table
CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    progress_type ENUM('mood', 'sleep', 'exercise', 'medication', 'therapy', 'custom') NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_unit VARCHAR(20),
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_progress_type (progress_type),
    INDEX idx_recorded_at (recorded_at)
);

-- Emergency contacts table
CREATE TABLE emergency_contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    organization VARCHAR(255),
    contact_type ENUM('police', 'medical', 'mental_health', 'crisis', 'general') NOT NULL,
    region VARCHAR(100),
    is_24_7 BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contact_type (contact_type),
    INDEX idx_region (region),
    INDEX idx_is_active (is_active)
);

-- User feedback table
CREATE TABLE user_feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    feedback_type ENUM('bug_report', 'feature_request', 'general', 'rating') NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_feedback_type (feedback_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- System settings table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
);

-- Offline sync table for handling offline data
CREATE TABLE offline_sync (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('insert', 'update', 'delete') NOT NULL,
    data JSON,
    sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP NULL,
    error_message TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_sync_status (sync_status),
    INDEX idx_created_at (created_at)
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'M-SHAURI Mental Health Counseling System', 'string', 'Application name', TRUE),
('app_version', '1.0.0', 'string', 'Application version', TRUE),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode toggle', FALSE),
('max_session_duration', '60', 'number', 'Maximum counseling session duration in minutes', FALSE),
('emergency_contact_required', 'true', 'boolean', 'Whether emergency contacts are required', TRUE),
('ai_counseling_enabled', 'true', 'boolean', 'Enable AI counseling feature', TRUE),
('offline_mode_enabled', 'true', 'boolean', 'Enable offline mode', TRUE),
('supported_languages', '["en", "sw"]', 'json', 'Supported languages', TRUE);

-- Insert default emergency contacts
INSERT INTO emergency_contacts (name, phone, email, organization, contact_type, region, is_24_7, is_active) VALUES
('Emergency Services', '112', NULL, 'Tanzania Police Force', 'police', 'All', TRUE, TRUE),
('Medical Emergency', '114', NULL, 'Emergency Medical Services', 'medical', 'All', TRUE, TRUE),
('Mental Health Helpline', '+255 XXX XXX XXX', 'helpline@mshauri.tz', 'M-SHAURI Support', 'mental_health', 'All', TRUE, TRUE),
('Crisis Support', '+255 XXX XXX XXX', 'crisis@mshauri.tz', 'M-SHAURI Crisis Team', 'crisis', 'All', TRUE, TRUE);

-- Insert sample mental health resources
INSERT INTO resources (title, content, resource_type, category, language, is_featured, is_active, view_count) VALUES
('Understanding Depression', 'Depression is a common mental health condition that affects millions of people worldwide. It can cause persistent feelings of sadness, hopelessness, and loss of interest in activities you once enjoyed.', 'article', 'depression', 'both', TRUE, TRUE, 0),
('Coping with Anxiety', 'Anxiety is a normal human emotion, but when it becomes excessive and interferes with daily life, it may be an anxiety disorder. Learn about symptoms, causes, and coping strategies.', 'article', 'anxiety', 'both', TRUE, TRUE, 0),
('Stress Management Techniques', 'Stress is a natural response to challenges, but chronic stress can harm your physical and mental health. Discover effective stress management techniques.', 'article', 'stress', 'both', TRUE, TRUE, 0),
('Emergency Mental Health Resources', 'If you are experiencing a mental health crisis, please contact emergency services immediately. Your safety is our priority.', 'article', 'emergency', 'both', TRUE, TRUE, 0);

-- Create indexes for better performance
CREATE INDEX idx_users_email_active ON users(email, is_active);
CREATE INDEX idx_assessments_user_type ON user_assessment_responses(user_id, assessment_id);
CREATE INDEX idx_counseling_user_active ON counseling_sessions(user_id, is_active);
CREATE INDEX idx_resources_category_active ON resources(category, is_active);
CREATE INDEX idx_progress_user_type ON user_progress(user_id, progress_type);
CREATE INDEX idx_feedback_user_type ON user_feedback(user_id, feedback_type);

-- Create views for common queries
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.created_at,
    u.last_login,
    COUNT(DISTINCT uar.id) as assessment_count,
    COUNT(DISTINCT cs.id) as counseling_sessions,
    MAX(uar.completed_at) as last_assessment
FROM users u
LEFT JOIN user_assessment_responses uar ON u.id = uar.user_id
LEFT JOIN counseling_sessions cs ON u.id = cs.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.email, u.created_at, u.last_login;

CREATE VIEW resource_summary AS
SELECT 
    r.id,
    r.title,
    r.resource_type,
    r.category,
    r.language,
    r.is_featured,
    r.view_count,
    r.created_at
FROM resources r
WHERE r.is_active = TRUE
ORDER BY r.is_featured DESC, r.view_count DESC;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE GetUserProgress(IN user_id INT, IN days_back INT)
BEGIN
    SELECT 
        progress_type,
        metric_name,
        AVG(metric_value) as avg_value,
        COUNT(*) as data_points,
        MAX(recorded_at) as last_recorded
    FROM user_progress 
    WHERE user_id = user_id 
    AND recorded_at >= DATE_SUB(NOW(), INTERVAL days_back DAY)
    GROUP BY progress_type, metric_name
    ORDER BY last_recorded DESC;
END //

CREATE PROCEDURE GetAssessmentHistory(IN user_id INT)
BEGIN
    SELECT 
        a.title,
        a.assessment_type,
        uar.total_score,
        uar.risk_level,
        uar.completed_at
    FROM user_assessment_responses uar
    JOIN assessments a ON uar.assessment_id = a.id
    WHERE uar.user_id = user_id
    ORDER BY uar.completed_at DESC;
END //

CREATE PROCEDURE SyncOfflineData(IN user_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE sync_id INT;
    DECLARE sync_cursor CURSOR FOR 
        SELECT id FROM offline_sync 
        WHERE user_id = user_id AND sync_status = 'pending';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN sync_cursor;
    sync_loop: LOOP
        FETCH sync_cursor INTO sync_id;
        IF done THEN
            LEAVE sync_loop;
        END IF;
        
        -- Update sync status to synced
        UPDATE offline_sync 
        SET sync_status = 'synced', synced_at = NOW() 
        WHERE id = sync_id;
    END LOOP;
    CLOSE sync_cursor;
END //

DELIMITER ;

-- Create triggers for automatic updates
DELIMITER //

CREATE TRIGGER update_user_last_login
AFTER INSERT ON user_sessions
FOR EACH ROW
BEGIN
    UPDATE users 
    SET last_login = NOW() 
    WHERE id = NEW.user_id;
END //

CREATE TRIGGER increment_resource_view_count
AFTER SELECT ON resources
FOR EACH ROW
BEGIN
    UPDATE resources 
    SET view_count = view_count + 1 
    WHERE id = NEW.id;
END //

DELIMITER ;

-- Grant permissions (adjust as needed for your setup)
-- CREATE USER 'mshauri_user'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON mshauri_mental_health.* TO 'mshauri_user'@'localhost';
-- FLUSH PRIVILEGES;
