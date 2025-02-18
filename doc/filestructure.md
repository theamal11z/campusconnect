
# Project File Structure

```
.
├── .config/
│   └── npm/
│       └── node_global/
│           └── lib/
├── .expo/
│   ├── README.md
│   └── devices.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── assets/
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── doc/
│   ├── ccnet.md
│   ├── concept.md
│   ├── development_plan.md
│   ├── filestructure.md
│   ├── flow.md
│   ├── nextstep.md
│   ├── setup.md
│   ├── status.md
│   └── testing.md
├── lib/
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── Tag.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useData.ts
│   │   └── useOfflineStorage.ts
│   ├── services/
│   │   ├── MediaService.ts
│   │   ├── ProfileService.ts
│   │   ├── TagService.ts
│   │   └── VerificationService.ts
│   ├── types/
│   │   └── supabase.ts
│   └── supabase.ts
├── screens/
│   ├── ChangePasswordScreen.tsx
│   ├── ChatScreen.tsx
│   ├── CollegeDetailScreen.tsx
│   ├── CompareCollegesScreen.tsx
│   ├── EditProfileScreen.tsx
│   ├── ExploreScreen.tsx
│   ├── ForumsScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── NotificationsScreen.tsx
│   ├── PostScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── SettingsScreen.tsx
│   └── VerifyScreen.tsx
├── supabase/
│   └── migrations/
│       ├── 004_complete_schema.sql
│       ├── 005_messaging_schema.sql
│       ├── 006_additional_features.sql
│       ├── 007_final_features.sql
│       ├── 009_user_relationships.sql
│       ├── 011_fix_schema_errors.sql
│       └── 012_search_optimization.sql
├── .env
├── .gitignore
├── .replit
├── App.tsx
├── README.md
├── app.json
├── index.ts
├── package-lock.json
├── package.json
└── tsconfig.json
```

## Directory Structure Overview

- `.config/`: Configuration files for npm
- `.expo/`: Expo-related configuration and device info
- `.github/`: GitHub workflows and CI configuration
- `assets/`: Application images and icons
- `doc/`: Project documentation
- `lib/`: Core application logic and utilities
  - `components/`: Reusable React components
  - `context/`: React context providers
  - `hooks/`: Custom React hooks
  - `services/`: Business logic services
  - `types/`: TypeScript type definitions
- `screens/`: Application screens/pages
- `supabase/`: Database migrations and Supabase configuration
