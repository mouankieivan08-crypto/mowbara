import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { Bouton } from '../components/Bouton';

export const ScreenEmergency: React.FC = () => {
  const { t } = useTranslation();
  const { setCurrentScreen, setInputText, setDetectedCategoryId } = useAppState();

  const handleBack = () => {
    setInputText('');
    setDetectedCategoryId(null);
    setCurrentScreen('s2_home');
  };

  const urgences = [
    { name: "Police Secours", number: "117", type: "call" },
    { name: "Urgences Médicales (CHU)", number: "3434", type: "call" },
    { name: "Sapeurs-Pompiers", number: "118", type: "call" }
  ];

  const specializees = [
    { name: "SOS Femmes violentées", number: "1444", type: "call" },
    { name: "Allô Enfance en danger", number: "111", type: "call" },
    { name: "Clinique AFJC (Brazzaville)", number: "+242066601444", type: "call" }
  ];

  return (
    <div className="flex-1 flex flex-col justify-between bg-fond-base min-h-full">
      <div className="flex flex-col gap-24">
        {/* SOS Header styled in danger red */}
        <div className="flex flex-col gap-8 text-center pt-8">
          <span className="text-danger font-titres text-2xl font-black uppercase tracking-wider block">
            SOS Urgences
          </span>
          <p className="text-xs text-encre-douce font-bold">
            Appels directs d'aide et de secours en République du Congo
          </p>
        </div>

        {/* Bloc 1 — Urgences */}
        <div className="flex flex-col gap-12">
          <h3 className="font-titres text-sm font-bold text-encre-forte border-b border-bordure pb-4">
            Services d'urgence (Secours)
          </h3>
          <div className="flex flex-col gap-8">
            {urgences.map((u, i) => (
              <a
                key={i}
                href={`tel:${u.number}`}
                className="bg-fond-carte border border-bordure rounded-lg p-16 h-[72px] flex items-center justify-between active:bg-fond-encart transition-colors shadow-xs"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-encre-forte">{u.name}</span>
                  <span className="text-xs font-semibold text-encre-douce mt-4">{u.number}</span>
                </div>
                <span className="text-lg shrink-0">📞</span>
              </a>
            ))}
          </div>
        </div>

        {/* Bloc 2 — Lignes spécialisées */}
        <div className="flex flex-col gap-12">
          <h3 className="font-titres text-sm font-bold text-encre-forte border-b border-bordure pb-4">
            Lignes spécialisées & Conseils
          </h3>
          <div className="flex flex-col gap-8">
            {specializees.map((s, i) => (
              <a
                key={i}
                href={`tel:${s.number}`}
                className="bg-fond-carte border border-bordure rounded-lg p-16 h-[72px] flex items-center justify-between active:bg-fond-encart transition-colors shadow-xs"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-encre-forte">{s.name}</span>
                  <span className="text-xs font-semibold text-encre-douce mt-4">{s.number}</span>
                </div>
                <span className="text-lg shrink-0">📞</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12 mt-32 mb-24">
        <Bouton variant="primaire" onClick={handleBack}>
          Retour à l'accueil
        </Bouton>
        <Bouton variant="secondaire" onClick={exitQuickly}>
          {t('exit_quick')}
        </Bouton>
      </div>
    </div>
  );
};
