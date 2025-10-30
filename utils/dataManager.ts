// Data persistence manager with localStorage and optional backend sync

import { User, Product } from '../types';

const STORAGE_KEYS = {
  USER: 'vaxtopUser',
  PRODUCTS: 'vaxtopProducts',
  USERS: 'vaxtopUsers',
  SETTINGS: 'vaxtopSettings',
};

export const dataManager = {
  // User operations
  saveUser: (user: User) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  },

  getUser: (): User | null => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user === 'guest' ? null : user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  clearUser: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      return true;
    } catch (error) {
      console.error('Error clearing user:', error);
      return false;
    }
  },

  // Products operations
  saveProducts: (products: Product[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return true;
    } catch (error) {
      console.error('Error saving products:', error);
      return false;
    }
  },

  getProducts: (): Product[] => {
    try {
      const productsStr = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return productsStr ? JSON.parse(productsStr) : [];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  },

  addProduct: (product: Product) => {
    try {
      const products = dataManager.getProducts();
      products.push(product);
      dataManager.saveProducts(products);
      return true;
    } catch (error) {
      console.error('Error adding product:', error);
      return false;
    }
  },

  updateProduct: (productId: string, updates: Partial<Product>) => {
    try {
      const products = dataManager.getProducts();
      const index = products.findIndex(p => p.id === productId);
      if (index === -1) return false;
      products[index] = { ...products[index], ...updates };
      dataManager.saveProducts(products);
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  },

  deleteProduct: (productId: string) => {
    try {
      const products = dataManager.getProducts();
      const filtered = products.filter(p => p.id !== productId);
      dataManager.saveProducts(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },

  // Settings operations
  saveSettings: (settings: Record<string, any>) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },

  getSettings: (): Record<string, any> => {
    try {
      const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settingsStr ? JSON.parse(settingsStr) : {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  },

  // Backup and recovery
  exportData: () => {
    try {
      return {
        user: localStorage.getItem(STORAGE_KEYS.USER),
        products: localStorage.getItem(STORAGE_KEYS.PRODUCTS),
        settings: localStorage.getItem(STORAGE_KEYS.SETTINGS),
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },

  importData: (backup: any) => {
    try {
      if (backup.user) localStorage.setItem(STORAGE_KEYS.USER, backup.user);
      if (backup.products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, backup.products);
      if (backup.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, backup.settings);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },
};

export default dataManager;
