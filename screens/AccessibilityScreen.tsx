import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export const CheckboxSetting: React.FC<{ label: string; description?: string; isChecked: boolean; onToggle: () => void; id: string; }> =
    ({ label, description, isChecked, onToggle, id }) => (
        <label htmlFor={id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700 cursor-pointer">
            <div>
                <span className="font-semibold text-lg">{label}</span>
                {description && <p className="text-sm text-gray-400">{description}</p>}
            </div>
            <input
                type="checkbox"
                id={id}
                checked={isChecked}
                onChange={onToggle}
                className="w-6 h-6 rounded-md bg-gray-600 border-gray-500 text-accent focus:ring-accent focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 shrink-0"
            />
        </label>
    );

const AccessibilityScreen: React.FC = () => {
  const { 
    highContrast, toggleHighContrast,
    largeText, toggleLargeText,
    reduceMotion, toggleReduceMotion,
    textSpacing, toggleTextSpacing 
  } = useAccessibility();


  return (
    <div className="h-full w-full p-6 bg-primary text-secondary overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-accent">הגדרות נגישות</h1>

      <div className="space-y-6">
        <CheckboxSetting
          label="ניגודיות גבוהה"
          description="מגביר את הניגודיות של הצבעים באתר."
          isChecked={highContrast} 
          onToggle={toggleHighContrast} 
          id="highContrast" 
        />
        <CheckboxSetting
          label="טקסט גדול"
          description="מגדיל את כל הטקסטים לקריאה נוחה יותר."
          isChecked={largeText} 
          onToggle={toggleLargeText} 
          id="largeText" 
        />
        <CheckboxSetting
          label="הפחתת תנועה"
          description="מבטל אנימציות ומעברים לא חיוניים."
          isChecked={reduceMotion} 
          onToggle={toggleReduceMotion} 
          id="reduceMotion" 
        />
        <CheckboxSetting
          label="הגדלת ריווח טקסט"
          description="מרווח את האותיות והשורות לשיפור הקריאות."
          isChecked={textSpacing} 
          onToggle={toggleTextSpacing} 
          id="textSpacing" 
        />
      </div>
      
      <div className="mt-8 text-gray-400 text-center">
          <p>השינויים נשמרים אוטומטית ויחולו על כל האתר.</p>
      </div>
    </div>
  );
};

export default AccessibilityScreen;