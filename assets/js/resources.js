// M-SHAURI Resources JavaScript
// Handles mental health resources functionality

class ResourcesManager {
    constructor() {
        this.resources = [];
        this.filteredResources = [];
        this.bookmarkedResources = [];
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.loadResources();
        this.loadBookmarks();
        this.setupEventListeners();
        this.displayResources();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilter(e.target.dataset.category));
        });
    }

    loadResources() {
        // In a real application, this would load from a server
        // For now, we'll use the resources defined in the HTML
        this.resources = Array.from(document.querySelectorAll('.resource-card')).map(card => ({
            element: card,
            title: card.querySelector('h3').textContent,
            description: card.querySelector('p').textContent,
            category: card.dataset.category,
            tags: Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent),
            id: card.querySelector('button').onclick.toString().match(/'([^']+)'/)[1]
        }));

        this.filteredResources = [...this.resources];
    }

    loadBookmarks() {
        try {
            const bookmarks = localStorage.getItem('mshauri_bookmarks');
            if (bookmarks) {
                this.bookmarkedResources = JSON.parse(bookmarks);
                this.updateBookmarkedSection();
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
    }

    saveBookmarks() {
        try {
            localStorage.setItem('mshauri_bookmarks', JSON.stringify(this.bookmarkedResources));
        } catch (error) {
            console.error('Error saving bookmarks:', error);
        }
    }

    handleSearch(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.filterResources();
    }

    handleFilter(category) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.currentCategory = category;
        this.filterResources();
    }

    filterResources() {
        this.filteredResources = this.resources.filter(resource => {
            const matchesCategory = this.currentCategory === 'all' || resource.category === this.currentCategory;
            const matchesSearch = this.searchTerm === '' || 
                resource.title.toLowerCase().includes(this.searchTerm) ||
                resource.description.toLowerCase().includes(this.searchTerm) ||
                resource.tags.some(tag => tag.toLowerCase().includes(this.searchTerm));
            
            return matchesCategory && matchesSearch;
        });

        this.displayResources();
    }

    displayResources() {
        // Hide all resources first
        this.resources.forEach(resource => {
            resource.element.classList.add('hidden');
        });

        // Show filtered resources
        this.filteredResources.forEach(resource => {
            resource.element.classList.remove('hidden');
        });

        // Show no results message if needed
        this.showNoResultsIfNeeded();
    }

    showNoResultsIfNeeded() {
        let noResultsElement = document.getElementById('noResults');
        
        if (this.filteredResources.length === 0) {
            if (!noResultsElement) {
                noResultsElement = document.createElement('div');
                noResultsElement.id = 'noResults';
                noResultsElement.className = 'no-results';
                noResultsElement.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>No resources found</h3>
                    <p>Try adjusting your search terms or filters</p>
                `;
                document.getElementById('resourcesGrid').appendChild(noResultsElement);
            }
        } else if (noResultsElement) {
            noResultsElement.remove();
        }
    }

    updateBookmarkedSection() {
        const bookmarkedSection = document.getElementById('bookmarkedSection');
        const bookmarkedGrid = document.getElementById('bookmarkedGrid');
        
        if (this.bookmarkedResources.length > 0) {
            bookmarkedSection.style.display = 'block';
            bookmarkedGrid.innerHTML = '';
            
            this.bookmarkedResources.forEach(bookmark => {
                const bookmarkElement = this.createBookmarkElement(bookmark);
                bookmarkedGrid.appendChild(bookmarkElement);
            });
        } else {
            bookmarkedSection.style.display = 'none';
        }
    }

    createBookmarkElement(bookmark) {
        const element = document.createElement('div');
        element.className = 'resource-card';
        element.innerHTML = `
            <div class="resource-icon">
                <i class="fas fa-${this.getResourceIcon(bookmark.category)}"></i>
            </div>
            <div class="resource-content">
                <h3>${bookmark.title}</h3>
                <p>${bookmark.description}</p>
                <div class="resource-tags">
                    ${bookmark.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="resource-actions">
                    <button class="btn btn-primary" onclick="openResource('${bookmark.id}')">Read More</button>
                    <button class="btn btn-outline" onclick="removeBookmark('${bookmark.id}')">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `;
        return element;
    }

    getResourceIcon(category) {
        const icons = {
            'depression': 'heart-broken',
            'anxiety': 'wind',
            'stress': 'balance-scale',
            'trauma': 'shield-alt',
            'general': 'heart'
        };
        return icons[category] || 'heart';
    }
}

// Global functions
function searchResources() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && window.resourcesManager) {
        window.resourcesManager.handleSearch(searchInput.value);
    }
}

function openResource(resourceId) {
    const resourceContent = getResourceContent(resourceId);
    
    const modal = document.getElementById('resourceModal');
    const content = document.getElementById('resourceContent');
    
    if (modal && content) {
        content.innerHTML = resourceContent;
        modal.style.display = 'block';
    }
}

function getResourceContent(resourceId) {
    const resourceContents = {
        'depression-guide': {
            title: 'Understanding Depression',
            category: 'Depression',
            content: `
                <div class="resource-content-header">
                    <h2>Understanding Depression</h2>
                    <p>A comprehensive guide to depression symptoms, causes, and treatment</p>
                </div>
                <div class="resource-content-body">
                    <h3>What is Depression?</h3>
                    <p>Depression is a common mental health condition that affects millions of people worldwide. It can cause persistent feelings of sadness, hopelessness, and loss of interest in activities you once enjoyed.</p>
                    
                    <h3>Common Symptoms</h3>
                    <ul>
                        <li>Persistent sadness or emptiness</li>
                        <li>Loss of interest in activities</li>
                        <li>Changes in appetite or weight</li>
                        <li>Sleep disturbances</li>
                        <li>Fatigue or loss of energy</li>
                        <li>Difficulty concentrating</li>
                        <li>Feelings of worthlessness</li>
                        <li>Thoughts of death or suicide</li>
                    </ul>
                    
                    <h3>When to Seek Help</h3>
                    <p>If you experience these symptoms for more than two weeks, or if they interfere with your daily life, it's important to seek professional help. Depression is treatable, and early intervention can lead to better outcomes.</p>
                    
                    <h3>Treatment Options</h3>
                    <ul>
                        <li>Psychotherapy (talk therapy)</li>
                        <li>Medication</li>
                        <li>Lifestyle changes</li>
                        <li>Support groups</li>
                        <li>Alternative therapies</li>
                    </ul>
                </div>
            `
        },
        'depression-coping': {
            title: 'Coping with Depression',
            category: 'Depression',
            content: `
                <div class="resource-content-header">
                    <h2>Coping with Depression</h2>
                    <p>Practical strategies to manage depression symptoms</p>
                </div>
                <div class="resource-content-body">
                    <h3>Self-Care Strategies</h3>
                    <ul>
                        <li>Maintain a regular sleep schedule</li>
                        <li>Eat a balanced diet</li>
                        <li>Exercise regularly, even light activity</li>
                        <li>Stay connected with others</li>
                        <li>Engage in activities you enjoy</li>
                    </ul>
                    
                    <h3>Mindfulness and Relaxation</h3>
                    <p>Practice mindfulness meditation, deep breathing exercises, or progressive muscle relaxation to help manage stress and improve mood.</p>
                    
                    <h3>Building a Support System</h3>
                    <p>Reach out to trusted friends and family members. Consider joining a support group or seeking professional counseling.</p>
                    
                    <h3>Setting Realistic Goals</h3>
                    <p>Break large tasks into smaller, manageable steps. Celebrate small victories and be patient with yourself.</p>
                </div>
            `
        },
        'anxiety-guide': {
            title: 'Managing Anxiety',
            category: 'Anxiety',
            content: `
                <div class="resource-content-header">
                    <h2>Managing Anxiety</h2>
                    <p>Understanding and managing anxiety disorders</p>
                </div>
                <div class="resource-content-body">
                    <h3>What is Anxiety?</h3>
                    <p>Anxiety is a normal human emotion, but when it becomes excessive and interferes with daily life, it may be an anxiety disorder.</p>
                    
                    <h3>Types of Anxiety Disorders</h3>
                    <ul>
                        <li>Generalized Anxiety Disorder (GAD)</li>
                        <li>Panic Disorder</li>
                        <li>Social Anxiety Disorder</li>
                        <li>Specific Phobias</li>
                        <li>Obsessive-Compulsive Disorder (OCD)</li>
                    </ul>
                    
                    <h3>Common Symptoms</h3>
                    <ul>
                        <li>Excessive worry or fear</li>
                        <li>Restlessness or feeling on edge</li>
                        <li>Difficulty concentrating</li>
                        <li>Muscle tension</li>
                        <li>Sleep disturbances</li>
                        <li>Panic attacks</li>
                    </ul>
                    
                    <h3>Treatment Approaches</h3>
                    <p>Anxiety disorders are highly treatable. Treatment may include therapy, medication, or a combination of both.</p>
                </div>
            `
        },
        'breathing-exercises': {
            title: 'Breathing Exercises',
            category: 'Anxiety',
            content: `
                <div class="resource-content-header">
                    <h2>Breathing Exercises for Anxiety</h2>
                    <p>Step-by-step breathing techniques to reduce anxiety</p>
                </div>
                <div class="resource-content-body">
                    <h3>4-7-8 Breathing Technique</h3>
                    <ol>
                        <li>Breathe in through your nose for 4 counts</li>
                        <li>Hold your breath for 7 counts</li>
                        <li>Exhale through your mouth for 8 counts</li>
                        <li>Repeat 3-4 times</li>
                    </ol>
                    
                    <h3>Box Breathing</h3>
                    <ol>
                        <li>Inhale for 4 counts</li>
                        <li>Hold for 4 counts</li>
                        <li>Exhale for 4 counts</li>
                        <li>Hold for 4 counts</li>
                        <li>Repeat</li>
                    </ol>
                    
                    <h3>Diaphragmatic Breathing</h3>
                    <ol>
                        <li>Place one hand on your chest, one on your belly</li>
                        <li>Breathe deeply so your belly rises</li>
                        <li>Keep your chest relatively still</li>
                        <li>Exhale slowly through pursed lips</li>
                    </ol>
                </div>
            `
        },
        'stress-management': {
            title: 'Stress Management',
            category: 'Stress',
            content: `
                <div class="resource-content-header">
                    <h2>Stress Management Techniques</h2>
                    <p>Effective strategies to manage and reduce stress</p>
                </div>
                <div class="resource-content-body">
                    <h3>Time Management</h3>
                    <ul>
                        <li>Prioritize tasks</li>
                        <li>Break large projects into smaller steps</li>
                        <li>Set realistic deadlines</li>
                        <li>Learn to say no when necessary</li>
                    </ul>
                    
                    <h3>Relaxation Techniques</h3>
                    <ul>
                        <li>Deep breathing exercises</li>
                        <li>Progressive muscle relaxation</li>
                        <li>Meditation and mindfulness</li>
                        <li>Yoga or gentle stretching</li>
                    </ul>
                    
                    <h3>Lifestyle Changes</h3>
                    <ul>
                        <li>Regular exercise</li>
                        <li>Healthy eating habits</li>
                        <li>Adequate sleep</li>
                        <li>Limiting caffeine and alcohol</li>
                    </ul>
                </div>
            `
        },
        'mindfulness-guide': {
            title: 'Mindfulness & Meditation',
            category: 'General',
            content: `
                <div class="resource-content-header">
                    <h2>Mindfulness & Meditation</h2>
                    <p>Introduction to mindfulness practices</p>
                </div>
                <div class="resource-content-body">
                    <h3>What is Mindfulness?</h3>
                    <p>Mindfulness is the practice of being present and fully engaged in the current moment, without judgment.</p>
                    
                    <h3>Basic Mindfulness Practice</h3>
                    <ol>
                        <li>Find a quiet, comfortable place</li>
                        <li>Sit or lie down comfortably</li>
                        <li>Close your eyes or soften your gaze</li>
                        <li>Focus on your breath</li>
                        <li>When your mind wanders, gently return to your breath</li>
                        <li>Start with 5-10 minutes daily</li>
                    </ol>
                    
                    <h3>Mindful Activities</h3>
                    <ul>
                        <li>Mindful eating</li>
                        <li>Walking meditation</li>
                        <li>Body scan</li>
                        <li>Loving-kindness meditation</li>
                    </ul>
                </div>
            `
        }
    };

    const resource = resourceContents[resourceId];
    if (resource) {
        return resource.content;
    }
    
    return `
        <div class="resource-content-header">
            <h2>Resource Not Found</h2>
            <p>The requested resource is not available</p>
        </div>
        <div class="resource-content-body">
            <p>We apologize, but the resource you're looking for is not available at this time.</p>
        </div>
    `;
}

function bookmarkResource(resourceId) {
    if (!window.resourcesManager) return;

    const resource = window.resourcesManager.resources.find(r => r.id === resourceId);
    if (!resource) return;

    const bookmark = {
        id: resourceId,
        title: resource.title,
        description: resource.description,
        category: resource.category,
        tags: resource.tags,
        bookmarkedAt: new Date().toISOString()
    };

    // Check if already bookmarked
    const existingIndex = window.resourcesManager.bookmarkedResources.findIndex(b => b.id === resourceId);
    
    if (existingIndex >= 0) {
        // Remove bookmark
        window.resourcesManager.bookmarkedResources.splice(existingIndex, 1);
        showNotification('Resource removed from bookmarks', 'info');
    } else {
        // Add bookmark
        window.resourcesManager.bookmarkedResources.push(bookmark);
        showNotification('Resource bookmarked', 'success');
    }

    window.resourcesManager.saveBookmarks();
    window.resourcesManager.updateBookmarkedSection();
}

function removeBookmark(resourceId) {
    if (!window.resourcesManager) return;

    const index = window.resourcesManager.bookmarkedResources.findIndex(b => b.id === resourceId);
    if (index >= 0) {
        window.resourcesManager.bookmarkedResources.splice(index, 1);
        window.resourcesManager.saveBookmarks();
        window.resourcesManager.updateBookmarkedSection();
        showNotification('Bookmark removed', 'info');
    }
}

function callEmergency() {
    window.open('tel:112');
}

function callMentalHealth() {
    window.open('tel:+255XXXXXXXXX');
}

function callMedical() {
    window.open('tel:114');
}

function showUserMenu() {
    if (window.authManager) {
        window.authManager.showUserMenu();
    }
}

function toggleLanguage() {
    if (window.MSHAURI) {
        window.MSHAURI.toggleLanguage();
    }
}

function showNotification(message, type) {
    if (window.MSHAURI && window.MSHAURI.showNotification) {
        window.MSHAURI.showNotification(message, type);
    } else {
        alert(message);
    }
}

// Initialize resources manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.resourcesManager = new ResourcesManager();
});
