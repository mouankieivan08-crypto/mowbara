import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { CarteContact } from '../components/CarteContact';
import { Bouton } from '../components/Bouton';
import contactsData from '../../data/contacts.json';

export const ScreenDirectory: React.FC = () => {
  const { t } = useTranslation();
  const { setCurrentScreen } = useAppState();

  const [filter, setFilter] = useState<string>('tous');

  // Filtrer les contacts en fonction du type sélectionné
  const filteredContacts = contactsData.filter((contact) => {
    if (filter === 'tous') return true;
    return contact.type === filter;
  });

  return (
    <div className="flex-1 flex flex-col justify-between p-20 select-none bg-fond-base overflow-y-auto">
      <div className="flex flex-col gap-24 mt-8">
        <div className="flex items-center justify-between border-b border-bordure pb-12">
          <h2 className="font-titres text-xl font-bold text-encre-forte">
            {t('directory.title')}
          </h2>
          <button
            onClick={() => setCurrentScreen('s2_home')}
            className="text-sm font-bold text-primaire active:text-primaire-contact min-h-[48px] px-8 py-4 touch-manipulation"
          >
            {t('legal.back')}
          </button>
        </div>

        {/* Boutons de filtrage */}
        <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-none">
          {['tous', 'écoute', 'juridique', 'social'].map((type) => {
            const isActive = filter === type;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-12 py-8 rounded-full text-xs font-bold transition-all min-h-[48px] touch-manipulation whitespace-nowrap ${
                  isActive
                    ? 'bg-primaire text-texte-sur-fonce'
                    : 'bg-fond-encart text-encre-douce border border-bordure active:bg-fond-base'
                }`}
              >
                {t(`directory.filter_${type}` as any, { defaultValue: type.toUpperCase() })}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-16">
          {filteredContacts.map((contact) => (
            <CarteContact
              key={contact.id}
              nom={contact.nom}
              numero={contact.numero}
              type={contact.type}
              statutVerification={contact.statut_verification as 'verifie' | 'a_verifier'}
              description={contact.description}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-12 mt-32 mb-24">
        <Bouton variant="primaire" onClick={() => setCurrentScreen('s2_home')}>
          {t('emergency.back_to_app')}
        </Bouton>
        <Bouton variant="secondaire" onClick={exitQuickly}>
          {t('exit_quick')}
        </Bouton>
      </div>
    </div>
  );
};
