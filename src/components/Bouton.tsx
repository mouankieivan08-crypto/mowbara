import React from 'react';
import { motion } from 'framer-motion';

interface BoutonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primaire' | 'secondaire' | 'danger' | 'attention' | 'disabled';
  className?: string;
  isLoading?: boolean;
  loadingText?: string;
}

export const Bouton: React.FC<BoutonProps> = ({
  onClick,
  children,
  variant = 'primaire',
  className = '',
  isLoading = false,
  loadingText = "Envoi en cours...",
}) => {
  const isCustomDisabled = variant === 'disabled' || isLoading;

  let baseStyles = "w-full rounded-md font-bold transition-colors touch-manipulation flex items-center justify-center gap-8 text-center min-h-[48px] px-16 py-12";
  let variantStyles = "";

  if (variant === 'primaire') {
    variantStyles = "bg-primaire text-texte-sur-fonce active:bg-primaire-contact";
  } else if (variant === 'secondaire') {
    variantStyles = "bg-fond-encart text-encre-forte border border-bordure active:bg-fond-base";
  } else if (variant === 'danger') {
    variantStyles = "bg-danger text-texte-sur-fonce active:opacity-90";
  } else if (variant === 'attention') {
    variantStyles = "bg-attention text-texte-sur-fonce active:opacity-90";
  } else if (isCustomDisabled) {
    variantStyles = "bg-encre-douce opacity-40 text-texte-sur-fonce cursor-not-allowed";
  }

  return (
    <motion.button
      type="button"
      onClick={isCustomDisabled ? undefined : onClick}
      whileTap={isCustomDisabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.08 }} // RÈGLE : scale(0.97) à la pression en 80 ms (0.08s)
      className={`${baseStyles} ${variantStyles} ${className}`}
      disabled={isCustomDisabled}
    >
      {isLoading ? (
        <div className="flex items-center gap-8 justify-center">
          <svg className="animate-spin h-16 w-16 text-[#D4A373]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-bold">{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};
