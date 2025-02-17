# CampusConnect Setup Guide

## Development Environment Setup

### Prerequisites
- Android Studio (Latest Version)
- Java Development Kit (JDK) 11 or higher
- Kotlin plugin (Latest Version)
- Firebase CLI tools
- Git
- Node.js (for Firebase Functions)

### Initial Setup Steps

1. **Clone the Repository**
```bash
git clone https://github.com/your-org/campusconnect.git
cd campusconnect
```

2. **Firebase Setup**
```bash
npm install -g firebase-tools
firebase login
firebase init
```

Select the following Firebase services:
- Authentication
- Firestore
- Storage
- Functions
- Hosting

3. **Android Studio Configuration**
- Open Android Studio
- File -> Open -> Select the project directory
- Wait for Gradle sync to complete
- Add your `google-services.json` to app/

### Environment Variables

Create a `.env` file in the project root:
```
FIREBASE_API_KEY=your_api_key
MAPS_API_KEY=your_maps_api_key
ENCRYPTION_KEY=your_encryption_key
```

## Database Setup

### Firestore Collections Structure

```
collections/
├── users/
│   ├── uid/
│   │   ├── profile
│   │   ├── verification_status
│   │   ├── settings
│   │   ├── following
│   │   └── followers
├── colleges/
│   ├── college_id/
│   │   ├── basic_info
│   │   ├── stats
│   │   └── reviews
├── posts/
│   ├── post_id/
│   │   ├── content
│   │   ├── author
│   │   ├── metadata
│   │   ├── comments
│   │   └── likes
└── messages/
    └── chat_id/
        ├── messages
        └── participants
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    // Add more rules as needed
  }
}
```

## API Keys and Services

### Required API Keys
1. Google Maps API
2. Firebase Configuration
3. Push Notification Service
4. Analytics Service

### Service Setup
1. **Firebase Console Setup**
   - Create new project
   - Enable Authentication methods
   - Set up Firestore rules
   - Configure Storage rules

2. **Google Maps Integration**
   - Enable Maps SDK in Google Cloud Console
   - Generate API key with appropriate restrictions
   - Add key to manifest

## Testing Environment

### Local Testing
1. Install Android Emulator
2. Configure test devices
3. Set up Firebase Local Emulator Suite

### CI/CD Setup
1. Configure GitHub Actions
2. Set up automated testing
3. Configure deployment pipelines

## Deployment Checklist

- [ ] Configure ProGuard rules
- [ ] Set up signing keys
- [ ] Prepare privacy policy
- [ ] Configure Firebase production environment
- [ ] Set up monitoring tools
- [ ] Prepare store listing materials 