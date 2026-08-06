import React from 'react';
import { useStore } from '../store/useStore';
import type { ActiveTab } from '../types';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, favoriteIds } = useStore();

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'timetable', label: 'Schedule' },
    { id: 'artists', label: 'Artists' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur-lg border-t border-rule/30">
      <div className="max-w-sm mx-auto flex items-center justify-center gap-1 py-2 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full text-sm font-display font-bold tracking-tight transition-all ${
                isActive
                  ? 'bg-ink text-paper'
                  : 'text-ink-3'
              }`}
            >
              {tab.label}
              {tab.id === 'timetable' && favoriteIds.length > 0 && !isActive && (
                <span className="ml-1.5 text-[10px] font-mono text-accent">{favoriteIds.length}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
