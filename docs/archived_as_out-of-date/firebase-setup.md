# Firebase Setup Documentation

**Date:** 2025-08-11  
**Status:** ✅ Code Complete - Requires Configuration  
**Epic 0 - Task 8**

## Overview

Firebase has been integrated into the SportHawk app for:

- **Crashlytics**: Real-time crash reporting and analysis
- **Analytics**: User behavior tracking and insights

## Implementation Complete

### Files Created/Modified

1. **`/lib/firebase.ts`** - Complete Firebase service wrapper
   - Initialization logic
   - Crashlytics utilities
   - Analytics utilities
   - Error boundary integration

2. **`/app/_layout.tsx`** - Firebase initialization on app start

3. **`/contexts/UserContext.tsx`** - Analytics integration
   - Login/signup events
   - User ID tracking
   - Session events

### Features Implemented

#### Crashlytics

- `log(message)` - Log custom messages
- `recordError(error)` - Record non-fatal errors
- `setUserId(id)` - Track user (anonymous ID)
- `setAttribute(key, value)` - Custom attributes
- `crash()` - Test crash (dev only)

#### Analytics

- `logEvent(name, params)` - Custom events
- `logScreenView(name)` - Screen tracking
- `logSignUp(method)` - Sign up tracking
- `logLogin(method)` - Login tracking
- `setUserProperty(name, value)` - User segmentation
- Team/Event/Payment specific events

## Configuration Required

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project "SportHawk" (or use existing)
3. Enable Google Analytics when prompted
4. Select or create Analytics account

### Step 2: Add Apps to Firebase

#### iOS App

1. Click "Add app" → iOS
2. Bundle ID: `com.sporthawk.app` (or your bundle ID)
3. Download `GoogleService-Info.plist`
4. Save to `/ios/` directory

#### Android App

1. Click "Add app" → Android
2. Package name: `com.sporthawk.app` (or your package)
3. Download `google-services.json`
4. Save to `/android/app/` directory

### Step 3: Configure Environment Variables

Add to `.env`:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_API_KEY_IOS=your-ios-api-key
EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID=your-android-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID_IOS=your-ios-app-id
EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID=your-android-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Step 4: Update app.json

Add Firebase plugin configuration:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics",
      "@react-native-firebase/analytics"
    ],
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### Step 5: EAS Build Configuration

Since Firebase requires native code, you must use EAS Build:

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Configure EAS:

```bash
eas build:configure
```

3. Update `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "your-project-id"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

4. Build development client:

```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

## Usage in Code

### Track Screen Views

```typescript
import { FirebaseAnalytics } from '@top/lib/firebase';

// In screen component
useEffect(() => {
  FirebaseAnalytics.logScreenView('TeamDetails');
}, []);
```

### Track Events

```typescript
// Custom event
FirebaseAnalytics.logEvent('team_joined', {
  team_id: teamId,
  team_name: teamName,
});

// Payment event
FirebaseAnalytics.logPaymentSuccess(amount, 'GBP', 'stripe');
```

### Record Errors

```typescript
import { FirebaseCrashlytics } from '@top/lib/firebase';

try {
  // risky operation
} catch (error) {
  FirebaseCrashlytics.recordError(error, {
    context: 'Loading team data',
  });
}
```

### Error Boundaries

```typescript
import { logErrorToCrashlytics } from '@top/lib/firebase';

class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logErrorToCrashlytics(error, errorInfo);
  }
}
```

## Testing

### Test Crashlytics

```typescript
// In development only
import { FirebaseCrashlytics } from '@top/lib/firebase';

// Force a test crash
FirebaseCrashlytics.crash();
```

### Verify Analytics

1. Open Firebase Console
2. Go to Analytics → DebugView
3. Enable debug mode on device
4. Perform actions in app
5. See events appear in real-time

### Debug Mode

#### iOS

```bash
# Enable debug mode
xcrun simctl launch booted com.sporthawk.app --args -FIRAnalyticsDebugEnabled
```

#### Android

```bash
adb shell setprop debug.firebase.analytics.app com.sporthawk.app
```

## Important Notes

### Expo Go Limitations

- **Firebase does NOT work in Expo Go**
- Must use development build (EAS Build)
- Test on physical device or simulator with dev build

### Privacy Considerations

- Never log personal information
- Use anonymous user IDs
- Follow GDPR/privacy laws
- Add privacy policy mentions

### Performance Impact

- Firebase adds ~2MB to app size
- Minimal runtime overhead
- Async operations don't block UI

## Monitoring

### Crashlytics Dashboard

- Real-time crash reports
- Crash-free users percentage
- Top crashes by impact
- Velocity alerts

### Analytics Dashboard

- User engagement metrics
- Event tracking
- User properties
- Conversion funnels
- Retention analysis

## Troubleshooting

### Firebase not initializing

- Check environment variables
- Verify config files in place
- Ensure using dev build, not Expo Go

### Events not appearing

- Check debug mode enabled
- Verify internet connection
- Wait 24 hours for production data

### Crashes not reported

- Ensure Crashlytics enabled in Firebase Console
- Check `setCrashlyticsCollectionEnabled(true)`
- Restart app after crash

## Next Steps

1. **Create Firebase Project** (if not exists)
2. **Download config files** (GoogleService-Info.plist, google-services.json)
3. **Add environment variables**
4. **Create EAS development build**
5. **Test on device**
6. **Monitor dashboards**

## Conclusion

Firebase integration is complete at the code level. The app will gracefully handle missing configuration by disabling Firebase features. Once configured with proper credentials and built with EAS, you'll have full crash reporting and analytics capabilities.
