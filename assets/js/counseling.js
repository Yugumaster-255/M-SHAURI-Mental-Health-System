// M-SHAURI Counseling JavaScript
// Handles AI counseling chat functionality

class CounselingManager {
    constructor() {
        this.messages = [];
        this.sessionId = this.generateSessionId();
        this.isTyping = false;
        this.breathingInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChatHistory();
        this.initializeChat();
    }

    setupEventListeners() {
        // Message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
            messageInput.addEventListener('input', () => this.handleInput());
        }

        // Send button
        const sendButton = document.getElementById('sendButton');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Auto-resize textarea
        if (messageInput) {
            messageInput.addEventListener('input', () => this.autoResize());
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleInput() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            // Enable/disable send button based on content
            const sendButton = document.getElementById('sendButton');
            if (sendButton) {
                sendButton.disabled = !messageInput.value.trim();
            }
        }
    }

    autoResize() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        const message = messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Disable input while processing
        this.setInputDisabled(true);
        
        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to AI counselor
            const response = await this.getAIResponse(message);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage(response.message, 'ai', response);
            
            // Check for emergency indicators
            if (response.analysis && response.analysis.risk_level === 'critical') {
                this.showEmergencyPanel();
            }
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            this.addMessage('I apologize, but I\'m having trouble processing your message right now. Please try again or contact support if the issue persists.', 'ai');
        } finally {
            this.setInputDisabled(false);
        }
    }

    async getAIResponse(message) {
        try {
            // Try to connect to Python AI service
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    user_id: this.getCurrentUserId(),
                    session_id: this.sessionId
                })
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('AI service unavailable');
            }
        } catch (error) {
            // Fallback to local processing
            console.log('AI service unavailable, using local processing');
            return this.processLocally(message);
        }
    }

    processLocally(message) {
        // Simple local processing for offline mode
        const responses = [
            "Thank you for sharing that with me. It takes courage to talk about your feelings.",
            "I can hear that you're going through a difficult time. You're not alone in this.",
            "It sounds like you're dealing with a lot right now. I'm here to listen and support you.",
            "What you're experiencing sounds challenging. Remember that it's okay to feel this way.",
            "I appreciate you opening up to me. How are you feeling about what you've shared?",
            "It sounds like you might benefit from some coping strategies. Would you like me to suggest some?",
            "Your feelings are valid and important. Is there anything specific you'd like to talk about?",
            "I'm here to support you. What would be most helpful for you right now?"
        ];

        // Simple keyword detection
        const lowerMessage = message.toLowerCase();
        let selectedResponse = responses[Math.floor(Math.random() * responses.length)];

        if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
            selectedResponse = "I can hear that you're feeling anxious. Anxiety can feel overwhelming, but there are techniques that can help. Try taking slow, deep breaths and focusing on the present moment.";
        } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
            selectedResponse = "It sounds like you might be feeling sad or depressed. These feelings are valid and it's important to acknowledge them. Consider reaching out to a trusted person or professional for support.";
        } else if (lowerMessage.includes('stress') || lowerMessage.includes('stressed')) {
            selectedResponse = "Stress can be overwhelming. Try the 4-7-8 breathing technique: breathe in for 4 counts, hold for 7, exhale for 8. This can help calm your nervous system.";
        } else if (lowerMessage.includes('help') || lowerMessage.includes('crisis')) {
            selectedResponse = "If you're in immediate distress, please reach out for help. You can contact emergency services at 112 or a mental health helpline. Your safety is important.";
        }

        return {
            message: selectedResponse,
            analysis: {
                risk_level: this.assessRiskLevel(message),
                concerns: this.identifyConcerns(message)
            }
        };
    }

    assessRiskLevel(message) {
        const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'not worth living', 'harm myself'];
        const lowerMessage = message.toLowerCase();
        
        for (const keyword of crisisKeywords) {
            if (lowerMessage.includes(keyword)) {
                return 'critical';
            }
        }
        
        return 'low';
    }

    identifyConcerns(message) {
        const concerns = [];
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
            concerns.push('anxiety');
        }
        if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
            concerns.push('depression');
        }
        if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
            concerns.push('stress');
        }
        
        return concerns;
    }

    addMessage(content, sender, metadata = null) {
        const message = {
            id: Date.now(),
            content: content,
            sender: sender,
            timestamp: new Date(),
            metadata: metadata
        };

        this.messages.push(message);
        this.displayMessage(message);
        this.saveChatHistory();
    }

    displayMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${message.sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${this.escapeHtml(message.content)}</p>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const typingElement = document.createElement('div');
        typingElement.className = 'message ai-message typing-indicator';
        typingElement.id = 'typingIndicator';
        typingElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    setInputDisabled(disabled) {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        
        if (messageInput) {
            messageInput.disabled = disabled;
        }
        if (sendButton) {
            sendButton.disabled = disabled;
        }
    }

    showEmergencyPanel() {
        const emergencyPanel = document.getElementById('emergencyPanel');
        if (emergencyPanel) {
            emergencyPanel.style.display = 'block';
            emergencyPanel.scrollIntoView({ behavior: 'smooth' });
        }
    }

    hideEmergencyPanel() {
        const emergencyPanel = document.getElementById('emergencyPanel');
        if (emergencyPanel) {
            emergencyPanel.style.display = 'none';
        }
    }

    loadChatHistory() {
        try {
            const savedHistory = localStorage.getItem('mshauri_chat_history');
            if (savedHistory) {
                const history = JSON.parse(savedHistory);
                this.messages = history.messages || [];
                this.displayChatHistory();
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    displayChatHistory() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        // Clear existing messages (except the initial AI message)
        const existingMessages = chatMessages.querySelectorAll('.message:not(.ai-message)');
        existingMessages.forEach(msg => msg.remove());

        // Display saved messages
        this.messages.forEach(message => {
            this.displayMessage(message);
        });
    }

    saveChatHistory() {
        try {
            const chatData = {
                messages: this.messages,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('mshauri_chat_history', JSON.stringify(chatData));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    initializeChat() {
        // Hide suggestions after first message
        const suggestions = document.getElementById('chatSuggestions');
        if (suggestions && this.messages.length > 0) {
            suggestions.style.display = 'none';
        }
    }

    getCurrentUserId() {
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}h ago`;
        } else {
            return messageTime.toLocaleDateString();
        }
    }
}

// Global functions
function sendMessage() {
    if (window.counselingManager) {
        window.counselingManager.sendMessage();
    }
}

function sendSuggestion(text) {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.value = text;
        sendMessage();
    }
}

function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        if (window.counselingManager) {
            window.counselingManager.messages = [];
            localStorage.removeItem('mshauri_chat_history');
            location.reload();
        }
    }
}

function exportChat() {
    if (window.counselingManager) {
        const chatData = {
            messages: window.counselingManager.messages,
            sessionId: window.counselingManager.sessionId,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(chatData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `mshauri-chat-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

function callEmergency() {
    window.open('tel:112');
}

function callMentalHealth() {
    window.open('tel:+255XXXXXXXXX');
}

function showBreathingExercise() {
    const modal = document.getElementById('breathingModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showMindfulness() {
    const modal = document.getElementById('mindfulnessModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function startBreathing() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const startBtn = document.getElementById('startBreathingBtn');
    const stopBtn = document.getElementById('stopBreathingBtn');
    
    if (!circle || !text) return;
    
    let phase = 0; // 0: breathe in, 1: hold, 2: breathe out, 3: hold
    const phases = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
    const durations = [4000, 7000, 8000, 2000]; // milliseconds
    
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    
    const breathingCycle = () => {
        text.textContent = phases[phase];
        circle.className = `breathing-circle ${phase === 0 ? 'breathing-in' : phase === 2 ? 'breathing-out' : ''}`;
        
        phase = (phase + 1) % 4;
        
        if (window.counselingManager) {
            window.counselingManager.breathingInterval = setTimeout(breathingCycle, durations[phase]);
        }
    };
    
    breathingCycle();
}

function stopBreathing() {
    const startBtn = document.getElementById('startBreathingBtn');
    const stopBtn = document.getElementById('stopBreathingBtn');
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    
    if (window.counselingManager && window.counselingManager.breathingInterval) {
        clearTimeout(window.counselingManager.breathingInterval);
        window.counselingManager.breathingInterval = null;
    }
    
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    
    if (circle) {
        circle.className = 'breathing-circle';
    }
    if (text) {
        text.textContent = 'Breathe In';
    }
}

function completeGrounding() {
    alert('Great job completing the grounding exercise! This technique can help you feel more centered and present.');
    closeModal('mindfulnessModal');
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

// Initialize counseling manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.counselingManager = new CounselingManager();
});
