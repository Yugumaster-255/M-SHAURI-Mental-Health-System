// M-SHAURI Admin Panel JavaScript
// Handles admin panel functionality

class AdminManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.users = [];
        this.assessments = [];
        this.resources = [];
        this.analytics = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Search functionality
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => {
                this.searchUsers(e.target.value);
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const risk = e.target.dataset.risk;
                this.filterAssessments(risk);
            });
        });

        // Add resource form
        const addResourceForm = document.getElementById('addResourceForm');
        if (addResourceForm) {
            addResourceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addResource();
            });
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to nav link
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionId;

        // Load section-specific data
        switch (sectionId) {
            case 'users':
                this.loadUsers();
                break;
            case 'assessments':
                this.loadAssessments();
                break;
            case 'resources':
                this.loadResources();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // Simulate API calls
            const dashboardData = await this.getDashboardData();
            
            // Update stats
            document.getElementById('totalUsers').textContent = dashboardData.totalUsers;
            document.getElementById('totalAssessments').textContent = dashboardData.totalAssessments;
            document.getElementById('totalSessions').textContent = dashboardData.totalSessions;
            document.getElementById('totalResources').textContent = dashboardData.totalResources;

            // Update activity list
            this.updateActivityList(dashboardData.recentActivity);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async getDashboardData() {
        // Simulate API response
        return {
            totalUsers: 1247,
            totalAssessments: 3421,
            totalSessions: 1893,
            totalResources: 156,
            recentActivity: [
                {
                    type: 'user_registration',
                    message: 'New user registered',
                    user: 'John Doe',
                    time: '2 minutes ago'
                },
                {
                    type: 'assessment_completed',
                    message: 'Assessment completed',
                    user: 'Jane Smith',
                    time: '5 minutes ago'
                },
                {
                    type: 'counseling_session',
                    message: 'Counseling session started',
                    user: 'Mike Johnson',
                    time: '10 minutes ago'
                },
                {
                    type: 'resource_viewed',
                    message: 'Resource viewed',
                    user: 'Sarah Wilson',
                    time: '15 minutes ago'
                }
            ]
        };
    }

    updateActivityList(activities) {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.message}</h4>
                    <p>User: ${activity.user}</p>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'user_registration': 'user-plus',
            'assessment_completed': 'clipboard-check',
            'counseling_session': 'comments',
            'resource_viewed': 'book',
            'login': 'sign-in-alt',
            'logout': 'sign-out-alt'
        };
        return icons[type] || 'info-circle';
    }

    initializeCharts() {
        this.createUserRegistrationsChart();
        this.createAssessmentChart();
    }

    createUserRegistrationsChart() {
        const ctx = document.getElementById('userRegistrationsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'New Users',
                    data: [45, 67, 89, 123],
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createAssessmentChart() {
        const ctx = document.getElementById('assessmentChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Not Started'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        '#4ECDC4',
                        '#FFE66D',
                        '#FF6B6B'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    async loadUsers() {
        try {
            // Simulate API call
            const users = await this.getUsers();
            this.users = users;
            this.displayUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async getUsers() {
        // Simulate API response
        return [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                registrationDate: '2024-01-15',
                lastLogin: '2024-01-20',
                status: 'active'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                registrationDate: '2024-01-10',
                lastLogin: '2024-01-19',
                status: 'active'
            },
            {
                id: 3,
                name: 'Mike Johnson',
                email: 'mike@example.com',
                registrationDate: '2024-01-05',
                lastLogin: '2024-01-18',
                status: 'inactive'
            }
        ];
    }

    displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.registrationDate}</td>
                <td>${user.lastLogin}</td>
                <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewUser(${user.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    searchUsers(searchTerm) {
        const filteredUsers = this.users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.displayUsers(filteredUsers);
    }

    async loadAssessments() {
        try {
            const assessments = await this.getAssessments();
            this.assessments = assessments;
            this.displayAssessments(assessments);
        } catch (error) {
            console.error('Error loading assessments:', error);
        }
    }

    async getAssessments() {
        // Simulate API response
        return [
            {
                id: 1,
                user: 'John Doe',
                type: 'PHQ-9',
                score: 15,
                riskLevel: 'moderate',
                date: '2024-01-20'
            },
            {
                id: 2,
                user: 'Jane Smith',
                type: 'GAD-7',
                score: 8,
                riskLevel: 'low',
                date: '2024-01-19'
            },
            {
                id: 3,
                user: 'Mike Johnson',
                type: 'PHQ-9',
                score: 22,
                riskLevel: 'high',
                date: '2024-01-18'
            }
        ];
    }

    displayAssessments(assessments) {
        const tbody = document.getElementById('assessmentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = assessments.map(assessment => `
            <tr>
                <td>${assessment.user}</td>
                <td>${assessment.type}</td>
                <td>${assessment.score}</td>
                <td><span class="risk-badge risk-${assessment.riskLevel}">${assessment.riskLevel}</span></td>
                <td>${assessment.date}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewAssessment(${assessment.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editAssessment(${assessment.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterAssessments(riskLevel) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-risk="${riskLevel}"]`).classList.add('active');

        let filteredAssessments = this.assessments;
        if (riskLevel !== 'all') {
            filteredAssessments = this.assessments.filter(assessment => 
                assessment.riskLevel === riskLevel
            );
        }

        this.displayAssessments(filteredAssessments);
    }

    async loadResources() {
        try {
            const resources = await this.getResources();
            this.resources = resources;
            this.displayResources(resources);
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    }

    async getResources() {
        // Simulate API response
        return [
            {
                id: 1,
                title: 'Understanding Depression',
                category: 'depression',
                type: 'article',
                views: 245
            },
            {
                id: 2,
                title: 'Anxiety Management',
                category: 'anxiety',
                type: 'video',
                views: 189
            },
            {
                id: 3,
                title: 'Stress Relief Techniques',
                category: 'stress',
                type: 'exercise',
                views: 156
            }
        ];
    }

    displayResources(resources) {
        const grid = document.getElementById('adminResourcesGrid');
        if (!grid) return;

        grid.innerHTML = resources.map(resource => `
            <div class="resource-admin-card">
                <div class="resource-admin-header">
                    <h3>${resource.title}</h3>
                    <p>${resource.category} • ${resource.type}</p>
                </div>
                <div class="resource-admin-content">
                    <p><strong>Views:</strong> ${resource.views}</p>
                    <div class="resource-admin-actions">
                        <button class="btn btn-primary" onclick="viewResource(${resource.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-secondary" onclick="editResource(${resource.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteResource(${resource.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadAnalytics() {
        try {
            const analytics = await this.getAnalytics();
            this.analytics = analytics;
            this.createAnalyticsCharts();
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    async getAnalytics() {
        // Simulate API response
        return {
            mentalHealthTrends: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                depression: [45, 52, 48, 61, 55],
                anxiety: [38, 44, 42, 49, 47],
                stress: [52, 58, 55, 63, 59]
            },
            engagement: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                sessions: [120, 145, 167, 189],
                assessments: [89, 102, 118, 134]
            }
        };
    }

    createAnalyticsCharts() {
        this.createMentalHealthTrendsChart();
        this.createEngagementChart();
    }

    createMentalHealthTrendsChart() {
        const ctx = document.getElementById('mentalHealthTrendsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.analytics.mentalHealthTrends.labels,
                datasets: [
                    {
                        label: 'Depression',
                        data: this.analytics.mentalHealthTrends.depression,
                        borderColor: '#FF6B6B',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Anxiety',
                        data: this.analytics.mentalHealthTrends.anxiety,
                        borderColor: '#4ECDC4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Stress',
                        data: this.analytics.mentalHealthTrends.stress,
                        borderColor: '#FFE66D',
                        backgroundColor: 'rgba(255, 230, 109, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createEngagementChart() {
        const ctx = document.getElementById('engagementChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.analytics.engagement.labels,
                datasets: [
                    {
                        label: 'Counseling Sessions',
                        data: this.analytics.engagement.sessions,
                        backgroundColor: '#4A90E2'
                    },
                    {
                        label: 'Assessments',
                        data: this.analytics.engagement.assessments,
                        backgroundColor: '#7B68EE'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    addResource() {
        const form = document.getElementById('addResourceForm');
        const formData = new FormData(form);
        
        const resource = {
            title: formData.get('title'),
            content: formData.get('content'),
            category: formData.get('category'),
            type: formData.get('type')
        };

        // Add to resources array
        this.resources.push({
            id: Date.now(),
            ...resource,
            views: 0
        });

        // Update display
        this.displayResources(this.resources);

        // Close modal
        closeModal('addResourceModal');

        // Reset form
        form.reset();

        showNotification('Resource added successfully', 'success');
    }
}

// Global functions
function addResource() {
    const modal = document.getElementById('addResourceModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function searchUsers() {
    const searchInput = document.getElementById('userSearch');
    if (searchInput && window.adminManager) {
        window.adminManager.searchUsers(searchInput.value);
    }
}

function exportUsers() {
    if (window.adminManager) {
        const users = window.adminManager.users;
        const csv = convertToCSV(users);
        downloadCSV(csv, 'users.csv');
    }
}

function exportAssessments() {
    if (window.adminManager) {
        const assessments = window.adminManager.assessments;
        const csv = convertToCSV(assessments);
        downloadCSV(csv, 'assessments.csv');
    }
}

function generateReport(type) {
    showNotification(`${type} report generated successfully`, 'success');
    // In a real application, this would generate and download a report
}

function viewUser(userId) {
    showNotification(`Viewing user ${userId}`, 'info');
}

function editUser(userId) {
    showNotification(`Editing user ${userId}`, 'info');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        showNotification(`User ${userId} deleted`, 'success');
    }
}

function viewAssessment(assessmentId) {
    showNotification(`Viewing assessment ${assessmentId}`, 'info');
}

function editAssessment(assessmentId) {
    showNotification(`Editing assessment ${assessmentId}`, 'info');
}

function viewResource(resourceId) {
    showNotification(`Viewing resource ${resourceId}`, 'info');
}

function editResource(resourceId) {
    showNotification(`Editing resource ${resourceId}`, 'info');
}

function deleteResource(resourceId) {
    if (confirm('Are you sure you want to delete this resource?')) {
        showNotification(`Resource ${resourceId} deleted`, 'success');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('mshauri_admin_session');
        window.location.href = 'index.html';
    }
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

function showNotification(message, type) {
    if (window.MSHAURI && window.MSHAURI.showNotification) {
        window.MSHAURI.showNotification(message, type);
    } else {
        alert(message);
    }
}

// Initialize admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminManager = new AdminManager();
});
