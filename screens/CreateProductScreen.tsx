
import React, { useState, useContext } from 'react';
import { AppStateContext } from '../App';
import { useAuthContext } from '../context/AuthContext';
import { Product, User } from '../types';

interface CreateProductScreenProps {
  setActiveScreen: (screen: string) => void;
}

type Mode = 'view' | 'create' | 'edit';

const CreateProductScreen: React.FC<CreateProductScreenProps> = ({ setActiveScreen }) => {
  const { products, setProducts } = useContext(AppStateContext);
  const { user } = useAuthContext();
  const [mode, setMode] = useState<Mode>('view');
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [description, setDescription] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState(''); // Simple text input for mock image/video URL

  const currentUser = user as User;
  const userProducts = products.filter(p => p.userId === currentUser.id);

  const handleCreate = () => {
    setDescription('');
    setProductUrl('');
    setMediaUrl('');
    setProductToEdit(null);
    setMode('create');
  };

  const handleEdit = (product: Product) => {
    setDescription(product.description);
    setProductUrl(product.productUrl);
    setMediaUrl(product.media.urls[0]);
    setProductToEdit(product);
    setMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !productUrl || !mediaUrl) {
      alert('יש למלא את כל השדות');
      return;
    }

    if (mode === 'create') {
      const newProduct: Product = {
        id: `p${Date.now()}`,
        userId: currentUser.id,
        description,
        productUrl,
        media: { type: 'image', urls: [mediaUrl] }, // Assuming image for simplicity
        likes: [],
        comments: [],
        isPublished: true,
        publishedAt: new Date().toISOString(),
      };
      setProducts(prev => [newProduct, ...prev]);
      alert('המוצר פורסם בהצלחה!');
      setActiveScreen('home');
    } else if (mode === 'edit' && productToEdit) {
      setProducts(prev =>
        prev.map(p =>
          p.id === productToEdit.id
            ? { ...p, description, productUrl, media: { ...p.media, urls: [mediaUrl] } }
            : p
        )
      );
      alert('המוצר עודכן בהצלחה!');
      setMode('view');
    }
  };
  
  const handleDelete = (productId: string) => {
      if (window.confirm('האם אתה בטוח שברצונך למחוק את המוצר?')) {
          setProducts(prev => prev.filter(p => p.id !== productId));
      }
  }

  const handleTogglePublish = (productId: string) => {
      setProducts(prev => prev.map(p => p.id === productId ? {...p, isPublished: !p.isPublished} : p));
  }

  const renderContent = () => {
    if (mode === 'create' || mode === 'edit') {
      return (
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{mode === 'create' ? 'יצירת מוצר חדש' : 'עריכת מוצר'}</h2>
          <textarea
            placeholder="תיאור המוצר..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
          <input
            type="url"
            placeholder="קישור לתמונה/וידאו (URL)"
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
           <input
            type="url"
            placeholder="קישור לדף המוצר"
            value={productUrl}
            onChange={e => setProductUrl(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
          <button type="submit" className="bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors">
            {mode === 'create' ? 'פרסם מוצר' : 'שמור שינויים'}
          </button>
        </form>
      );
    }

    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">המוצרים שלי</h2>
        {userProducts.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p>אין לך מוצרים.</p>
            <button onClick={handleCreate} className="mt-4 bg-accent text-primary font-bold py-2 px-4 rounded-lg">
              צור מוצר ראשון
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userProducts.map(p => (
              <div key={p.id} className={`p-3 rounded-lg flex items-center gap-4 ${p.isPublished ? 'bg-gray-800' : 'bg-gray-900 opacity-60'}`}>
                <img src={p.media.urls[0]} alt="" className="w-16 h-16 object-cover rounded-md" />
                <div className="flex-1">
                  <p className="font-semibold">{p.description.substring(0, 40)}...</p>
                  <p className="text-xs text-gray-400">{p.isPublished ? 'מפורסם' : 'לא מפורסם'}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => handleEdit(p)} className="text-xs text-accent hover:underline">ערוך</button>
                    <button onClick={() => handleTogglePublish(p.id)} className="text-xs text-yellow-400 hover:underline">{p.isPublished ? 'בטל פרסום' : 'פרסם'}</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline">מחק</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-primary text-secondary overflow-y-auto">
      <div className="p-2 bg-gray-900 flex justify-center gap-2 border-b border-gray-700">
        <button onClick={() => setMode('view')} className={`py-2 px-4 rounded-lg text-sm ${mode === 'view' ? 'bg-accent text-primary' : 'bg-transparent'}`}>המוצרים שלי</button>
        <button onClick={handleCreate} className={`py-2 px-4 rounded-lg text-sm ${mode === 'create' ? 'bg-accent text-primary' : 'bg-transparent'}`}>הוספת מוצר</button>
      </div>
      {renderContent()}
    </div>
  );
};

export default CreateProductScreen;