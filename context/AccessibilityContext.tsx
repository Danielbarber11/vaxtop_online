import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  largeText: boolean;
  toggleLargeText: () => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  textSpacing: boolean;
  toggleTextSpacing: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [textSpacing, setTextSpacing] = useState(false);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleLargeText = () => setLargeText(prev => !prev);
  const toggleReduceMotion = () => setReduceMotion(prev => !prev);
  const toggleTextSpacing = () => setTextSpacing(prev => !prev);

  const value = useMemo(() => ({
    highContrast,
    toggleHighContrast,
    largeText,
    toggleLargeText,
    reduceMotion,
    toggleReduceMotion,
    textSpacing,
    toggleTextSpacing,
  }), [highContrast, largeText, reduceMotion, textSpacing]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
