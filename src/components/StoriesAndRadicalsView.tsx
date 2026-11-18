import React, { useState, useEffect } from 'react';
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

  const tabs: { id: StorySubTab; label: string; glyph: string }[] = [
    { id: 'stories', label: 'Asal-usul huruf', glyph: '源' },
    { id: 'stroke-order', label: 'Urutan goresan', glyph: '笔' },
    { id: 'tones', label: 'Nada pinyin', glyph: '调' },
    { id: 'radicals', label: '16 radikal', glyph: '部' },
    { id: 'sandbox', label: 'Tulis bebas', glyph: '写' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Section index: hanzi glyph + label, active marked by rule and vermilion */}
      <nav aria-label="Bagian Aksara" className="overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
        <div role="tablist" className="flex min-w-max sm:min-w-0 border-t-2 border-ink sm:grid sm:grid-cols-5 sm:divide-x sm:divide-ink/20 border-b border-ink/20">
          {tabs.map((tab, i) => {
            const isActive = currentSubTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectTab(tab.id)}
                className={`relative flex items-center gap-3 px-4 py-3 text-left whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion ${
                  isActive ? 'text-ink' : 'text-muted hover:text-ink hover:bg-paper-2'
                }`}
              >
                {isActive && <span aria-hidden className="absolute -top-0.5 left-0 right-0 h-0.5 bg-vermilion" />}
                <span className={`font-serif font-black text-2xl leading-none ${isActive ? 'text-vermilion' : ''}`}>{tab.glyph}</span>
                <span className="text-sm">
                  <span className="block text-[10px] tabular-nums opacity-70">{String(i + 1).padStart(2, '0')}</span>
                  <span className={isActive ? 'font-semibold' : ''}>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

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

