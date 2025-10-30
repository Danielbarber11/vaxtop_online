import React from 'react';
import { XIcon } from './Icons';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({ isOpen, onClose, onLogin, onSignup }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-primary rounded-lg shadow-xl w-11/12 max-w-xs p-6 relative text-secondary border border-gray-700 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white" aria-label="סגור">
          <XIcon className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold text-center">התחבר או הירשם</h3>
        <p className="text-sm text-gray-400 text-center">כדי להמשיך, עליך להתחבר לחשבונך או ליצור חשבון חדש.</p>
        <div className="w-full flex flex-col gap-3 mt-2">
            <button onClick={onLogin} className="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors">
                התחבר
            </button>
            <button onClick={onSignup} className="w-full bg-gray-700 text-secondary font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors">
                הירשם
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;
