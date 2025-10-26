// M-SHAURI Mental Health Counseling System - Main JavaScript

// Global variables
let currentLanguage = 'en';
let isOnline = navigator.onLine;
let userData = null;

// Language translations
const translations = {
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.assessment': 'Self-Assessment',
        'nav.counseling': 'AI Counseling',
        'nav.resources': 'Resources',
        'nav.contact': 'Contact',
        'nav.login': 'Login',
        'nav.swahili': 'Swahili',
        
        // Hero section
        'hero.title': 'M-SHAURI Mental Health Counseling System',
        'hero.subtitle': 'Your trusted companion for mental health support. Get personalized guidance, access resources, and connect with AI-assisted counseling - available online and offline.',
        'hero.startAssessment': 'Start Self-Assessment',
        'hero.aiCounseling': 'AI Counseling',
        'hero.feature.secure': 'Secure & Private',
        'hero.feature.offline': 'Works Offline',
        'hero.feature.bilingual': 'Swahili & English',
        
        // Features
        'features.title': 'How M-SHAURI Helps You',
        'features.assessment.title': 'Self-Assessment',
        'features.assessment.desc': 'Complete personalized questionnaires to understand your mental health status and get tailored recommendations.',
        'features.counseling.title': 'AI Counseling',
        'features.counseling.desc': 'Chat with our AI assistant for immediate support, guidance, and preliminary mental health advice.',
        'features.resources.title': 'Resources & Tips',
        'features.resources.desc': 'Access a comprehensive library of mental health resources, articles, and coping strategies.',
        'features.tracking.title': 'Progress Tracking',
        'features.tracking.desc': 'Monitor your mental health journey with detailed progress reports and personalized insights.',
        
        // Emergency
        'emergency.title': 'Need Immediate Help?',
        'emergency.desc': 'If you\'re experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.',
        'emergency.contacts': 'Emergency Contacts',
        
        // Modal
        'modal.login.title': 'Login to M-SHAURI',
        'modal.register.title': 'Create Account',
        'modal.emergency.title': 'Emergency Contacts',
        'modal.close': 'Close',
        
        // Forms
        'form.email': 'Email Address',
        'form.password': 'Password',
        'form.name': 'Full Name',
        'form.confirmPassword': 'Confirm Password',
        'form.login': 'Login',
        'form.register': 'Create Account',
        'form.noAccount': 'Don\'t have an account?',
        'form.hasAccount': 'Already have an account?',
        'form.registerHere': 'Register here',
        'form.loginHere': 'Login here',
        
        // Emergency contacts
        'emergency.police': 'Police',
        'emergency.medical': 'Medical Emergency',
        'emergency.helpline': 'National Mental Health Helpline',
        'emergency.crisis': 'Crisis Support',
        'emergency.local': 'Local Support',
        'emergency.localDesc': 'Contact your nearest health center or mental health professional'
    },
    sw: {
        // Navigation
        'nav.home': 'Nyumbani',
        'nav.assessment': 'Kujichunguza',
        'nav.counseling': 'Ushauri wa AI',
        'nav.resources': 'Rasilimali',
        'nav.contact': 'Mawasiliano',
        'nav.login': 'Ingia',
        'nav.swahili': 'Kiswahili',
        
        // Hero section
        'hero.title': 'M-SHAURI Mfumo wa Ushauri wa Afya ya Akili',
        'hero.subtitle': 'Mshirika wako wa kuegemea kwa msaada wa afya ya akili. Pata mwongozo wa kibinafsi, fikia rasilimali, na unganisha na ushauri wa AI - inapatikana mtandaoni na nje ya mtandao.',
        'hero.startAssessment': 'Anza Kujichunguza',
        'hero.aiCounseling': 'Ushauri wa AI',
        'hero.feature.secure': 'Salama na Kibinafsi',
        'hero.feature.offline': 'Inafanya Kazi Nje ya Mtandao',
        'hero.feature.bilingual': 'Kiswahili na Kiingereza',
        
        // Features
        'features.title': 'Jinsi M-SHAURI Inakusaidia',
        'features.assessment.title': 'Kujichunguza',
        'features.assessment.desc': 'Kamilisha maswali ya kibinafsi ili kuelewa hali ya afya yako ya akili na kupata mapendekezo yanayofaa.',
        'features.counseling.title': 'Ushauri wa AI',
        'features.counseling.desc': 'Zungumza na msaidizi wetu wa AI kwa msaada wa haraka, mwongozo, na ushauri wa awali wa afya ya akili.',
        'features.resources.title': 'Rasilimali na Vidokezo',
        'features.resources.desc': 'Fikia maktaba kamili ya rasilimali za afya ya akili, makala, na mikakati ya kukabiliana.',
        'features.tracking.title': 'Kufuatilia Maendeleo',
        'features.tracking.desc': 'Fuatilia safari yako ya afya ya akili kwa ripoti za kina za maendeleo na ufahamu wa kibinafsi.',
        
        // Emergency
        'emergency.title': 'Unahitaji Msaada wa Haraka?',
        'emergency.desc': 'Ikiwa unakumbana na mgogoro wa afya ya akili, tafadhali wasiliana na huduma za dharura au mtaalamu wa afya ya akili mara moja.',
        'emergency.contacts': 'Mawasiliano ya Dharura',
        
        // Modal
        'modal.login.title': 'Ingia kwenye M-SHAURI',
        'modal.register.title': 'Unda Akaunti',
        'modal.emergency.title': 'Mawasiliano ya Dharura',
        'modal.close': 'Funga',
        
        // Forms
        'form.email': 'Anwani ya Barua pepe',
        'form.password': 'Nenosiri',
        'form.name': 'Jina Kamili',
        'form.confirmPassword': 'Thibitisha Nenosiri',
        'form.login': 'Ingia',
        'form.register': 'Unda Akaunti',
        'form.noAccount': 'Huna akaunti?',
        'form.hasAccount': 'Tayari una akaunti?',
        'form.registerHere': 'Jisajili hapa',
        'form.loginHere': 'Ingia hapa',
        
        // Emergency contacts
        'emergency.police': 'Polisi',
        'emergency.medical': 'Dharura ya Matibabu',
        'emergency.helpline': 'Mstari wa Msaada wa Afya ya Akili',
        'emergency.crisis': 'Msaada wa Mgogoro',
        'emergency.local': 'Msaada wa Kienyeji',
        'emergency.localDesc': 'Wasiliana na kituo cha afya cha karibu au mtaalamu wa afya ya akili'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkOnlineStatus();
    loadUserPreferences();
});

// Initialize application
function initializeApp() {
    console.log('M-SHAURI Mental Health Counseling System initialized');
    
    // Set initial language
    const savedLanguage = localStorage.getItem('mshauri_language') || 'en';
    setLanguage(savedLanguage);
    
    // Initialize navigation
    initializeNavigation();
    
    // Check if user is logged in
    checkAuthStatus();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation toggle for mobile
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
    
    // Online/offline status
    window.addEventListener('online', function() {
        isOnline = true;
        showNotification('Connection restored', 'success');
        syncOfflineData();
    });
    
    window.addEventListener('offline', function() {
        isOnline = false;
        showNotification('Working offline mode', 'info');
    });
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Navigation functions
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Handle navigation
            handleNavigation(targetId);
        });
    });
}

function handleNavigation(targetId) {
    switch(targetId) {
        case 'home':
            scrollToSection('hero');
            break;
        case 'assessment':
            window.location.href = 'questionnaire.html';
            break;
        case 'counseling':
            window.location.href = 'counseling.html';
            break;
        case 'resources':
            window.location.href = 'resources.html';
            break;
        case 'contact':
            showContactInfo();
            break;
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Language functions
function toggleLanguage() {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('mshauri_language', newLanguage);
}

function setLanguage(language) {
    currentLanguage = language;
    updateTextContent();
    updateLanguageButton();
}

function updateTextContent() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

function updateLanguageButton() {
    const langButton = document.querySelector('.btn-outline');
    if (langButton) {
        langButton.innerHTML = `<i class="fas fa-language"></i> ${currentLanguage === 'en' ? 'Swahili' : 'English'}`;
    }
}

// Modal functions
function showLogin() {
    closeAllModals();
    document.getElementById('loginModal').style.display = 'block';
}

function showRegister() {
    closeAllModals();
    document.getElementById('registerModal').style.display = 'block';
}

function showEmergencyContacts() {
    closeAllModals();
    document.getElementById('emergencyModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Action functions
function startAssessment() {
    if (userData) {
        window.location.href = 'questionnaire.html';
    } else {
        showNotification('Please login to start assessment', 'info');
        showLogin();
    }
}

function showCounseling() {
    if (userData) {
        window.location.href = 'counseling.html';
    } else {
        showNotification('Please login to access AI counseling', 'info');
        showLogin();
    }
}

function showContactInfo() {
    showNotification('Contact information will be displayed here', 'info');
}

// Authentication functions
function checkAuthStatus() {
    const savedUser = localStorage.getItem('mshauri_user');
    if (savedUser) {
        userData = JSON.parse(savedUser);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const loginButton = document.querySelector('.btn-primary');
    if (userData && loginButton) {
        loginButton.innerHTML = `<i class="fas fa-user"></i> ${userData.name}`;
        loginButton.onclick = showUserMenu;
    }
}

function showUserMenu() {
    // Implementation for user menu dropdown
    console.log('Show user menu');
}

// Form handlers
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Simulate login process
    if (email && password) {
        userData = {
            id: 1,
            name: 'Test User',
            email: email,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('mshauri_user', JSON.stringify(userData));
        updateAuthUI();
        closeModal('loginModal');
        showNotification('Login successful', 'success');
    } else {
        showNotification('Please fill in all fields', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (name && email && password) {
        userData = {
            id: Date.now(),
            name: name,
            email: email,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('mshauri_user', JSON.stringify(userData));
        updateAuthUI();
        closeModal('registerModal');
        showNotification('Account created successfully', 'success');
    } else {
        showNotification('Please fill in all fields', 'error');
    }
}

// Online/Offline functions
function checkOnlineStatus() {
    isOnline = navigator.onLine;
    updateOnlineStatus();
}

function updateOnlineStatus() {
    const statusIndicator = document.querySelector('.online-status');
    if (statusIndicator) {
        statusIndicator.textContent = isOnline ? 'Online' : 'Offline';
        statusIndicator.className = `online-status ${isOnline ? 'online' : 'offline'}`;
    }
}

function syncOfflineData() {
    if (isOnline && userData) {
        // Sync offline data with server
        console.log('Syncing offline data...');
        showNotification('Data synchronized', 'success');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 3000;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
            }
            .notification-success { background: #4ECDC4; }
            .notification-error { background: #FF6B6B; }
            .notification-info { background: #4A90E2; }
            .notification-warning { background: #FFE66D; color: #333; }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

// User preferences
function loadUserPreferences() {
    const preferences = localStorage.getItem('mshauri_preferences');
    if (preferences) {
        const prefs = JSON.parse(preferences);
        if (prefs.theme) {
            document.documentElement.setAttribute('data-theme', prefs.theme);
        }
    }
}

function saveUserPreferences(preferences) {
    localStorage.setItem('mshauri_preferences', JSON.stringify(preferences));
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString(currentLanguage === 'sw' ? 'sw-TZ' : 'en-US');
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString(currentLanguage === 'sw' ? 'sw-TZ' : 'en-US');
}

// Export functions for use in other files
window.MSHAURI = {
    showLogin,
    showRegister,
    showEmergencyContacts,
    startAssessment,
    showCounseling,
    toggleLanguage,
    setLanguage,
    showNotification,
    userData: () => userData,
    isOnline: () => isOnline
};
