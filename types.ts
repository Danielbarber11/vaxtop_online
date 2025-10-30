
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  profilePicture?: string;
  isPartner: boolean;
  subscriptions: string[]; // array of user IDs
  viewedNotifications: string[]; // array of product IDs
  savedProducts: string[]; // array of product IDs
  isBlocked?: boolean;
  isPrivate?: boolean;
}

export interface Product {
  id: string;
  userId: string;
  description: string;
  media: { type: 'image' | 'video'; urls: string[] };
  productUrl: string;
  likes: string[]; // array of user IDs
  comments: Comment[];
  isPublished: boolean;
  publishedAt: string; // ISO date string
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}