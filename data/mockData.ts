import { User, Product } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'דניאל המפתח', email: 'daniel@vaxtop.com', password: 'test123', isPartner: true, profilePicture: 'https://picsum.photos/id/1005/200', subscriptions: ['u2'], viewedNotifications: [], savedProducts: [], isBlocked: false, isPrivate: false },
  { id: 'u2', name: 'חנות אופנה', email: 'fashion@store.com', password: 'test123', isPartner: true, profilePicture: 'https://picsum.photos/id/1011/200', subscriptions: [], viewedNotifications: [], savedProducts: [], isBlocked: false, isPrivate: false },
  { id: 'u3', name: 'גדגטים ועוד', email: 'gadgets@tech.com', password: 'test123', isPartner: false, profilePicture: 'https://picsum.photos/id/1025/200', subscriptions: ['u1'], viewedNotifications: [], savedProducts: [], isBlocked: false, isPrivate: false },
  { id: 'u4', name: 'יופי וטיפוח', email: 'beauty@care.com', password: 'test123', isPartner: false, profilePicture: 'https://picsum.photos/id/1025/200', subscriptions: [], viewedNotifications: [], savedProducts: [], isBlocked: false, isPrivate: false },
  { id: 'u5', name: 'דניאל בר בר', email: 'danielbarber1246@gmail.com', password: 'test123', isPartner: true, profilePicture: 'https://picsum.photos/id/1005/200', subscriptions: [], viewedNotifications: [], savedProducts: [], isBlocked: false, isPrivate: false },
];

export const MOCK_PRODUCTS: Product[] = [];
