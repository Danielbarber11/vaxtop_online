const recentNotifications = notifications.slice(-50); const limited = notifications; // Store all permanent
interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark';
  language: 'he' | 'en';
  notifications: boolean;
  autoPlay: boolean;
  likedProducts: string[]; // product IDs
  savedProducts: string[]; // saved for later
  following: string[]; // user IDs
  followers: string[]; // user IDs
  blockedUsers: string[]; // user IDs
  notifications: {
    newFollower: boolean;
    productComments: boolean;
    productLikes: boolean;
  };
}

interface BellNotification {
  id: string;
  userId: string;
  type: 'follow' | 'like' | 'comment' | 'sale';
  message: string;
  productId?: string;
  fromUserId?: string;
  read: boolean;
  createdAt: string;
}

const PREFERENCES_STORAGE_KEY = 'vaxtopUserPreferences';
const NOTIFICATIONS_STORAGE_KEY = 'vaxtopNotifications';

export const preferencesManager = {
  // Initialize default preferences
  initializePreferences: (userId: string): UserPreferences => {
    const existing = preferencesManager.getPreferences(userId);
    if (existing) return existing;

    const defaultPrefs: UserPreferences = {
      userId,
      theme: 'light',
      language: 'he',
      notifications: true,
      autoPlay: true,
      likedProducts: [],
      savedProducts: [],
      following: [],
      followers: [],
      blockedUsers: [],
      notifications: {
        newFollower: true,
        productComments: true,
        productLikes: true,
      },
    };

    preferencesManager.savePreferences(userId, defaultPrefs);
    return defaultPrefs;
  },

  // Get user preferences
  getPreferences: (userId: string): UserPreferences | null => {
    try {
      const prefsStr = localStorage.getItem(`${PREFERENCES_STORAGE_KEY}_${userId}`);
      return prefsStr ? JSON.parse(prefsStr) : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  },

  // Save user preferences
  savePreferences: (userId: string, preferences: UserPreferences): boolean => {
    try {
      localStorage.setItem(
        `${PREFERENCES_STORAGE_KEY}_${userId}`,
        JSON.stringify(preferences)
      );
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  },

  // Add liked product
  addLikedProduct: (userId: string, productId: string): boolean => {
    try {
      const prefs = preferencesManager.initializePreferences(userId);
      if (!prefs.likedProducts.includes(productId)) {
        prefs.likedProducts.push(productId);
        preferencesManager.savePreferences(userId, prefs);
      }
      return true;
    } catch (error) {
      console.error('Error adding liked product:', error);
      return false;
    }
  },

  // Remove liked product
  removeLikedProduct: (userId: string, productId: string): boolean => {
    try {
      const prefs = preferencesManager.getPreferences(userId);
      if (!prefs) return false;
      prefs.likedProducts = prefs.likedProducts.filter(id => id !== productId);
      preferencesManager.savePreferences(userId, prefs);
      return true;
    } catch (error) {
      console.error('Error removing liked product:', error);
      return false;
    }
  },

  // Check if product is liked
  isProductLiked: (userId: string, productId: string): boolean => {
    try {
      const prefs = preferencesManager.getPreferences(userId);
      return prefs ? prefs.likedProducts.includes(productId) : false;
    } catch (error) {
      console.error('Error checking liked product:', error);
      return false;
    }
  },

  // Add notification
  addNotification: (userId: string, notification: Omit<BellNotification, 'id'>): BellNotification => {
    try {
      const notifWithId: BellNotification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const notifications = preferencesManager.getNotifications(userId);
      notifications.push(notifWithId);
      // Keep only last 50 notifications
      const limited = notifications.slice(-50);
      localStorage.setItem(
        `${NOTIFICATIONS_STORAGE_KEY}_${userId}`,
        JSON.stringify(limited)
      );
      
      return notifWithId;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  },

  // Get notifications
  getNotifications: (userId: string): BellNotification[] => {
    try {
      const notifsStr = localStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`);
      return notifsStr ? JSON.parse(notifsStr) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  // Get unread notifications count
  getUnreadCount: (userId: string): number => {
    try {
      const notifications = preferencesManager.getNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Mark notification as read
  markNotificationAsRead: (userId: string, notificationId: string): boolean => {
    try {
      const notifications = preferencesManager.getNotifications(userId);
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        localStorage.setItem(
          `${NOTIFICATIONS_STORAGE_KEY}_${userId}`,
          JSON.stringify(notifications)
        );
      }
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: (userId: string): boolean => {
    try {
      const notifications = preferencesManager.getNotifications(userId);
      notifications.forEach(n => (n.read = true));
      localStorage.setItem(
        `${NOTIFICATIONS_STORAGE_KEY}_${userId}`,
        JSON.stringify(notifications)
      );
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  // Add following
  addFollowing: (userId: string, targetUserId: string): boolean => {
    try {
      const prefs = preferencesManager.initializePreferences(userId);
      if (!prefs.following.includes(targetUserId)) {
        prefs.following.push(targetUserId);
        preferencesManager.savePreferences(userId, prefs);
      }
      return true;
    } catch (error) {
      console.error('Error adding following:', error);
      return false;
    }
  },

  // Remove following
  removeFollowing: (userId: string, targetUserId: string): boolean => {
    try {
      const prefs = preferencesManager.getPreferences(userId);
      if (!prefs) return false;
      prefs.following = prefs.following.filter(id => id !== targetUserId);
      preferencesManager.savePreferences(userId, prefs);
      return true;
    } catch (error) {
      console.error('Error removing following:', error);
      return false;
    }
  },

  // Check if following
  isFollowing: (userId: string, targetUserId: string): boolean => {
    try {
      const prefs = preferencesManager.getPreferences(userId);
      return prefs ? prefs.following.includes(targetUserId) : false;
    } catch (error) {
      console.error('Error checking following:', error);
      return false;
    }
  },
};

export default preferencesManager;
