<?php
/**
 * M-SHAURI Authentication API
 * Handles user registration, login, logout, and session management
 */

require_once 'config.php';

class AuthAPI {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Handle authentication requests
     */
    public function handleRequest() {
        $method = Request::getMethod();
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'register':
                if ($method === 'POST') {
                    $this->register();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'login':
                if ($method === 'POST') {
                    $this->login();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'logout':
                if ($method === 'POST') {
                    $this->logout();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'verify':
                if ($method === 'GET') {
                    $this->verifyToken();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'refresh':
                if ($method === 'POST') {
                    $this->refreshToken();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'profile':
                if ($method === 'GET') {
                    $this->getProfile();
                } elseif ($method === 'PUT') {
                    $this->updateProfile();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            default:
                Response::error('Invalid action', 400);
        }
    }
    
    /**
     * Register new user
     */
    private function register() {
        $data = Request::getJson();
        
        // Validate required fields
        $required_fields = ['name', 'email', 'password'];
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                Response::error("Field '{$field}' is required", 400);
            }
        }
        
        $name = Utils::sanitizeInput($data['name']);
        $email = Utils::sanitizeInput($data['email']);
        $password = $data['password'];
        $phone = Utils::sanitizeInput($data['phone'] ?? '');
        $date_of_birth = $data['date_of_birth'] ?? null;
        $gender = $data['gender'] ?? 'prefer_not_to_say';
        $language_preference = $data['language_preference'] ?? DEFAULT_LANGUAGE;
        
        // Validate email
        if (!Utils::validateEmail($email)) {
            Response::error('Invalid email address', 400);
        }
        
        // Validate password strength
        if (strlen($password) < 6) {
            Response::error('Password must be at least 6 characters long', 400);
        }
        
        // Check if user already exists
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('User with this email already exists', 409);
        }
        
        try {
            $this->db->beginTransaction();
            
            // Hash password
            $password_hash = Utils::hashPassword($password);
            
            // Insert user
            $stmt = $this->db->prepare("
                INSERT INTO users (name, email, password_hash, phone, date_of_birth, gender, language_preference)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $name, $email, $password_hash, $phone, $date_of_birth, $gender, $language_preference
            ]);
            
            $user_id = $this->db->lastInsertId();
            
            // Create session
            $session_token = Utils::generateToken(64);
            $expires_at = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
            
            $stmt = $this->db->prepare("
                INSERT INTO user_sessions (user_id, session_token, device_info, ip_address, expires_at)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $user_id, $session_token, $_SERVER['HTTP_USER_AGENT'] ?? '', 
                $_SERVER['REMOTE_ADDR'] ?? '', $expires_at
            ]);
            
            // Generate JWT token
            $jwt_payload = [
                'user_id' => $user_id,
                'email' => $email,
                'name' => $name,
                'iat' => time(),
                'exp' => time() + SESSION_LIFETIME
            ];
            $jwt_token = Utils::generateJWT($jwt_payload);
            
            $this->db->commit();
            
            // Log activity
            Utils::logActivity($user_id, 'user_registered', ['email' => $email]);
            
            // Return success response
            Response::success([
                'user' => [
                    'id' => $user_id,
                    'name' => $name,
                    'email' => $email,
                    'language_preference' => $language_preference
                ],
                'token' => $jwt_token,
                'session_token' => $session_token
            ], 'User registered successfully', 201);
            
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Registration error: " . $e->getMessage());
            Response::serverError('Registration failed');
        }
    }
    
    /**
     * User login
     */
    private function login() {
        $data = Request::getJson();
        
        if (empty($data['email']) || empty($data['password'])) {
            Response::error('Email and password are required', 400);
        }
        
        $email = Utils::sanitizeInput($data['email']);
        $password = $data['password'];
        
        try {
            // Get user data
            $stmt = $this->db->prepare("
                SELECT id, name, email, password_hash, is_active, last_login
                FROM users 
                WHERE email = ?
            ");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                Response::error('Invalid email or password', 401);
            }
            
            if (!$user['is_active']) {
                Response::error('Account is deactivated', 403);
            }
            
            // Verify password
            if (!Utils::verifyPassword($password, $user['password_hash'])) {
                Response::error('Invalid email or password', 401);
            }
            
            // Create new session
            $session_token = Utils::generateToken(64);
            $expires_at = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
            
            $stmt = $this->db->prepare("
                INSERT INTO user_sessions (user_id, session_token, device_info, ip_address, expires_at)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $user['id'], $session_token, $_SERVER['HTTP_USER_AGENT'] ?? '', 
                $_SERVER['REMOTE_ADDR'] ?? '', $expires_at
            ]);
            
            // Generate JWT token
            $jwt_payload = [
                'user_id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'iat' => time(),
                'exp' => time() + SESSION_LIFETIME
            ];
            $jwt_token = Utils::generateJWT($jwt_payload);
            
            // Update last login
            $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);
            
            // Log activity
            Utils::logActivity($user['id'], 'user_login', ['ip' => $_SERVER['REMOTE_ADDR'] ?? '']);
            
            Response::success([
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'last_login' => $user['last_login']
                ],
                'token' => $jwt_token,
                'session_token' => $session_token
            ], 'Login successful');
            
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            Response::serverError('Login failed');
        }
    }
    
    /**
     * User logout
     */
    private function logout() {
        $user_id = Request::requireAuth();
        $session_token = Request::getAuthToken();
        
        try {
            // Deactivate session
            $stmt = $this->db->prepare("
                UPDATE user_sessions 
                SET is_active = 0 
                WHERE user_id = ? AND session_token = ?
            ");
            $stmt->execute([$user_id, $session_token]);
            
            // Log activity
            Utils::logActivity($user_id, 'user_logout');
            
            Response::success(null, 'Logout successful');
            
        } catch (Exception $e) {
            error_log("Logout error: " . $e->getMessage());
            Response::serverError('Logout failed');
        }
    }
    
    /**
     * Verify JWT token
     */
    private function verifyToken() {
        $token = Request::getAuthToken();
        
        if (!$token) {
            Response::error('Token required', 401);
        }
        
        if (!Utils::verifyJWT($token)) {
            Response::error('Invalid token', 401);
        }
        
        $payload = Utils::decodeJWT($token);
        
        // Check if token is expired
        if ($payload['exp'] < time()) {
            Response::error('Token expired', 401);
        }
        
        // Get user data
        $stmt = $this->db->prepare("
            SELECT id, name, email, is_active 
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user || !$user['is_active']) {
            Response::error('User not found or inactive', 401);
        }
        
        Response::success([
            'user' => $user,
            'token_valid' => true
        ]);
    }
    
    /**
     * Refresh JWT token
     */
    private function refreshToken() {
        $user_id = Request::requireAuth();
        
        try {
            // Get user data
            $stmt = $this->db->prepare("
                SELECT id, name, email, is_active 
                FROM users 
                WHERE id = ? AND is_active = 1
            ");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch();
            
            if (!$user) {
                Response::error('User not found', 404);
            }
            
            // Generate new JWT token
            $jwt_payload = [
                'user_id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'iat' => time(),
                'exp' => time() + SESSION_LIFETIME
            ];
            $jwt_token = Utils::generateJWT($jwt_payload);
            
            Response::success([
                'token' => $jwt_token
            ], 'Token refreshed successfully');
            
        } catch (Exception $e) {
            error_log("Token refresh error: " . $e->getMessage());
            Response::serverError('Token refresh failed');
        }
    }
    
    /**
     * Get user profile
     */
    private function getProfile() {
        $user_id = Request::requireAuth();
        
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, email, phone, date_of_birth, gender, 
                       language_preference, created_at, last_login
                FROM users 
                WHERE id = ?
            ");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch();
            
            if (!$user) {
                Response::error('User not found', 404);
            }
            
            Response::success($user);
            
        } catch (Exception $e) {
            error_log("Get profile error: " . $e->getMessage());
            Response::serverError('Failed to get profile');
        }
    }
    
    /**
     * Update user profile
     */
    private function updateProfile() {
        $user_id = Request::requireAuth();
        $data = Request::getJson();
        
        try {
            $update_fields = [];
            $update_values = [];
            
            // Allowed fields to update
            $allowed_fields = ['name', 'phone', 'date_of_birth', 'gender', 'language_preference'];
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    $update_fields[] = "{$field} = ?";
                    $update_values[] = Utils::sanitizeInput($data[$field]);
                }
            }
            
            if (empty($update_fields)) {
                Response::error('No valid fields to update', 400);
            }
            
            $update_values[] = $user_id;
            
            $sql = "UPDATE users SET " . implode(', ', $update_fields) . " WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($update_values);
            
            // Log activity
            Utils::logActivity($user_id, 'profile_updated', $data);
            
            Response::success(null, 'Profile updated successfully');
            
        } catch (Exception $e) {
            error_log("Update profile error: " . $e->getMessage());
            Response::serverError('Failed to update profile');
        }
    }
}

// Handle the request
try {
    $authAPI = new AuthAPI();
    $authAPI->handleRequest();
} catch (Exception $e) {
    error_log("Auth API error: " . $e->getMessage());
    Response::serverError('Authentication service error');
}
?>
