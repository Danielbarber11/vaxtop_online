// Comments Manager - שמירת תגובות של המשתמשים

const COMMENTS_STORAGE_KEY = 'vaxtopComments';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  text: string;
  createdAt: string;
}

export const commentsManager = {
  // הוסף תגובה
  addComment: (userId: string, userName: string, productId: string, text: string) => {
    try {
      const comments = commentsManager.getProductComments(productId);
      const newComment: Comment = {
        id: `comment_${Date.now()}_${Math.random()}`,
        userId,
        userName,
        productId,
        text,
        createdAt: new Date().toISOString()
      };
      comments.push(newComment);
      localStorage.setItem(`${COMMENTS_STORAGE_KEY}_${productId}`, JSON.stringify(comments));
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  },

  // קבל את כל התגובות למוצר
  getProductComments: (productId: string): Comment[] => {
    try {
      const commentsStr = localStorage.getItem(`${COMMENTS_STORAGE_KEY}_${productId}`);
      return commentsStr ? JSON.parse(commentsStr) : [];
    } catch (error) {
      console.error('Error getting product comments:', error);
      return [];
    }
  },

  // מחק תגובה
  deleteComment: (productId: string, commentId: string) => {
    try {
      const comments = commentsManager.getProductComments(productId);
      const filtered = comments.filter(c => c.id !== commentId);
      localStorage.setItem(`${COMMENTS_STORAGE_KEY}_${productId}`, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  },

  // ספור תגובות למוצר
  getCommentsCount: (productId: string): number => {
    try {
      return commentsManager.getProductComments(productId).length;
    } catch (error) {
      console.error('Error getting comments count:', error);
      return 0;
    }
  },

  // עדכן תגובה
  updateComment: (productId: string, commentId: string, newText: string) => {
    try {
      const comments = commentsManager.getProductComments(productId);
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.text = newText;
        localStorage.setItem(`${COMMENTS_STORAGE_KEY}_${productId}`, JSON.stringify(comments));
        return comment;
      }
      return null;
    } catch (error) {
      console.error('Error updating comment:', error);
      return null;
    }
  },

  // נקה את כל התגובות של מוצר
  clearProductComments: (productId: string) => {
    try {
      localStorage.removeItem(`${COMMENTS_STORAGE_KEY}_${productId}`);
      return true;
    } catch (error) {
      console.error('Error clearing comments:', error);
      return false;
    }
  }
};

export default commentsManager;
