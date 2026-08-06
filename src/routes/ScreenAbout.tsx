import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { Bouton } from '../components/Bouton';

export const ScreenAbout: React.FC = () => {
  const { t } = useTranslation();
  const { setCurrentScreen } = useAppState();

  return (
    <div className="flex-1 flex flex-col justify-between p-20 select-none bg-fond-base overflow-y-auto">
      <div className="flex flex-col gap-24 mt-8">
        <div className="flex items-center justify-between border-b border-bordure pb-12">
          <h2 className="font-titres text-xl font-bold text-encre-forte">
            {t('about.title')}
          </h2>
          <button
            onClick={() => setCurrentScreen('s8_settings')}
            className="text-sm font-bold text-primaire active:text-primaire-contact min-h-[48px] px-8 py-4 touch-manipulation"
          >
            {t('legal.back')}
          </button>
        </div>

        {/* Charte de confidentialité et sécurité */}
        <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-12 text-sm leading-relaxed text-encre-forte">
          <h3 className="font-titres text-base font-bold text-encre-forte">
            {t('about.privacy_policy_title')}
          </h3>
          <p>{t('about.privacy_policy_body')}</p>
        </div>

        <div className="text-center text-xs text-encre-douce mt-8">
          <p>{t('about.app_version')}</p>
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
