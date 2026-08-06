import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { motion, AnimatePresence } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { t } = useTranslation();
  const {
    currentScreen,
    setCurrentScreen,
    setInputText,
    setDetectedCategoryId,
    carnetActif,
    pinHash,
  } = useAppState();

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});

  // 1. Détecter l'onglet actif
  const getActiveTab = (screen: string): string => {
    if (['s2_home', 's3_analysis', 's4_results', 's5_law', 's6_emergency'].includes(screen)) {
      return 'parler';
    }
    if (screen === 's7_directory') return 'aide';
    if (screen === 's9_guide') return 'droits';
    if (screen === 's12_carnet') return 'carnet';
    if (screen === 's8_settings') return 'réglages';
    return 'parler';
  };

  const activeTab = getActiveTab(currentScreen);

  // 2. Commutation d'onglets
  const handleTabClick = (tab: string) => {
    if (tab === 'parler') {
      setCurrentScreen('s2_home');
    } else if (tab === 'aide') {
      setCurrentScreen('s7_directory');
    } else if (tab === 'droits') {
      setCurrentScreen('s9_guide');
    } else if (tab === 'carnet') {
      setCurrentScreen('s12_carnet');
    } else if (tab === 'réglages') {
      setCurrentScreen('s8_settings');
    }
  };

  // 3. Conservation et restauration du défilement
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    // Restaurer le scroll pour l'onglet actif
    const savedPos = scrollPositions.current[activeTab] || 0;
    element.scrollTop = savedPos;

    // Enregistrer la position pendant le scroll
    const handleScroll = () => {
      if (contentRef.current) {
        scrollPositions.current[activeTab] = contentRef.current.scrollTop;
      }
    };

    element.addEventListener('scroll', handleScroll);
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab]);

  // 4. Verrouillage par inactivité (Desktop uniquement >= 900px)
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const isDesktop = () => window.innerWidth >= 900;
    if (!pinHash) return;

    let warnTimer: any;
    let lockTimer: any;
    let countdownInterval: any;

    const resetTimers = () => {
      setShowInactivityWarning(false);
      setTimeLeft(30);

      clearTimeout(warnTimer);
      clearTimeout(lockTimer);
      clearInterval(countdownInterval);

      if (!isDesktop()) return;

      // Alerte après 2 min 30 (150 s)
      warnTimer = setTimeout(() => {
        setShowInactivityWarning(true);
        let count = 30;
        countdownInterval = setInterval(() => {
          count -= 1;
          setTimeLeft(count);
        }, 1000);
      }, 150000);

      // Verrouillage après 3 min (180 s)
      lockTimer = setTimeout(() => {
        // Vider l'état en mémoire et verrouiller
        setInputText('');
        setDetectedCategoryId(null);
        setCurrentScreen('s1_pin');
      }, 180000);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimers));

    resetTimers(); // Initialisation

    return () => {
      clearTimeout(warnTimer);
      clearTimeout(lockTimer);
      clearInterval(countdownInterval);
      events.forEach((event) => window.removeEventListener(event, resetTimers));
    };
  }, [pinHash, setCurrentScreen, setInputText, setDetectedCategoryId]);

  // 5. Touche Échap pour sortie rapide (Desktop uniquement >= 900px)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && window.innerWidth >= 900) {
        exitQuickly();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen relative bg-fond-base select-none">
      {/* ──────────────────────────────────────────────────────────
          1. HEADER (Mobile / Tablette < 900px)
          ────────────────────────────────────────────────────────── */}
      <header className="min-[900px]:hidden sticky top-0 bg-fond-carte border-b border-bordure h-[56px] flex items-center justify-between px-16 z-30 shadow-xs">
        {/* Zone de navigation d'onglets horizontaux glissants */}
        <nav className="flex-1 flex gap-16 overflow-x-auto scrollbar-none h-[48px] items-center" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'parler'}
            onClick={() => handleTabClick('parler')}
            className={`h-[48px] px-8 text-sm font-semibold flex items-center border-b-2 transition-all ${
              activeTab === 'parler'
                ? 'text-encre-forte border-primaire'
                : 'text-encre-douce border-transparent'
            }`}
          >
            {t('tabs.talk', 'Parler')}
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'aide'}
            onClick={() => handleTabClick('aide')}
            className={`h-[48px] px-8 text-sm font-semibold flex items-center border-b-2 transition-all ${
              activeTab === 'aide'
                ? 'text-encre-forte border-primaire'
                : 'text-encre-douce border-transparent'
            }`}
          >
            {t('tabs.help', 'Aide')}
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'droits'}
            onClick={() => handleTabClick('droits')}
            className={`h-[48px] px-8 text-sm font-semibold flex items-center border-b-2 transition-all ${
              activeTab === 'droits'
                ? 'text-encre-forte border-primaire'
                : 'text-encre-douce border-transparent'
            }`}
          >
            {t('tabs.rights', 'Droits')}
          </button>

          {carnetActif && (
            <button
              role="tab"
              aria-selected={activeTab === 'carnet'}
              onClick={() => handleTabClick('carnet')}
              className={`h-[48px] px-8 text-sm font-semibold flex items-center border-b-2 transition-all ${
                activeTab === 'carnet'
                  ? 'text-encre-forte border-primaire'
                  : 'text-encre-douce border-transparent'
              }`}
            >
              {t('tabs.notebook', 'Carnet')}
            </button>
          )}
        </nav>

        {/* Bouton de Réglages ancré à droite */}
        <button
          onClick={() => handleTabClick('réglages')}
          aria-label={t('settings.title')}
          className={`w-[48px] h-[48px] flex items-center justify-center text-encre-douce active:text-encre-forte transition-colors ml-8 rounded-full active:bg-fond-encart ${
            activeTab === 'réglages' ? 'text-primaire bg-fond-encart' : ''
          }`}
        >
          <svg className="w-20 h-20 fill-current" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>
      </header>

      {/* ──────────────────────────────────────────────────────────
          2. CORE CONTAINER (Mobile / Tablette / Desktop)
          ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Barre latérale gauche (Desktop uniquement >= 900px) */}
        <aside className="hidden min-[900px]:flex flex-col justify-between w-[240px] bg-fond-carte border-r border-bordure h-screen sticky top-0 p-24 select-none">
          <div className="flex flex-col gap-32">
            {/* Titre très discret pour collaborateurs */}
            <h1 className="font-titres text-lg font-bold text-primaire select-none">
              Mwaebara
            </h1>

            {/* Menu vertical */}
            <nav className="flex flex-col gap-8" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'parler'}
                onClick={() => handleTabClick('parler')}
                className={`h-[48px] px-16 text-sm font-semibold rounded-md flex items-center justify-start gap-12 transition-all text-left ${
                  activeTab === 'parler'
                    ? 'text-encre-forte bg-fond-encart border-l-4 border-primaire'
                    : 'text-encre-douce hover:bg-fond-encart/50'
                }`}
              >
                {t('tabs.talk', 'Parler')}
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'aide'}
                onClick={() => handleTabClick('aide')}
                className={`h-[48px] px-16 text-sm font-semibold rounded-md flex items-center justify-start gap-12 transition-all text-left ${
                  activeTab === 'aide'
                    ? 'text-encre-forte bg-fond-encart border-l-4 border-primaire'
                    : 'text-encre-douce hover:bg-fond-encart/50'
                }`}
              >
                {t('tabs.help', 'Aide')}
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'droits'}
                onClick={() => handleTabClick('droits')}
                className={`h-[48px] px-16 text-sm font-semibold rounded-md flex items-center justify-start gap-12 transition-all text-left ${
                  activeTab === 'droits'
                    ? 'text-encre-forte bg-fond-encart border-l-4 border-primaire'
                    : 'text-encre-douce hover:bg-fond-encart/50'
                }`}
              >
                {t('tabs.rights', 'Droits')}
              </button>

              {carnetActif && (
                <button
                  role="tab"
                  aria-selected={activeTab === 'carnet'}
                  onClick={() => handleTabClick('carnet')}
                  className={`h-[48px] px-16 text-sm font-semibold rounded-md flex items-center justify-start gap-12 transition-all text-left ${
                    activeTab === 'carnet'
                      ? 'text-encre-forte bg-fond-encart border-l-4 border-primaire'
                      : 'text-encre-douce hover:bg-fond-encart/50'
                  }`}
                >
                  {t('tabs.notebook', 'Carnet')}
                </button>
              )}

              <button
                role="tab"
                aria-selected={activeTab === 'réglages'}
                onClick={() => handleTabClick('réglages')}
                className={`h-[48px] px-16 text-sm font-semibold rounded-md flex items-center justify-start gap-12 transition-all text-left ${
                  activeTab === 'réglages'
                    ? 'text-encre-forte bg-fond-encart border-l-4 border-primaire'
                    : 'text-encre-douce hover:bg-fond-encart/50'
                }`}
              >
                {t('settings.title', 'Réglages')}
              </button>
            </nav>
          </div>

          {/* Bouton d'urgence 117 ancré au bas de la barre latérale */}
          <a
            href="tel:117"
            className="bg-danger text-texte-sur-fonce h-[72px] flex flex-col justify-center items-center rounded-md font-bold text-center select-none cursor-pointer transition-transform active:scale-95 text-base gap-4"
          >
            <span className="text-sm tracking-wider uppercase opacity-80">Urgence vitale</span>
            <span className="text-xl font-extrabold">Appeler le 117</span>
          </a>
        </aside>

        {/* Zone de contenu principale (limitée à 560px sur tablette, 680px sur desktop, centrée) */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Bouton de Sortie Rapide pour Desktop (>= 900px) */}
          <div className="hidden min-[900px]:block absolute top-24 right-24 z-30 text-center select-none">
            <button
              onClick={exitQuickly}
              aria-label={t('exit_quick')}
              className="w-48 h-48 bg-fond-carte border border-bordure text-danger rounded-full flex items-center justify-center shadow-md active:scale-95 active:bg-fond-encart transition-all"
            >
              <svg className="w-24 h-24 fill-current" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            <span className="text-[10px] text-encre-douce font-bold mt-4 block">
              Échap
            </span>
          </div>

          {/* Conteneur principal de défilement de contenu */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto w-full max-[599px]:px-20 min-[600px]:max-[899px]:max-w-[560px] min-[600px]:max-[899px]:mx-auto min-[900px]:max-w-[680px] min-[900px]:mx-auto min-[900px]:py-48 max-[899px]:pb-[72px] max-[899px]:pt-12"
          >
            {/* Transition de fondu selon le breakpoint */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: window.innerWidth >= 900 ? 0.14 : 0.18,
                  ease: 'easeInOut',
                }}
                className="flex flex-col min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. BANDE D'URGENCE FIXE (Mobile / Tablette < 900px)
          ────────────────────────────────────────────────────────── */}
      <div className="min-[900px]:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-danger text-texte-sur-fonce flex items-center justify-between px-20 z-40 shadow-lg pb-[env(safe-area-inset-bottom)] select-none">
        {/* Bouton d'urgence géant */}
        <a
          href="tel:117"
          className="flex-1 h-[48px] bg-fond-carte text-danger border border-transparent rounded-md flex items-center justify-center gap-8 font-bold active:bg-fond-encart transition-transform active:scale-95 touch-manipulation shadow-md"
        >
          <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          <span className="text-sm">Appeler le 117</span>
        </a>

        {/* Bouton sortie rapide */}
        <button
          onClick={exitQuickly}
          aria-label={t('exit_quick')}
          className="w-[48px] h-[48px] flex items-center justify-center text-texte-sur-fonce hover:text-fond-encart ml-16 active:scale-95 transition-all"
        >
          <svg className="w-24 h-24 fill-current" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────
          4. MODALE COMPTE À REBOURS INACTIVITÉ (Desktop)
          ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showInactivityWarning && (
          <div className="fixed inset-0 bg-encre-forte/60 backdrop-blur-xs flex items-center justify-center z-50 p-24 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-fond-carte p-32 rounded-lg border border-bordure max-w-[400px] w-full text-center shadow-2xl flex flex-col gap-20"
            >
              <h3 className="font-titres text-lg font-bold text-encre-forte">
                Session inactive
              </h3>
              <p className="text-sm text-encre-douce leading-relaxed">
                Par mesure de sécurité pour vos données, l'application se verrouillera automatiquement dans :
              </p>
              <div className="text-3xl font-extrabold text-danger">
                {timeLeft}s
              </div>
              <p className="text-xs text-encre-douce">
                Bougez la souris ou touchez l'écran pour rester connecté.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
