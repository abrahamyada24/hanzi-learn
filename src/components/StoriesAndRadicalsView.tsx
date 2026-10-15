import React, { useState, useEffect } from 'react';
import { Compass, Layers, PenTool } from 'lucide-react';
import { CharacterStoriesView } from './CharacterStoriesView';
import { RadicalsView } from './RadicalsView';
import { CustomCharacterSandbox } from './CustomCharacterSandbox';

export type StorySubTab = 'stories' | 'radicals' | 'sandbox';

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

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Segmented Control Switcher */}
      <div className="bg-white dark:bg-stone-900 p-2 sm:p-2.5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between gap-1 max-w-xl mx-auto transition-colors">
        <button
          onClick={() => handleSelectTab('stories')}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
            currentSubTab === 'stories'
              ? 'bg-red-700 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <Compass className="w-4 h-4 flex-shrink-0" />
          <span>Asal-Usul Huruf</span>
        </button>

        <button
          onClick={() => handleSelectTab('radicals')}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
            currentSubTab === 'radicals'
              ? 'bg-blue-700 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <Layers className="w-4 h-4 flex-shrink-0" />
          <span>16 Radikal</span>
        </button>

        <button
          onClick={() => handleSelectTab('sandbox')}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
            currentSubTab === 'sandbox'
              ? 'bg-purple-700 text-white shadow-xs font-bold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <PenTool className="w-4 h-4 flex-shrink-0" />
          <span>Tulis Bebas</span>
        </button>
      </div>

      {/* Content based on sub-tab */}
      <div className="animate-in fade-in duration-150">
        {currentSubTab === 'stories' && <CharacterStoriesView />}
        {currentSubTab === 'radicals' && <RadicalsView />}
        {currentSubTab === 'sandbox' && <CustomCharacterSandbox />}
      </div>
    </div>
  );
};
