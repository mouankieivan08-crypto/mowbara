import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { Bouton } from '../components/Bouton';

export const ScreenSettings: React.FC = () => {
  const { t } = useTranslation();
  const { textSize, setTextSize, setCurrentScreen, setPinHash } = useAppState();

  const handleResetPin = () => {
    setPinHash(null);
    alert(t('settings.pin_disabled_success'));
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-20 select-none bg-fond-base overflow-y-auto">
      <div className="flex flex-col gap-24 mt-8">
        <div className="flex items-center justify-between border-b border-bordure pb-12">
          <h2 className="font-titres text-xl font-bold text-encre-forte">
            {t('settings.title')}
          </h2>
          <button
            onClick={() => setCurrentScreen('s2_home')}
            className="text-sm font-bold text-primaire active:text-primaire-contact min-h-[48px] px-8 py-4 touch-manipulation"
          >
            {t('legal.back')}
          </button>
        </div>

        {/* Configuration de la taille du texte */}
        <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-12">
          <span className="text-sm font-bold text-encre-douce uppercase tracking-wider">
            {t('settings.text_size')}
          </span>
          <div className="grid grid-cols-3 gap-8">
            {['base', 'lg', 'xl'].map((size) => {
              const isActive = textSize === size;
              return (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`px-12 py-12 rounded-md font-bold text-sm min-h-[48px] touch-manipulation ${
                    isActive
                      ? 'bg-primaire text-texte-sur-fonce'
                      : 'bg-fond-encart text-encre-forte border border-bordure active:bg-fond-base'
                  }`}
                >
                  {size === 'base'
                    ? t('settings.size_normal')
                    : size === 'lg'
                    ? t('settings.size_large')
                    : t('settings.size_xlarge')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration de la langue (Français unique sur ce MVP) */}
        <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-8">
          <span className="text-sm font-bold text-encre-douce uppercase tracking-wider">
            {t('settings.language')}
          </span>
          <div className="p-12 bg-fond-encart text-sm font-bold rounded-md border border-bordure flex justify-between items-center">
            <span>{t('settings.lang_fr')}</span>
            <span className="text-xs text-primaire font-semibold uppercase">{t('results.verified')}</span>
          </div>
        </div>

        {/* Gestion du PIN */}
        <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-12">
          <span className="text-sm font-bold text-encre-douce uppercase tracking-wider">
            {t('settings.pin_lock')}
          </span>
          <Bouton variant="secondaire" onClick={handleResetPin}>
            {t('settings.reset_pin_btn')}
          </Bouton>
        </div>

        {/* Guide d'orientation et À propos */}
        <div className="flex flex-col gap-8">
          <Bouton variant="secondaire" onClick={() => setCurrentScreen('s9_guide')}>
            {t('directory.filter_juridique')} (Guide)
          </Bouton>
          <Bouton variant="secondaire" onClick={() => setCurrentScreen('s10_about')}>
            {t('about.title')}
          </Bouton>
        </div>
      </div>

      <div className="flex flex-col gap-12 mt-32 mb-24">
        <Bouton variant="primaire" onClick={() => setCurrentScreen('s2_home')}>
          {t('emergency.back_to_app')}
        </Bouton>
        <Bouton variant="secondaire" onClick={exitQuickly}>
          {t('exit_quick')}
        </Bouton>
      </div>
    </div>
  );
};
