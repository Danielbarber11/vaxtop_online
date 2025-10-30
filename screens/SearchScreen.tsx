import React, { useState, useMemo, useContext } from 'react';
import { AppStateContext } from '../App';
import { Product, User } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface SearchScreenProps {
  onViewUserFeed: (user: User, productId: string) => void;
  setViewingProfile: (user: User) => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ onViewUserFeed, setViewingProfile }) => {
  const { products, users } = useContext(AppStateContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const publishedProducts = useMemo(() => products.filter(p => p.isPublished), [products]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    const productDataForAI = publishedProducts.map(p => ({
      id: p.id,
      description: p.description,
      mediaType: p.media.type,
    }));

    const prompt = `אתה מנוע חיפוש חכם עבור אתר קניות. המשתמש מחפש: "${searchTerm}".
    להלן רשימת המוצרים הזמינים בפורמט JSON:
    ${JSON.stringify(productDataForAI)}

    נתח את בקשת החיפוש של המשתמש והשווה אותה לתיאורים של המוצרים. החזר אובייקט JSON המכיל מפתח "productIds" עם מערך של מזהי המוצרים הרלוונטיים ביותר, מסודרים מהרלוונטי ביותר לפחות רלוונטי. התמקד בהבנת ההקשר, לא רק בהתאמת מילות מפתח. אם אין תוצאות רלוונטיות, החזר מערך ריק.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["productIds"]
          }
        }
      });

      const result = JSON.parse(response.text);
      const orderedProducts = result.productIds
        .map((id: string) => publishedProducts.find(p => p.id === id))
        .filter((p: Product | undefined): p is Product => p !== undefined);

      setSearchResults(orderedProducts);

    } catch (error) {
      console.error("AI Search Error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const ProductThumbnail: React.FC<{ product: Product }> = ({ product }) => {
    const uploader = users.find(u => u.id === product.userId);
    if (!uploader) return null;
    
    return (
        <div 
        className="relative aspect-[9/16] bg-gray-800 rounded-md overflow-hidden group cursor-pointer"
        onClick={() => onViewUserFeed(uploader, product.id)}
        >
        {product.media.type === 'image' ? (
            <img src={product.media.urls[0]} alt={product.description} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full relative">
            <video src={product.media.urls[0]} className="w-full h-full object-cover" muted loop />
            <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                <svg xmlns="http://www.w.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-2">
           <div className="flex items-center gap-2">
             {uploader.profilePicture ? 
                <img src={uploader.profilePicture} className="w-6 h-6 rounded-full border border-white" /> :
                <div className="w-6 h-6 rounded-full bg-gray-600"></div>
             }
             <p className="text-white text-xs font-semibold truncate">{uploader.name}</p>
           </div>
        </div>
        </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center text-gray-400 mt-10">מחפש...</div>;
    }
    if (hasSearched && searchResults.length === 0) {
      return <div className="text-center text-gray-400 mt-10">לא נמצאו תוצאות עבור "{searchTerm}".</div>;
    }
    if (hasSearched) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {searchResults.map(product => (
            <ProductThumbnail key={product.id} product={product} />
          ))}
        </div>
      );
    }
    return (
        <div className="text-center text-gray-500 mt-10">
            <p>חפש מוצרים, רעיונות ועוד...</p>
        </div>
    )
  };

  return (
    <div className="h-full w-full flex flex-col p-4 bg-primary text-secondary">
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="search"
          placeholder="חפש עם AI..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </form>
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};

export default SearchScreen;