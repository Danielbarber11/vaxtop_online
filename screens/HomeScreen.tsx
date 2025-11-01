
import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { AppStateContext } from '../App';
import { User, Product } from '../types';
import { getPreferences, savePreferences, addLikedProduct, removeLikedProduct, isProductLiked } from '../utils/preferencesManager';

interface HomeScreenProps {
  setViewingProfile: (user: User) => void;
  promptForAuth: () => void;
  onCommentClick: (product: Product) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setViewingProfile, promptForAuth, onCommentClick }) => {
  const { products } = useContext(AppStateContext);
  const [visibleProductId, setVisibleProductId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const productRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const shuffledProducts = useMemo(() => {
    const published = products.filter(p => p.isPublished);
    // Fisher-Yates shuffle algorithm to randomize the product order
    for (let i = published.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [published[i], published[j]] = [published[j], published[i]];
    }
    return published;
  }, [products]);

  useEffect(() => {
    // Ensure cleanup of old observer before creating a new one
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: null, // observes intersections relative to the viewport
      rootMargin: '0px',
      threshold: 0.7, // Trigger when 70% of the item is visible
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
    
    // Set first product as visible on initial load if it's not set
    if (shuffledProducts.length > 0 && !visibleProductId) {
      setVisibleProductId(shuffledProducts[0].id);
    }
    
    const observer = observerRef.current;
    
    // Attach observer to all product card elements
    productRefs.current.forEach(ref => {
      if(ref) observer.observe(ref);
    });

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [shuffledProducts]); // Re-run if the shuffled product list changes

  const getRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      productRefs.current.set(id, el);
    } else {
      productRefs.current.delete(id);
    }
  };

  return (
    <div className="h-full w-full overflow-y-scroll snap-y-mandatory hide-scrollbar snap-stop-always">
      {shuffledProducts.map(product => (
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
  );
};

export default HomeScreen;
