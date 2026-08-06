import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { CarteLoi } from '../components/CarteLoi';
import { Bouton } from '../components/Bouton';
import categoriesData from '../../data/categories.json';

export const ScreenLaw: React.FC = () => {
  const { t } = useTranslation();
  const { detectedCategoryId, setCurrentScreen } = useAppState();

  const categoryInfo = categoriesData.find(c => c.id === detectedCategoryId) || categoriesData[0];

  return (
    <div className="flex-1 flex flex-col justify-between p-20 select-none bg-fond-base overflow-y-auto">
      <div className="flex flex-col gap-24 mt-8">
        <div className="flex items-center justify-between border-b border-bordure pb-12">
          <h2 className="font-titres text-xl font-bold text-encre-forte">
            {t('legal.title')}
          </h2>
          <button
            onClick={() => setCurrentScreen('s4_results')}
            className="text-sm font-bold text-primaire active:text-primaire-contact min-h-[48px] px-8 py-4 touch-manipulation"
          >
            {t('legal.back')}
          </button>
        </div>

        <CarteLoi
          titre={categoryInfo.titre}
          loi={categoryInfo.loi_congolaise}
          peines={categoryInfo.peines}
        />
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
