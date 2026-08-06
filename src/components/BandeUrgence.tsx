import React from 'react';
import { useTranslation } from 'react-i18next';

interface BandeUrgenceProps {
  onCall: () => void;
}

export const BandeUrgence: React.FC<BandeUrgenceProps> = ({ onCall }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-danger text-texte-sur-fonce px-16 py-12 flex flex-col gap-4 text-center select-none">
      <div className="flex flex-col gap-4">
        <span className="font-titres text-lg font-bold">
          {t('home.alert_title')}
        </span>
        <span className="text-sm">
          {t('home.alert_body')}
        </span>
      </div>
      <button
        onClick={onCall}
        className="mt-8 bg-fond-carte text-danger border border-danger rounded-md px-16 py-12 font-bold transition-transform active:scale-95 touch-manipulation min-h-[48px] flex items-center justify-center gap-8 self-center"
      >
        <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        {t('emergency_call_117')}
      </button>
    </div>
  );
};
