// M-SHAURI Authentication Module

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.loadStoredUser();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for storage changes (multi-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === 'mshauri_user') {
                this.loadStoredUser();
            }
        });

        // Listen for online/offline status
        window.addEventListener('online', () => {
            this.syncUserData();
        });
    }

    loadStoredUser() {
        try {
            const storedUser = localStorage.getItem('mshauri_user');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                this.isAuthenticated = true;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading stored user:', error);
            this.logout();
        }
    }

    async login(email, password) {
        try {
            // Show loading state
            this.showLoading('Logging in...');

            // Simulate API call
            const response = await this.authenticateUser(email, password);
            
            if (response.success) {
                this.currentUser = response.user;
                this.isAuthenticated = true;
                
                // Store user data
                localStorage.setItem('mshauri_user', JSON.stringify(this.currentUser));
                
                // Update UI
                this.updateUI();
                
                // Show success message
                this.showNotification('Login successful', 'success');
                
                return { success: true, user: this.currentUser };
            } else {
                this.showNotification(response.message || 'Login failed', 'error');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
            return { success: false, message: 'Login failed' };
        } finally {
            this.hideLoading();
        }
    }

    async register(userData) {
        try {
            this.showLoading('Creating account...');

            // Validate user data
            const validation = this.validateUserData(userData);
            if (!validation.valid) {
                this.showNotification(validation.message, 'error');
                return { success: false, message: validation.message };
            }

            // Simulate API call
            const response = await this.createUser(userData);
            
            if (response.success) {
                this.currentUser = response.user;
                this.isAuthenticated = true;
                
                // Store user data
                localStorage.setItem('mshauri_user', JSON.stringify(this.currentUser));
                
                // Update UI
                this.updateUI();
                
                // Show success message
                this.showNotification('Account created successfully', 'success');
                
                return { success: true, user: this.currentUser };
            } else {
                this.showNotification(response.message || 'Registration failed', 'error');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
            return { success: false, message: 'Registration failed' };
        } finally {
            this.hideLoading();
        }
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Clear stored data
        localStorage.removeItem('mshauri_user');
        localStorage.removeItem('mshauri_session');
        
        // Update UI
        this.updateUI();
        
        // Show message
        this.showNotification('Logged out successfully', 'info');
        
        // Redirect to home
        window.location.href = 'index.html';
    }

    updateUI() {
        const loginButton = document.querySelector('.btn-primary');
        const userMenu = document.getElementById('userMenu');
        
        if (this.isAuthenticated && this.currentUser) {
            // Update login button to show user info
            if (loginButton) {
                loginButton.innerHTML = `
                    <i class="fas fa-user"></i>
                    ${this.currentUser.name}
                `;
                loginButton.onclick = () => this.showUserMenu();
            }
            
            // Show user menu if it exists
            if (userMenu) {
                userMenu.style.display = 'block';
            }
        } else {
            // Reset to login button
            if (loginButton) {
                loginButton.innerHTML = 'Login';
                loginButton.onclick = () => this.showLoginModal();
            }
            
            // Hide user menu
            if (userMenu) {
                userMenu.style.display = 'none';
            }
        }
    }

    showUserMenu() {
        const menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.innerHTML = `
            <div class="user-menu-content">
                <div class="user-info">
                    <h4>${this.currentUser.name}</h4>
                    <p>${this.currentUser.email}</p>
                </div>
                <div class="user-menu-actions">
                    <button onclick="authManager.showProfile()">
                        <i class="fas fa-user"></i> Profile
                    </button>
                    <button onclick="authManager.showSettings()">
                        <i class="fas fa-cog"></i> Settings
                    </button>
                    <button onclick="authManager.logout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .user-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 1000;
                min-width: 200px;
                border: 1px solid #e1e8ed;
            }
            .user-menu-content {
                padding: 1rem;
            }
            .user-info {
                border-bottom: 1px solid #e1e8ed;
                padding-bottom: 1rem;
                margin-bottom: 1rem;
            }
            .user-info h4 {
                margin: 0 0 0.25rem 0;
                color: #2c3e50;
            }
            .user-info p {
                margin: 0;
                color: #666;
                font-size: 0.9rem;
            }
            .user-menu-actions button {
                width: 100%;
                padding: 0.5rem;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .user-menu-actions button:hover {
                background: #f8f9fa;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(menu);
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !e.target.closest('.btn-primary')) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    showProfile() {
        this.showNotification('Profile page coming soon', 'info');
    }

    showSettings() {
        this.showNotification('Settings page coming soon', 'info');
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // Validation methods
    validateUserData(userData) {
        const { name, email, password, confirmPassword } = userData;
        
        if (!name || name.trim().length < 2) {
            return { valid: false, message: 'Name must be at least 2 characters long' };
        }
        
        if (!email || !this.isValidEmail(email)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        
        if (!password || password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters long' };
        }
        
        if (password !== confirmPassword) {
            return { valid: false, message: 'Passwords do not match' };
        }
        
        return { valid: true };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // API simulation methods
    async authenticateUser(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate authentication logic
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === email);
        
        if (user && user.password === password) {
            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    loginTime: new Date().toISOString()
                }
            };
        } else {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }
    }

    async createUser(userData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user already exists
        const users = this.getStoredUsers();
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
            return {
                success: false,
                message: 'User with this email already exists'
            };
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In real app, this would be hashed
            createdAt: new Date().toISOString()
        };
        
        // Store user
        users.push(newUser);
        localStorage.setItem('mshauri_users', JSON.stringify(users));
        
        return {
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                loginTime: new Date().toISOString()
            }
        };
    }

    getStoredUsers() {
        try {
            const users = localStorage.getItem('mshauri_users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    async syncUserData() {
        if (this.isAuthenticated && navigator.onLine) {
            try {
                // Simulate syncing with server
                console.log('Syncing user data...');
                this.showNotification('Data synchronized', 'success');
            } catch (error) {
                console.error('Sync error:', error);
            }
        }
    }

    // UI helper methods
    showLoading(message) {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            .loading-content {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                text-align: center;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #4A90E2;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.querySelector('.loading-overlay');
        if (loading) {
            loading.remove();
        }
    }

    showNotification(message, type) {
        if (window.MSHAURI && window.MSHAURI.showNotification) {
            window.MSHAURI.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Public methods
    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    hasPermission(permission) {
        if (!this.isAuthenticated) return false;
        
        // Simple permission check - can be extended
        const permissions = this.currentUser.permissions || ['basic'];
        return permissions.includes(permission) || permissions.includes('admin');
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for global access
window.authManager = authManager;

// Form handlers
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = formData.get('email');
            const password = formData.get('password');
            
            await authManager.login(email, password);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };
            
            await authManager.register(userData);
        });
    }
});
