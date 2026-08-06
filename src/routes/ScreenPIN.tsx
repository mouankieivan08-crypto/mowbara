import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { hashPin, verifyPin } from '../services/pinCrypto';
import { exitQuickly } from '../exit';
import { Bouton } from '../components/Bouton';

export const ScreenPIN: React.FC = () => {
  const { t } = useTranslation();
  const { pinHash, setPinHash, setCurrentScreen } = useAppState();

  // États du verrou
  const [step, setStep] = useState<'create' | 'confirm' | 'unlock'>(
    pinHash ? 'unlock' : 'create'
  );
  const [pin, setPin] = useState<string>('');
  const [firstPin, setFirstPin] = useState<string>(''); // Stockage temporaire en mémoire
  const [errorMessage, setErrorMessage] = useState<string>('');

  // États de blocage
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTime, setLockoutTime] = useState<number>(0); // En secondes

  // Gérer le compte à rebours de blocage
  useEffect(() => {
    if (lockoutTime <= 0) return;
    const timer = setInterval(() => {
      setLockoutTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleKeyPress = async (num: string) => {
    if (lockoutTime > 0) return;
    setErrorMessage('');

    const newPin = pin + num;
    if (newPin.length > 4) return;

    setPin(newPin);

    if (newPin.length === 4) {
      // Attendre 150ms pour que l'utilisatrice voie le dernier point se remplir
      setTimeout(async () => {
        if (step === 'create') {
          setFirstPin(newPin);
          setPin('');
          setStep('confirm');
        } else if (step === 'confirm') {
          if (newPin === firstPin) {
            const hash = await hashPin(newPin);
            setPinHash(hash);
            setCurrentScreen('s2_home');
          } else {
            setErrorMessage(t('pin.error_mismatch'));
            setPin('');
            setFirstPin('');
            setStep('create');
          }
        } else if (step === 'unlock') {
          if (pinHash) {
            const isValid = await verifyPin(newPin, pinHash);
            if (isValid) {
              setFailedAttempts(0);
              setCurrentScreen('s2_home');
            } else {
              const newAttempts = failedAttempts + 1;
              setFailedAttempts(newAttempts);
              setPin('');

              if (newAttempts >= 6) {
                // RÈGLE : 6 échecs -> blocage 5 min (300 s)
                setLockoutTime(300);
              } else if (newAttempts >= 3) {
                // RÈGLE : 3 échecs -> blocage 30 s
                setLockoutTime(30);
              } else {
                setErrorMessage("Code PIN incorrect. Veuillez réessayer.");
              }
            }
          }
        }
      }, 150);
    }
  };

  const handleBackspace = () => {
    if (lockoutTime > 0) return;
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSkip = () => {
    // RÈGLE : Option "Ignorer le code" à la création
    setCurrentScreen('s2_home');
  };

  // Titres et sous-titres dynamiques
  let title = '';
  let subtitle = '';

  if (step === 'create') {
    title = t('pin.create_title');
    subtitle = t('pin.create_subtitle');
  } else if (step === 'confirm') {
    title = t('pin.confirm_title');
    subtitle = t('pin.confirm_subtitle');
  } else if (step === 'unlock') {
    // RÈGLE ABSOLUE : L'écran verrou ne comporte ni logo, ni nom d'app, ni icône identifiable.
    title = t('pin.enter_pin');
    subtitle = '';
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-20 select-none bg-fond-base">
      <div className="flex flex-col gap-16 mt-24 text-center">
        <h2 className="font-titres text-xl font-bold text-encre-forte">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-encre-douce leading-relaxed px-12">
            {subtitle}
          </p>
        )}

        {/* Représentation visuelle des 4 points ronds */}
        <div className="flex justify-center gap-16 my-24">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded-full border border-encre-forte transition-colors duration-100 ${
                pin.length > index ? 'bg-encre-forte' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {errorMessage && (
          <span className="text-sm text-attention font-bold block">
            {errorMessage}
          </span>
        )}

        {lockoutTime > 0 && (
          <span className="text-sm text-danger font-bold block px-16">
            {t('pin.locked', { seconds: lockoutTime })}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-24 mb-24">
        {/* Pavé numérique tactile custom (cibles de 64x64 px) */}
        <div className="grid grid-cols-3 gap-16 max-w-[280px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="w-64 h-64 rounded-full bg-fond-carte border border-bordure text-encre-forte font-bold text-xl flex items-center justify-center active:bg-fond-encart transition-colors duration-700 active:scale-95 touch-manipulation shadow-xs"
            >
              {num}
            </button>
          ))}

          {/* Touche gauche (Ignorer ou vide) */}
          {step === 'create' ? (
            <button
              type="button"
              onClick={handleSkip}
              className="w-64 h-64 text-xs font-bold text-encre-douce flex items-center justify-center active:scale-95 touch-manipulation"
            >
              {t('pin.skip')}
            </button>
          ) : (
            <div className="w-64 h-64" />
          )}

          {/* Touche 0 */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="w-64 h-64 rounded-full bg-fond-carte border border-bordure text-encre-forte font-bold text-xl flex items-center justify-center active:bg-fond-encart transition-colors duration-700 active:scale-95 touch-manipulation shadow-xs"
          >
            0
          </button>

          {/* Touche Retour arrière (Backspace) */}
          <button
            type="button"
            onClick={handleBackspace}
            className="w-64 h-64 text-encre-forte font-bold flex items-center justify-center active:scale-95 touch-manipulation"
          >
            <svg className="w-24 h-24 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
            </svg>
          </button>
        </div>

        {step === 'create' && (
          <p className="text-xs text-encre-douce text-center leading-relaxed px-16">
            {t('pin.warning_no_recovery')}
          </p>
        )}

        {/* Bouton de sortie rapide discret toujours présent */}
        <Bouton variant="danger" onClick={exitQuickly} className="mt-8">
          {t('exit_quick')}
        </Bouton>
      </div>
    </div>
  );
};
