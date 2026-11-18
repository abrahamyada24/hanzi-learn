import React from 'react';

export type NavTab = 'home' | 'flashcards' | 'stories' | 'quiz' | 'profile';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

// Hanzi glyphs stand in for icons: 家 home, 学 study, 字 characters, 测 quiz, 我 me
const TABS: { id: NavTab; label: string; glyph: string }[] = [
  { id: 'home', label: 'Beranda', glyph: '家' },
  { id: 'flashcards', label: 'Belajar', glyph: '学' },
  { id: 'stories', label: 'Aksara', glyph: '字' },
  { id: 'quiz', label: 'Kuis', glyph: '测' },
  { id: 'profile', label: 'Profil', glyph: '我' }
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => (
  <nav
    aria-label="Navigasi utama"
    className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper border-t border-ink pb-[env(safe-area-inset-bottom)]"
  >
    <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
      {TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-current={active ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-vermilion ${
              active ? 'text-vermilion' : 'text-muted'
            }`}
          >
            {active && <span aria-hidden className="absolute -top-px left-0 right-0 h-0.5 bg-vermilion" />}
            <span className="font-serif font-black text-2xl leading-none" aria-hidden>{tab.glyph}</span>
            <span className={`text-[10px] uppercase tracking-[0.1em] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);
