#!/usr/bin/env python3
"""
M-SHAURI AI Counseling Module
Provides AI-assisted mental health counseling using rule-based and NLP approaches
"""

import json
import re
import random
import logging
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except:
    logger.warning("NLTK data download failed. Some features may not work properly.")

class MentalHealthCounselor:
    """
    AI Mental Health Counselor using rule-based and sentiment analysis
    """
    
    def __init__(self):
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.stop_words = set(stopwords.words('english'))
        
        # Mental health keywords and their associated concerns
        self.mental_health_keywords = {
            'depression': ['sad', 'depressed', 'hopeless', 'empty', 'worthless', 'suicide', 'kill myself'],
            'anxiety': ['anxious', 'worried', 'nervous', 'panic', 'fear', 'scared', 'overwhelmed'],
            'stress': ['stressed', 'pressure', 'overwhelmed', 'burnout', 'exhausted'],
            'trauma': ['trauma', 'ptsd', 'flashback', 'nightmare', 'triggered'],
            'substance': ['alcohol', 'drug', 'addiction', 'drinking', 'smoking'],
            'eating': ['eating', 'food', 'weight', 'anorexia', 'bulimia', 'binge'],
            'sleep': ['sleep', 'insomnia', 'tired', 'fatigue', 'nightmare'],
            'relationships': ['relationship', 'partner', 'family', 'friend', 'lonely', 'isolated']
        }
        
        # Crisis keywords that require immediate attention
        self.crisis_keywords = [
            'suicide', 'kill myself', 'end it all', 'not worth living',
            'harm myself', 'hurt myself', 'die', 'death'
        ]
        
        # Response templates for different scenarios
        self.response_templates = {
            'crisis': [
                "I'm very concerned about what you're sharing. Your safety is the most important thing right now.",
                "It sounds like you're going through an extremely difficult time. Please know that help is available.",
                "What you're experiencing sounds very serious. I strongly encourage you to reach out for immediate support."
            ],
            'depression': [
                "It sounds like you might be experiencing depression. This is a real medical condition that can be treated.",
                "What you're describing sounds like symptoms of depression. You're not alone in this.",
                "Depression can make everything feel overwhelming. It's important to remember that this feeling won't last forever."
            ],
            'anxiety': [
                "It sounds like you might be dealing with anxiety. This is very common and there are effective ways to manage it.",
                "Anxiety can feel overwhelming, but there are techniques that can help you feel more in control.",
                "What you're experiencing sounds like anxiety. Remember that anxiety is treatable and you don't have to face it alone."
            ],
            'general_support': [
                "Thank you for sharing that with me. It takes courage to talk about these feelings.",
                "I can hear that you're going through a difficult time. You're not alone in this.",
                "It sounds like you're dealing with a lot right now. I'm here to listen and support you."
            ]
        }
        
        # Coping strategies and resources
        self.coping_strategies = {
            'breathing': [
                "Try the 4-7-8 breathing technique: Inhale for 4 counts, hold for 7, exhale for 8.",
                "Deep breathing can help calm your nervous system. Try breathing in slowly for 4 counts, then out for 6.",
                "When feeling overwhelmed, try box breathing: 4 counts in, 4 hold, 4 out, 4 hold."
            ],
            'grounding': [
                "Try the 5-4-3-2-1 grounding technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
                "Ground yourself by focusing on your feet on the floor and your breath in your body.",
                "Try progressive muscle relaxation: tense and release each muscle group from your toes to your head."
            ],
            'mindfulness': [
                "Try a brief mindfulness exercise: focus on your breath and gently return your attention when your mind wanders.",
                "Take a moment to notice what you're feeling without judgment. Just observe.",
                "Practice the STOP technique: Stop, Take a breath, Observe what's happening, Proceed with intention."
            ]
        }
    
    def analyze_message(self, message: str) -> Dict:
        """
        Analyze user message for mental health concerns and sentiment
        """
        message_lower = message.lower()
        
        # Check for crisis indicators
        crisis_score = self._check_crisis_indicators(message_lower)
        
        # Analyze sentiment
        sentiment_scores = self.sentiment_analyzer.polarity_scores(message)
        
        # Identify mental health concerns
        concerns = self._identify_concerns(message_lower)
        
        # Calculate overall risk level
        risk_level = self._calculate_risk_level(crisis_score, sentiment_scores, concerns)
        
        return {
            'crisis_score': crisis_score,
            'sentiment': sentiment_scores,
            'concerns': concerns,
            'risk_level': risk_level,
            'timestamp': datetime.now().isoformat()
        }
    
    def _check_crisis_indicators(self, message: str) -> float:
        """Check for crisis indicators in the message"""
        crisis_count = 0
        for keyword in self.crisis_keywords:
            if keyword in message:
                crisis_count += 1
        
        return min(crisis_count / len(self.crisis_keywords), 1.0)
    
    def _identify_concerns(self, message: str) -> List[str]:
        """Identify mental health concerns in the message"""
        concerns = []
        for concern, keywords in self.mental_health_keywords.items():
            for keyword in keywords:
                if keyword in message:
                    concerns.append(concern)
                    break
        return list(set(concerns))
    
    def _calculate_risk_level(self, crisis_score: float, sentiment: Dict, concerns: List[str]) -> str:
        """Calculate overall risk level"""
        if crisis_score > 0.3:
            return 'critical'
        elif sentiment['compound'] < -0.5 and len(concerns) > 2:
            return 'high'
        elif sentiment['compound'] < -0.2 or len(concerns) > 0:
            return 'moderate'
        else:
            return 'low'
    
    def generate_response(self, analysis: Dict, user_message: str) -> Dict:
        """Generate appropriate response based on analysis"""
        risk_level = analysis['risk_level']
        concerns = analysis['concerns']
        crisis_score = analysis['crisis_score']
        
        response = {
            'message': '',
            'suggestions': [],
            'resources': [],
            'emergency_contact': False,
            'follow_up': False
        }
        
        if risk_level == 'critical' or crisis_score > 0.3:
            response['message'] = random.choice(self.response_templates['crisis'])
            response['emergency_contact'] = True
            response['suggestions'] = [
                "Please contact emergency services immediately",
                "Call a crisis helpline",
                "Reach out to a trusted friend or family member",
                "Go to your nearest emergency room"
            ]
        elif concerns:
            primary_concern = concerns[0]
            if primary_concern in self.response_templates:
                response['message'] = random.choice(self.response_templates[primary_concern])
            else:
                response['message'] = random.choice(self.response_templates['general_support'])
            
            # Add coping strategies
            if primary_concern == 'anxiety':
                response['suggestions'].extend(random.sample(self.coping_strategies['breathing'], 2))
                response['suggestions'].extend(random.sample(self.coping_strategies['grounding'], 1))
            elif primary_concern == 'depression':
                response['suggestions'].extend(random.sample(self.coping_strategies['mindfulness'], 2))
                response['suggestions'].append("Consider reaching out to a mental health professional")
            else:
                response['suggestions'].extend(random.sample(self.coping_strategies['breathing'], 1))
                response['suggestions'].extend(random.sample(self.coping_strategies['grounding'], 1))
        else:
            response['message'] = random.choice(self.response_templates['general_support'])
            response['suggestions'] = [
                "Consider talking to a trusted friend or family member",
                "Try some relaxation techniques",
                "Consider speaking with a mental health professional"
            ]
        
        # Add follow-up suggestions
        if risk_level in ['moderate', 'high']:
            response['follow_up'] = True
            response['suggestions'].append("Consider scheduling a follow-up conversation")
        
        return response
    
    def get_emergency_resources(self) -> Dict:
        """Get emergency contact information"""
        return {
            'emergency_services': {
                'police': '112',
                'medical': '114',
                'description': 'Emergency services for immediate help'
            },
            'mental_health_helplines': [
                {
                    'name': 'National Mental Health Helpline',
                    'phone': '+255 XXX XXX XXX',
                    'available': '24/7'
                },
                {
                    'name': 'Crisis Support Line',
                    'phone': '+255 XXX XXX XXX',
                    'available': '24/7'
                }
            ],
            'online_resources': [
                {
                    'name': 'Mental Health Resources',
                    'url': 'https://example.com/mental-health',
                    'description': 'Comprehensive mental health information'
                }
            ]
        }

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize counselor
counselor = MentalHealthCounselor()

@app.route('/api/analyze', methods=['POST'])
def analyze_message():
    """Analyze user message and provide mental health insights"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        user_id = data.get('user_id')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Analyze the message
        analysis = counselor.analyze_message(message)
        
        # Generate response
        response = counselor.generate_response(analysis, message)
        
        # Log the interaction
        logger.info(f"Analysis for user {user_id}: {analysis}")
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_message: {str(e)}")
        return jsonify({'error': 'Analysis failed'}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint for AI counseling"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        user_id = data.get('user_id')
        session_id = data.get('session_id')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Analyze the message
        analysis = counselor.analyze_message(message)
        
        # Generate response
        response = counselor.generate_response(analysis, message)
        
        # Add session context
        response['session_id'] = session_id
        response['user_id'] = user_id
        
        # Log the interaction
        logger.info(f"Chat interaction for user {user_id}: {analysis['risk_level']}")
        
        return jsonify({
            'success': True,
            'response': response,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        return jsonify({'error': 'Chat failed'}), 500

@app.route('/api/emergency', methods=['GET'])
def get_emergency_resources():
    """Get emergency contact information"""
    try:
        resources = counselor.get_emergency_resources()
        return jsonify({
            'success': True,
            'resources': resources,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting emergency resources: {str(e)}")
        return jsonify({'error': 'Failed to get emergency resources'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'M-SHAURI AI Counselor',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/assess', methods=['POST'])
def assess_mental_health():
    """Assess mental health based on questionnaire responses"""
    try:
        data = request.get_json()
        responses = data.get('responses', {})
        user_id = data.get('user_id')
        
        if not responses:
            return jsonify({'error': 'Responses are required'}), 400
        
        # Calculate assessment scores
        scores = {}
        total_score = 0
        
        # PHQ-9 (Depression) scoring
        if 'phq9' in responses:
            phq9_score = sum(responses['phq9'].values())
            scores['depression'] = phq9_score
            total_score += phq9_score
        
        # GAD-7 (Anxiety) scoring
        if 'gad7' in responses:
            gad7_score = sum(responses['gad7'].values())
            scores['anxiety'] = gad7_score
            total_score += gad7_score
        
        # Determine risk level
        if total_score >= 20:
            risk_level = 'high'
        elif total_score >= 10:
            risk_level = 'moderate'
        else:
            risk_level = 'low'
        
        # Generate recommendations
        recommendations = []
        if scores.get('depression', 0) >= 10:
            recommendations.append("Consider speaking with a mental health professional about depression")
        if scores.get('anxiety', 0) >= 10:
            recommendations.append("Consider anxiety management techniques or professional help")
        
        if risk_level == 'high':
            recommendations.append("Please consider reaching out for immediate support")
        
        return jsonify({
            'success': True,
            'scores': scores,
            'total_score': total_score,
            'risk_level': risk_level,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in assess_mental_health: {str(e)}")
        return jsonify({'error': 'Assessment failed'}), 500

if __name__ == '__main__':
    print("Starting M-SHAURI AI Counselor...")
    print("Available endpoints:")
    print("- POST /api/analyze - Analyze message for mental health concerns")
    print("- POST /api/chat - Main chat endpoint")
    print("- GET /api/emergency - Get emergency resources")
    print("- POST /api/assess - Assess mental health from questionnaire")
    print("- GET /api/health - Health check")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
