<?php
/**
 * M-SHAURI Mental Health Counseling System - Configuration
 * Database and application configuration settings
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'mshauri_mental_health');
define('DB_USER', 'Yugumaster');
define('DB_PASS', '12345678');

// Application configuration
define('APP_NAME', 'M-SHAURI Mental Health Counseling System');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost/mshauri');
define('APP_TIMEZONE', 'Africa/Dar_es_Salaam');

// Security settings
define('JWT_SECRET', 'your-secret-key-change-this-in-production');
define('PASSWORD_HASH_ALGO', PASSWORD_DEFAULT);
define('SESSION_LIFETIME', 3600); // 1 hour
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutes

// File upload settings
define('UPLOAD_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('UPLOAD_ALLOWED_TYPES', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']);
define('UPLOAD_PATH', 'uploads/');

// Email settings (for notifications)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', '');
define('SMTP_PASSWORD', '');
define('FROM_EMAIL', 'noreply@mshauri.tz');
define('FROM_NAME', 'M-SHAURI System');

// AI/ML settings
define('AI_ENABLED', true);
define('AI_API_URL', 'http://localhost:5000/api');
define('AI_TIMEOUT', 30);

// Offline mode settings
define('OFFLINE_MODE_ENABLED', true);
define('OFFLINE_SYNC_INTERVAL', 300); // 5 minutes
define('OFFLINE_DATA_RETENTION_DAYS', 30);

// Emergency settings
define('EMERGENCY_CONTACT_REQUIRED', true);
define('CRISIS_THRESHOLD_SCORE', 8.0);
define('AUTO_EMERGENCY_NOTIFICATION', false);

// Language settings
define('DEFAULT_LANGUAGE', 'en');
define('SUPPORTED_LANGUAGES', ['en', 'sw']);

// Privacy and compliance
define('GDPR_COMPLIANT', true);
define('DATA_RETENTION_DAYS', 365);
define('ANONYMIZE_AFTER_DAYS', 90);

// Set timezone
date_default_timezone_set(APP_TIMEZONE);

// Error reporting (disable in production)
if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// CORS settings for API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Database connection class
 */
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function __clone() {
        throw new Exception("Cannot clone singleton");
    }
    
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

/**
 * Utility functions
 */
class Utils {
    
    /**
     * Generate secure random token
     */
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    /**
     * Hash password securely
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_HASH_ALGO);
    }
    
    /**
     * Verify password
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Sanitize input data
     */
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate email address
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Generate JWT token
     */
    public static function generateJWT($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }
    
    /**
     * Verify JWT token
     */
    public static function verifyJWT($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        $header = $parts[0];
        $payload = $parts[1];
        $signature = $parts[2];
        
        $expectedSignature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
        $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));
        
        return hash_equals($signature, $expectedSignature);
    }
    
    /**
     * Decode JWT payload
     */
    public static function decodeJWT($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        return $payload;
    }
    
    /**
     * Log activity
     */
    public static function logActivity($user_id, $action, $details = null) {
        $log_data = [
            'user_id' => $user_id,
            'action' => $action,
            'details' => $details,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        error_log("Activity: " . json_encode($log_data));
    }
    
    /**
     * Send notification email
     */
    public static function sendEmail($to, $subject, $message, $isHTML = true) {
        // Implementation for sending emails
        // This would integrate with your email service
        return true;
    }
    
    /**
     * Check if user is online
     */
    public static function isUserOnline($user_id) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM user_sessions 
            WHERE user_id = ? AND expires_at > NOW() AND is_active = 1
        ");
        $stmt->execute([$user_id]);
        $result = $stmt->fetch();
        return $result['count'] > 0;
    }
    
    /**
     * Get user's timezone
     */
    public static function getUserTimezone($user_id) {
        // Default to Tanzania timezone
        return 'Africa/Dar_es_Salaam';
    }
    
    /**
     * Format date for user's timezone
     */
    public static function formatDateForUser($date, $user_id = null) {
        $timezone = $user_id ? self::getUserTimezone($user_id) : APP_TIMEZONE;
        $dt = new DateTime($date);
        $dt->setTimezone(new DateTimeZone($timezone));
        return $dt->format('Y-m-d H:i:s');
    }
}

/**
 * Response helper class
 */
class Response {
    
    public static function success($data = null, $message = 'Success', $code = 200) {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('c')
        ]);
        exit();
    }
    
    public static function error($message = 'Error', $code = 400, $details = null) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'details' => $details,
            'timestamp' => date('c')
        ]);
        exit();
    }
    
    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, 401);
    }
    
    public static function forbidden($message = 'Forbidden') {
        self::error($message, 403);
    }
    
    public static function notFound($message = 'Not found') {
        self::error($message, 404);
    }
    
    public static function serverError($message = 'Internal server error') {
        self::error($message, 500);
    }
}

/**
 * Request helper class
 */
class Request {
    
    public static function getMethod() {
        return $_SERVER['REQUEST_METHOD'];
    }
    
    public static function isPost() {
        return self::getMethod() === 'POST';
    }
    
    public static function isGet() {
        return self::getMethod() === 'GET';
    }
    
    public static function isPut() {
        return self::getMethod() === 'PUT';
    }
    
    public static function isDelete() {
        return self::getMethod() === 'DELETE';
    }
    
    public static function getData() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }
    
    public static function getJson() {
        return self::getData();
    }
    
    public static function getAuthToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
    
    public static function getCurrentUser() {
        $token = self::getAuthToken();
        if (!$token || !Utils::verifyJWT($token)) {
            return null;
        }
        
        $payload = Utils::decodeJWT($token);
        return $payload ? $payload['user_id'] : null;
    }
    
    public static function requireAuth() {
        $user_id = self::getCurrentUser();
        if (!$user_id) {
            Response::unauthorized('Authentication required');
        }
        return $user_id;
    }
}

// Initialize database connection
try {
    $db = Database::getInstance();
} catch (Exception $e) {
    Response::serverError('Database connection failed');
}
?>
