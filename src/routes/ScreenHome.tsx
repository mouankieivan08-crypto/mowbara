import React, { useState } from 'react';
import { useAppState } from '../AppStateContext';
import { detectVitalDanger } from '../services/emergency';
import { ChampSaisie } from '../components/ChampSaisie';
import { Bouton } from '../components/Bouton';

interface Question {
  id: number;
  texte: string;
  reponses: string[];
}

const QUESTIONS_MOCK: Question[] = [
  {
    id: 1,
    texte: "Votre conjoint vous insulte-t-il, vous dénigre-t-il ou vous humilie-t-il en privé ou en public ?",
    reponses: ["Jamais", "Parfois", "Souvent / Très souvent"]
  },
  {
    id: 2,
    texte: "Contrôle-t-il vos dépenses ou vous prive-t-il d'argent pour les besoins de base de la famille ?",
    reponses: ["Non, jamais", "Oui, parfois", "Oui, constamment"]
  },
  {
    id: 3,
    texte: "Vous interdit-t-il de voir votre famille, vos amies ou de travailler ?",
    reponses: ["Non", "Oui, il essaie de me surveiller", "Oui, je me sens complètement isolée"]
  },
  {
    id: 4,
    texte: "Avez-vous déjà subi des bousculades, des gifles, des coups ou d'autres violences physiques ?",
    reponses: ["Jamais", "Oui, une fois", "Oui, à plusieurs reprises"]
  }
];

export const ScreenHome: React.FC = () => {
  const {
    inputText,
    setInputText,
    isOffline,
    favorites,
    setFavorites,
    setCurrentScreen,
  } = useAppState();

  // Navigation interne de l'onglet Infos :
  // 'accueil' (INF-1) | 'grid' (INF-2) | 'run' (INF-3) | 'results' (INF-4) | 'text-libre'
  const [infosView, setInfosView] = useState<'accueil' | 'grid' | 'run' | 'results' | 'text-libre'>('accueil');
  const [selectedSegment, setSelectedSegment] = useState<'guides' | 'favoris'>('guides');

  // État questionnaire
  const [selectedQuestionnaire, setSelectedSegmentQ] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Rubriques list (INF-1)
  const rubriques = [
    { id: '1', titre: "Que sont les violences conjugales ?", file: "loi_1" },
    { id: '2', titre: "Obtenir un certificat médical de constatation", file: "loi_2" },
    { id: '3', titre: "Déposer plainte : à qui s'adresser, comment", file: "loi_3" },
    { id: '4', titre: "Si on refuse d'enregistrer votre plainte (art. 40)", file: "loi_4" },
    { id: '5', titre: "Combien de temps avez-vous pour agir ? (art. 46)", file: "loi_5" },
    { id: '6', titre: "La séparation et le logement", file: "loi_6" },
    { id: '7', titre: "La situation des enfants", file: "loi_7" },
    { id: '8', titre: "Le veuvage et la succession (art. 19 et 60)", file: "loi_8" }
  ];

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (detectVitalDanger(text)) {
      setCurrentScreen('s6_emergency');
    }
  };

  const startTextAnalysis = () => {
    if (!inputText.trim()) return;
    setCurrentScreen('s3_analysis');
  };

  const handleStartQuestionnaire = (qName: string) => {
    setSelectedSegmentQ(qName);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setInfosView('run');
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS_MOCK.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setInfosView('results');
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
    }
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between select-none bg-fond-base min-h-full">

      {/* INF-1 : Accueil Infos */}
      {infosView === 'accueil' && (
        <div className="flex flex-col gap-16">

          {/* 1. Carte d'appel / Questionnaire d'auto-évaluation */}
          <div className="bg-primaire text-texte-sur-fonce rounded-lg p-16 shadow-md flex flex-col gap-12">
            <div className="flex justify-between items-start">
              <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-8 py-4 rounded-full">
                6 questionnaires d'évaluation
              </span>
            </div>
            <div>
              <h3 className="font-titres text-lg font-bold text-white leading-snug">
                Quelle est ma situation ?
              </h3>
              <p className="text-sm text-white/80 mt-4 leading-relaxed">
                Répondez de façon anonyme à nos évaluations rapides pour identifier vos droits et peines prévues par la loi congolaise.
              </p>
            </div>
            <button
              onClick={() => setInfosView('grid')}
              className="text-white text-xs font-bold underline text-left focus:outline-none mt-4"
            >
              Accéder aux questionnaires →
            </button>
          </div>

          {/* 2. Contrôle segmenté (Guides | Favoris) */}
          <div className="bg-fond-encart p-4 rounded-full flex gap-4 h-[44px]">
            <button
              onClick={() => setSelectedSegment('guides')}
              className={`flex-1 rounded-full text-sm font-bold text-center transition-all ${
                selectedSegment === 'guides'
                  ? 'bg-fond-carte text-encre-forte shadow-xs'
                  : 'text-encre-douce'
              }`}
            >
              Guides
            </button>
            <button
              onClick={() => setSelectedSegment('favoris')}
              className={`flex-1 rounded-full text-sm font-bold text-center transition-all ${
                selectedSegment === 'favoris'
                  ? 'bg-fond-carte text-encre-forte shadow-xs'
                  : 'text-encre-douce'
              }`}
            >
              Favoris ({favorites.length})
            </button>
          </div>

          {/* 3. Contenu selon le segment */}
          {selectedSegment === 'guides' ? (
            <div className="flex flex-col gap-6">
              {rubriques.map((rubrique) => (
                <div
                  key={rubrique.id}
                  onClick={() => {
                    // Simuler la navigation vers l'article INF-5/INF-6
                    setCurrentScreen('s9_guide');
                  }}
                  className="bg-fond-carte border border-bordure h-[52px] rounded-lg px-12 flex items-center justify-between active:bg-fond-encart transition-colors cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-10 truncate">
                    <svg className="w-18 h-18 text-primaire shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-4h-2V7h2v2z" />
                    </svg>
                    <span className="text-xs font-semibold text-encre-forte truncate">
                      {rubrique.titre}
                    </span>
                  </div>
                  <span className="text-encre-douce text-base font-bold shrink-0">›</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {favorites.length === 0 ? (
                <p className="text-xs text-encre-douce text-center py-20 italic">
                  Aucun guide enregistré en favori pour le moment.
                </p>
              ) : (
                rubriques
                  .filter(r => favorites.includes(r.id))
                  .map(rubrique => (
                    <div
                      key={rubrique.id}
                      className="bg-fond-carte border border-bordure h-[52px] rounded-lg px-12 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-10 truncate">
                        <svg className="w-18 h-18 text-primaire shrink-0 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-4h-2V7h2v2z" />
                        </svg>
                        <span className="text-xs font-semibold text-encre-forte truncate">
                          {rubrique.titre}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFavorite(rubrique.id)}
                        className="text-[10px] font-bold text-danger px-8 py-4 active:scale-95"
                      >
                        Retirer
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* INF-2 : Questionnaires Grid */}
      {infosView === 'grid' && (
        <div className="flex flex-col gap-16">
          <div className="flex justify-between items-center border-b border-bordure pb-8">
            <h3 className="font-titres text-base font-bold text-encre-forte">
              Auto-évaluations
            </h3>
            <button
              onClick={() => setInfosView('accueil')}
              className="text-xs font-bold text-primaire"
            >
              ← Retour
            </button>
          </div>

          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-10">
            {/* Ma situation personnelle (Texte libre) */}
            <div
              onClick={() => setInfosView('text-libre')}
              className="col-span-1 min-[400px]:col-span-2 bg-fond-encart border border-primaire/20 rounded-lg p-12 shadow-xs active:bg-fond-encart/80 cursor-pointer flex flex-col justify-between h-[100px]"
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold text-primaire uppercase">Texte Libre</span>
                <span className="text-[9px] font-bold text-accent">RAPIDE</span>
              </div>
              <div>
                <h4 className="font-titres text-xs font-bold text-encre-forte">
                  Ma situation personnelle
                </h4>
                <p className="text-[10px] text-encre-douce mt-1">Décrivez votre situation en texte libre.</p>
              </div>
              <span className="text-[11px] font-bold text-primaire text-right">Démarrer →</span>
            </div>

            {/* Autres questionnaires */}
            {[
              "Le couple",
              "L'argent et finances",
              "Le corps et l'intégrité",
              "La famille et les enfants",
              "Papiers et administratif"
            ].map((qName, i) => (
              <div
                key={i}
                onClick={() => handleStartQuestionnaire(qName)}
                className="bg-fond-carte border border-bordure rounded-lg p-12 shadow-xs active:bg-fond-encart transition-colors cursor-pointer flex flex-col justify-between h-[100px]"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold text-encre-douce">4 questions</span>
                  <span className="text-[9px] font-bold text-attention">DISPONIBLE</span>
                </div>
                <div>
                  <h4 className="font-titres text-xs font-bold text-encre-forte truncate">
                    {qName}
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-primaire text-right">Démarrer →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INF-3 : Questionnaire Run */}
      {infosView === 'run' && (
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-6">
            {/* Barre de progression */}
            <div className="w-full bg-fond-encart h-4 rounded-full overflow-hidden">
              <div
                className="bg-primaire h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS_MOCK.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-encre-douce">
              Question {currentQuestionIndex + 1} sur {QUESTIONS_MOCK.length} ({selectedQuestionnaire})
            </span>
          </div>

          <h3 className="font-titres text-base font-bold text-encre-forte leading-snug">
            {QUESTIONS_MOCK[currentQuestionIndex].texte}
          </h3>

          <div className="flex flex-col gap-8 mt-4">
            {QUESTIONS_MOCK[currentQuestionIndex].reponses.map((rep, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(rep)}
                className={`w-full min-h-[46px] px-12 py-8 rounded-lg text-xs font-bold text-left border transition-all ${
                  selectedAnswer === rep
                    ? 'bg-primaire text-white border-transparent'
                    : 'bg-fond-carte border-bordure text-encre-forte active:bg-fond-encart'
                }`}
              >
                {rep}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-16">
            <button
              onClick={handlePrevQuestion}
              className={`text-xs font-bold px-12 py-8 rounded-md ${
                currentQuestionIndex === 0
                  ? 'text-encre-douce/40 cursor-not-allowed'
                  : 'text-encre-forte active:bg-fond-encart'
              }`}
              disabled={currentQuestionIndex === 0}
            >
              Précédent
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className={`text-xs font-bold px-16 py-8 rounded-md transition-all ${
                selectedAnswer
                  ? 'bg-primaire text-white active:scale-95'
                  : 'bg-encre-douce/10 text-encre-douce/50 cursor-not-allowed'
              }`}
            >
              Suivant
            </button>
          </div>

          <button
            onClick={() => setInfosView('results')}
            className="text-[11px] font-semibold text-encre-douce text-center mt-8 hover:underline focus:outline-none"
          >
            Je préfère ne pas répondre et voir les résultats
          </button>
        </div>
      )}

      {/* INF-4 : Questionnaire Results */}
      {infosView === 'results' && (
        <div className="flex flex-col gap-16">
          <div className="bg-fond-carte border border-bordure rounded-lg p-16 shadow-md flex flex-col gap-12">
            <h3 className="font-titres text-base font-bold text-encre-forte border-b border-bordure pb-8">
              Synthèse d'orientation
            </h3>
            <p className="text-xs text-encre-douce leading-relaxed">
              D'après vos réponses, plusieurs lois congolaises protègent vos droits :
            </p>
            <div className="flex flex-wrap gap-6">
              <span className="bg-accent/15 text-accent text-[11px] font-bold px-10 py-4 rounded-full">
                Loi Mouébara n°19-2022
              </span>
              <span className="bg-accent/15 text-accent text-[11px] font-bold px-10 py-4 rounded-full">
                Code de la Famille
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <h4 className="font-titres text-xs font-bold text-encre-forte">
              Recommandation immédiate
            </h4>
            <div className="bg-fond-carte border border-bordure p-12 rounded-lg flex flex-col gap-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">LIGNE DIRECTE</span>
              <h5 className="font-titres text-sm font-bold text-encre-forte">Numéro d'Écoute National 1444</h5>
              <p className="text-[11px] text-encre-douce">Anonyme, gratuit et disponible 24h/24 en République du Congo.</p>
              <a
                href="tel:1444"
                className="w-full min-h-[44px] bg-primaire text-white rounded-md flex items-center justify-center font-bold text-xs"
              >
                Appeler le 1444
              </a>
            </div>
          </div>

          <Bouton variant="primaire" onClick={() => setInfosView('accueil')} className="mt-12">
            Retour à l'accueil Infos
          </Bouton>
        </div>
      )}

      {/* INF-2 (Text Libre View) : Situation Analysis Input */}
      {infosView === 'text-libre' && (
        <div className="flex-grow flex flex-col justify-between">
          <div className="flex flex-col gap-16">
            <div className="flex justify-between items-center border-b border-bordure pb-12">
              <h3 className="font-titres text-lg font-bold text-encre-forte">
                Situation personnelle
              </h3>
              <button
                onClick={() => setInfosView('grid')}
                className="text-xs font-bold text-primaire"
              >
                ← Retour
              </button>
            </div>

            <p className="text-sm text-encre-douce leading-relaxed">
              Décrivez librement votre situation ci-dessous. Vos écrits sont analysés en mémoire locale pour identifier l'orientation et la loi congolaise correspondante.
            </p>

            <ChampSaisie
              value={inputText}
              onChange={handleTextChange}
              placeholder="Décrivez ce qui s'est passé en quelques phrases objectivement..."
            />

            {isOffline && (
              <div className="bg-attention/10 border border-attention text-attention p-12 rounded-md text-xs font-semibold leading-relaxed">
                Vous êtes actuellement hors-ligne. Les numéros d'urgence restent actifs.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-12 mt-32">
            <Bouton
              variant={(!inputText.trim() || isOffline) ? 'disabled' : 'primaire'}
              onClick={startTextAnalysis}
            >
              Lancer l'analyse
            </Bouton>

            <Bouton variant="secondaire" onClick={() => setInfosView('grid')}>
              Retour aux questionnaires
            </Bouton>
          </div>
        </div>
      )}
    </div>
  );
};
