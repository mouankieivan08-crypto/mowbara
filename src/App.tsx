import React from 'react';
import { useAppState } from './AppStateContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScreenPIN } from './routes/ScreenPIN';
import { ScreenHome } from './routes/ScreenHome';
import { ScreenAnalysis } from './routes/ScreenAnalysis';
import { ScreenResults } from './routes/ScreenResults';
import { ScreenLaw } from './routes/ScreenLaw';
import { ScreenEmergency } from './routes/ScreenEmergency';
import { ScreenDirectory } from './routes/ScreenDirectory';
import { ScreenSettings } from './routes/ScreenSettings';
import { ScreenGuide } from './routes/ScreenGuide';
import { ScreenAbout } from './routes/ScreenAbout';

export const AppContent: React.FC = () => {
  const { currentScreen } = useAppState();

  // RÈGLE 21 : Chaque écran reste utilisable à 200 % de zoom navigateur sans troncature ni chevauchement.
  // RÈGLE 1 & 23 : Transitions fluides, sorties de 0 ms rapides.
  return (
    <main className="flex-1 flex flex-col justify-between w-full max-w-[360px] mx-auto min-h-screen relative overflow-hidden bg-fond-base shadow-lg">
      {currentScreen === 's1_pin' && <ScreenPIN />}
      {currentScreen === 's2_home' && <ScreenHome />}
      {currentScreen === 's3_analysis' && <ScreenAnalysis />}
      {currentScreen === 's4_results' && <ScreenResults />}
      {currentScreen === 's5_law' && <ScreenLaw />}
      {currentScreen === 's6_emergency' && <ScreenEmergency />}
      {currentScreen === 's7_directory' && <ScreenDirectory />}
      {currentScreen === 's8_settings' && <ScreenSettings />}
      {currentScreen === 's9_guide' && <ScreenGuide />}
      {currentScreen === 's10_about' && <ScreenAbout />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
