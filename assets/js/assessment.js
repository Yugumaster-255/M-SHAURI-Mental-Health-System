// M-SHAURI Assessment JavaScript
// Handles mental health assessment functionality

class AssessmentManager {
    constructor() {
        this.currentSection = 0;
        this.totalSections = 3;
        this.responses = {};
        this.isSubmitting = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedProgress();
        this.updateProgress();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('assessmentForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Radio button changes
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(input => {
            input.addEventListener('change', () => this.handleResponseChange());
        });

        // Auto-save progress
        setInterval(() => this.saveProgress(), 30000); // Save every 30 seconds
    }

    handleResponseChange() {
        this.collectResponses();
        this.updateProgress();
        this.saveProgress();
    }

    collectResponses() {
        const formData = new FormData(document.getElementById('assessmentForm'));
        this.responses = {};

        // Collect PHQ-9 responses
        const phq9Responses = {};
        for (let i = 1; i <= 9; i++) {
            const value = formData.get(`phq9_${i}`);
            if (value !== null) {
                phq9Responses[i] = parseInt(value);
            }
        }
        if (Object.keys(phq9Responses).length > 0) {
            this.responses.phq9 = phq9Responses;
        }

        // Collect GAD-7 responses
        const gad7Responses = {};
        for (let i = 1; i <= 7; i++) {
            const value = formData.get(`gad7_${i}`);
            if (value !== null) {
                gad7Responses[i] = parseInt(value);
            }
        }
        if (Object.keys(gad7Responses).length > 0) {
            this.responses.gad7 = gad7Responses;
        }

        // Collect additional responses
        const additionalFields = ['stress_level', 'sleep_hours', 'exercise', 'support_system', 'previous_treatment'];
        additionalFields.forEach(field => {
            const value = formData.get(field);
            if (value !== null) {
                this.responses[field] = parseInt(value);
            }
        });
    }

    updateProgress() {
        const totalQuestions = 21; // 9 PHQ-9 + 7 GAD-7 + 5 additional
        let answeredQuestions = 0;

        // Count answered questions
        const radioInputs = document.querySelectorAll('input[type="radio"]:checked');
        answeredQuestions = radioInputs.length;

        const progress = (answeredQuestions / totalQuestions) * 100;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = `Question ${answeredQuestions} of ${totalQuestions}`;
        }
    }

    saveProgress() {
        this.collectResponses();
        const progressData = {
            responses: this.responses,
            timestamp: new Date().toISOString(),
            user_id: this.getCurrentUserId()
        };

        localStorage.setItem('mshauri_assessment_progress', JSON.stringify(progressData));
        console.log('Assessment progress saved');
    }

    loadSavedProgress() {
        try {
            const savedData = localStorage.getItem('mshauri_assessment_progress');
            if (savedData) {
                const progressData = JSON.parse(savedData);
                this.responses = progressData.responses || {};
                this.restoreFormData();
            }
        } catch (error) {
            console.error('Error loading saved progress:', error);
        }
    }

    restoreFormData() {
        // Restore PHQ-9 responses
        if (this.responses.phq9) {
            Object.entries(this.responses.phq9).forEach(([question, value]) => {
                const input = document.querySelector(`input[name="phq9_${question}"][value="${value}"]`);
                if (input) {
                    input.checked = true;
                }
            });
        }

        // Restore GAD-7 responses
        if (this.responses.gad7) {
            Object.entries(this.responses.gad7).forEach(([question, value]) => {
                const input = document.querySelector(`input[name="gad7_${question}"][value="${value}"]`);
                if (input) {
                    input.checked = true;
                }
            });
        }

        // Restore additional responses
        Object.entries(this.responses).forEach(([field, value]) => {
            if (!['phq9', 'gad7'].includes(field)) {
                const input = document.querySelector(`input[name="${field}"][value="${value}"]`);
                if (input) {
                    input.checked = true;
                }
            }
        });

        this.updateProgress();
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;
        this.collectResponses();

        // Validate required fields
        if (!this.validateResponses()) {
            this.isSubmitting = false;
            return;
        }

        try {
            // Show loading state
            this.showLoading('Processing your assessment...');

            // Calculate scores
            const scores = this.calculateScores();
            
            // Send to server
            const result = await this.submitAssessment(scores);
            
            // Show results
            this.showResults(result);
            
            // Clear saved progress
            localStorage.removeItem('mshauri_assessment_progress');
            
        } catch (error) {
            console.error('Assessment submission error:', error);
            this.showNotification('Assessment submission failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
            this.isSubmitting = false;
        }
    }

    validateResponses() {
        const requiredSections = ['phq9', 'gad7'];
        const missingSections = [];

        requiredSections.forEach(section => {
            if (!this.responses[section] || Object.keys(this.responses[section]).length === 0) {
                missingSections.push(section.toUpperCase());
            }
        });

        if (missingSections.length > 0) {
            this.showNotification(`Please complete the ${missingSections.join(' and ')} sections`, 'error');
            return false;
        }

        return true;
    }

    calculateScores() {
        const scores = {};

        // Calculate PHQ-9 score
        if (this.responses.phq9) {
            scores.depression = Object.values(this.responses.phq9).reduce((sum, score) => sum + score, 0);
        }

        // Calculate GAD-7 score
        if (this.responses.gad7) {
            scores.anxiety = Object.values(this.responses.gad7).reduce((sum, score) => sum + score, 0);
        }

        // Calculate total score
        scores.total = (scores.depression || 0) + (scores.anxiety || 0);

        // Determine risk level
        scores.risk_level = this.determineRiskLevel(scores);

        return scores;
    }

    determineRiskLevel(scores) {
        const depressionScore = scores.depression || 0;
        const anxietyScore = scores.anxiety || 0;
        const totalScore = scores.total || 0;

        // Check for critical indicators
        if (depressionScore >= 20 || anxietyScore >= 15 || totalScore >= 30) {
            return 'critical';
        } else if (depressionScore >= 15 || anxietyScore >= 10 || totalScore >= 20) {
            return 'high';
        } else if (depressionScore >= 10 || anxietyScore >= 7 || totalScore >= 15) {
            return 'moderate';
        } else {
            return 'low';
        }
    }

    async submitAssessment(scores) {
        const assessmentData = {
            user_id: this.getCurrentUserId(),
            responses: this.responses,
            scores: scores,
            timestamp: new Date().toISOString()
        };

        try {
            // Try to submit to server
            const response = await fetch('php/assessment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(assessmentData)
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Server submission failed');
            }
        } catch (error) {
            // Fallback to local processing
            console.log('Server submission failed, using local processing');
            return this.processLocally(scores);
        }
    }

    processLocally(scores) {
        const recommendations = this.generateRecommendations(scores);
        
        return {
            success: true,
            scores: scores,
            recommendations: recommendations,
            risk_level: scores.risk_level,
            message: 'Assessment completed successfully'
        };
    }

    generateRecommendations(scores) {
        const recommendations = [];
        const depressionScore = scores.depression || 0;
        const anxietyScore = scores.anxiety || 0;

        // Depression recommendations
        if (depressionScore >= 15) {
            recommendations.push({
                type: 'urgent',
                title: 'Professional Help Recommended',
                message: 'Your depression score suggests you may benefit from professional mental health support.',
                actions: ['Contact a mental health professional', 'Consider therapy or counseling', 'Speak with your doctor']
            });
        } else if (depressionScore >= 10) {
            recommendations.push({
                type: 'moderate',
                title: 'Monitor Your Mood',
                message: 'Your responses suggest some symptoms of depression. Consider monitoring your mood and seeking support.',
                actions: ['Practice self-care', 'Stay connected with others', 'Consider professional support']
            });
        }

        // Anxiety recommendations
        if (anxietyScore >= 10) {
            recommendations.push({
                type: 'urgent',
                title: 'Anxiety Management',
                message: 'Your anxiety score suggests you may benefit from anxiety management techniques.',
                actions: ['Try relaxation techniques', 'Practice deep breathing', 'Consider professional support']
            });
        } else if (anxietyScore >= 7) {
            recommendations.push({
                type: 'moderate',
                title: 'Anxiety Awareness',
                message: 'You may be experiencing some anxiety. Consider stress management techniques.',
                actions: ['Practice mindfulness', 'Try relaxation exercises', 'Stay active']
            });
        }

        // General recommendations
        if (scores.risk_level === 'critical') {
            recommendations.push({
                type: 'emergency',
                title: 'Immediate Support Needed',
                message: 'Your responses suggest you may need immediate support. Please reach out for help.',
                actions: ['Contact emergency services', 'Call a crisis helpline', 'Reach out to a trusted person']
            });
        }

        // Add general wellness recommendations
        recommendations.push({
            type: 'general',
            title: 'General Wellness',
            message: 'Maintaining good mental health is important for everyone.',
            actions: ['Get regular exercise', 'Maintain a healthy sleep schedule', 'Stay connected with others', 'Practice stress management']
        });

        return recommendations;
    }

    showResults(result) {
        const modal = document.getElementById('resultsModal');
        const content = document.getElementById('resultsContent');
        
        if (!modal || !content) {
            console.error('Results modal not found');
            return;
        }

        // Generate results HTML
        const resultsHTML = this.generateResultsHTML(result);
        content.innerHTML = resultsHTML;

        // Show modal
        modal.style.display = 'block';

        // Scroll to top
        window.scrollTo(0, 0);
    }

    generateResultsHTML(result) {
        const scores = result.scores;
        const recommendations = result.recommendations;
        const riskLevel = scores.risk_level;

        let html = `
            <div class="results-section">
                <h3>Assessment Summary</h3>
                <p>Thank you for completing the mental health assessment. Here are your results:</p>
                
                <div class="score-display">
                    <div class="score-value">${scores.total || 0}</div>
                    <div class="score-label">Total Score</div>
                </div>
                
                <div class="risk-level risk-${riskLevel}">
                    Risk Level: ${riskLevel.toUpperCase()}
                </div>
            </div>
        `;

        // Add individual scores
        if (scores.depression !== undefined) {
            html += `
                <div class="results-section">
                    <h3>Depression Assessment (PHQ-9)</h3>
                    <p>Score: ${scores.depression}/27</p>
                    <p>${this.getDepressionInterpretation(scores.depression)}</p>
                </div>
            `;
        }

        if (scores.anxiety !== undefined) {
            html += `
                <div class="results-section">
                    <h3>Anxiety Assessment (GAD-7)</h3>
                    <p>Score: ${scores.anxiety}/21</p>
                    <p>${this.getAnxietyInterpretation(scores.anxiety)}</p>
                </div>
            `;
        }

        // Add emergency alert if needed
        if (riskLevel === 'critical') {
            html += `
                <div class="emergency-alert">
                    <h3>⚠️ Immediate Support Recommended</h3>
                    <p>Your responses suggest you may need immediate support. Please reach out for help.</p>
                    <div class="emergency-contacts">
                        <div class="emergency-contact">
                            <strong>Emergency Services</strong>
                            <div>112</div>
                        </div>
                        <div class="emergency-contact">
                            <strong>Mental Health Helpline</strong>
                            <div>+255 XXX XXX XXX</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Add recommendations
        if (recommendations && recommendations.length > 0) {
            html += `
                <div class="recommendations">
                    <h4>Recommendations</h4>
                    <ul>
            `;
            
            recommendations.forEach(rec => {
                html += `<li>${rec.message}</li>`;
            });
            
            html += `
                    </ul>
                </div>
            `;
        }

        return html;
    }

    getDepressionInterpretation(score) {
        if (score >= 20) return 'Severe depression - Professional help strongly recommended';
        if (score >= 15) return 'Moderately severe depression - Consider professional help';
        if (score >= 10) return 'Moderate depression - Monitor symptoms and consider support';
        if (score >= 5) return 'Mild depression - Consider self-care and support';
        return 'Minimal depression - Continue current practices';
    }

    getAnxietyInterpretation(score) {
        if (score >= 15) return 'Severe anxiety - Professional help recommended';
        if (score >= 10) return 'Moderate anxiety - Consider anxiety management techniques';
        if (score >= 5) return 'Mild anxiety - Monitor and practice stress management';
        return 'Minimal anxiety - Continue current practices';
    }

    getCurrentUserId() {
        // Get user ID from stored user data
        try {
            const userData = localStorage.getItem('mshauri_user');
            if (userData) {
                const user = JSON.parse(userData);
                return user.id;
            }
        } catch (error) {
            console.error('Error getting user ID:', error);
        }
        return null;
    }

    getAuthToken() {
        // Get auth token from stored session
        try {
            const sessionData = localStorage.getItem('mshauri_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                return session.token;
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        return null;
    }

    showLoading(message) {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
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
            alert(message);
        }
    }
}

// Global functions for buttons
function saveProgress() {
    if (window.assessmentManager) {
        window.assessmentManager.saveProgress();
        window.assessmentManager.showNotification('Progress saved', 'success');
    }
}

function startCounseling() {
    window.location.href = 'counseling.html';
}

function viewResources() {
    window.location.href = 'resources.html';
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

// Initialize assessment manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.assessmentManager = new AssessmentManager();
});
