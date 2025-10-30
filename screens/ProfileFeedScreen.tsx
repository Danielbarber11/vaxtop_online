import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { AppStateContext } from '../App';
import { User, Product } from '../types';
import { ArrowLeftIcon } from '../components/Icons';

interface ProfileFeedScreenProps {
  productsToShow: Product[];
  title: string;
  initialProductId: string;
  onBack: () => void;
  setViewingProfile: (user: User) => void;
  promptForAuth: () => void;
  onCommentClick: (product: Product) => void;
}

const ProfileFeedScreen: React.FC<ProfileFeedScreenProps> = ({ productsToShow, title, initialProductId, onBack, setViewingProfile, promptForAuth, onCommentClick }) => {
  const [visibleProductId, setVisibleProductId] = useState<string | null>(initialProductId);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const productRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const orderedProducts = useMemo(() => {
    const sorted = [...productsToShow]; // Create a mutable copy
    
    // Move the initial product to the top
    const initialIndex = sorted.findIndex(p => p.id === initialProductId);
    if (initialIndex > 0) {
      const [initialProduct] = sorted.splice(initialIndex, 1);
      sorted.unshift(initialProduct);
    }
    return sorted;
  }, [productsToShow, initialProductId]);

  useEffect(() => {
    const options = {
      root: scrollContainerRef.current,
      rootMargin: '0px',
      threshold: 0.7,
    };

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = (entry.target as HTMLElement).dataset.productId;
          if (id) {
            setVisibleProductId(id);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, options);
    const observer = observerRef.current;
    
    productRefs.current.forEach(ref => {
      if(ref) observer.observe(ref);
    });

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [orderedProducts]);

  const getRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      productRefs.current.set(id, el);
    } else {
      productRefs.current.delete(id);
    }
  };

  return (
    <div className="h-full w-full relative bg-primary">
        <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
             <button 
                onClick={onBack} 
                className="p-2 bg-black/75 rounded-full text-white hover:bg-black transition-colors"
                aria-label="חזור לפרופיל"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white icon-shadow">{title}</h1>
            <div className="w-10 h-10"></div>
        </header>

        <div ref={scrollContainerRef} className="h-full w-full overflow-y-scroll snap-y-mandatory hide-scrollbar snap-stop-always">
        {orderedProducts.map(product => (
            <div 
            key={product.id} 
            ref={getRef(product.id)}
            data-product-id={product.id}
            className="h-full w-full snap-start flex-shrink-0"
            >
            <ProductCard
                product={product}
                setViewingProfile={setViewingProfile}
                isVisible={visibleProductId === product.id}
                promptForAuth={promptForAuth}
                onCommentClick={onCommentClick}
            />
            </div>
        ))}
        </div>
    </div>
  );
};

export default ProfileFeedScreen;