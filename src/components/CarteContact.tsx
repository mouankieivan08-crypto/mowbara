import React from 'react';
import { useTranslation } from 'react-i18next';

interface CarteContactProps {
  nom: string;
  numero: string;
  type: string;
  statutVerification: 'verifie' | 'a_verifier';
  description: string;
}

export const CarteContact: React.FC<CarteContactProps> = ({
  nom,
  numero,
  type,
  statutVerification,
  description,
}) => {
  const { t } = useTranslation();
  const isVerified = statutVerification === 'verifie';

  return (
    <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-12 select-none">
      <div className="flex justify-between items-start gap-8">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            {type}
          </span>
          <h4 className="font-titres text-base font-bold text-encre-forte">
            {nom}
          </h4>
        </div>

        {/* Badge de statut de vérification */}
        <span
          className={`px-8 py-4 rounded-full text-xs font-semibold ${
            isVerified
              ? 'bg-primaire/10 text-primaire'
              : 'bg-attention/10 text-attention'
          }`}
        >
          {isVerified ? t('results.verified') : t('results.to_verify')}
        </span>
      </div>

      <p className="text-sm text-encre-douce leading-relaxed">
        {description}
      </p>

      {/* RÈGLE ABSOLUE : Un contact dont statut_verification vaut a_verifier s'affiche avec son badge et son bouton d'appel désactivé. */}
      {isVerified ? (
        <a
          href={`tel:${numero}`}
          className="mt-8 w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center gap-8 bg-primaire text-texte-sur-fonce active:bg-primaire-contact transition-transform active:scale-95 touch-manipulation text-base"
        >
          <svg className="w-14 h-14 fill-current" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          {t('results.call_now')} : {numero}
        </a>
      ) : (
        <div className="flex flex-col gap-4 mt-8">
          <button
            disabled
            className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center gap-8 bg-encre-douce/20 text-encre-douce/50 cursor-not-allowed text-base"
          >
            <svg className="w-14 h-14 fill-current opacity-30" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            {numero}
          </button>
          <span className="text-xs text-attention font-medium">
            {t('directory.unverified_warning')}
          </span>
        </div>
      )}
    </div>
  );
};
