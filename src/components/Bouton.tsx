import React from 'react';
import { motion } from 'framer-motion';

interface BoutonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primaire' | 'secondaire' | 'danger' | 'attention' | 'disabled';
  className?: string;
}

export const Bouton: React.FC<BoutonProps> = ({
  onClick,
  children,
  variant = 'primaire',
  className = '',
}) => {
  const isCustomDisabled = variant === 'disabled';

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
      {children}
    </motion.button>
  );
};
