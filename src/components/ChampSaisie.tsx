import React from 'react';

interface ChampSaisieProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const ChampSaisie: React.FC<ChampSaisieProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* RÈGLE ABSOLUE : autocomplete="off", spellcheck="false", et jamais à l'intérieur d'un <form> */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="sentences"
        spellCheck="false"
        rows={4}
        className="w-full bg-fond-encart border border-bordure rounded-md p-16 text-encre-forte text-sm placeholder:text-encre-douce focus:outline-none focus:border-primaire resize-none leading-relaxed"
      />
    </div>
  );
};
