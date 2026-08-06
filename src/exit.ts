/**
 * Logique de sortie rapide de l'application Mwaebara (PWA)
 * 1. Vide l'état applicatif en mémoire
 * 2. Écrase l'entrée d'historique courante
 * 3. Redirige instantanément sans animation ni confirmation vers un site neutre (ex: Google Search ou météo)
 */
export function exitQuickly(): void {
  // 1. Vider les variables en mémoire en forçant le rechargement/nettoyage de la page
  try {
    sessionStorage.clear();
  } catch (e) {
    // Échec silencieux
  }

  // 2. Écraser l'historique de navigation
  window.history.replaceState(null, '', '/');

  // 3. Redirection instantanée (0 ms) vers un site neutre et crédible
  window.location.replace('https://www.google.cg');
}
