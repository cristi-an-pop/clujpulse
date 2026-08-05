import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { ArtistsView } from './components/ArtistsView';
import { TimetableView } from './components/TimetableView';
import { InstallPrompt } from './components/InstallPrompt';

export const App: React.FC = () => {
  const { activeTab } = useStore();
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdate(true);
            }
          });
        }
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-body relative">
      {/* Subtle ambient color wash */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[oklch(20%_0.08_290)] rounded-full blur-[200px] opacity-30 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[oklch(18%_0.06_340)] rounded-full blur-[180px] opacity-20 translate-y-1/3 -translate-x-1/4" />
      </div>
      <div className="relative z-10">
        <Header />
      </div>

      {showUpdate && (
        <div className="px-6 py-2 bg-paper-2 border-b border-rule flex items-center justify-between">
          <span className="text-xs text-ink-2">New version available</span>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-bold text-accent uppercase tracking-wider hover:underline"
          >
            Reload
          </button>
        </div>
      )}

      <main className="flex-1 w-full relative z-10">
        {activeTab === 'timetable' && <TimetableView />}
        {activeTab === 'artists' && <ArtistsView />}
      </main>

      <Navbar />
      <InstallPrompt />
    </div>
  );
};
export default App;
