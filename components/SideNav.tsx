import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { HomeIcon, SearchIcon, PlusCircleIcon, UserCircleIcon, AccessibilityIcon } from './Icons';

interface SideNavProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  promptForAuth: () => void;
}

const Separator: React.FC = () => <div className="h-px w-8 bg-gray-700"></div>;

const SideNav: React.FC<SideNavProps> = ({ activeScreen, setActiveScreen, promptForAuth }) => {
    const { user } = useAuthContext();

    const navItems = [
        { name: 'home', label: 'דף הבית', icon: HomeIcon },
        { name: 'search', label: 'חיפוש', icon: SearchIcon },
        { name: 'create', label: 'צור', icon: PlusCircleIcon, needsAuth: true },
        { name: 'accessibility', label: 'נגישות', icon: AccessibilityIcon },
        { name: 'profile', label: 'פרופיל', icon: UserCircleIcon },
    ];

    const handleNavClick = (screenName: string, needsAuth?: boolean) => {
        if (needsAuth && user === 'guest') {
            promptForAuth();
            return;
        }
        setActiveScreen(screenName);
    };

    return (
        <nav className="hidden md:flex flex-col items-center justify-center px-3 bg-primary">
            <div className="flex flex-col items-center gap-4 bg-gray-900/50 p-3 rounded-full border border-gray-800">
                {navItems.map((item, index) => (
                    <React.Fragment key={item.name}>
                        <button
                            onClick={() => handleNavClick(item.name, item.needsAuth)}
                            aria-label={item.label}
                            className={`p-3 rounded-full transition-colors duration-200 ${
                                activeScreen === item.name ? 'bg-accent text-primary' : 'text-secondary hover:bg-gray-700'
                            }`}
                        >
                            <item.icon className="w-7 h-7" />
                        </button>
                        {index < navItems.length - 1 && <Separator />}
                    </React.Fragment>
                ))}
            </div>
        </nav>
    );
};

export default SideNav;
