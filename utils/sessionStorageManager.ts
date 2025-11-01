// Session Storage Manager - Multi-device login (PERMANENT)
// מנהל סשן מרובה מכשירים - התחברות נצחית עד למחיקה

interface DeviceSession {
  deviceId: string;
  userId: string;
  token: string;
  sessionToken: string;
  email: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
}

const SESSION_STORAGE_KEYS = {
  CURRENT_SESSION: 'vaxtopCurrentSession',
  DEVICE_ID: 'vaxtopDeviceId',
  SESSIONS_LIST: 'vaxtopSessionsList',
};

// Generate unique device ID
const generateDeviceId = (): string => {
  const existingId = localStorage.getItem(SESSION_STORAGE_KEYS.DEVICE_ID);
  if (existingId) return existingId;
  
  const newId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(SESSION_STORAGE_KEYS.DEVICE_ID, newId);
  return newId;
};

// Generate secure session token
const generateSessionToken = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
};

export const sessionStorageManager = {
  // Create new permanent device session (NO expiration)
  createSession: (userId: string, email: string): DeviceSession => {
    try {
      const deviceId = generateDeviceId();
      const sessionToken = generateSessionToken();
      const now = new Date();

      const session: DeviceSession = {
        deviceId,
        userId,
        token: btoa(`${userId}:${sessionToken}`),
        sessionToken,
        email,
        createdAt: now.toISOString(),
        lastActivity: now.toISOString(),
        isActive: true,
      };

      // Save permanent session
      localStorage.setItem(SESSION_STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
      
      // Add to sessions list
      sessionStorageManager.addToSessionsList(session);
      
      console.log(`✅ Permanent session created on device: ${session.deviceId}`);
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Get current session (permanent)
  getCurrentSession: (): DeviceSession | null => {
    try {
      const sessionStr = localStorage.getItem(SESSION_STORAGE_KEYS.CURRENT_SESSION);
      if (!sessionStr) return null;
      
      const session: DeviceSession = JSON.parse(sessionStr);
      return session.isActive ? session : null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  // Update last activity timestamp
  updateLastActivity: (): boolean => {
    try {
      const session = sessionStorageManager.getCurrentSession();
      if (!session) return false;
      
      session.lastActivity = new Date().toISOString();
      localStorage.setItem(SESSION_STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
      
      // Update in sessions list
      const sessions = sessionStorageManager.getSessionsList();
      const index = sessions.findIndex(s => s.sessionToken === session.sessionToken);
      if (index !== -1) {
        sessions[index].lastActivity = session.lastActivity;
        localStorage.setItem(SESSION_STORAGE_KEYS.SESSIONS_LIST, JSON.stringify(sessions));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating last activity:', error);
      return false;
    }
  },

  // Add session to list (keep all sessions)
  addToSessionsList: (session: DeviceSession): void => {
    try {
      const sessions = sessionStorageManager.getSessionsList();
      // Remove old session from same device if exists
      const filtered = sessions.filter(s => s.deviceId !== session.deviceId);
      filtered.push(session);
      // No limit - keep all sessions
      localStorage.setItem(SESSION_STORAGE_KEYS.SESSIONS_LIST, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error adding to sessions list:', error);
    }
  },

  // Get all sessions (permanent)
  getSessionsList: (): DeviceSession[] => {
    try {
      const sessionsStr = localStorage.getItem(SESSION_STORAGE_KEYS.SESSIONS_LIST);
      return sessionsStr ? JSON.parse(sessionsStr) : [];
    } catch (error) {
      console.error('Error getting sessions list:', error);
      return [];
    }
  },

  // Delete only current device session
  clearSession: (): boolean => {
    try {
      const session = sessionStorageManager.getCurrentSession();
      if (session) {
        session.isActive = false;
        localStorage.setItem(SESSION_STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
      }
      console.log('✅ Session deleted from this device only');
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  },

  // Delete all sessions and device ID (factory reset)
  deleteAllSessions: (): boolean => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_SESSION);
      localStorage.removeItem(SESSION_STORAGE_KEYS.SESSIONS_LIST);
      console.log('⚠️ All sessions deleted - FACTORY RESET');
      return true;
    } catch (error) {
      console.error('Error deleting all sessions:', error);
      return false;
    }
  },

  // Verify session token
  verifySessionToken: (token: string): boolean => {
    try {
      const session = sessionStorageManager.getCurrentSession();
      return session !== null && session.token === token && session.isActive;
    } catch (error) {
      console.error('Error verifying session token:', error);
      return false;
    }
  },

  // Get device ID
  getDeviceId: (): string => {
    return generateDeviceId();
  },

  // Get user ID from session
  getUserId: (): string | null => {
    const session = sessionStorageManager.getCurrentSession();
    return session ? session.userId : null;
  },

  // Get device sessions for user (can login from multiple devices)
  getUserDevices: (userId: string): DeviceSession[] => {
    try {
      const sessions = sessionStorageManager.getSessionsList();
      return sessions.filter(s => s.userId === userId && s.isActive);
    } catch (error) {
      console.error('Error getting user devices:', error);
      return [];
    }
  },
};

export default sessionStorageManager;
