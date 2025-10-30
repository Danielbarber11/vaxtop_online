import React, { useContext, useState } from 'react';
import { User, Product } from '../types';
import { AppStateContext } from '../App';
import { ArrowLeftIcon, BellIcon } from '../components/Icons';
import { useAuthContext } from '../context/AuthContext';
import { generateGradientForId } from '../utils/color';

interface PublicProfileScreenProps {
  user: User;
  onClose: () => void;
  onViewFeed: (productsToShow: Product[], title: string, initialProductId: string) => void;
}

const PublicProfileScreen: React.FC<PublicProfileScreenProps> = ({ user, onClose, onViewFeed }) => {
  const { products } = useContext(AppStateContext);
  const { user: currentUser, updateUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'products' | 'likes'>('products');
  
  const userProducts = products
    .filter(p => p.userId === user.id && p.isPublished)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
  const likedProducts = products.filter(p => p.likes.includes(user.id) && p.isPublished);
    
  const partnerBorder = user.isPartner ? 'p-1 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full' : '';
  
  const fallbackAvatarStyle = {
    background: generateGradientForId(user.id),
  };

  const isSubscribed = currentUser !== 'guest' && currentUser?.subscriptions.includes(user.id);

  const handleSubscribeToggle = () => {
    if (currentUser === 'guest' || !currentUser) return;

    const newSubscriptions = isSubscribed
        ? currentUser.subscriptions.filter(id => id !== user.id)
        : [...currentUser.subscriptions, user.id];
    
    updateUser({ ...currentUser, subscriptions: newSubscriptions });
  };

  const ProductGrid: React.FC<{products: Product[], onProductClick: (product: Product) => void}> = ({ products, onProductClick }) => (
    <div className="grid grid-cols-3 gap-1 p-1">
        {products.map(p => (
            <div key={p.id} onClick={() => onProductClick(p)} className={`relative aspect-square bg-gray-800 rounded-sm overflow-hidden cursor-pointer`}>
                <img src={p.media.urls[0]} alt={p.description} className="w-full h-full object-cover" />
            </div>
        ))}
    </div>
  );

  const renderContent = () => {
      if (activeTab === 'products') {
          if (userProducts.length === 0) return <p className="text-center text-gray-400 mt-10">למשתמש זה אין עדיין מוצרים.</p>;
          return <ProductGrid products={userProducts} onProductClick={(p) => onViewFeed(userProducts, `המוצרים של ${user.name}`, p.id)} />;
      }
      if (activeTab === 'likes') {
          if (likedProducts.length === 0) return <p className="text-center text-gray-400 mt-10">המשתמש לא אהב מוצרים עדיין.</p>;
          return <ProductGrid products={likedProducts} onProductClick={(p) => onViewFeed(likedProducts, `לייקים של ${user.name}`, p.id)} />;
      }
  }

  return (
    <div className="h-full w-full flex flex-col bg-primary text-secondary">
      <header className="relative flex items-center justify-center p-4 border-b border-gray-700 bg-gray-900">
        <button onClick={onClose} aria-label="חזור" className="absolute left-4 top-1/2 -translate-y-1/2 p-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">הפרופיל של {user.name}</h1>
        {currentUser !== 'guest' && currentUser?.id !== user.id && (
            <button onClick={handleSubscribeToggle} aria-label={isSubscribed ? "בטל הרשמה לעדכונים" : "הירשם לעדכונים"} className="absolute right-4 top-1/2 -translate-y-1/2 p-2">
                <BellIcon className={`w-7 h-7 ${isSubscribed ? 'text-yellow-400' : 'text-secondary'}`} filled={isSubscribed} />
            </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex flex-col items-center">
          <div className={`relative w-24 h-24 mb-4 ${partnerBorder}`}>
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full border-2 border-primary" />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-bold" style={fallbackAvatarStyle}>
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
        </div>
        
        <div className="border-b border-t border-gray-700 flex justify-around">
            <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 font-semibold ${activeTab === 'products' ? 'text-accent border-b-2 border-accent' : 'text-gray-400'}`}>מוצרים</button>
            <button onClick={() => setActiveTab('likes')} className={`flex-1 py-3 font-semibold ${activeTab === 'likes' ? 'text-accent border-b-2 border-accent' : 'text-gray-400'}`}>לייקים</button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default PublicProfileScreen;