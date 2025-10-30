import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { HomeIcon, SearchIcon, PlusCircleIcon, UserCircleIcon, AccessibilityIcon } from './Icons';

interface BottomNavProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  promptForAuth: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen, promptForAuth }) => {
    const { user } = useAuthContext();

    const navItems = [
        { name: 'home', label: 'דף הבית', icon: HomeIcon },
        { name: 'search', label: 'חיפוש', icon: SearchIcon },
        { name: 'create', label: 'צור', icon: PlusCircleIcon },
        { name: 'accessibility', label: 'נגישות', icon: AccessibilityIcon },
        { name: 'profile', label: 'פרופיל', icon: UserCircleIcon },
    ];

    const handleNavClick = (screenName: string) => {
        if (screenName === 'create' && user === 'guest') {
            promptForAuth();
            return;
        }
        setActiveScreen(screenName);
    };

    return (
        <div className="bg-primary border-t border-gray-700 w-full h-16 flex justify-around items-center md:h-20">
            {navItems.map((item) => (
                <button
                    key={item.name}
                    onClick={() => handleNavClick(item.name)}
                    className={`flex flex-col items-center justify-center h-full w-1/5 transition-colors duration-200 ${
                        activeScreen === item.name ? 'text-accent' : 'text-secondary'
                    }`}
                >
                    <item.icon className="w-7 h-7 md:w-8 md:h-8" />
                </button>
            ))}
        </div>
    );
};

export default BottomNav;
