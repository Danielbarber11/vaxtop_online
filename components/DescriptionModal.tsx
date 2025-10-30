import React, { ReactNode, useEffect, useState } from 'react';
import { XIcon } from './Icons';

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({ isOpen, onClose, title, children }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsRendered(false);
    }
  };

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-40 transition-colors duration-300 ${isOpen ? 'bg-black/60' : 'bg-transparent'}`}
      onClick={onClose}
    >
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-primary border-t border-gray-700 rounded-t-2xl p-4 pb-24 shadow-lg transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={(e) => e.stopPropagation()}
        onTransitionEnd={handleAnimationEnd}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-secondary">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="max-h-[40vh] overflow-y-auto text-secondary hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DescriptionModal;
