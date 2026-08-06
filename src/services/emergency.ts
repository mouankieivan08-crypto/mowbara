/**
 * Service de détection d'urgence vitale locale pour Mwaebara (PWA).
 * Exécuté en priorité absolue dès la saisie de texte de l'utilisatrice.
 * RÈGLE ABSOLUE : N'envoie aucun texte au réseau si un mot-clé critique est détecté.
 */

const CRITICAL_KEYWORDS = [
  'tuer',
  'mort',
  'arme',
  'pistolet',
  'couteau',
  'm\'égorger',
  'poignarder',
  'battre à mort',
  'assassiner',
  'égorger',
  'menace de mort',
  'va me tuer',
  'veut me tuer',
  'suicide',
];

/**
 * Analyse le texte libre saisi par l'utilisatrice.
 * @param text Le texte libre saisi.
 * @returns true si un danger de mort immédiat est détecté localement, false sinon.
 */
export function detectVitalDanger(text: string): boolean {
  if (!text) return false;

  const normalizedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const keyword of CRITICAL_KEYWORDS) {
    const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedText.includes(normalizedKeyword)) {
      return true;
    }
  }

  return false;
}
