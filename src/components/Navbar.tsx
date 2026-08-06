import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { ActiveTab } from '../types';
import { Share } from 'lucide-react';
import { Modal } from './Modal';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, favoriteIds } = useStore();
  const [showInstall, setShowInstall] = useState(false);

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone)
  );

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'timetable', label: 'Schedule' },
    { id: 'artists', label: 'Artists' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-paper border-t border-rule/30">
        <div className="flex items-center justify-center gap-1 py-2 px-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full text-sm font-display font-bold tracking-tight transition-all ${
                  isActive ? 'bg-ink text-paper' : 'text-ink-3'
                }`}
              >
                {tab.label}
                {tab.id === 'timetable' && favoriteIds.length > 0 && !isActive && (
                  <span className="ml-1.5 text-[10px] font-mono text-accent">{favoriteIds.length}</span>
                )}
              </button>
            );
          })}

          {!isStandalone && (
            <button
              onClick={() => setShowInstall(true)}
              className="ml-auto p-2 text-ink-3 hover:text-ink transition-colors"
              title="Install app"
            >
              <Share className="w-4 h-4" />
            </button>
          )}
        </div>
      </nav>

      <Modal isOpen={showInstall} onClose={() => setShowInstall(false)} title="Add to Home Screen">
        {isIOS ? (
          <ol className="space-y-3 text-sm text-ink-2">
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">1.</span>
              Tap the <strong className="text-ink">Share</strong> button at the bottom of Safari
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">2.</span>
              Scroll and tap <strong className="text-ink">Add to Home Screen</strong>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">3.</span>
              Tap <strong className="text-ink">Add</strong> — done!
            </li>
          </ol>
        ) : (
          <ol className="space-y-3 text-sm text-ink-2">
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">1.</span>
              Tap the <strong className="text-ink">⋮ menu</strong> in Chrome
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">2.</span>
              Tap <strong className="text-ink">Install app</strong> or <strong className="text-ink">Add to Home Screen</strong>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">3.</span>
              Tap <strong className="text-ink">Install</strong> — that's it!
            </li>
          </ol>
        )}
        <p className="text-xs text-ink-3 mt-4">Works offline at the festival. Your lineup is saved on device.</p>
        <button
          onClick={() => setShowInstall(false)}
          className="mt-5 w-full py-3 rounded-full text-sm font-display font-bold bg-ink text-paper"
        >
          Got it
        </button>
      </Modal>
    </>
  );
};
