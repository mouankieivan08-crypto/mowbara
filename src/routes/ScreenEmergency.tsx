import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { Bouton } from '../components/Bouton';

export const ScreenEmergency: React.FC = () => {
  const { t } = useTranslation();
  const { setCurrentScreen, setInputText, setDetectedCategoryId } = useAppState();

  const handleBack = () => {
    // Réinitialiser la situation en cours pour sécurité
    setInputText('');
    setDetectedCategoryId(null);
    setCurrentScreen('s2_home');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-20 select-none bg-fond-base">
      <div className="flex flex-col gap-24 mt-24">
        {/* En-tête d'alerte neutre sans logo */}
        <div className="flex flex-col gap-8 text-center">
          <span className="text-danger font-titres text-2xl font-bold uppercase tracking-wider block">
            {t('emergency.title')}
          </span>
          <p className="text-sm text-encre-douce font-semibold">
            {t('emergency.vital_danger')}
          </p>
        </div>

        {/* Instructions de sécurité vitales */}
        <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-12">
          <h3 className="font-titres text-base font-bold text-encre-forte">
            {t('emergency.instructions_title')}
          </h3>
          <ul className="list-disc pl-16 text-sm text-encre-forte flex flex-col gap-8 leading-relaxed">
            <li>{t('emergency.instruction_1')}</li>
            <li>{t('emergency.instruction_2')}</li>
            <li>{t('emergency.instruction_3')}</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-16 mb-24">
        {/* RÈGLE ABSOLUE : Le rouge #B3261E est réservé au danger vital et au 117. */}
        <a
          href="tel:117"
          className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center gap-8 bg-danger text-texte-sur-fonce active:opacity-90 transition-transform active:scale-95 touch-manipulation text-lg"
        >
          <svg className="w-20 h-20 fill-current animate-pulse" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          {t('emergency.call_police_btn')}
        </a>

        {/* Option secondaire 1444 */}
        <a
          href="tel:1444"
          className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center gap-8 bg-primaire text-texte-sur-fonce active:bg-primaire-contact transition-transform active:scale-95 touch-manipulation text-base"
        >
          {t('emergency.call_1444_btn')}
        </a>

        <Bouton variant="secondaire" onClick={handleBack}>
          {t('emergency.back_to_app')}
        </Bouton>

        {/* Bouton de sortie rapide en bas */}
        <Bouton variant="danger" onClick={exitQuickly} className="mt-8">
          {t('exit_quick')}
        </Bouton>
      </div>
    </div>
  );
};
