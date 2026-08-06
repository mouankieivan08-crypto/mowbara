import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { ChipCategorie } from '../components/ChipCategorie';
import { CarteContact } from '../components/CarteContact';
import { Bouton } from '../components/Bouton';
import categoriesData from '../../data/categories.json';
import contactsData from '../../data/contacts.json';
import { logger } from '../logger';

export const ScreenResults: React.FC = () => {
  const { t } = useTranslation();
  const { detectedCategoryId, setCurrentScreen, setInputText, setDetectedCategoryId } = useAppState();

  const isUncertain = detectedCategoryId === 'incertain';

  // Rechercher les informations correspondantes à la catégorie
  const categoryInfo = categoriesData.find(c => c.id === detectedCategoryId);

  // Sélectionner les contacts pertinents pour l'orientation
  // RÈGLE ABSOLUE : Les numéros viennent exclusivement de contacts.json. Le 1444 est prioritaire en secours.
  const recommendedContacts = contactsData.filter(c => {
    if (isUncertain) {
      // Classification incertaine : s'oriente prioritairement vers le 1444
      return c.id === '1444';
    }
    if (detectedCategoryId === 'agression_sexuelle') {
      return c.id === '1444' || c.id === 'afjc' || c.id === '117';
    }
    return c.id === '1444' || c.id === 'afjc' || c.id === 'mas';
  });

  useEffect(() => {
    // Journalisation métier asynchrone (anonyme et sans message ni IP)
    // RÈGLE ABSOLUE : ne contient jamais le texte du message, ni d'identifiants
    const payload = {
      categories: isUncertain ? [] : [detectedCategoryId || 'unknown'],
      contact_propose: isUncertain ? '1444' : (detectedCategoryId === 'agression_sexuelle' ? '117' : '1444'),
      urgence_vitale: false,
      mineure_impliquee: false,
      horodatage: new Date().toISOString()
    };

    logger.info("Envoi asynchrone anonyme de la journalisation métier", payload);
    // Simulation d'un envoi asynchrone avec échec silencieux
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // Échec silencieux réglementaire
    });
  }, [detectedCategoryId, isUncertain]);

  const handleNewAnalysis = () => {
    setInputText('');
    setDetectedCategoryId(null);
    setCurrentScreen('s2_home');
  };

  return (
    <div className="flex-1 flex flex-col justify-between select-none bg-fond-base">
      <div className="flex flex-col gap-24">
        <div className="flex flex-col gap-8 pb-12 border-b border-bordure">
          <span className="text-xs font-bold uppercase tracking-wider text-encre-douce">
            {t('results.category_detected')}
          </span>
          <ChipCategorie label={isUncertain ? "Non identifié" : (categoryInfo?.titre || "Inconnue")} />
        </div>

        {/* RÈGLE ABSOLUE : Classification incertaine (confiance < 0.5) : l'app dit qu'elle n'est pas sûre, ne cite aucun article, et oriente vers le 1444 */}
        {isUncertain ? (
          <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-8">
            <p className="text-sm text-encre-forte font-semibold leading-relaxed">
              {t('results.confidence_low')}
            </p>
          </div>
        ) : (
          categoryInfo && (
            <>
              <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-8">
                <p className="text-sm text-encre-forte leading-relaxed">
                  {categoryInfo.description}
                </p>
              </div>

              {/* Loi congolaise détaillée */}
              <div className="bg-fond-encart border-l-4 border-accent p-16 rounded-sm flex flex-col gap-8">
                <span className="text-xs font-bold text-accent uppercase block">
                  {t('results.legal_text')}
                </span>
                <p className="text-sm text-encre-forte font-semibold leading-relaxed line-clamp-3">
                  {categoryInfo.loi_congolaise}
                </p>
                <button
                  onClick={() => setCurrentScreen('s5_law')}
                  className="text-xs font-bold text-primaire active:text-primaire-contact underline text-left mt-4 min-h-[48px] touch-manipulation"
                >
                  {t('results.view_details_btn')}
                </button>
              </div>
            </>
          )
        )}

        {/* Contacts recommandés */}
        <div className="flex flex-col gap-12">
          <h3 className="font-titres text-base font-bold text-encre-forte">
            {t('results.recommended_contacts')}
          </h3>
          <div className="flex flex-col gap-16">
            {recommendedContacts.map((contact) => (
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
      </div>

      <div className="flex flex-col gap-12 mt-32 mb-24">
        <Bouton variant="primaire" onClick={handleNewAnalysis}>
          {t('results.back_home')}
        </Bouton>
        <Bouton variant="secondaire" onClick={exitQuickly}>
          {t('exit_quick')}
        </Bouton>
      </div>
    </div>
  );
};
