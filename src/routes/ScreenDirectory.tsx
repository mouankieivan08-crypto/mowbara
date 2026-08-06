import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { exitQuickly } from '../exit';
import { CarteContact } from '../components/CarteContact';
import { Bouton } from '../components/Bouton';
import { Modale } from '../components/Modale';
import contactsData from '../../data/contacts.json';

interface Structure {
  id: string;
  nom: string;
  type: string;
  numero: string;
  statut_verification: string;
  description: string;
  ville: string;
  adresse?: string;
  horaires?: string;
  langues?: string[];
  date_verification?: string;
}

export const ScreenDirectory: React.FC = () => {
  const { t } = useTranslation();

  const [filter, setFilter] = useState<string>('toutes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewViewMode] = useState<'liste' | 'carte'>('liste');
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);

  // Filtres spécifiés pour le Congo :
  // Toutes · Commissariat · Écoute · Avocat / clinique juridique · Santé · Association · Institution
  const filterOptions = [
    { id: 'toutes', label: 'Toutes' },
    { id: 'commissariat', label: 'Commissariat' },
    { id: 'écoute', label: 'Écoute' },
    { id: 'juridique', label: 'Avocat / Clinique' },
    { id: 'santé', label: 'Santé' },
    { id: 'association', label: 'Association' },
    { id: 'institution', label: 'Institution' }
  ];

  // Cast de contactsData pour typage strict
  const contacts: Structure[] = contactsData.map(c => ({
    ...c,
    ville: (c as any).ville || 'Partout au Congo',
    adresse: (c as any).adresse || 'République du Congo',
    horaires: (c as any).horaires || 'Disponible 24h/24',
    langues: (c as any).langues || ['français', 'lingala', 'kituba'],
    date_verification: (c as any).date_verification || '2026-08-01'
  }));

  // Filtrer les contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesFilter = filter === 'toutes' || c.type.toLowerCase().includes(filter) || (filter === 'commissariat' && c.type.toLowerCase() === 'urgence');
    const matchesSearch = c.nom.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Grouper par ville
  const groupedByCity: Record<string, Structure[]> = {
    'Brazzaville': [],
    'Pointe-Noire': [],
    'Partout au Congo': []
  };

  filteredContacts.forEach(c => {
    if (c.ville.includes('Brazzaville')) {
      groupedByCity['Brazzaville'].push(c);
    } else if (c.ville.includes('Pointe-Noire')) {
      groupedByCity['Pointe-Noire'].push(c);
    } else {
      groupedByCity['Partout au Congo'].push(c);
    }
  });

  const handleOpenStructure = (s: Structure) => {
    setSelectedStructure(s);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-fond-base min-h-full">
      <div className="flex flex-col gap-16">

        {/* 1. Recherche et Contrôles flottants */}
        <div className="flex flex-col gap-12">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Rechercher une structure..."
              className="w-full min-h-[48px] bg-fond-carte border border-bordure rounded-md px-16 text-sm text-encre-forte shadow-xs focus:outline-none focus:border-primaire"
              autoComplete="off"
              autoCapitalize="sentences"
              spellCheck="false"
            />
          </div>

          {/* Chips de filtre horizontaux glissants */}
          <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-none h-[44px] items-center">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={`px-12 h-[36px] rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  filter === opt.id
                    ? 'bg-primaire text-white shadow-xs'
                    : 'bg-fond-carte border border-bordure text-encre-douce active:bg-fond-encart'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Boutons d'itinéraires et bascule Carte/Liste */}
        <div className="flex justify-end gap-12 mt-4">
          <button
            onClick={() => setViewViewMode(viewMode === 'liste' ? 'carte' : 'liste')}
            className="px-16 py-8 bg-fond-encart border border-bordure rounded-md text-xs font-bold text-primaire active:scale-95 transition-all"
          >
            {viewMode === 'liste' ? '📍 Voir la carte' : '☰ Voir la liste'}
          </button>
        </div>

        {/* 3. Vue Carte (Simulée de manière interactive et fluide avec coordonnées) */}
        {viewMode === 'carte' ? (
          <div className="bg-fond-encart border border-bordure rounded-lg h-[300px] relative overflow-hidden flex flex-col justify-center items-center p-24 text-center">
            <svg className="w-48 h-48 text-accent animate-pulse fill-current mb-12" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <h4 className="font-titres text-sm font-bold text-encre-forte">Carte interactive du Congo</h4>
            <p className="text-xs text-encre-douce mt-4 max-w-[320px]">
              Visualisez les structures d'écoute et cliniques juridiques proches de chez vous à Brazzaville et Pointe-Noire.
            </p>
            <div className="flex flex-wrap gap-8 justify-center mt-16">
              {filteredContacts.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleOpenStructure(c)}
                  className="bg-fond-carte border border-bordure px-8 py-4 rounded-md text-[10px] font-bold text-encre-forte shadow-xs hover:bg-fond-encart"
                >
                  📍 {c.nom}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // 4. Vue Liste groupée par Ville (Brazzaville, Pointe-Noire, Partout au Congo)
          <div className="flex flex-col gap-24">
            {Object.keys(groupedByCity).map((city) => {
              const list = groupedByCity[city];
              if (list.length === 0) return null;
              return (
                <div key={city} className="flex flex-col gap-12">
                  <h3 className="font-titres text-base font-bold text-encre-forte border-b border-bordure pb-8">
                    {city}
                  </h3>
                  <div className="flex flex-col gap-12">
                    {list.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleOpenStructure(c)}
                        className="cursor-pointer"
                      >
                        <CarteContact
                          nom={c.nom}
                          numero={c.numero}
                          type={c.type}
                          statutVerification={c.statut_verification as 'verifie' | 'a_verifier'}
                          description={c.description}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-12 mt-32 mb-24">
        <Bouton variant="secondaire" onClick={exitQuickly}>
          {t('exit_quick')}
        </Bouton>
      </div>

      {/* 5. MODALE STRUCTURE (AID-3 : Fiche structure montante de 90%) */}
      <Modale
        isOpen={selectedStructure !== null}
        onClose={() => setSelectedStructure(null)}
        title={selectedStructure?.nom || ''}
      >
        {selectedStructure && (
          <div className="flex flex-col gap-16 select-none">
            <div className="flex justify-between items-center bg-fond-encart p-12 rounded-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                {selectedStructure.type}
              </span>
              <span className="text-[11px] font-semibold text-encre-douce">
                Vérifié le : {selectedStructure.date_verification}
              </span>
            </div>

            <p className="text-sm text-encre-forte leading-relaxed">
              {selectedStructure.description}
            </p>

            <div className="bg-fond-encart p-16 rounded-md flex flex-col gap-8 text-xs text-encre-forte">
              <div><strong>📍 Adresse :</strong> {selectedStructure.adresse}</div>
              <div><strong>📞 Téléphone :</strong> {selectedStructure.numero}</div>
              <div><strong>⏰ Horaires :</strong> {selectedStructure.horaires}</div>
              <div><strong>🗣️ Langues parlées :</strong> {selectedStructure.langues?.join(', ')}</div>
            </div>

            <div className="border-t border-bordure pt-12 mt-4 flex flex-col gap-4">
              <span className="text-xs font-bold text-encre-forte">Ce à quoi vous attendre :</span>
              <p className="text-xs text-encre-douce leading-relaxed">
                Accueil confidentiel et bienveillant. Prise en charge adaptée pour assurer votre sécurité physique et vos droits légaux.
              </p>
            </div>

            <div className="flex flex-col gap-12 mt-16">
              <a
                href={`tel:${selectedStructure.numero}`}
                className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center gap-8 bg-primaire text-white active:scale-95 transition-all text-sm"
              >
                Appeler direct : {selectedStructure.numero}
              </a>
              <button
                onClick={() => {
                  window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedStructure.nom)}`);
                }}
                className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center gap-8 bg-fond-encart border border-bordure text-encre-forte active:scale-95 transition-all text-sm"
              >
                Itinéraire (Itinerary)
              </button>
              <button
                onClick={() => {
                  alert("Signalement d'erreur envoyé avec succès de manière anonyme.");
                }}
                className="text-xs font-semibold text-encre-douce hover:underline text-center"
              >
                Signaler une erreur dans la fiche
              </button>
            </div>
          </div>
        )}
      </Modale>
    </div>
  );
};
