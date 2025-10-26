# M-SHAURI - Mental Health Counseling System

A comprehensive web-based and offline-accessible mental health counseling system designed for the Tanzanian community. The system provides resources, guidance, and AI-assisted counseling tools to users seeking mental health support.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure login/registration system with password hashing
- **Mental Health Assessment**: Comprehensive questionnaires (PHQ-9, GAD-7) with scoring
- **AI Counseling**: Chat-based AI assistant for preliminary mental health advice
- **Resource Library**: Extensive mental health resources and coping strategies
- **Offline Mode**: Local storage and database support for offline access
- **Bilingual Support**: Swahili and English language support
- **Progress Tracking**: User progress monitoring and assessment history

### Technical Features
- **Responsive Design**: Mobile-friendly interface with modern UI/UX
- **Security**: GDPR-compliant data privacy and secure authentication
- **Offline Sync**: Automatic synchronization when online
- **Emergency Support**: Crisis intervention and emergency contact integration
- **Admin Panel**: User management and analytics dashboard

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Interactive functionality and API integration
- **Font Awesome**: Icon library for UI elements

### Backend
- **PHP 7.4+**: Server-side logic and API endpoints
- **MySQL**: Database for user data and assessments
- **Python 3.8+**: AI counseling module with NLP capabilities

### AI/ML
- **NLTK**: Natural language processing for sentiment analysis
- **Flask**: Python web framework for AI service
- **Rule-based System**: Mental health assessment and response generation

## 📁 Project Structure

```
M-SHAURI/
├── index.html                 # Main landing page
├── questionnaire.html         # Mental health assessment
├── counseling.html            # AI counseling chat
├── resources.html            # Mental health resources
├── assets/
│   ├── css/
│   │   ├── style.css         # Main stylesheet
│   │   ├── responsive.css    # Responsive design
│   │   ├── assessment.css    # Assessment page styles
│   │   ├── counseling.css    # Counseling page styles
│   │   └── resources.css     # Resources page styles
│   └── js/
│       ├── main.js           # Core functionality
│       ├── auth.js           # Authentication system
│       ├── assessment.js     # Assessment logic
│       ├── counseling.js     # AI counseling chat
│       └── resources.js      # Resources management
├── php/
│   ├── config.php            # Database and app configuration
│   └── auth.php              # Authentication API
├── python/
│   ├── ai_counselor.py       # AI counseling module
│   └── requirements.txt      # Python dependencies
├── database/
│   └── schema.sql            # Database schema
└── README.md                # This file
```

## 🚀 Installation & Setup

### Prerequisites
- **Web Server**: Apache/Nginx with PHP 7.4+
- **Database**: MySQL 5.7+ or MariaDB 10.3+
- **Python**: Python 3.8+ with pip
- **Node.js**: Optional, for development tools

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE mshauri_mental_health;
USE mshauri_mental_health;

-- Import schema
SOURCE database/schema.sql;
```

### 2. PHP Configuration

1. Copy files to your web server directory
2. Update `php/config.php` with your database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'mshauri_mental_health');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

3. Set appropriate permissions:
```bash
chmod 755 php/
chmod 644 php/*.php
```

### 3. Python AI Service Setup

```bash
# Install Python dependencies
cd python/
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('vader_lexicon'); nltk.download('punkt'); nltk.download('stopwords')"

# Start AI service
python ai_counselor.py
```

### 4. Web Server Configuration

#### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ php/$1 [L]
```

#### Nginx
```nginx
location /api/ {
    try_files $uri $uri/ /php/$1;
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_NAME=mshauri_mental_health
DB_USER=your_username
DB_PASS=your_password

# Security
JWT_SECRET=your-secret-key-change-this
PASSWORD_HASH_ALGO=PASSWORD_DEFAULT

# AI Service
AI_API_URL=http://localhost:5000/api
AI_ENABLED=true

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Offline Mode Configuration
```javascript
// In assets/js/main.js
const OFFLINE_MODE = true;
const SYNC_INTERVAL = 300000; // 5 minutes
const DATA_RETENTION_DAYS = 30;
```

## 📱 Usage

### For Users
1. **Registration**: Create an account with email and password
2. **Assessment**: Complete mental health questionnaires
3. **AI Counseling**: Chat with AI assistant for support
4. **Resources**: Access mental health articles and coping strategies
5. **Progress**: Track your mental health journey

### For Administrators
1. **User Management**: View and manage user accounts
2. **Analytics**: Monitor system usage and assessment results
3. **Content Management**: Add/update mental health resources
4. **Crisis Monitoring**: Review high-risk assessments

## 🔒 Security Features

### Data Protection
- **Password Hashing**: Bcrypt with salt for secure password storage
- **JWT Tokens**: Secure session management
- **Input Sanitization**: XSS and injection prevention
- **HTTPS**: SSL/TLS encryption for data transmission

### Privacy Compliance
- **GDPR Compliance**: Data protection and user rights
- **Data Anonymization**: Automatic data anonymization after retention period
- **Consent Management**: User consent for data processing
- **Right to Deletion**: User data deletion capabilities

## 🌐 Offline Mode

### Local Storage
- **Assessment Data**: Stored locally for offline completion
- **Chat History**: AI counseling sessions cached locally
- **User Preferences**: Settings and bookmarks stored locally
- **Resource Cache**: Mental health resources available offline

### Synchronization
- **Auto-sync**: Automatic data sync when online
- **Conflict Resolution**: Smart conflict resolution for concurrent edits
- **Data Integrity**: Checksums and validation for data integrity
- **Backup**: Local backup of critical data

## 🧪 Testing

### Manual Testing
1. **User Registration/Login**: Test authentication flow
2. **Assessment Completion**: Test questionnaire functionality
3. **AI Counseling**: Test chat interface and responses
4. **Resource Access**: Test resource library and search
5. **Offline Mode**: Test offline functionality

### Automated Testing
```bash
# Run PHP tests
php php/tests/auth_test.php

# Run Python tests
cd python/
python -m pytest tests/

# Run JavaScript tests
npm test
```

## 🚨 Emergency Features

### Crisis Detection
- **Keyword Monitoring**: Automatic detection of crisis keywords
- **Risk Assessment**: AI-powered risk level evaluation
- **Emergency Contacts**: Immediate access to crisis resources
- **Professional Referral**: Automatic referral to mental health professionals

### Emergency Contacts Tanzania
- **Police**: 112
- **Medical Emergency**: 114
- **Mental Health Helpline**: +255 694 563 663
- **Crisis Support**: +255 694 563 663

## 📊 Analytics & Monitoring

### User Analytics
- **Assessment Completion Rates**: Track user engagement
- **Common Mental Health Issues**: Identify prevalent concerns
- **Resource Usage**: Monitor popular resources
- **Session Duration**: Track counseling session lengths

### System Monitoring
- **Performance Metrics**: Response times and uptime
- **Error Tracking**: Log and monitor system errors
- **Security Monitoring**: Detect and prevent security threats
- **Data Usage**: Monitor database and storage usage

## 🔄 Updates & Maintenance

### Regular Updates
- **Security Patches**: Monthly security updates
- **Feature Updates**: Quarterly feature releases
- **Database Maintenance**: Weekly database optimization
- **Content Updates**: Regular mental health resource updates

### Backup Strategy
- **Database Backups**: Daily automated backups
- **File Backups**: Weekly file system backups
- **Configuration Backups**: Version-controlled configuration
- **Disaster Recovery**: Comprehensive disaster recovery plan

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- **PHP**: PSR-12 coding standards
- **JavaScript**: ESLint configuration
- **Python**: PEP 8 style guide
- **CSS**: BEM methodology

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Technical Support
- **Documentation**: Comprehensive documentation in `/docs`
- **Issue Tracking**: GitHub Issues for bug reports
- **Community Forum**: Community support forum
- **Email Support**: support@mshauri.tz

### Mental Health Support
- **Crisis Hotline**: 24/7 crisis support
- **Professional Referrals**: Mental health professional network
- **Support Groups**: Online and offline support groups
- **Emergency Services**: Immediate crisis intervention

## 🙏 Acknowledgments

- **Mental Health Professionals**: Clinical guidance and validation
- **Tanzanian Community**: Cultural sensitivity and local adaptation
- **Open Source Community**: Libraries and frameworks used
- **Research Partners**: Academic institutions and research organizations

## 📞 Contact

- **Project Lead**: Frank Augustino
- **Email**: contact@mshauri.tz
- **Website**: https://mshauri.tz
- **GitHub**: https://github.com/mshauri/mental-health-system

---

**⚠️ Important Notice**: This system is designed to provide preliminary mental health support and should not replace professional medical advice. Users experiencing mental health crises should contact emergency services or mental health professionals immediately.
