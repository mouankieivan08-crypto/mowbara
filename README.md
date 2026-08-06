# Mwaebara MVP 🇨🇬

Mwaebara est une PWA (Progressive Web App) d'orientation juridique conçue pour les femmes victimes de violences en République du Congo.

L'objectif de l'application est de permettre à l'utilisatrice de décrire sa situation en texte libre, d'identifier de manière totalement sécurisée et anonyme la catégorie juridique associée à sa situation, d'expliquer ce que dit la loi congolaise, et de l'orienter vers des numéros et des structures d'aide adaptés.

---

## 🔒 Principes Cruciaux de Sécurité & Confidentialité

Le projet est régi par des contraintes absolues de sécurité détaillées dans `AGENTS.md`. Tout collaborateur **doit** scrupuleusement les respecter :

1. **Aucun compte utilisateur ni stockage centralisé :** Il n'y a pas d'authentification par e-mail, téléphone, OAuth ou mot de passe.
2. **Double verrouillage local (PIN) :** L'accès est protégé par un code PIN à 4 chiffres facultatif mais encouragé.
   - Le PIN en clair n'est jamais stocké.
   - Il est haché localement via l'API Web Crypto avec **PBKDF2 (100 000 itérations, sel fixe, SHA-256)** et stocké sous la clé `pin_hash` dans le `localStorage`.
   - Tout échec de saisie incrémente un compteur de tentatives temporaire en mémoire pour appliquer un verrouillage de sécurité (30s après 3 échecs, 5 min après 6 échecs).
3. **Zéro persistance des conversations :** Le texte de l'utilisatrice et l'analyse de sa situation sont conservés exclusivement dans l'état React (`AppStateContext`). Rien n'est écrit dans le stockage local ou envoyé vers un serveur externe à des fins de stockage ou de pistage.
4. **Bouton Sortie Rapide (Bouton d'Urgence global) :** Accessible depuis chaque écran et modale en un clic, il redirige instantanément (0 ms) vers un site neutre (Google actualités) en nettoyant entièrement l'état React pour ne laisser aucune trace visible de navigation.
5. **Routage Neutre et Sécurisé :** Les URLs de l'application utilisent des identifiants neutres (ex: `/a`, `/b`, `/r/1`) qui ne révèlent pas la nature de l'écran affiché. De plus, la navigation s'effectue exclusivement par `window.history.replaceState` pour empêcher tout retour en arrière physique ou virtuel de remonter l'historique d'orientation.
6. **Pas d'analytique tiers ni de trackers :** Sentry, session replays, cookies ou Google Analytics sont strictement proscrits. Les seuls logs métier autorisés sont asynchrones, anonymisés à 100 %, sans adresses IP, sans texte de message, ni géolocalisation.

---

## 🛠️ Pile Technique (Stack)

- **Framework :** React 18+ avec TypeScript en mode strict.
- **Build Tool :** Vite.
- **Styling :** Tailwind CSS v4.
  - Configuration de thème entièrement dynamique tirée directement de `design/tokens.json` et injectée via la directive `@theme` dans `src/index.css`.
  - Pas de classes arbitraires en dur (utilisation exclusive des variables du design system).
- **Internationalisation :** `i18next` & `react-i18next`.
- **Animations :** `framer-motion` (toutes les transitions respectent `prefers-reduced-motion`).
- **PWA / Service Worker :** Workbox (`public/sw.js` écrit en pur JS natif pour s'assurer d'une compatibilité sans faille avec tous les navigateurs mobiles sans compilation complexe).
- **Aucune librairie de composants UI tierce** (tous les composants sont écrits à la main et sur mesure).
- **Budget de bundle strict :** ≤ 150 Ko gzippé pour le chargement initial.

---

## 📂 Organisation du Dépôt

```bash
├── data/
│   ├── categories.json   # Base de données des catégories juridiques congolaises
│   └── contacts.json     # Liste des structures d'aide officielles (Urgence, Écoute, Juridique...)
├── design/
│   ├── SPEC.md           # Spécifications UX/UI détaillées
│   └── tokens.json       # Palette de couleurs, espacements et arrondis officiels du projet
├── i18n/
│   └── fr.json           # Dictionnaire des textes de l'application (Français)
├── public/
│   ├── manifest.webmanifest # Manifeste PWA discret (sans logo de violences)
│   └── sw.js             # Service Worker optimisé pour le cache hors-ligne des statiques
├── src/
│   ├── components/       # Composants UI sur mesure (Boutons, Saisie, Modales, Cartes, etc.)
│   ├── routes/           # Écrans de l'application (S1 à S11)
│   ├── services/
│   │   ├── emergency.ts  # Analyse locale en texte libre des situations d'urgence critique
│   │   └── pinCrypto.ts  # Implémentation PBKDF2 via Web Crypto pour la sécurité du PIN
│   ├── App.tsx           # Point d'entrée de navigation neutre
│   ├── AppStateContext.tsx # Gestion d'état globale de la PWA et navigation par replaceState
│   ├── index.css         # Thème Tailwind v4 et styles fondamentaux de reset PWA
│   ├── logger.ts         # Wrapper de log unifié désactivé en production
│   └── main.tsx          # Initialisation React et i18n
├── vite.config.ts        # Configuration du bundler Vite avec injection CSS v4
└── tsconfig.json         # Paramètres stricts de TypeScript
```

---

## ⚙️ Installation et Développement Local

### Prérequis

- Node.js (version 18 ou supérieure recommandée)
- npm ou bun

### 1. Installation des dépendances

```bash
npm install
```

### 2. Démarrage du serveur de développement

Pour lancer l'application localement avec le rechargement à chaud (Hot Module Replacement) :

```bash
npm run dev
```

### 3. Compilation pour la production

Pour générer l'application optimisée pour la mise en production :

```bash
npm run build
```

Le résultat de la compilation se trouve dans le dossier `dist/`. La taille totale du bundle de production gzippé respecte notre budget de 150 Ko.

---

## 🔍 Processus de Contribution pour les Collaborateurs

Avant de soumettre une Pull Request, assurez-vous d'avoir validé les points suivants :

1. **Vérification TypeScript strict :**
   Exécutez `npm run type-check` (ou `npx tsc --noEmit`) pour vérifier l'absence d'erreurs de typage.
2. **Build sans avertissement :**
   Lancez `npm run build` et vérifiez que le projet se compile sans la moindre erreur.
3. **Respect absolu d'`AGENTS.md` :**
   Lisez et validez les 27 règles du fichier `AGENTS.md`. Un non-respect de ces directives de sécurité ou d'UI invalidera instantanément la contribution.
4. **Tests de flux :**
   Testez manuellement ou via des scripts de test (comme Playwright) que les écrans d'erreur s'affichent correctement si l'API échoue, et que l'urgence vitale est bien interceptée localement.
