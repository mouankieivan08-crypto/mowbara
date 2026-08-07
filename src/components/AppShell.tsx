import React, { useEffect, useRef, useState } from 'react';
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
    carnetActif,
    pinHash,
  } = useAppState();

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});
  const [showInactivityWarning, setShowInactivityWarning] = useState<boolean>(false);

  // Verrouillage de sécurité par inactivité sur ordinateur partagé (cybercafés...)
  useEffect(() => {
    // Ne s'applique que sur écran Desktop (>= 900px)
    if (window.innerWidth < 900) return;

    let warningTimer: any;
    let lockTimer: any;

    const resetInactivityTimers = () => {
      setShowInactivityWarning(false);
      clearTimeout(warningTimer);
      clearTimeout(lockTimer);

      // Déclencher l'avertissement après 2m 30s (150s = 150000ms)
      warningTimer = setTimeout(() => {
        setShowInactivityWarning(true);
      }, 150000);

      // Déclencher le verrouillage automatique après 3m (180s = 180000ms)
      lockTimer = setTimeout(() => {
        setShowInactivityWarning(false);
        if (pinHash) {
          setCurrentScreen('s1_pin');
        } else {
          setCurrentScreen('s2_home');
        }
      }, 180000);
    };

    // Écouter les interactions de l'utilisatrice
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimers();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initialiser les timers au montage
    resetInactivityTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(lockTimer);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [pinHash, setCurrentScreen]);

  // Détecter l'onglet actif selon les 5 sections spécifiées :
  // parler (Infos) -> /a, aide -> /b, carnet -> /c, SOS -> /d, sécurité -> /e
  const getActiveTab = (screen: string): string => {
    if (['s2_home', 's3_analysis', 's4_results', 's5_law', 's9_guide'].includes(screen)) {
      return 'infos';
    }
    if (screen === 's7_directory') return 'aide';
    if (screen === 's12_carnet') return 'carnet';
    if (screen === 's6_emergency') return 'sos';
    if (['s8_settings', 's10_about'].includes(screen)) {
      return 'securite';
    }
    return 'infos';
  };

  const activeTab = getActiveTab(currentScreen);

  // Commutation d'onglets
  const handleTabClick = (tab: string) => {
    if (tab === 'infos') {
      setCurrentScreen('s2_home');
    } else if (tab === 'aide') {
      setCurrentScreen('s7_directory');
    } else if (tab === 'carnet') {
      setCurrentScreen('s12_carnet');
    } else if (tab === 'sos') {
      setCurrentScreen('s6_emergency');
    } else if (tab === 'securite') {
      setCurrentScreen('s8_settings');
    }
  };

  // Conservation et restauration du défilement
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const savedPos = scrollPositions.current[activeTab] || 0;
    element.scrollTop = savedPos;

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

  // Touche Échap pour sortie rapide (Desktop uniquement >= 900px)
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

  // Déterminer le titre de l'écran courant
  const getScreenTitle = (): string => {
    if (activeTab === 'infos') return t('home.title', 'Informations');
    if (activeTab === 'aide') return t('directory.title', 'Aide & Structures');
    if (activeTab === 'carnet') return t('notebook.title', 'Carnet de Notes');
    if (activeTab === 'sos') return t('emergency.title', 'Urgence SOS');
    if (activeTab === 'securite') return t('settings.title', 'Sécurité & Réglages');
    return 'Mwaebara';
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen relative bg-fond-base select-none">
      {/* Bannière d'avertissement d'inactivité pour ordinateur partagé */}
      {showInactivityWarning && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-attention text-texte-sur-fonce px-16 py-8 rounded-md text-xs font-bold shadow-lg z-50 animate-pulse border border-white/20">
          ⚠️ Inactivité détectée. Verrouillage de sécurité automatique dans 30 secondes.
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          1. HEADER PERSISTANT (Mobile / Tablette < 900px)
          ────────────────────────────────────────────────────────── */}
      <header className="min-[900px]:hidden sticky top-0 bg-fond-carte border-b border-bordure h-[44px] flex items-center justify-between px-16 z-30 shadow-xs">
        <h2 className="font-titres text-sm font-bold text-encre-forte truncate pr-8">
          {getScreenTitle()}
        </h2>

        <div className="flex items-center gap-6">
          {/* Bouton Réglages / Sécurité rapide */}
          <button
            onClick={() => handleTabClick('securite')}
            aria-label={t('settings.title')}
            className={`w-[32px] h-[32px] flex items-center justify-center text-encre-douce rounded-full active:bg-fond-encart ${
              activeTab === 'securite' ? 'text-primaire bg-fond-encart' : ''
            }`}
          >
            <svg className="w-18 h-18 fill-current" viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>

          {/* Bouton Sortie Rapide universel */}
          <button
            onClick={exitQuickly}
            aria-label={t('exit_quick')}
            className="w-[32px] h-[32px] flex items-center justify-center text-danger bg-fond-encart rounded-full active:scale-95 transition-all"
          >
            <svg className="w-18 h-18 fill-current" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          2. CORE CONTAINER (Mobile / Tablette / Desktop)
          ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Barre latérale gauche (Desktop uniquement >= 900px) */}
        <aside className="hidden min-[900px]:flex flex-col justify-between w-[240px] bg-fond-carte border-r border-bordure h-screen sticky top-0 p-24 select-none">
          <div className="flex flex-col gap-32">
            <h1 className="font-titres text-xl font-bold text-primaire select-none">
              Mwaebara
            </h1>

            {/* Menu vertical 5 onglets */}
            <nav className="flex flex-col gap-8" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'infos'}
                onClick={() => handleTabClick('infos')}
                className={`h-[48px] px-16 text-sm font-semibold rounded-md flex items-center justify-start gap-12 transition-all text-left ${
                  activeTab === 'infos'
                    ? 'text-encre-forte bg-fond-encart border-l-4 border-primaire'
                    : 'text-encre-douce hover:bg-fond-encart/50'
                }`}
              >
                {t('tabs.talk', 'Infos')}
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

              {/* SOS en danger rouge permanent */}
              <button
                role="tab"
                aria-selected={activeTab === 'sos'}
                onClick={() => handleTabClick('sos')}
                className={`h-[48px] px-16 text-sm font-bold rounded-md flex items-center justify-start gap-12 transition-all text-left ${
                  activeTab === 'sos'
                    ? 'text-danger bg-danger/10 border-l-4 border-danger'
                    : 'text-danger/80 hover:bg-danger/5'
                }`}
              >
                {t('tabs.emergency', 'SOS')}
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'securite'}
                onClick={() => handleTabClick('securite')}
                className={`h-[48px] px-16 text-sm font-semibold rounded-md flex items-center justify-start gap-12 transition-all text-left ${
                  activeTab === 'securite'
                    ? 'text-encre-forte bg-fond-encart border-l-4 border-primaire'
                    : 'text-encre-douce hover:bg-fond-encart/50'
                }`}
              >
                {t('settings.title', 'Sécurité')}
              </button>
            </nav>
          </div>

          <a
            href="tel:117"
            className="bg-danger text-texte-sur-fonce h-[72px] flex flex-col justify-center items-center rounded-md font-bold text-center select-none cursor-pointer transition-transform active:scale-95 text-base gap-4"
          >
            <span className="text-xs tracking-wider uppercase opacity-80">Urgence vitale</span>
            <span className="text-lg font-extrabold">Appeler le 117</span>
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
            className="flex-1 overflow-y-auto w-full max-[599px]:p-12 min-[600px]:p-20 max-[599px]:pb-[64px] min-[600px]:max-[899px]:pb-[72px] max-[899px]:pt-8 min-[600px]:max-[899px]:max-w-[560px] min-[600px]:max-[899px]:mx-auto min-[900px]:max-w-[680px] min-[900px]:mx-auto min-[900px]:py-48"
          >
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
          3. BARRE D'ONGLETS PERSISTANTE BASSE (Mobile / Tablette < 900px)
          ────────────────────────────────────────────────────────── */}
      <nav
        className="min-[900px]:hidden fixed bottom-0 left-0 right-0 h-[52px] bg-fond-carte border-t border-bordure flex items-center justify-around z-40 pb-[env(safe-area-inset-bottom)] select-none shadow-md"
        role="tablist"
      >
        {/* Onglet 1 : Infos */}
        <button
          role="tab"
          aria-selected={activeTab === 'infos'}
          onClick={() => handleTabClick('infos')}
          className="flex flex-col items-center justify-center w-full h-full gap-2 text-center active:scale-95 transition-transform"
        >
          <svg
            className={`w-20 h-20 fill-current ${
              activeTab === 'infos' ? 'text-primaire' : 'text-encre-douce'
            }`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <span
            className={`text-[10px] font-bold ${
              activeTab === 'infos' ? 'text-primaire' : 'text-encre-douce'
            }`}
          >
            Infos
          </span>
        </button>

        {/* Onglet 2 : Aide */}
        <button
          role="tab"
          aria-selected={activeTab === 'aide'}
          onClick={() => handleTabClick('aide')}
          className="flex flex-col items-center justify-center w-full h-full gap-2 text-center active:scale-95 transition-transform"
        >
          <svg
            className={`w-20 h-20 fill-current ${
              activeTab === 'aide' ? 'text-primaire' : 'text-encre-douce'
            }`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span
            className={`text-[10px] font-bold ${
              activeTab === 'aide' ? 'text-primaire' : 'text-encre-douce'
            }`}
          >
            Aide
          </span>
        </button>

        {/* Onglet 3 : Carnet (Conditionnel : absent du DOM si inactif) */}
        {carnetActif && (
          <button
            role="tab"
            aria-selected={activeTab === 'carnet'}
            onClick={() => handleTabClick('carnet')}
            className="flex flex-col items-center justify-center w-full h-full gap-2 text-center active:scale-95 transition-transform"
          >
            <svg
              className={`w-20 h-20 fill-current ${
                activeTab === 'carnet' ? 'text-primaire' : 'text-encre-douce'
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            <span
              className={`text-[10px] font-bold ${
                activeTab === 'carnet' ? 'text-primaire' : 'text-encre-douce'
              }`}
            >
              Carnet
            </span>
          </button>
        )}

        {/* Onglet 4 : SOS (Urgence, toujours en rouge danger !) */}
        <button
          role="tab"
          aria-selected={activeTab === 'sos'}
          onClick={() => handleTabClick('sos')}
          className="flex flex-col items-center justify-center w-full h-full gap-2 text-center active:scale-95 transition-transform"
        >
          <svg className="w-20 h-20 fill-current text-danger" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span className="text-[10px] font-bold text-danger">SOS</span>
        </button>

        {/* Onglet 5 : Sécurité */}
        <button
          role="tab"
          aria-selected={activeTab === 'securite'}
          onClick={() => handleTabClick('securite')}
          className="flex flex-col items-center justify-center w-full h-full gap-2 text-center active:scale-95 transition-transform"
        >
          <svg
            className={`w-20 h-20 fill-current ${
              activeTab === 'securite' ? 'text-primaire' : 'text-encre-douce'
            }`}
            viewBox="0 0 24 24"
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
          <span
            className={`text-[10px] font-bold ${
              activeTab === 'securite' ? 'text-primaire' : 'text-encre-douce'
            }`}
          >
            Sécurité
          </span>
        </button>
      </nav>
    </div>
  );
};
