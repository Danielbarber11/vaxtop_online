import React, { useContext, useState } from 'react';
import { AppStateContext } from '../App';
import { Product, User } from '../types';
import Modal from '../components/Modal';
import { XIcon } from '../components/Icons';
import { generateGradientForId } from '../utils/color';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave }) => {
  const [description, setDescription] = useState(product.description);
  const [productUrl, setProductUrl] = useState(product.productUrl);

  const handleSave = () => {
    onSave({ ...product, description, productUrl });
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="עריכת מוצר">
      <div className="flex flex-col gap-4">
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary"
        />
        <input
          type="url"
          value={productUrl}
          onChange={e => setProductUrl(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary"
        />
        <button onClick={handleSave} className="bg-accent text-primary font-bold py-2 rounded-lg">
          שמור שינויים
        </button>
      </div>
    </Modal>
  );
};


interface AdminScreenProps {
  onClose: () => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ onClose }) => {
  const { users, products, setProducts } = useContext(AppStateContext);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleDelete = (productId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המוצר הזה לצמיתות?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleSave = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  return (
    <div className="h-full w-full flex flex-col bg-primary text-secondary">
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
      <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
        <h1 className="text-xl font-bold text-yellow-400">פאנל ניהול</h1>
        <button onClick={onClose} className="p-2">
          <XIcon className="w-6 h-6" />
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {users.map(user => {
          const userProducts = products.filter(p => p.userId === user.id);
          const fallbackAvatarStyle = { background: generateGradientForId(user.id) };
          return (
            <div key={user.id} className="bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-12 h-12 rounded-full" />
                ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold" style={fallbackAvatarStyle}>
                        {user.name.charAt(0)}
                    </div>
                )}
                <div>
                  <h2 className="text-lg font-bold">{user.name}</h2>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
              {userProducts.length > 0 ? (
                <div className="space-y-3">
                  {userProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-gray-800 p-2 rounded-md">
                      <img src={p.media.urls[0]} alt="" className="w-12 h-12 object-cover rounded" />
                      <p className="flex-1 text-sm truncate">{p.description}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingProduct(p)} className="text-xs text-accent hover:underline">ערוך</button>
                        <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline">מחק</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">למשתמש זה אין מוצרים.</p>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default AdminScreen;