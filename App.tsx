import React, { useState, useMemo, useEffect } from 'react';
import { useEnhancedAuth } from './utils/EnhancedAuthContext';
import { createSession, getCurrentSession, addLikedProduct, removeLikedProduct, addNotification } from './utils/sessionStorageManager';
import { getPreferences, savePreferences, addFollowing, removeFollowing, isFollowing } from './utils/preferencesManager';
import { AuthContext, useAuth } from './context/AuthContext';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import CreateProductScreen from './screens/CreateProductScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import AccessibilityScreen from './screens/AccessibilityScreen';
import HelpScreen from './screens/HelpScreen';
import PublicProfileScreen from './screens/PublicProfileScreen';
import { User, Product } from './types';
import { MOCK_USERS, MOCK_PRODUCTS } from './data/mockData';
import AuthPromptModal from './components/AuthPromptModal';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import ProfileFeedScreen from './screens/ProfileFeedScreen';
import CommentsModal from './components/CommentsModal';
import AdminScreen from './screens/AdminScreen';

export const AppStateContext = React.createContext<{
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}>({
  products: [],
  setProducts: () => {},
  users: [],
  setUsers: () => {},
});

const App: React.FC = () => {
  return (
    <AuthContext.Provider value={useEnhancedAuth()}>
      <AccessibilityProvider>
        <MainApp />
      </AccessibilityProvider>
    </AuthContext.Provider>
  );
};

const MainApp: React.FC = () => {
    const { user, logout, logoutAllDevices } = useEnhancedAuth();
  const [activeScreen, setActiveScreen] = useState('home');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [viewingProfileFeed, setViewingProfileFeed] = useState<{
    productsToShow: Product[];
    title: string;
    initialProductId: string;
  } | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [commentingProduct, setCommentingProduct] = useState<Product | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { highContrast, largeText, reduceMotion, textSpacing } = useAccessibility();
  const [homeScreenKey, setHomeScreenKey] = useState(Date.now());

  const appStateValue = useMemo(() => ({
    products, setProducts, users, setUsers
  }), [products, setProducts, users, setUsers]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.highContrast = String(highContrast);
    root.dataset.largeText = String(largeText);
    root.dataset.reduceMotion = String(reduceMotion);
    root.dataset.textSpacing = String(textSpacing);
  }, [highContrast, largeText, reduceMotion, textSpacing]);

  useEffect(() => {
    // When changing main screens, reset any detailed views.
    setViewingProfile(null);
    setViewingProfileFeed(null);
  }, [activeScreen]);

  const navigate = (screen: string) => {
    if (screen === 'home' && activeScreen === 'home') {
        setHomeScreenKey(Date.now());
    }
    setActiveScreen(screen);
  };

  const handleGoToLogin = () => {
    localStorage.setItem('authMode', 'login');
    setShowAuthPrompt(false);
    logout();
  };

  const handleGoToSignup = () => {
    localStorage.setItem('authMode', 'signup');
    setShowAuthPrompt(false);
    logout();
  };
  
  const handleViewFeed = (productsToShow: Product[], title: string, initialProductId: string) => {
    setViewingProfileFeed({ productsToShow, title, initialProductId });
  };
  
  const handleViewUserFeed = (user: User, initialProductId: string) => {
    const userProducts = products.filter(p => p.userId === user.id && p.isPublished)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    handleViewFeed(userProducts, `המוצרים של ${user.name}`, initialProductId);
  };
  
  const handleCommentClick = (product: Product) => {
      setCommentingProduct(product);
  }

  if (user === null) {
    return <AuthScreen />;
  }
  
  const renderContent = () => {
    if (showAdminPanel) {
        return <AdminScreen onClose={() => setShowAdminPanel(false)} />;
    }
    
    if (viewingProfileFeed) {
        return <ProfileFeedScreen
            productsToShow={viewingProfileFeed.productsToShow}
            title={viewingProfileFeed.title}
            initialProductId={viewingProfileFeed.initialProductId}
            onBack={() => setViewingProfileFeed(null)}
            setViewingProfile={setViewingProfile}
            promptForAuth={() => setShowAuthPrompt(true)}
            onCommentClick={handleCommentClick}
        />
    }

    if (viewingProfile) {
        return <PublicProfileScreen 
            user={viewingProfile} 
            onClose={() => setViewingProfile(null)} 
            onViewFeed={handleViewFeed}
        />;
    }

    switch (activeScreen) {
        case 'home':
            return <HomeScreen key={homeScreenKey} setViewingProfile={setViewingProfile} promptForAuth={() => setShowAuthPrompt(true)} onCommentClick={handleCommentClick} />;
        case 'search':
            return <SearchScreen onViewUserFeed={handleViewUserFeed} setViewingProfile={setViewingProfile} />;
        case 'create':
            return <CreateProductScreen setActiveScreen={setActiveScreen} />;
        case 'accessibility':
            return <AccessibilityScreen />;
        case 'profile':
            return <ProfileScreen 
                        setActiveScreen={setActiveScreen}
                        onViewFeed={handleViewFeed}
                        onViewUserFeed={handleViewUserFeed}
                        setViewingProfile={setViewingProfile}
                        onShowAdminPanel={() => setShowAdminPanel(true)}
                    />;
        case 'help':
            return <HelpScreen setActiveScreen={setActiveScreen} />;
        default:
            return <HomeScreen key={homeScreenKey} setViewingProfile={setViewingProfile} promptForAuth={() => setShowAuthPrompt(true)} onCommentClick={handleCommentClick} />;
    }
  };

  return (
    <AppStateContext.Provider value={appStateValue}>
      <div className="bg-primary text-secondary h-dvh w-screen overflow-hidden flex flex-col md:flex-row font-sans">
        <SideNav activeScreen={activeScreen} setActiveScreen={navigate} promptForAuth={() => setShowAuthPrompt(true)} />
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
        <div className="relative z-30 md:hidden">
          <BottomNav activeScreen={activeScreen} setActiveScreen={navigate} promptForAuth={() => setShowAuthPrompt(true)} />
        </div>
      </div>
      <AuthPromptModal 
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        onLogin={handleGoToLogin}
        onSignup={handleGoToSignup}
      />
      {commentingProduct && (
        <CommentsModal
            product={commentingProduct}
            onClose={() => setCommentingProduct(null)}
        />
      )}
    </AppStateContext.Provider>
  );
};

export default App;
