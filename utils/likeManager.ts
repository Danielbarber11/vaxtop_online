// Like Manager - שמירת לייקים של המשתמש

const LIKES_STORAGE_KEY = 'vaxtopUserLikes';

interface UserLike {
  userId: string;
  productId: string;
  likedAt: string;
}

export const likeManager = {
  // הוסף לייק
  addLike: (userId: string, productId: string) => {
    try {
      const likes = likeManager.getUserLikes(userId);
      // בדוק אם כבר עשה לייק
      if (!likes.find(l => l.productId === productId)) {
        likes.push({
          userId,
          productId,
          likedAt: new Date().toISOString()
        });
        localStorage.setItem(`${LIKES_STORAGE_KEY}_${userId}`, JSON.stringify(likes));
      }
      return true;
    } catch (error) {
      console.error('Error adding like:', error);
      return false;
    }
  },

  // הסר לייק
  removeLike: (userId: string, productId: string) => {
    try {
      const likes = likeManager.getUserLikes(userId);
      const filtered = likes.filter(l => l.productId !== productId);
      localStorage.setItem(`${LIKES_STORAGE_KEY}_${userId}`, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing like:', error);
      return false;
    }
  },

  // בדוק אם המשתמש עשה לייק למוצר
  hasLiked: (userId: string, productId: string): boolean => {
    try {
      const likes = likeManager.getUserLikes(userId);
      return likes.some(l => l.productId === productId);
    } catch (error) {
      console.error('Error checking like:', error);
      return false;
    }
  },

  // קבל את כל הלייקים של המשתמש
  getUserLikes: (userId: string): UserLike[] => {
    try {
      const likesStr = localStorage.getItem(`${LIKES_STORAGE_KEY}_${userId}`);
      return likesStr ? JSON.parse(likesStr) : [];
    } catch (error) {
      console.error('Error getting user likes:', error);
      return [];
    }
  },

  // ספור לייקים למוצר
  getLikesCount: (productId: string): number => {
    try {
      let count = 0;
      // סריקה על כל המשתמשים שנשמרו
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LIKES_STORAGE_KEY)) {
          const likes = JSON.parse(localStorage.getItem(key) || '[]');
          count += likes.filter((l: UserLike) => l.productId === productId).length;
        }
      }
      return count;
    } catch (error) {
      console.error('Error getting likes count:', error);
      return 0;
    }
  },

  // נקה את כל הלייקים של משתמש
  clearUserLikes: (userId: string) => {
    try {
      localStorage.removeItem(`${LIKES_STORAGE_KEY}_${userId}`);
      return true;
    } catch (error) {
      console.error('Error clearing user likes:', error);
      return false;
    }
  }
};

export default likeManager;
