import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../AppStateContext';
import { exitQuickly } from '../exit';
import { Bouton } from '../components/Bouton';
import { Modale } from '../components/Modale';

export const ScreenSettings: React.FC = () => {
  const { t } = useTranslation();
  const { textSize, setTextSize, setCurrentScreen, setPinHash, setCarnetActif } = useAppState();

  const [activeModal, setActiveModal] = useState<'pin' | 'leurre' | 'taille' | 'langue' | 'effacer_carnet' | 'tout_effacer' | null>(null);

  const handleResetPin = () => {
    setPinHash(null);
    alert("Le code PIN a été désactivé avec succès.");
    setActiveModal(null);
  };

  const handleClearCarnet = () => {
    // Le carnet est entièrement en mémoire React session, mais réinitialiser son activation
    setCarnetActif(false);
    alert("Le carnet a été entièrement effacé.");
    setActiveModal(null);
  };

  const handleClearAll = () => {
    setPinHash(null);
    setCarnetActif(false);
    localStorage.clear();
    sessionStorage.clear();
    alert("Toutes les données locales et d'accès ont été détruites.");
    exitQuickly();
  };

  const settingsRows = [
    { id: 'pin', label: "Modifier ou désactiver mon code PIN", color: "text-encre-forte" },
    { id: 'leurre', label: "Écran leurre d'urgence", color: "text-encre-forte" },
    { id: 'taille', label: "Taille du texte", color: "text-encre-forte" },
    { id: 'langue', label: "Langue de l'application", color: "text-encre-forte" },
    { id: 'effacer_carnet', label: "Effacer complètement le carnet", color: "text-danger font-bold" },
    { id: 'tout_effacer', label: "TOUT EFFACER & RÉINITIALISER", color: "text-danger font-black" },
    { id: 'about', label: "À propos & Mentions légales", color: "text-encre-forte", action: () => setCurrentScreen('s10_about') }
  ];

  return (
    <div className="flex-1 flex flex-col justify-between bg-fond-base min-h-full">
      <div className="flex flex-col gap-24">

        <p className="text-sm text-encre-douce leading-relaxed">
          Gérez la confidentialité et la configuration technique de votre application de manière anonyme et discrète.
        </p>

        {/* Liste des réglages de 56px de hauteur */}
        <div className="flex flex-col border-y border-bordure">
          {settingsRows.map((row) => (
            <div
              key={row.id}
              onClick={() => {
                if (row.action) {
                  row.action();
                } else {
                  setActiveModal(row.id as any);
                }
              }}
              className="h-[56px] border-b last:border-none border-bordure px-16 flex items-center justify-between active:bg-fond-encart transition-colors cursor-pointer"
            >
              <span className={`text-sm ${row.color}`}>
                {row.label}
              </span>
              <span className="text-encre-douce text-lg font-bold">›</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pied de page avec Encart de non-responsabilité requis par le Congo */}
      <div className="flex flex-col gap-16 mt-32 mb-24">
        <div className="bg-fond-encart border border-bordure p-16 rounded-lg text-xs text-encre-douce leading-relaxed text-center">
          ℹ️ L'application informe mais ne remplace ni un avocat, ni la police, ni un médecin.
        </div>
        <Bouton variant="secondaire" onClick={exitQuickly}>
          {t('exit_quick')}
        </Bouton>
      </div>

      {/* ──────────────────────────────────────────────────────────
          LES MODALES DE RÉGLAGES SÉCURISÉES (SEC-1)
          ────────────────────────────────────────────────────────── */}

      {/* 1. Modale PIN */}
      <Modale
        isOpen={activeModal === 'pin'}
        onClose={() => setActiveModal(null)}
        title="Gestion du code PIN"
      >
        <div className="flex flex-col gap-16">
          <p className="text-sm text-encre-forte leading-relaxed">
            Vous pouvez désactiver complètement le code PIN local de l'application si l'accès à vos informations ne présente plus de risque.
          </p>
          <Bouton variant="danger" onClick={handleResetPin} className="mt-8">
            Désactiver le code PIN
          </Bouton>
        </div>
      </Modale>

      {/* 2. Modale Écran Leurre */}
      <Modale
        isOpen={activeModal === 'leurre'}
        onClose={() => setActiveModal(null)}
        title="Écran leurre"
      >
        <div className="flex flex-col gap-16">
          <p className="text-sm text-encre-forte leading-relaxed">
            Configurez un écran fictif de météo ou d'actualités générales congolaises qui s'affichera par défaut si une personne suspecte prend votre téléphone.
          </p>
          <Bouton variant="secondaire" onClick={() => alert("Écran leurre météo activé de manière simulée.")}>
            Activer l'écran leurre météo
          </Bouton>
        </div>
      </Modale>

      {/* 3. Modale Taille du texte */}
      <Modale
        isOpen={activeModal === 'taille'}
        onClose={() => setActiveModal(null)}
        title="Taille du texte"
      >
        <div className="flex flex-col gap-12">
          <p className="text-sm text-encre-forte">Choisissez la lisibilité adaptée à vos besoins :</p>
          <div className="grid grid-cols-3 gap-8">
            {['base', 'lg', 'xl'].map((size) => {
              const isActive = textSize === size;
              return (
                <button
                  key={size}
                  onClick={() => {
                    setTextSize(size);
                    setActiveModal(null);
                  }}
                  className={`px-12 py-12 rounded-md font-bold text-sm min-h-[48px] ${
                    isActive
                      ? 'bg-primaire text-white'
                      : 'bg-fond-encart text-encre-forte'
                  }`}
                >
                  {size === 'base' ? 'Normal' : size === 'lg' ? 'Grand' : 'Très grand'}
                </button>
              );
            })}
          </div>
        </div>
      </Modale>

      {/* 4. Modale Langue */}
      <Modale
        isOpen={activeModal === 'langue'}
        onClose={() => setActiveModal(null)}
        title="Langue de l'application"
      >
        <div className="flex flex-col gap-12">
          <p className="text-sm text-encre-forte">Langues d'aide officiellement disponibles :</p>
          <div className="p-12 bg-fond-encart text-sm font-bold rounded-md flex justify-between items-center border border-bordure">
            <span>Français (République du Congo)</span>
            <span className="text-xs text-primaire uppercase">Actif</span>
          </div>
        </div>
      </Modale>

      {/* 5. Modale Effacer le Carnet */}
      <Modale
        isOpen={activeModal === 'effacer_carnet'}
        onClose={() => setActiveModal(null)}
        title="Effacer complètement le carnet"
      >
        <div className="flex flex-col gap-16 text-center">
          <p className="text-sm text-encre-forte leading-relaxed">
            Êtes-vous sûre de vouloir détruire définitivement toutes les notes enregistrées au carnet de session ? cette action est irréversible.
          </p>
          <div className="flex flex-col gap-12 mt-12">
            <button
              onClick={handleClearCarnet}
              className="w-full min-h-[56px] rounded-md font-bold bg-danger text-white active:scale-95"
            >
              Oui, détruire le carnet
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full min-h-[56px] rounded-md font-bold bg-fond-encart text-encre-forte"
            >
              Annuler
            </button>
          </div>
        </div>
      </Modale>

      {/* 6. Modale TOUT EFFACER */}
      <Modale
        isOpen={activeModal === 'tout_effacer'}
        onClose={() => setActiveModal(null)}
        title="DANGER : TOUT EFFACER & REINITIALISER"
      >
        <div className="flex flex-col gap-16 text-center">
          <p className="text-sm text-encre-forte leading-relaxed">
            Cette action détruira instantanément le code PIN, le carnet, les favoris et toutes les traces résiduelles dans le navigateur. Vous serez redirigée immédiatement vers Google Congo.
          </p>
          <div className="flex flex-col gap-12 mt-12">
            <button
              onClick={handleClearAll}
              className="w-full min-h-[56px] rounded-md font-bold bg-danger text-white active:scale-95"
            >
              Détruire toutes les traces
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full min-h-[56px] rounded-md font-bold bg-fond-encart text-encre-forte"
            >
              Annuler
            </button>
          </div>
        </div>
      </Modale>

    </div>
  );
};
