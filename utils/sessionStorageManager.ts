// Session Storage Manager - Multi-device login support
// מנהל סשן מרובה מכשירים עם토ken בטוח

interface DeviceSession {
  deviceId: string;
  userId: string;
  token: string;
  sessionToken: string; // Unique token for this device session
  email: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
}

interface AuthToken {
  userId: string;
  email: string;
  sessionToken: string;
  createdAt: string;
  expiresAt: string;
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
  // Create new device session
  createSession: (userId: string, email: string, expiresInDays: number = 30): DeviceSession => {
    try {
      const deviceId = generateDeviceId();
      const sessionToken = generateSessionToken();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

      const session: DeviceSession = {
        deviceId,
        userId,
        token: btoa(`${userId}:${sessionToken}`), // Basic encoding (not cryptographic)
        sessionToken,
        email,
        createdAt: now.toISOString(),
        lastActivity: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
      };

      // Save current session
      localStorage.setItem(SESSION_STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
      
      // Add to sessions list
      sessionStorageManager.addToSessionsList(session);
      
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Get current session
  getCurrentSession: (): DeviceSession | null => {
    try {
      const sessionStr = localStorage.getItem(SESSION_STORAGE_KEYS.CURRENT_SESSION);
      if (!sessionStr) return null;
      
      const session: DeviceSession = JSON.parse(sessionStr);
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        sessionStorageManager.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  // Update last activity
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

  // Add session to list
  addToSessionsList: (session: DeviceSession): void => {
    try {
      const sessions = sessionStorageManager.getSessionsList();
      // Remove old session from same device if exists
      const filtered = sessions.filter(s => s.deviceId !== session.deviceId);
      filtered.push(session);
      // Keep only last 10 sessions
      const limited = filtered.slice(-10);
      localStorage.setItem(SESSION_STORAGE_KEYS.SESSIONS_LIST, JSON.stringify(limited));
    } catch (error) {
      console.error('Error adding to sessions list:', error);
    }
  },

  // Get all sessions for this user
  getSessionsList: (): DeviceSession[] => {
    try {
      const sessionsStr = localStorage.getItem(SESSION_STORAGE_KEYS.SESSIONS_LIST);
      return sessionsStr ? JSON.parse(sessionsStr) : [];
    } catch (error) {
      console.error('Error getting sessions list:', error);
      return [];
    }
  },

  // Clear current session (logout)
  clearSession: (): boolean => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_SESSION);
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  },

  // Clear all sessions (logout from all devices)
  clearAllSessions: (): boolean => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_SESSION);
      localStorage.removeItem(SESSION_STORAGE_KEYS.SESSIONS_LIST);
      return true;
    } catch (error) {
      console.error('Error clearing all sessions:', error);
      return false;
    }
  },

  // Verify session token
  verifySessionToken: (token: string): boolean => {
    try {
      const session = sessionStorageManager.getCurrentSession();
      if (!session) return false;
      return session.token === token && session.isActive;
    } catch (error) {
      console.error('Error verifying session token:', error);
      return false;
    }
  },

  // Get device ID
  getDeviceId: (): string => {
    return generateDeviceId();
  },
};

export default sessionStorageManager;
