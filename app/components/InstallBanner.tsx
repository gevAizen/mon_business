'use client';

import { useEffect, useState } from 'react';
import { fr } from '@/lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Install banner for PWA
 * Shows native install prompt on supported browsers (Android Chrome, Edge, etc.)
 * Inspired by "100 Things Every Designer Needs to Know About People":
 * - People prefer optional interactions
 * - Show value proposition before asking for action
 */
export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () =>
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#60b8c0] text-white p-4 shadow-lg z-40 safe-area-inset-bottom">
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold">{fr.installBanner.title}</p>
          <p className="text-sm opacity-90">{fr.installBanner.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm font-semibold text-[#60b8c0] bg-white rounded-lg hover:bg-blue-50 transition-colors"
          >
            {fr.common.no}
          </button>
          <button
            onClick={handleInstall}
            className="px-4 py-2 text-sm font-semibold bg-blue-800 rounded-lg hover:bg-blue-900 transition-colors"
          >
            {fr.common.install}
          </button>
        </div>
      </div>
    </div>
  );
}
