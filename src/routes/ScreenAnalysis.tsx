import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { logger } from '../logger';
import { Bouton } from '../components/Bouton';

export const ScreenAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const { inputText, setCurrentScreen, setDetectedCategoryId, isOffline } = useAppState();

  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');

  useEffect(() => {
    // Seuil d'affichage du skeleton à 200 ms pour éviter le clignotement
    const skeletonTimer = setTimeout(() => {
      setShowSkeleton(true);
    }, 200);

    return () => clearTimeout(skeletonTimer);
  }, []);

  const runAnalysis = async (currentAttempt: number) => {
    try {
      setErrorState(false);
      setStatusText(t('analysis.processing_sub'));

      // Simulation d'une requête réseau vers l'API
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // Si l'utilisatrice tape "force_error", on simule une erreur réseau systématique
          if (inputText.toLowerCase().includes('force_error')) {
            reject(new Error('Simulated API/Network Error'));
          } else {
            resolve();
          }
        }, 1500); // 1.5 s de simulation de chargement
      });

      // Classification réussie
      const textLower = inputText.toLowerCase();
      let category = 'violence_domestique';

      // Si le message est trop court ou évasif, on simule une "classification incertaine"
      if (inputText.trim().length < 8) {
        category = 'incertain';
      } else if (textLower.includes('viol') || textLower.includes('sexuel') || textLower.includes('forcer')) {
        category = 'agression_sexuelle';
      } else if (textLower.includes('menace') || textLower.includes('harcele') || textLower.includes('suivre')) {
        category = 'harcelement';
      }

      setDetectedCategoryId(category);
      setCurrentScreen('s4_results');

    } catch (err) {
      logger.error(`Échec de l'analyse (tentative ${currentAttempt + 1})`, err);

      if (currentAttempt < 2) {
        // Retry avec Backoff Exponentiel : wait Math.pow(2, currentAttempt) * 1000 ms (1s, puis 2s)
        const delay = Math.pow(2, currentAttempt) * 1000;
        setStatusText(`Échec de connexion. Nouvelle tentative dans ${delay / 1000}s...`);

        setTimeout(() => {
          runAnalysis(currentAttempt + 1);
        }, delay);
      } else {
        // Plus de tentatives : Bascule sur l'état d'erreur permanent
        setErrorState(true);
      }
    }
  };

  useEffect(() => {
    if (isOffline) {
      setErrorState(true);
      return;
    }
    runAnalysis(0);
  }, [isOffline]);

  const handleRetry = () => {
    setErrorState(false);
    runAnalysis(0);
  };

  if (errorState) {
    return (
      <div className="flex-1 flex flex-col justify-between p-20 select-none bg-fond-base">
        <div className="flex flex-col gap-24 mt-24 text-center">
          <h2 className="font-titres text-xl font-bold text-danger">
            {t('error.title')}
          </h2>
          <p className="text-sm text-encre-douce leading-relaxed px-12">
            {t('error.body')}
          </p>

          {/* RÈGLE CENTRALE : toute erreur affiche le 117 et le 1444 en dur. */}
          <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-12 mt-16 max-w-[320px] mx-auto w-full">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block text-center">
              Numéros de secours indispensables
            </span>
            <a
              href="tel:117"
              className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center gap-8 bg-danger text-texte-sur-fonce active:opacity-90 transition-transform active:scale-95 touch-manipulation text-base"
            >
              Appeler la Police (117)
            </a>
            <a
              href="tel:1444"
              className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center gap-8 bg-primaire text-texte-sur-fonce active:bg-primaire-contact transition-transform active:scale-95 touch-manipulation text-base"
            >
              Appeler l'écoute (1444)
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-12 mb-24">
          <Bouton variant="primaire" onClick={handleRetry}>
            {t('error.retry_btn')}
          </Bouton>
          <Bouton variant="secondaire" onClick={() => setCurrentScreen('s2_home')}>
            {t('emergency.back_to_app')}
          </Bouton>
          <Bouton variant="danger" onClick={exitQuickly}>
            {t('exit_quick')}
          </Bouton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-20 select-none bg-fond-base">
      <div className="flex flex-col gap-24 mt-24">
        <h2 className="font-titres text-xl font-bold text-encre-forte text-center">
          {t('analysis.processing')}
        </h2>

        {/* Rappel de la situation */}
        <div className="bg-fond-encart border border-bordure p-16 rounded-md text-sm text-encre-douce italic">
          "{inputText}"
        </div>

        <p className="text-xs text-encre-douce text-center font-medium">
          {statusText}
        </p>

        {/* RÈGLE : Pendant l'analyse IA : bulle « trois points » statique, sans animation en boucle */}
        {!showSkeleton ? (
          <div className="flex justify-start">
            <div className="bg-fond-carte border border-bordure rounded-lg p-16 rounded-bl-none text-encre-douce flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-encre-douce opacity-40" />
              <span className="w-8 h-8 rounded-full bg-encre-douce opacity-60" />
              <span className="w-8 h-8 rounded-full bg-encre-douce opacity-80" />
            </div>
          </div>
        ) : (
          /* RÈGLE : Skeletons : pulsation d'opacity 1.4 s — jamais de shimmer en dégradé animé. Carte de résultat = 4 lignes de largeurs inégales. */
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col gap-12"
          >
            <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-12">
              <div className="h-16 bg-fond-encart rounded-sm w-3/4" />
              <div className="h-12 bg-fond-encart rounded-sm w-full" />
              <div className="h-12 bg-fond-encart rounded-sm w-5/6" />
              <div className="h-12 bg-fond-encart rounded-sm w-1/2" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-col gap-12 mb-24">
        <Bouton variant="secondaire" onClick={exitQuickly}>
          {t('exit_quick')}
        </Bouton>
      </div>
    </div>
  );
};
