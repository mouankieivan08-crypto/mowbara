/**
 * Utilitaire de chiffrement local sécurisé pour le code PIN (PWA Mwaebara).
 * RÈGLE ABSOLUE : Le code PIN en clair ne quitte jamais la mémoire.
 * Utilise l'API Web Crypto native du navigateur pour effectuer un hashage PBKDF2 robuste et étiré (100 000 itérations).
 */

/**
 * Dérive un hash robuste en PBKDF2 pour un code PIN à 4 chiffres.
 * @param pin Le code PIN en clair (4 chiffres).
 * @returns Une promesse contenant la chaîne hexadécimale du hash dérivé.
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();

  // Importer le PIN brut en tant que clé racine de dérivation PBKDF2
  const pinKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Utiliser un sel statique robuste pour le projet
  const salt = encoder.encode('mwaebara-pwa-pbkdf2-salt-congo');

  // Dériver des bits en PBKDF2 (100 000 itérations, SHA-256)
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    pinKey,
    256 // 32 octets (256 bits)
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Compare un PIN saisi avec le hash stocké dans localStorage.
 * @param inputPin Le code PIN saisi par l'utilisatrice.
 * @param storedHash Le hash stocké dans le localStorage.
 * @returns true si le PIN correspond au hash stocké, false sinon.
 */
export async function verifyPin(inputPin: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  const hashedInput = await hashPin(inputPin);
  return hashedInput === storedHash;
}
