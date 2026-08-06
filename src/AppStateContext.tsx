import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppStateContextProps {
  pinHash: string | null;
  setPinHash: (hash: string | null) => void;
  langue: string;
  setLangue: (l: string) => void;
  textSize: string; // 'base' | 'lg' | 'xl'
  setTextSize: (s: string) => void;
  currentScreen: string; // 's1_pin' | 's2_home' | 's3_analysis' | 's4_results' | 's5_law' | 's6_emergency' | 's7_directory' | 's8_settings' | 's9_guide' | 's10_about'
  setCurrentScreen: (screen: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  detectedCategoryId: string | null;
  setDetectedCategoryId: (id: string | null) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pinHash, setPinHashState] = useState<string | null>(() => localStorage.getItem('pin_hash'));
  const [langue, setLangueState] = useState<string>(() => localStorage.getItem('langue') || 'fr');
  const [textSize, setTextSizeState] = useState<string>(() => localStorage.getItem('taille_texte') || 'base');
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

  const setCurrentScreen = (screen: string) => {
    let routeSegment = '/a';
    if (screen === 's1_pin') routeSegment = '/a';
    else if (screen === 's2_home') routeSegment = '/b';
    else if (screen === 's3_analysis') routeSegment = '/c';
    else if (screen === 's4_results') routeSegment = '/r/1';
    else if (screen === 's5_law') routeSegment = '/r/2';
    else if (screen === 's6_emergency') routeSegment = '/e';
    else if (screen === 's7_directory') routeSegment = '/d';
    else if (screen === 's8_settings') routeSegment = '/s';
    else if (screen === 's9_guide') routeSegment = '/g';
    else if (screen === 's10_about') routeSegment = '/m';

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
      }}
    >
      <div className={`font-interface text-encre-forte min-h-screen bg-fond-base flex flex-col antialiased select-none overscroll-none text-${textSize}`}>
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
