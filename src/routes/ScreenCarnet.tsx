import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bouton } from '../components/Bouton';
import { ChampSaisie } from '../components/ChampSaisie';

interface Note {
  id: string;
  date: string;
  texte: string;
}

export const ScreenCarnet: React.FC = () => {
  const { t } = useTranslation();

  // RÈGLE ABSOLUE : Aucune persistance du contenu des conversations ou des notes de faits.
  // Ni localStorage, ni sessionStorage, ni IndexedDB, ni cookie. Les notes vivent exclusivement
  // en mémoire React durant la session active et disparaissent instantanément au rechargement ou à la fermeture.
  const [notes, setNotes] = useState<Note[]>([]);

  const [noteText, setNoteText] = useState('');
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleAddNote = () => {
    if (!noteText.trim()) return;

    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      date: noteDate,
      texte: noteText.trim(),
    };

    setNotes([newNote, ...notes]);
    setNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col gap-24 p-20 bg-fond-base select-none">
      <div className="flex flex-col gap-8">
        <h2 className="font-titres text-xl font-bold text-encre-forte">
          {t('notebook.title', 'Carnet de Notes de Faits')}
        </h2>
        <p className="text-sm text-encre-douce leading-relaxed">
          {t(
            'notebook.subtitle',
            'Notez de manière chronologique les faits, dates et détails importants. Utile pour constituer un dossier juridique ultérieurement.'
          )}
        </p>
      </div>

      {/* Avertissement de sécurité */}
      <div className="bg-attention/10 border border-attention text-attention p-16 rounded-md text-xs font-semibold leading-relaxed flex flex-col gap-4">
        <span>⚠️ {t('notebook.security_warning_title', 'Sécurité et Confidentialité :')}</span>
        <span>
          {t(
            'notebook.security_warning_body',
            'Par mesure de sécurité absolue, ces notes sont conservées uniquement en mémoire de session. Elles seront définitivement détruites en fermant l\'onglet ou en appuyant sur Sortie Rapide.'
          )}
        </span>
      </div>

      {/* Formulaire d'ajout de note */}
      <div className="bg-fond-carte border border-bordure p-16 rounded-lg flex flex-col gap-12 shadow-xs">
        <h3 className="font-titres text-sm font-bold text-encre-forte">
          {t('notebook.add_entry', 'Nouvelle entrée')}
        </h3>

        <div className="flex flex-col gap-4">
          <label className="text-xs font-semibold text-encre-douce">
            {t('notebook.date_label', 'Date des faits')}
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
            {t('notebook.details_label', 'Description des faits')}
          </label>
          <ChampSaisie
            value={noteText}
            onChange={setNoteText}
            placeholder={t('notebook.textarea_placeholder', 'Décrivez les faits de manière objective (heures, paroles, témoins, actes...)')}
          />
        </div>

        <Bouton
          variant={noteText.trim() ? 'primaire' : 'disabled'}
          onClick={handleAddNote}
          className="mt-8"
        >
          {t('notebook.add_btn', 'Ajouter au carnet')}
        </Bouton>
      </div>

      {/* Liste des notes ajoutées */}
      <div className="flex flex-col gap-12">
        <h3 className="font-titres text-base font-bold text-encre-forte border-b border-bordure pb-8">
          {t('notebook.entries_list', 'Notes de session')} ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <p className="text-sm text-encre-douce text-center py-24 italic">
            {t('notebook.no_entries', 'Aucune note pour le moment dans cette session.')}
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {notes.map((note) => (
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
                    {t('notebook.delete_btn', 'Supprimer')}
                  </button>
                </div>
                <p className="text-sm text-encre-forte leading-relaxed whitespace-pre-wrap">
                  {note.texte}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
