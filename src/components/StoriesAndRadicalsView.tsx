import React, { useState, useEffect } from 'react';
import { Compass, Layers, PenTool, Music, Sparkles } from 'lucide-react';
import { CharacterStoriesView } from './CharacterStoriesView';
import { RadicalsView } from './RadicalsView';
import { CustomCharacterSandbox } from './CustomCharacterSandbox';
import { StrokeOrderGuideView } from './StrokeOrderGuideView';
import { PinyinTonesGuideView } from './PinyinTonesGuideView';

export type StorySubTab = 'stories' | 'radicals' | 'stroke-order' | 'tones' | 'sandbox';

interface StoriesAndRadicalsViewProps {
  activeSubTab?: StorySubTab;
  onSubTabChange?: (subTab: StorySubTab) => void;
}

export const StoriesAndRadicalsView: React.FC<StoriesAndRadicalsViewProps> = ({
  activeSubTab = 'stories',
  onSubTabChange
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<StorySubTab>(activeSubTab);

  useEffect(() => {
    if (activeSubTab) {
      setCurrentSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleSelectTab = (tab: StorySubTab) => {
    setCurrentSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  const tabs: { id: StorySubTab; label: string; icon: React.FC<{ className?: string }>; activeColor: string }[] = [
    { id: 'stories', label: 'Asal-Usul Huruf', icon: Compass, activeColor: 'bg-red-700 text-white' },
    { id: 'stroke-order', label: 'Urutan Goresan', icon: PenTool, activeColor: 'bg-amber-700 text-white' },
    { id: 'tones', label: 'Nada Pinyin', icon: Music, activeColor: 'bg-teal-700 text-white' },
    { id: 'radicals', label: '16 Radikal', icon: Layers, activeColor: 'bg-blue-700 text-white' },
    { id: 'sandbox', label: 'Tulis Bebas', icon: Sparkles, activeColor: 'bg-purple-700 text-white' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Segmented Control Switcher (Scrollable on small mobile) */}
      <div className="flex justify-center">
        <div className="w-full max-w-3xl overflow-x-auto no-scrollbar py-0.5">
          <div className="bg-white dark:bg-stone-900 p-1.5 sm:p-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-start sm:justify-between gap-1 min-w-max sm:min-w-0 transition-colors">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentSubTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                    isActive
                      ? `${tab.activeColor} shadow-xs font-bold`
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content based on sub-tab */}
      <div className="animate-in fade-in duration-150">
        {currentSubTab === 'stories' && <CharacterStoriesView />}
        {currentSubTab === 'stroke-order' && <StrokeOrderGuideView />}
        {currentSubTab === 'tones' && <PinyinTonesGuideView />}
        {currentSubTab === 'radicals' && <RadicalsView />}
        {currentSubTab === 'sandbox' && <CustomCharacterSandbox />}
      </div>
    </div>
  );
};

