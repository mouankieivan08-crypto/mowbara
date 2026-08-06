# Spécification Écrans MVP — Mwaebara

## 1. Description des Écrans (SPEC)

### S1 : Écran PIN / Verrou
- **Création du code PIN (Premier lancement)** : Formulaire à deux étapes demandant de choisir un code PIN à 4 chiffres, puis de le confirmer. Contient une explication claire : "Aucune récupération possible de votre code. Choisissez un code mémorisable ou ignorez cette étape si vous êtes en urgence." Un bouton "Ignorer le code" permet de passer sans PIN.
- **Écran de verrouillage (Lancements suivants)** : Écran ultra discret sans aucun logo, nom, ni icône. Affiche juste 4 points vides et un pavé numérique custom avec des boutons ronds de 64x64 px.
- **Blocage local** : Après 3 échecs de saisie, le clavier se désactive pendant 30 secondes. Après 6 échecs, il se bloque pendant 5 minutes.
- **Raccourci de secours** : Un bouton de sortie rapide (neutre) est toujours visible en bas de l'écran.

### S2 : Écran Principal — Saisie Situation
- Un en-tête neutre avec un bouton d'accès au répertoire complet des contacts (icône livre), aux paramètres de l'application (icône rouage) et un grand bouton de sortie rapide.
- Un champ de saisie (`textarea`) textuelle de la situation avec `autocomplete="off"`, `spellcheck="false"`. Placeholder : "Décrivez ce qui s'est passé en quelques phrases...".
- Un bouton d'action principal "Analyser la situation" qui lance l'IA de classification juridique.
- Un bandeau d'alerte d'urgence en haut de l'écran avec le 117 en rouge vif `#B3261E`.

### S3 : Écran d'analyse en cours
- Affichage de la situation saisie par l'utilisatrice pour mémoire.
- En-dessous, un indicateur d'attente discret : une bulle de conversation avec trois points statiques (sans animation infinie).
- Après un seuil de 200 ms, affiche des skeletons de chargement représentant le résultat (cartes à 4 lignes de largeurs inégales avec pulsation d'opacité douce de 1.4 s).

### S4 : Écran de Résultats / Orientation
- Identification de la catégorie juridique détectée par la classification avec son titre et une brève explication textuelle neutre.
- Un badge affichant le taux de confiance ou la confirmation.
- Présentation de la carte de contact recommandée la plus adaptée pour la République du Congo (priorise le 1444, l'AFJC pour le juridique, ou les urgences).
- Possibilité d'afficher plusieurs cartes d'aide.
- Bouton pour consulter le texte de loi détaillé.

### S5 : Écran Détail de la Loi Congolaise
- Rappel de la catégorie détectée.
- Explication approfondie et rigoureuse de ce que dit la loi n° 19-2022 ou le code pénal congolais.
- Citations textuelles précises des peines encourues (issues exclusivement de `categories.json`).
- Bouton de retour en un clic à l'écran d'accueil S2.

### S6 : Écran Urgence Immédiate (117)
- Écran à fond rouge d'alerte ou blanc épuré avec de grands boutons rouges, déclenché immédiatement par le module `emergency.ts` si un mot-clé de violence mortelle/armes est détecté.
- Un bouton d'appel géant (56 px minimum) pointant directement sur `tel:117`.
- Des consignes de sécurité vitales très simples : "Mettez-vous en sécurité dans un lieu public", "Fuyez si cela est possible".
- Un bouton d'orientation d'urgence secondaire vers le service d'écoute 1444.
- Le bouton de sortie rapide (0 ms) toujours fonctionnel.

### S7 : Répertoire Complet des Structures d'Aide
- Liste complète de tous les contacts enregistrés dans `/data/contacts.json`.
- Filtrage ou badges par type de service (Écoute, Juridique, Médical, Social).
- Boutons d'appel direct sur chaque carte. Si un contact a son `statut_verification` à `a_verifier`, le bouton d'appel est désactivé et un badge "A vérifier" s'affiche de couleur attention `#8A6A17`.

### S8 : Paramètres de l'Application
- Sélecteur de taille de texte : "Normal", "Grand", "Très grand" (écrit la valeur `taille_texte` dans `localStorage` entre "base", "lg", "xl").
- Sélecteur de langue : "Français" (MVP).
- Bouton de désactivation ou réinitialisation du code PIN local.

### S9 : Guide Juridique Complet
- Permet de consulter librement toutes les catégories de violences et les lois associées définies dans `categories.json` de façon structurée, sans avoir à faire une saisie de texte libre.

### S10 : À propos & Mentions Légales
- Textes de mentions légales neutres pour ne pas éveiller de soupçons (présenté de manière sobre).
- Explication claire de la politique de stricte confidentialité (aucun stockage de vos messages, aucune transmission de données identifiantes).

### S11 : Écran de Repli Global / Error Boundary
- Déclenché en cas d'erreur fatale dans l'application React.
- Affiche un message rassurant : "Une erreur technique est survenue."
- Affiche en dur de grands boutons pour appeler immédiatement le 117 et le 1444.
- Un bouton "Redémarrer l'application".
