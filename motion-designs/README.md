# Motion designs — Doré et Vous, Happy Fruits & NICA nail's

Trois vidéos publicitaires verticales (1080×1920, 30 i/s, H.264 + AAC), prêtes à publier sur **TikTok, Instagram Reels, Statut WhatsApp et Facebook**.
Chaque vidéo existe en deux versions : **avec voix off** (recommandée) et **musique seule** (pour poser un son tendance TikTok).

| Vidéo | Avec voix off | Musique seule | Durée | Cible |
|---|---|---|---|---|
| **Doré et Vous** | [`dore-et-vous-voixoff.mp4`](output/dore-et-vous-voixoff.mp4) | [`dore-et-vous.mp4`](output/dore-et-vous.mp4) | 29,5 s | Particuliers (B2C), Brazzaville |
| **Happy Fruits** | [`happy-fruits-voixoff.mp4`](output/happy-fruits-voixoff.mp4) | [`happy-fruits.mp4`](output/happy-fruits.mp4) | 29,5 s | Entreprises (B2B), Congo-Brazzaville |
| **NICA nail's** | [`nica-nails-voixoff.mp4`](output/nica-nails-voixoff.mp4) | [`nica-nails.mp4`](output/nica-nails.mp4) | 30 s | Clientes du salon (B2C), réservation WhatsApp |

Les vignettes de couverture sont dans `output/*-cover.jpg`.

Les animations sont **calées sur le tempo** de la musique (120 BPM) : chaque apparition tombe sur un temps.
La musique et les bruitages sont **entièrement synthétisés** (aucun sample, aucun droit d'auteur).

---

## 1. Doré et Vous — « Des crêpes… en tagliatelles ?! »

Style sombre et doré, très gourmand, pour donner faim et déclencher la commande.

| Temps | Scène | Rôle commercial |
|---|---|---|
| 0–2 s | Coulures de chocolat + « Vous avez déjà goûté des crêpes en… **TAGLIATELLES ?!** » | **Accroche** : la curiosité arrête le défilement |
| 2–6 s | Le pot vedette surgit, logo DORÉ *et Vous*, « Des bouchées de bonheur dans chaque pot ! » | Mémorisation de la marque |
| 6–8 s | Le pot expliqué : garnitures / tagliatelles de crêpe / crème onctueuse | On comprend le produit en 2 s |
| 8–18 s | Carrousel des **10 saveurs** (nom + composition) + « Laquelle est votre préférée ? » | Envie + **commentaires** (engagement) |
| 18–21,5 s | « PRIX UNIQUE » → compteur **2000 FCFA**, pot 20 cm | Lève l'objection du prix |
| 21,5–24,5 s | Garnitures supplémentaires 500 / 300 FCFA, « À vous de jouer ! » | Panier moyen plus élevé |
| 24,5–29,5 s | **COMMANDEZ MAINTENANT ! 06 482 63 87** · Brazzaville | Appel à l'action, écran final tenu 3 s (capture d'écran facile) |

## 2. Happy Fruits — « La pause qui recharge vos équipes »

Style frais crème / vert / orange, ton professionnel mais joyeux, pensé pour convaincre un responsable d'entreprise.

| Temps | Scène | Rôle commercial |
|---|---|---|
| 0–3 s | Écran gris : horloge 10h00, « Vos équipes sont déjà… **À PLAT ?!** », batterie qui se vide | **Accroche problème** (fatigue au travail) |
| 3–7 s | Éclaboussure de jus → l'écran prend des couleurs, logo Happy Fruits, la batterie se recharge | La solution, avec un contraste fort |
| 7–9 s | « **6 COMBOS** de fruits frais, prêts à déguster » | Vue d'ensemble de l'offre |
| 9–18 s | Les 6 combos un par un (nom, fruits, promesse) | Désir produit |
| 18–23 s | « Pensé pour vos **ÉQUIPES** » : bureaux, entreprises, écoles, chantiers, ONG + livraison régulière, formats individuels ou en lots, commandes en gros, partenariat long terme | Argumentaire B2B |
| 23–25 s | Engagements : 100 % naturels, sans conservateurs, fruits de saison du Congo · « Le fruit, c'est la vie ! » | Confiance |
| 25–29,5 s | « Offrez à vos équipes la pause qui donne la pêche ! » + bouton **Demandez votre devis** + contact | Appel à l'action |

> **À faire avant de publier Happy Fruits :** aucun numéro de téléphone n'apparaissait sur vos visuels,
> la vidéo affiche donc « Écrivez-nous en message privé ». Pour afficher votre numéro en grand à la fin,
> renseignez-le dans `happy-fruits/index.html` (bloc `CONFIG` en haut du script), puis relancez l'export (voir § 4).
>
> ```js
> const CONFIG = {
>   phone: '06 123 45 67',   // ← votre numéro
>   ...
> ```

## 3. NICA nail's — « Envie d'ongles de reine ? »

Style noir & or luxueux (comme l'affiche des tarifs), rose en accent, musique R&B chic.

| Temps | Scène | Rôle commercial |
|---|---|---|
| 0–3 s | Gros plan photo (French + fleurs 3D + or), « Envie d'ongles **de reine ?** » + pastille **dès 3 000 FCFA** | **Accroche** : désir + prix d'appel |
| 3–6 s | Cadre doré qui se dessine, « Bienvenue chez », couronne, **NICA** *nail's*, « Nous prenons soin de vos ongles ✨ » | Image de marque premium |
| 6–12 s | « Nos réalisations » : vos 2 photos dans une arche dorée (French & nail art / Fleurs 3D & touches dorées) | Preuve du savoir-faire |
| 12–20,5 s | « Nos prestations & tarifs » : les 8 prestations avec photo, numéro et prix, en 2 vagues de 4 | Toute l'offre, lisible |
| 20,5–23 s | « À partir de **3 000 FCFA** » | Lève l'objection du prix |
| 23–26 s | « Pour prendre rendez-vous, envoyez-nous : » nom, prestation, date & heure, photo d'inspiration | Réduit les allers-retours en message |
| 26–30 s | Logo + photo en médaillon, **RÉSERVEZ MAINTENANT**, bouton WhatsApp **06 482 63 87**, « Merci de votre confiance » | Appel à l'action |

---

## 4. Voix off

Voix féminine française synthétisée avec **Kokoro** (modèle libre, licence Apache 2.0, utilisable en publicité),
calée phrase par phrase sur les scènes. La musique baisse automatiquement d'environ 11 dB sous la voix.
Chaque phrase a été vérifiée par transcription automatique (Whisper) : prix et numéros de téléphone sont compris sans erreur.

Les textes ci-dessous peuvent aussi servir de **script si vous préférez enregistrer une vraie voix** (votre voix, un animateur local…) :
calez chaque phrase sur le temps indiqué.

**Doré et Vous**
| Temps | Texte |
|---|---|
| 0,1 s | Des crêpes… en tagliatelles ?! |
| 2,6 s | Doré… et Vous ! Des bouchées de bonheur, dans chaque pot ! |
| 6 s | Crêpe, crème onctueuse, garnitures gourmandes. |
| 8,5 s | Dix saveurs irrésistibles : Oreo, Kinder, mangue, coco, caramel, chocolat… Laquelle sera votre préférée ? Dites-le en commentaire ! |
| 18,1 s | Un seul prix : deux mille francs le pot ! |
| 21,5 s | Et les garnitures, dès trois cents francs ! |
| 24,6 s | Commandez maintenant au 06 482 63 87 ! |

**Happy Fruits**
| Temps | Texte |
|---|---|
| 0,1 s | Dix heures… et vos équipes sont déjà à plat ? |
| 3,2 s | Happy Fruits : la pause fruitée qui recharge vos équipes ! |
| 7 s | Six combos de fruits frais, prêts à déguster. |
| 9,5 s | Mangue, ananas, passion, papaye, pastèque… Des fruits de saison du Congo, cent pour cent naturels, sans conservateurs ! |
| 18,2 s | Bureaux, écoles, chantiers : livraison régulière et commandes en gros. |
| 23,5 s | Le fruit, c'est la vie ! |
| 25,5 s | Offrez-leur la pause qui donne la pêche. Demandez votre devis ! |

**NICA nail's**
| Temps | Texte |
|---|---|
| 0,25 s | Envie d'ongles… de reine ? |
| 3,25 s | Bienvenue chez NICA nail's ! |
| 6,3 s | French, nail art, fleurs en 3D, touches dorées… Découvrez nos réalisations. |
| 12,2 s | Vernis permanent, pose gel, pose américaine, gainage des ongles et des pieds… Toutes nos prestations, à petits prix. |
| 20,6 s | À partir de trois mille francs seulement ! |
| 22,95 s | Pour réserver : votre nom, la prestation et la date. |
| 25,6 s | Sur WhatsApp, au 06 482 63 87 ! |

Les textes se modifient dans le bloc `voice` de chaque `index.html`. La syntaxe `[mot](phonèmes)` impose une prononciation
(utilisée pour « NICA nail's », « WhatsApp », « Happy Fruits », « Oreo », « Kinder »…).

---

## 5. Conseils de publication

**Textes prêts à copier-coller**

*Doré et Vous (TikTok / Reels / Facebook) :*
> 🍫 Des crêpes… en TAGLIATELLES ?! 😱
> 10 saveurs gourmandes, un seul prix : **2000 FCFA** le pot de 20 cm.
> Laquelle est votre préférée ? Dites-le en commentaire 👇
> 📞 Commandez au 06 482 63 87 · 📍 Brazzaville
> #Brazzaville #Congo #Crêpes #Gourmandise #DoréEtVous #Kinder #Oreo #Dessert242

*Happy Fruits (Facebook / LinkedIn / Statut WhatsApp) :*
> 🍍 10h00 et vos équipes sont déjà à plat ?
> Happy Fruits livre à vos bureaux des pots de fruits frais, 100 % naturels et sans conservateurs.
> 6 combos, formats individuels ou en lots, commandes en gros.
> 👉 Demandez votre devis entreprise en message privé.
> #Brazzaville #Congo #Entreprise #BienÊtreAuTravail #FruitsFrais #HappyFruits

*NICA nail's (TikTok / Reels / Statut WhatsApp) :*
> 💅 Envie d'ongles de reine ? 👑
> Vernis permanent, pose gel, pose américaine, French, nail art, fleurs 3D, gainage des pieds…
> **À partir de 3 000 FCFA** ✨
> 📲 Réservez sur WhatsApp au 06 482 63 87 : envoyez votre nom, la prestation, la date/heure et une photo d'inspiration.
> #NailsBrazzaville #Brazzaville #Congo #Ongles #NailArt #PoseGel #FrenchManucure #NICAnails

**Astuces**
- Publiez aux heures de pointe (12h–14h et 19h–22h) et épinglez un commentaire avec le numéro.
- Sur TikTok/Reels, vous pouvez baisser le son d'origine et ajouter un son tendance : les animations restent rythmées.
- Les informations essentielles (prix, téléphone) sont placées hors des zones masquées par l'interface TikTok/Instagram.
- Pour un boost publicitaire Facebook/Instagram, ciblez Brazzaville + rayon 10 km ; pour Happy Fruits, ciblez les intérêts « gestion d'entreprise », « ressources humaines », « petites entreprises ».

---

## 6. Modifier et ré-exporter

Les vidéos sont codées en HTML/JS : chaque texte, couleur ou timing se modifie directement dans
`dore-et-vous/index.html`, `happy-fruits/index.html` et `nica-nails/index.html` (prix, numéro, saveurs, combos, prestations, phrases…).

**Prérequis :** Node 18+, Playwright (`npm i -g playwright` puis `npx playwright install chromium`), ffmpeg, Python 3 + numpy.

**Pour la voix off :** `pip install kokoro-onnx soundfile scipy`, puis placer `kokoro-v1.0.onnx` et `voices-v1.0.bin`
(release « model-files-v1.0 » du dépôt GitHub `thewh1teagle/kokoro-onnx`) dans `engine/models/`
(ou indiquer leur dossier avec la variable `KOKORO_DIR`). Sans ces fichiers, seule la version musique est exportée.

```bash
cd motion-designs
node engine/render.cjs dore-et-vous        # → output/dore-et-vous.mp4 (+ musique + vignette)
node engine/render.cjs happy-fruits        # → output/happy-fruits.mp4
node engine/render.cjs nica-nails          # → output/nica-nails.mp4 + output/nica-nails-voixoff.mp4
node engine/render.cjs nica-nails --audio-only           # refait seulement le son / la voix off (quelques secondes)
node engine/render.cjs nica-nails --audio-only --check   # + transcription automatique de chaque phrase (Whisper, sherpa-onnx)
node engine/render.cjs happy-fruits --stills 5,12,28   # captures PNG pour vérifier une modification
node engine/check.cjs happy-fruits         # détecte les textes qui sortent du cadre
```

**Aperçu en direct dans le navigateur** (avec barre de lecture) :

```bash
cd motion-designs && python3 -m http.server 8000
# puis ouvrir http://localhost:8000/dore-et-vous/, /happy-fruits/ ou /nica-nails/
```

## Structure

```
motion-designs/
├── dore-et-vous/index.html    # composition Doré et Vous
├── happy-fruits/index.html    # composition Happy Fruits (bloc CONFIG à personnaliser)
├── nica-nails/index.html      # composition NICA nail's
├── engine/
│   ├── motion.js              # moteur d'animation déterministe (images clés, easing, aperçu)
│   ├── stage.css              # scène 1080×1920 + polices
│   ├── render.cjs             # export image par image → ffmpeg → MP4
│   ├── music.py               # musique + bruitages synthétisés, calés sur les repères
│   ├── voice.py               # voix off (Kokoro), calage par scène, baisse de la musique sous la voix
│   ├── asr_check.py           # vérification de la voix off par transcription automatique
│   └── check.cjs              # contrôle des débordements de texte
├── assets/
│   ├── src/                   # visuels d'origine (logo, affiches)
│   ├── cut/                   # produits détourés (pots, coupes, garnitures, logo), vignettes des prestations NICA
│   └── fonts/                 # Anton, Permanent Marker, Kaushan Script, Fredoka, Poppins, Pacifico, Cinzel, Great Vibes (licence OFL/Apache)
└── output/                    # vidéos MP4 (voix off + musique seule) + vignettes
```
