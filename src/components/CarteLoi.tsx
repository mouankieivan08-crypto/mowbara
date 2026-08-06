import React from 'react';
import { useTranslation } from 'react-i18next';

interface CarteLoiProps {
  titre: string;
  loi: string;
  peines: string;
}

export const CarteLoi: React.FC<CarteLoiProps> = ({ titre, loi, peines }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-12 select-none">
      <div className="flex flex-col gap-4 border-b border-bordure pb-8">
        <span className="text-sm font-bold text-encre-douce uppercase tracking-wider">
          {t('legal.loi_congolaise')}
        </span>
        <h4 className="font-titres text-lg font-bold text-encre-forte">
          {titre}
        </h4>
      </div>
      <p className="text-sm text-encre-forte leading-relaxed">
        {loi}
      </p>
      <div className="bg-fond-encart border-l-4 border-accent p-12 rounded-sm mt-4">
        <span className="text-xs font-bold text-accent uppercase block mb-4">
          {t('legal.peines')}
        </span>
        <p className="text-sm text-encre-forte font-semibold leading-relaxed">
          {peines}
        </p>
      </div>
    </div>
  );
};
