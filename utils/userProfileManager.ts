// User Profile Manager - שמירה של פרטי משתמשים

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
  website?: string;
  city?: string;
  country?: string;
  joinedDate: string;
  isVerified?: boolean;
  googleId?: string;
}

const PROFILE_PREFIX = 'vaxtopProfile_';

export const userProfileManager = {
  // שמור או עדכן פרטי משתמש
  saveProfile: (userId: string, profile: UserProfile) => {
    try {
      localStorage.setItem(`${PROFILE_PREFIX}${userId}`, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  },

  // קבל פרטי משטחמש
  getProfile: (userId: string): UserProfile | null => {
    try {
      const profileStr = localStorage.getItem(`${PROFILE_PREFIX}${userId}`);
      return profileStr ? JSON.parse(profileStr) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  // עדכן שדות בפרופיל
  updateProfileField: (userId: string, field: keyof UserProfile, value: any) => {
    try {
      const profile = userProfileManager.getProfile(userId);
      if (profile) {
        (profile as any)[field] = value;
        return userProfileManager.saveProfile(userId, profile);
      }
      return false;
    } catch (error) {
      console.error('Error updating profile field:', error);
      return false;
    }
  },

  // מחק פרטי
  deleteProfile: (userId: string) => {
    try {
      localStorage.removeItem(`${PROFILE_PREFIX}${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  },

  // בדוק אם פרטי קיים
  profileExists: (userId: string): boolean => {
    try {
      return localStorage.getItem(`${PROFILE_PREFIX}${userId}`) !== null;
    } catch (error) {
      console.error('Error checking profile:', error);
      return false;
    }
  },

  // קבל את כל הפרטים
  getAllProfiles: (): UserProfile[] => {
    try {
      const profiles: UserProfile[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(PROFILE_PREFIX)) {
          const profileStr = localStorage.getItem(key);
          if (profileStr) {
            profiles.push(JSON.parse(profileStr));
          }
        }
      }
      return profiles;
    } catch (error) {
      console.error('Error getting all profiles:', error);
      return [];
    }
  },

  // מצא פרטי לפי מרא
  searchProfilesByName: (name: string): UserProfile[] => {
    try {
      const allProfiles = userProfileManager.getAllProfiles();
      return allProfiles.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }
};

export default userProfileManager;
