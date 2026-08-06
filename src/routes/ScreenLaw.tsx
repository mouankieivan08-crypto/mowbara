import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { CarteLoi } from '../components/CarteLoi';
import { Bouton } from '../components/Bouton';
import categoriesData from '../../data/categories.json';

export const ScreenLaw: React.FC = () => {
  const { t } = useTranslation();
  const { detectedCategoryId, setCurrentScreen, favorites, setFavorites } = useAppState();

  const categoryInfo = categoriesData.find(c => c.id === detectedCategoryId) || categoriesData[0];
  const isFav = favorites.includes(categoryInfo.id);

  const toggleFavorite = () => {
    if (isFav) {
      setFavorites(favorites.filter(f => f !== categoryInfo.id));
    } else {
      setFavorites([...favorites, categoryInfo.id]);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between select-none bg-fond-base min-h-full">
      <div className="flex flex-col gap-24">
        <div className="flex items-center justify-between border-b border-bordure pb-12">
          <h2 className="font-titres text-lg font-bold text-encre-forte">
            Détail de la loi
          </h2>
          <div className="flex items-center gap-12">
            <button
              onClick={toggleFavorite}
              className="text-lg leading-none"
              aria-label="Ajouter aux favoris"
            >
              {isFav ? '★' : '☆'}
            </button>
            <button
              onClick={() => setCurrentScreen('s9_guide')}
              className="text-sm font-bold text-primaire"
            >
              ← Retour
            </button>
          </div>
        </div>

        <CarteLoi
          titre={categoryInfo.titre}
          loi={categoryInfo.loi_congolaise}
          peines={categoryInfo.peines}
        />

        <div className="text-[11px] text-encre-douce italic leading-relaxed border-t border-bordure pt-12">
          Source officielle : Loi Mouébara n°19-2022 du 4 mai 2022 et Code pénal de la République du Congo. Validé par l'Association des Femmes Juristes du Congo (AFJC).
        </div>
      </div>

      <div className="flex flex-col gap-12 mt-32 mb-24">
        <Bouton variant="primaire" onClick={() => setCurrentScreen('s9_guide')}>
          Retour aux guides
        </Bouton>
        <Bouton variant="secondaire" onClick={exitQuickly}>
          {t('exit_quick')}
        </Bouton>
      </div>
    </div>
  );
};
