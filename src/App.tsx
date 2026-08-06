import React from 'react';
import { useAppState } from './AppStateContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/AppShell';
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
import { ScreenCarnet } from './routes/ScreenCarnet';

export const AppContent: React.FC = () => {
  const { currentScreen } = useAppState();

  // Écran PIN verrouillé autonome (ultra discret, aucun header ni logo ni onglets)
  if (currentScreen === 's1_pin') {
    return (
      <main className="flex-1 flex flex-col justify-between w-full min-h-screen relative overflow-hidden bg-fond-base max-w-[390px] mx-auto md:border md:border-bordure md:rounded-lg md:shadow-xl md:my-24 md:h-[840px] md:max-h-[90vh]">
        <ScreenPIN />
      </main>
    );
  }

  // RÈGLE : Tous les autres écrans sont enveloppés dans l'AppShell responsive universelle
  return (
    <AppShell>
      {currentScreen === 's2_home' && <ScreenHome />}
      {currentScreen === 's3_analysis' && <ScreenAnalysis />}
      {currentScreen === 's4_results' && <ScreenResults />}
      {currentScreen === 's5_law' && <ScreenLaw />}
      {currentScreen === 's6_emergency' && <ScreenEmergency />}
      {currentScreen === 's7_directory' && <ScreenDirectory />}
      {currentScreen === 's8_settings' && <ScreenSettings />}
      {currentScreen === 's9_guide' && <ScreenGuide />}
      {currentScreen === 's10_about' && <ScreenAbout />}
      {currentScreen === 's12_carnet' && <ScreenCarnet />}
    </AppShell>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-fond-base select-none">
        <AppContent />
      </div>
    </ErrorBoundary>
  );
};

export default App;
