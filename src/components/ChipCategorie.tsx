import React from 'react';

interface ChipCategorieProps {
  label: string;
}

export const ChipCategorie: React.FC<ChipCategorieProps> = ({ label }) => {
  return (
    <span className="inline-flex items-center gap-4 bg-fond-encart text-accent border border-bordure rounded-full px-12 py-4 text-sm font-semibold select-none">
      <span className="w-8 h-8 rounded-full bg-accent" />
      {label}
    </span>
  );
};
