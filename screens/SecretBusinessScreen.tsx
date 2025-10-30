
import React, { useState, useContext } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { User } from '../types';

interface SecretBusinessScreenProps {
  onClose: () => void;
}

const SecretBusinessScreen: React.FC<SecretBusinessScreenProps> = ({ onClose }) => {
  const { user, updateUser } = useAuthContext();
  const [businessName, setBusinessName] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && user !== 'guest') {
      const currentUser = user as User;
      updateUser({ ...currentUser, isPartner: true, name: businessName || currentUser.name });
      setSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary z-50 p-6 flex flex-col justify-center items-center text-secondary">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">דף סודי: פרופיל עסקי</h1>
      
      {!success ? (
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          <p className="text-center text-gray-300">שדרג את החשבון שלך לחשבון שותפים כדי לקבל מסגרת מוזהבת וגישה לתכונות נוספות.</p>
          <input
            type="text"
            placeholder="שם העסק (אופציונלי)"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button type="submit" className="bg-yellow-500 text-primary font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors">
            שדרג לחשבון שותפים
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-2xl text-green-400 font-bold">ברכות!</p>
          <p>החשבון שלך שודרג בהצלחה לחשבון שותפים.</p>
        </div>
      )}
      
      <button onClick={onClose} className="mt-8 bg-gray-700 text-secondary py-2 px-6 rounded-lg">
        סגור
      </button>
    </div>
  );
};

export default SecretBusinessScreen;
   