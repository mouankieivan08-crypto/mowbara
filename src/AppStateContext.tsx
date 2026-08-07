import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppStateContextProps {
  pinHash: string | null;
  setPinHash: (hash: string | null) => void;
  langue: string;
  setLangue: (l: string) => void;
  textSize: string; // 'base' | 'lg' | 'xl'
  setTextSize: (s: string) => void;
  currentScreen: string; // 's1_pin' | 's2_home' | 's3_analysis' | ...
  setCurrentScreen: (screen: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  detectedCategoryId: string | null;
  setDetectedCategoryId: (id: string | null) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  carnetActif: boolean;
  setCarnetActif: (actif: boolean) => void;
  favorites: string[]; // List of favorite article IDs
  setFavorites: (favs: string[]) => void;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pinHash, setPinHashState] = useState<string | null>(() => localStorage.getItem('pin_hash'));
  const [langue, setLangueState] = useState<string>(() => localStorage.getItem('langue') || 'fr');
  const [textSize, setTextSizeState] = useState<string>(() => localStorage.getItem('taille_texte') || 'base');

  // RÈGLE ABSOLUE 4 : Aucune écriture dans localStorage hors des 3 clés autorisées (pin_hash, langue, taille_texte)
  // carnetActif et favoris vivent exclusivement en mémoire React durant la session.
  const [carnetActif, setCarnetActifState] = useState<boolean>(false);
  const [favorites, setFavoritesState] = useState<string[]>([]);

  const [currentScreen, setCurrentScreenState] = useState<string>(() => {
    const storedPin = localStorage.getItem('pin_hash');
    return storedPin ? 's1_pin' : 's2_home';
  });
  const [inputText, setInputText] = useState<string>('');
  const [detectedCategoryId, setDetectedCategoryId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Intercepter le bouton de retour physique Android ou navigateur de façon réglementaire
  // RÈGLE ABSOLUE 2 : Toute navigation interne utilise history.replaceState, jamais pushState.
  useEffect(() => {
    const handlePopState = () => {
      // Forcer le maintien sur le même écran neutre via replaceState
      window.history.replaceState(null, '', window.location.pathname);
    };

    window.history.replaceState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // RÈGLE 7.b : Pas d'invite d'installation PWA sur Desktop
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      if (!isTouch) {
        e.preventDefault(); // Annuler l'affichage sur ordinateur partagé
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const setPinHash = (hash: string | null) => {
    if (hash) {
      localStorage.setItem('pin_hash', hash);
    } else {
      localStorage.removeItem('pin_hash');
    }
    setPinHashState(hash);
  };

  const setLangue = (l: string) => {
    localStorage.setItem('langue', l);
    setLangueState(l);
  };

  const setTextSize = (s: string) => {
    localStorage.setItem('taille_texte', s);
    setTextSizeState(s);
  };

  const setCarnetActif = (actif: boolean) => {
    setCarnetActifState(actif);
  };

  const setFavorites = (favs: string[]) => {
    setFavoritesState(favs);
  };

  const setCurrentScreen = (screen: string) => {
    let routeSegment = '/a';

    // MAPPAGE EXPLICITE DES SEGMENTS NEUTRES DU CONGO :
    // parler (Infos) -> /a, aide -> /b, carnet -> /c, SOS -> /d, sécurité -> /e
    if (['s2_home', 's3_analysis', 's4_results', 's5_law', 's9_guide'].includes(screen)) {
      routeSegment = '/a'; // Infos
    } else if (screen === 's1_pin') {
      routeSegment = '/a'; // verrou
    } else if (screen === 's7_directory') {
      routeSegment = '/b'; // Aide
    } else if (screen === 's12_carnet') {
      routeSegment = '/c'; // Carnet
    } else if (screen === 's6_emergency') {
      routeSegment = '/d'; // SOS (Urgence)
    } else if (['s8_settings', 's10_about'].includes(screen)) {
      routeSegment = '/e'; // Sécurité (Réglages)
    }

    window.history.replaceState(null, '', routeSegment);
    setCurrentScreenState(screen);
  };

  return (
    <AppStateContext.Provider
      value={{
        pinHash,
        setPinHash,
        langue,
        setLangue,
        textSize,
        setTextSize,
        currentScreen,
        setCurrentScreen,
        inputText,
        setInputText,
        detectedCategoryId,
        setDetectedCategoryId,
        isOffline,
        setIsOffline,
        carnetActif,
        setCarnetActif,
        favorites,
        setFavorites,
      }}
    >
      <div className={`font-interface text-encre-forte h-[100dvh] bg-fond-base flex flex-col antialiased select-none overscroll-none text-${textSize} overflow-hidden`}>
        {children}
      </div>
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
