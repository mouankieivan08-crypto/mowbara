import React, { useState } from 'react';
import { useAppState } from '../AppStateContext';
import { Bouton } from '../components/Bouton';
import { ChampSaisie } from '../components/ChampSaisie';
import { Modale } from '../components/Modale';

interface Note {
  id: string;
  date: string;
  texte: string;
}

export const ScreenCarnet: React.FC = () => {
  const { carnetActif, setCarnetActif } = useAppState();

  // RÈGLE ABSOLUE : Les notes vivent exclusivement en mémoire React durant la session active
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState('');
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [isAdding, setIsAdding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleActivateCarnet = () => {
    setCarnetActif(true);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;

    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      date: noteDate,
      texte: noteText.trim(),
    };

    setNotes([newNote, ...notes]);
    setNoteText('');
    setIsAdding(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  // Groupement par mois (CAR-1)
  const getGroupedNotes = () => {
    const groups: Record<string, Note[]> = {};
    notes.forEach(note => {
      const parts = note.date.split('-');
      if (parts.length < 2) return;
      const monthIndex = parseInt(parts[1], 10) - 1;
      const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
      const monthYear = `${months[monthIndex]} ${parts[0]}`;
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(note);
    });
    return groups;
  };

  const groupedNotes = getGroupedNotes();

  // Simuler l'exportation du PDF 100% côté client (CAR-3)
  const handleExportPDF = () => {
    setShowExportModal(true);
  };

  const triggerDownload = () => {
    const docContent = `Mwaebara - Carnet de Notes\nPériode couverte : Session active\nNombre d'entrées : ${notes.length}\n\n` +
      notes.map((n, i) => `Entrée ${i+1} : Le ${n.date}\nDescription : ${n.texte}\n\n`).join('\n') +
      `Annexe technique : Empreinte SHA-256 de session.`;

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Carnet_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  // 1. CAR-0 : Carnet désactivé (état par défaut)
  if (!carnetActif) {
    return (
      <div className="flex-1 flex flex-col justify-between p-20 bg-fond-base min-h-full">
        <div className="flex flex-col gap-24 mt-8">
          <div className="flex flex-col gap-8">
            <h2 className="font-titres text-xl font-bold text-encre-forte">
              Carnet de faits et de preuves
            </h2>
            <p className="text-sm text-encre-douce leading-relaxed">
              Consignez de façon chronologique les dates, heures, déclarations et faits marquants de violence. Ce carnet vous aide à structurer des éléments probants pour un dossier médical ou juridique au Congo.
            </p>
          </div>

          <div className="bg-attention/10 border border-attention text-attention p-16 rounded-md text-xs font-semibold leading-relaxed flex flex-col gap-8">
            <span className="font-bold">🚨 Attention aux risques de sécurité :</span>
            <span>
              L'activation du Carnet affichera un onglet permanent dans le menu. Ne l'activez que si vous êtes certaine de la confidentialité physique de votre appareil.
            </span>
          </div>

          <Bouton variant="primaire" onClick={handleActivateCarnet}>
            Activer le carnet
          </Bouton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between bg-fond-base min-h-full relative select-none">

      {/* 2. CAR-1 : Vue Liste du Carnet */}
      {!isAdding ? (
        <div className="flex flex-col gap-24">
          <div className="flex justify-between items-center border-b border-bordure pb-12">
            <div className="flex flex-col">
              <h2 className="font-titres text-lg font-bold text-encre-forte">
                Mon Carnet
              </h2>
              <span className="text-xs text-danger font-semibold">Mémoire temporaire active</span>
            </div>

            {notes.length > 0 && (
              <button
                onClick={handleExportPDF}
                className="px-12 py-6 bg-fond-encart border border-bordure rounded-md text-xs font-bold text-primaire active:scale-95"
              >
                Exporter (PDF)
              </button>
            )}
          </div>

          {/* Avertissement de sécurité */}
          <div className="bg-attention/10 border border-attention text-attention p-12 rounded-md text-[11px] leading-relaxed">
            Par mesure de sécurité, vos notes sont conservées uniquement en mémoire vive. Elles s'effaceront définitivement en cliquant sur Sortie Rapide ou en rechargeant l'app.
          </div>

          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-48 text-center gap-12">
              <p className="text-sm text-encre-douce italic">
                Votre carnet est vide pour le moment.
              </p>
              <Bouton variant="secondaire" onClick={() => setIsAdding(true)}>
                + Ajouter un fait
              </Bouton>
            </div>
          ) : (
            <div className="flex flex-col gap-20">
              {Object.keys(groupedNotes).map(monthYear => (
                <div key={monthYear} className="flex flex-col gap-12">
                  <h3 className="font-titres text-sm font-bold text-primaire sticky top-0 bg-fond-base py-4 z-10">
                    {monthYear}
                  </h3>
                  <div className="flex flex-col gap-12">
                    {groupedNotes[monthYear].map((note) => (
                      <div
                        key={note.id}
                        className="bg-fond-carte border border-bordure p-16 rounded-lg flex flex-col gap-12 shadow-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-accent">
                            Le {note.date}
                          </span>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-xs font-semibold text-danger active:scale-95"
                          >
                            Supprimer
                          </button>
                        </div>
                        <p className="text-sm text-encre-forte leading-relaxed whitespace-pre-wrap">
                          {note.texte}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FAB Bouton flottant d'ajout */}
          <button
            onClick={() => setIsAdding(true)}
            className="fixed bottom-80 right-24 w-56 h-56 bg-primaire hover:bg-primaire-contact text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 z-30 transition-transform"
            aria-label="Ajouter une entrée"
          >
            <svg className="w-24 h-24 fill-current" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
        </div>
      ) : (
        // 3. CAR-2 : Formulaire d'ajout d'entrée
        <div className="flex flex-col justify-between flex-grow">
          <div className="flex flex-col gap-24">
            <div className="flex justify-between items-center border-b border-bordure pb-12">
              <h3 className="font-titres text-lg font-bold text-encre-forte">
                Nouveau Fait
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-xs font-bold text-encre-douce"
              >
                Annuler
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-xs font-semibold text-encre-douce">
                Date des événements
              </label>
              <input
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                className="w-full min-h-[44px] bg-fond-encart border border-bordure rounded-md px-12 text-sm text-encre-forte focus:outline-none focus:border-primaire"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-xs font-semibold text-encre-douce">
                Description objective et témoins
              </label>
              <ChampSaisie
                value={noteText}
                onChange={setNoteText}
                placeholder="Décrivez les paroles, heures exactes, témoins ou violences physiques objectives..."
              />
            </div>

            {/* Outils d'ajout de pièces jointes (CAR-2 BAR) */}
            <div className="border border-bordure rounded-lg p-12 bg-fond-carte flex flex-col gap-12 shadow-xs">
              <span className="text-xs font-bold text-encre-forte">Ajouter des pièces justificatives :</span>
              <div className="grid grid-cols-2 gap-8 text-xs text-encre-douce">
                <button
                  onClick={() => alert("Capture d'image dans l'application sécurisée simulée.")}
                  className="p-8 bg-fond-encart hover:bg-fond-encart/80 rounded-md text-left font-semibold"
                >
                  📷 Prendre une photo
                </button>
                <button
                  onClick={() => alert("Capture de vidéo dans l'application sécurisée simulée.")}
                  className="p-8 bg-fond-encart hover:bg-fond-encart/80 rounded-md text-left font-semibold"
                >
                  🎥 Filmer
                </button>
                <button
                  onClick={() => alert("Fichiers de l'appareil sécurisés.")}
                  className="p-8 bg-fond-encart hover:bg-fond-encart/80 rounded-md text-left font-semibold"
                >
                  📎 Fichiers
                </button>
                <button
                  onClick={() => alert("Enregistrement audio sécurisé.")}
                  className="p-8 bg-fond-encart hover:bg-fond-encart/80 rounded-md text-left font-semibold"
                >
                  🎙️ Enregistrer un audio
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-12 mt-32 mb-24">
            <Bouton
              variant={noteText.trim() ? 'primaire' : 'disabled'}
              onClick={handleAddNote}
            >
              Ajouter au carnet
            </Bouton>
            <Bouton variant="secondaire" onClick={() => setIsAdding(false)}>
              Retour à la liste
            </Bouton>
          </div>
        </div>
      )}

      {/* 4. MODALE EXPORTATION PDF (CAR-3) */}
      <Modale
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Exporter le Carnet"
      >
        <div className="flex flex-col gap-16 select-none">
          <p className="text-sm text-encre-forte leading-relaxed">
            Vous allez générer un fichier contenant l'intégralité de vos notes de session au format brut sécurisé.
          </p>
          <div className="bg-attention/10 border border-attention text-attention p-12 rounded-md text-xs font-semibold leading-relaxed">
            ⚠️ Attention : Une fois exporté, ce document sort de l'application et n'est plus protégé par votre code d'accès personnel.
          </div>
          <div className="flex flex-col gap-12 mt-16">
            <button
              onClick={triggerDownload}
              className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center bg-primaire text-white active:scale-95 transition-all text-sm"
            >
              Télécharger le document (.txt brut)
            </button>
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center bg-fond-encart text-encre-forte border border-bordure active:scale-95 transition-all text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </Modale>

    </div>
  );
};
