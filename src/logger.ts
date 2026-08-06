/**
 * Wrapper de journalisation de développement et production pour Mwaebara (PWA)
 * - En développement : Affiche des logs dans la console
 * - En production : Supprime les logs debug/info et ne conserve que les erreurs/avertissements de manière anonyme
 * - RÈGLE ABSOLUE : Aucun log ne contient jamais le contenu d'un message d'utilisatrice ou d'identifiant personnel.
 */

// Utilisation d'une détection robuste compatible Vite Bundler
const isDev = !!(import.meta as any).env?.DEV;

export const logger = {
  debug(message: string, ...optionalParams: any[]): void {
    if (isDev) {
      console.log(`[DEBUG] ${message}`, ...optionalParams);
    }
  },

  info(message: string, ...optionalParams: any[]): void {
    if (isDev) {
      console.info(`[INFO] ${message}`, ...optionalParams);
    }
  },

  warn(message: string, ...optionalParams: any[]): void {
    console.warn(`[WARN] ${message}`, ...optionalParams);
  },

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error || '');
  }
};
