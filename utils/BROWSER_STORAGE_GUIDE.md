# Browser Storage Management Guide

## Overview

This guide explains how to use the new browser storage managers for vaxtop_online. All user preferences, likes, notifications, and multi-device login support are now stored securely in the browser.

## Files Created

### 1. `sessionStorageManager.ts` (Multi-Device Login)
Manages user sessions across multiple devices with secure token generation.

**Key Features:**
- Creates unique device IDs
- Generates secure session tokens
- Sessions persist forever - NO expiration (until manual deletion)- Maintains list of active sessions

**Usage Example:**
```typescript
import sessionStorageManager from './sessionStorageManager';

// Create a new session when user logs in
const session = sessionStorageManager.createSession(
  userId,
  userEmail,
  30 // expiration in days
);

// Check if session is valid
if (sessionStorageManager.getCurrentSession()) {
  // Session exists and is active
}

// Logout from current device
sessionStorageManager.clearSession();

// Logout from all devices
sessionStorageManager.clearAllSessions();
```

### 2. `preferencesManager.ts` (User Preferences)
Stores and manages user preferences including likes, notifications, and follow relationships.

**Key Features:**
- Save user theme, language, and notification settings
- Track liked products (saved in browser)
- Manage notification bell system
- Track following/followers relationships
- Store up to 50 notifications per user

**Usage Example:**
```typescript
import preferencesManager from './preferencesManager';

// Initialize user preferences
const prefs = preferencesManager.initializePreferences(userId);

// Add a liked product
preferencesManager.addLikedProduct(userId, productId);

// Check if product is liked
const isLiked = preferencesManager.isProductLiked(userId, productId);

// Add notification
preferencesManager.addNotification(userId, {
  type: 'like',
  message: 'Someone liked your product',
  productId: productId,
  fromUserId: likerUserId,
  read: false,
  createdAt: new Date().toISOString(),
});

// Get unread notifications count
const unreadCount = preferencesManager.getUnreadCount(userId);

// Mark all as read
preferencesManager.markAllNotificationsAsRead(userId);
```

### 3. `EnhancedAuthContext.ts` (Authentication)
Replace the old AuthContext with this enhanced version that includes session management.

**Key Features:**
- Multi-device login support
- Session validation
- Automatic session recovery on app restart
- Device identification
- Logout from all devices option

**Usage Example:**
```typescript
import { useEnhancedAuth } from './EnhancedAuthContext';

function MyComponent() {
  const { 
    user, 
    isAuthenticated,
    deviceId,
    login,
    logout,
    logoutAllDevices,
    isSessionValid
  } = useEnhancedAuth();

  const handleLogin = (user, email) => {
    login(user, email);
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Logged in on device: {deviceId}</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

## Data Storage Location

All data is stored using browser's localStorage:

```
localStorage {
  vaxtopUser: User object (JSON)
  vaxtopUserEmail: string
  vaxtopCurrentSession: DeviceSession object (JSON)
  vaxtopSessionsList: DeviceSession[] (JSON)
  vaxtopDeviceId: string
  vaxtopUserPreferences_{userId}: UserPreferences object (JSON)
  vaxtopUserLikes_{userId}: UserLike[] (JSON)
  vaxtopNotifications_{userId}: BellNotification[] (JSON)
}
```

## Privacy & Security

✅ **What's Protected:**
- All user data is stored locally in the browser
- No sensitive data is sent to third-party services
- Each device has a unique ID
- Sessions expire after 30 days
- Email and password are NOT stored in localStorage (handle in backend)

⚠️ **Important Notes:**
- Data is browser-specific (not synced across devices)
- Clearing browser cache will delete all stored data
- Use HTTPS in production to prevent man-in-the-middle attacks
- For sensitive operations, validate sessions in the backend

## Integration Steps

1. **Update App.tsx:**
   - Replace `AuthContext` with `EnhancedAuthContext`
   - Import `useEnhancedAuth` hook

2. **Update Components:**
   - Use `preferencesManager` for like/notification functionality
   - Call `addLikedProduct` when user likes something
   - Call `addNotification` for notification bell events

3. **Test Multi-Device:**
   - Open app on phone and desktop
   - Login on both devices
   - Verify different session IDs in localStorage
   - Test "logout from all devices" feature

## API Reference

### sessionStorageManager
- `createSession(userId, email, expiresInDays)`
- `getCurrentSession()`
- `updateLastActivity()`
- `getSessionsList()`
- `clearSession()`
- `clearAllSessions()`
- `verifySessionToken(token)`
- `getDeviceId()`

### preferencesManager
- `initializePreferences(userId)`
- `getPreferences(userId)`
- `savePreferences(userId, preferences)`
- `addLikedProduct(userId, productId)`
- `removeLikedProduct(userId, productId)`
- `isProductLiked(userId, productId)`
- `addNotification(userId, notification)`
- `getNotifications(userId)`
- `getUnreadCount(userId)`
- `markNotificationAsRead(userId, notificationId)`
- `markAllNotificationsAsRead(userId)`
- `addFollowing(userId, targetUserId)`
- `removeFollowing(userId, targetUserId)`
- `isFollowing(userId, targetUserId)`

## Environment Variables

No additional environment variables required. All functionality works out of the box.

## Future Enhancements

- Backend sync for cross-device data
- Encryption for sensitive localStorage data
- Automatic cleanup of expired sessions
- Analytics on device usage
- Remote logout from all devices
