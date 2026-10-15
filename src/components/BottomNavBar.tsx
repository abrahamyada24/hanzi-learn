import React from 'react';
import { Home, BookOpen, Compass, HelpCircle, User } from 'lucide-react';

export type NavTab = 'home' | 'flashcards' | 'stories' | 'quiz' | 'profile';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userPhotoUrl?: string | null;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  userPhotoUrl
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Beranda', icon: Home },
    { id: 'flashcards' as NavTab, label: 'Belajar', icon: BookOpen },
    { id: 'stories' as NavTab, label: 'Aksara', icon: Compass },
    { id: 'quiz' as NavTab, label: 'Kuis', icon: HelpCircle },
    { id: 'profile' as NavTab, label: 'Profil', icon: User }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all relative py-1.5 active:scale-95 ${
                isActive ? 'text-red-700 font-bold' : 'text-stone-400 hover:text-stone-600 font-medium'
              }`}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-red-600 rounded-full" />
              )}

              {/* Icon / Avatar for Profile tab */}
              {tab.id === 'profile' && userPhotoUrl ? (
                <div className={`w-5 h-5 rounded-full overflow-hidden border transition ${
                  isActive ? 'border-red-600 ring-2 ring-red-100' : 'border-stone-300'
                }`}>
                  <img src={userPhotoUrl} alt="Profil" className="w-full h-full object-cover" />
                </div>
              ) : (
                <Icon 
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`} 
                />
              )}

              <span className={`text-[10px] tracking-tight leading-none ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
