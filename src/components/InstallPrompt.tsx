import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Smartphone } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [show, setShow] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in navigator && (navigator as any).standalone);

    if (isStandalone) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const dismissed = localStorage.getItem('clujpulse-install-dismissed');
    if (dismissed) return;

    setIsIOS(/iPhone|iPad|iPod/.test(navigator.userAgent));
    setTimeout(() => setShow(true), 2000);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('clujpulse-install-dismissed', '1');
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed bottom-16 left-4 right-4 z-40 bg-paper-2 border border-rule rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-display font-bold text-ink">
              Add ClujPulse to your home screen
            </p>
            <p className="text-xs text-ink-2 mt-1">
              Access your lineup instantly, works offline at the festival.
            </p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setShowSteps(true)}
                className="px-4 py-2 rounded-full text-xs font-display font-bold bg-ink text-paper"
              >
                Show me how
              </button>
              <button
                onClick={dismiss}
                className="px-4 py-2 rounded-full text-xs font-display font-bold text-ink-3"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showSteps} onClose={() => { setShowSteps(false); dismiss(); }} title="Install ClujPulse">
        {isIOS ? (
          <ol className="space-y-3 text-sm text-ink-2">
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">1.</span>
              Tap the <strong className="text-ink">Share</strong> button (square with arrow) at the bottom of Safari
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">2.</span>
              Scroll down and tap <strong className="text-ink">Add to Home Screen</strong>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">3.</span>
              Tap <strong className="text-ink">Add</strong> — done! Open it from your home screen
            </li>
          </ol>
        ) : (
          <ol className="space-y-3 text-sm text-ink-2">
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">1.</span>
              Tap the <strong className="text-ink">⋮ menu</strong> (three dots) in Chrome
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">2.</span>
              Tap <strong className="text-ink">Add to Home Screen</strong> or <strong className="text-ink">Install app</strong>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-display font-bold">3.</span>
              Tap <strong className="text-ink">Install</strong> — that's it!
            </li>
          </ol>
        )}
        <button
          onClick={() => { setShowSteps(false); dismiss(); }}
          className="mt-5 w-full py-3 rounded-full text-sm font-display font-bold bg-ink text-paper"
        >
          Got it
        </button>
      </Modal>
    </>
  );
};
