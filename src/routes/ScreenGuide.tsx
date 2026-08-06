import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { Bouton } from '../components/Bouton';
import categoriesData from '../../data/categories.json';

export const ScreenGuide: React.FC = () => {
  const { t } = useTranslation();
  const { setCurrentScreen, setDetectedCategoryId, favorites, setFavorites } = useAppState();

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Éviter de cliquer sur la carte entière
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleCategoryClick = (id: string) => {
    setDetectedCategoryId(id);
    setCurrentScreen('s5_law'); // Naviguer vers l'article détaillé INF-6
  };

  return (
    <div className="flex-1 flex flex-col justify-between select-none bg-fond-base min-h-full">
      <div className="flex flex-col gap-24">
        <div className="flex items-center justify-between border-b border-bordure pb-12">
          <h2 className="font-titres text-lg font-bold text-encre-forte">
            Guides & Lois (Congo)
          </h2>
          <button
            onClick={() => setCurrentScreen('s2_home')}
            className="text-sm font-bold text-primaire"
          >
            ← Retour
          </button>
        </div>

        <p className="text-sm text-encre-douce leading-relaxed">
          Consultez librement les fiches de lois et guides officiels d'aide en République du Congo. Cliquez sur l'étoile pour les ajouter à vos favoris.
        </p>

        <div className="flex flex-col gap-12">
          {categoriesData.map((category) => {
            const isFav = favorites.includes(category.id);
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="bg-fond-carte border border-bordure rounded-lg p-16 shadow-xs flex flex-col gap-8 active:bg-fond-encart transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start gap-12">
                  <h3 className="font-titres text-sm font-bold text-encre-forte leading-snug">
                    {category.titre}
                  </h3>
                  <button
                    onClick={(e) => toggleFavorite(category.id, e)}
                    className="text-lg leading-none shrink-0"
                    aria-label="Ajouter aux favoris"
                  >
                    {isFav ? '★' : '☆'}
                  </button>
                </div>
                <p className="text-xs text-encre-douce leading-relaxed line-clamp-2">
                  {category.description}
                </p>
                <span className="text-xs font-bold text-primaire text-right mt-4 block">
                  Consulter →
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-12 mt-32 mb-24">
        <Bouton variant="primaire" onClick={() => setCurrentScreen('s2_home')}>
          Retour à l'accueil
        </Bouton>
        <Bouton variant="secondaire" onClick={exitQuickly}>
          {t('exit_quick')}
        </Bouton>
      </div>
    </div>
  );
};
