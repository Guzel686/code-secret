# Code secret en couleurs

Jeu solo inspiré du Mastermind, réalisé avec Codex dans le cadre de l’atelier de technologie émergente. L’objectif est une application simple, compréhensible et utilisable sur ordinateur et smartphone.

Version : **0.1.0**, première version locale du 11 novembre 2026. Pour jouer, ouvrir `index.html` dans un navigateur. Choisir quatre couleurs et valider. Au clavier : Tab pour changer de commande, flèches pour choisir une couleur et Entrée pour valider.

Jeu publié : https://guzel686.github.io/code-secret/
Dépôt : https://github.com/Guzel686/code-secret
Version remise J1 : tag [`jalon-1`](https://github.com/Guzel686/code-secret/tree/jalon-1). Ce tag repère la version remise ; le site peut évoluer après ce jalon.

Les fichiers `index.html` et `style.css` décrivent la page et son apparence. `game.js` contient les règles ; `app.js` relie les commandes visibles au même moteur que l’API. Aucune installation ni connexion n’est nécessaire pour jouer localement.

## Règles et sources

Références : énoncé du projet édition 2.1, annexe `code-couleurs-1.0`, contrat API commune 0.2, atelier 5 du 18 novembre 2026 et atelier 4 du 11 novembre 2026 (exercices 4.1 et 4.2). Documents fournis dans la conversation ; supports de cours conservés dans le dossier voisin `jeu`.

- Code secret aléatoire de quatre couleurs parmi rouge, bleu, vert, jaune, orange, violet. Répétitions autorisées.
- Dix essais maximum ; une proposition complète contient quatre couleurs ordonnées.
- Une proposition invalide est expliquée et ne consomme aucun essai.
- Compter les couleurs bien placées, puis les mal placées parmi les occurrences restantes. Chaque occurrence compte une seule fois.
- Quatre bien placées donnent la victoire, même au dixième essai. Sinon, dix essais donnent la défaite.
- L’historique reste visible. Après la fin, seul un redémarrage permet de rejouer.
- L’API 0.2 utilise la même partie que l’interface ; aucun secret n’est exposé dans son état.

## Choix

Proposition de conception de Codex : une seule page, quatre listes de couleurs avec leurs noms et un aperçu coloré, deux boutons et un historique. Les noms permettent de jouer sans devoir distinguer les nuances. HTML, CSS et JavaScript sans framework pour faciliter la compréhension et la reprise.

Périmètre : base des ateliers 4 et 5. Les exercices bonus ne sont pas réalisés.

Question ouverte : l’affichage et les commandes seront-ils assez pratiques sur mon smartphone ? À vérifier sur un appareil réel, en notant son modèle et le résultat.

## Vérifications

### Essais manuels de l’auteur

Résultats déclarés par l’auteur le **18 novembre 2026**, sur **Chrome**, à partir du jeu publié (code du commit `c41e6fd`).

| Test | Attendu | Résultat déclaré |
| --- | --- | --- |
| 1 — Trois couleurs | Refus expliqué ; compteur à 0/10 et historique vide | Réussi |
| 2 — Ajout de la quatrième couleur | Compteur à 1/10 ; proposition et indices dans l’historique ; erreur effacée | Réussi |
| 3 — Nouvelle partie | Compteur à 0/10, historique et indices vidés, quatre choix réinitialisés et erreur effacée | Réussi |
| 4 — Répétitions | Secret imposé rouge–rouge–bleu–vert ; quatre rouges donnent 2 bien placées et 0 mal placée, compteur à 1/10 | Réussi |
| 5 — Victoire | Dans la même partie, rouge–rouge–bleu–vert donne 4 bien placées et 0 mal placée, victoire en 2 essais, validation désactivée | Réussi |

Les cinq résultats ont été confirmés par l’auteur après exécution manuelle sur Chrome. Pour les tests 4 et 5, le secret a été imposé avec `window.codeSecretTest.startGame` en mode `?test=1`, sans redémarrage entre les deux propositions.

### Retour du binôme

Retour transmis par l’auteur le **19 novembre 2026**, sur le jeu publié.

| Manipulation | Attendu | Observé selon le retour transmis |
| --- | --- | --- |
| Valider trois couleurs | Refus sans consommer d’essai | Conforme |
| Valider quatre couleurs | Un essai ajouté avec ses indices | Conforme |
| Nouvelle partie | Remise à zéro | Conforme |
| Jouer librement | Partie utilisable ; signaler les problèmes | Aucun problème signalé ; une partie gagnée en 6 essais |

Navigateur, appareil et date exacte d’exécution non précisés. Une partie gagnée ne valide pas tous les indices possibles.

### Atelier 5 et préparation J1

Scénarios définis le 18 novembre 2026 avant réexécution, version de départ `6c32992` :

| Type | Départ connu et action | Résultat attendu | Obtenu |
| --- | --- | --- | --- |
| Normal | Secret rouge–bleu–vert–jaune ; proposer rouge–vert–bleu–orange | 1 bien placée, 2 mal placées ; 1 essai et 1 entrée | Conforme, test moteur automatisé T01 |
| Limite | Secret rouge–rouge–bleu–vert ; proposer rouge–rouge–rouge–rouge | 2 bien placées, 0 mal placée ; 1 essai et 1 entrée | Conforme, moteur et interface automatisés |
| Négatif | Nouvelle partie ; sélectionner trois couleurs et valider | Refus expliqué ; 0 essai et historique vide | Conforme, moteur et interface automatisés |

Exercice 5.2 : réutiliser `tests/game.test.cjs` et `tests/browser.test.cjs`, sans modifier les règles. Le premier compare les nombres calculés aux valeurs attendues ; le second actionne la vraie page et vérifie les textes, le compteur et l’historique. Aucun bonus de mutation volontaire n’est réalisé.

Exécution du 18 novembre : `node --test tests/game.test.cjs tests/browser.test.cjs` ; **8 tests exécutés, 8 réussis, 0 échec** sur le code du commit `6c32992` (seul le README a changé depuis). Chrome sans fenêtre, fichiers locaux, largeur mobile simulée. Playwright est fourni par l’environnement Codex via `NODE_PATH` ; `CODE_SECRET_BROWSER` indique le chemin du navigateur installé. À cette étape locale, aucun essai personnel de l’auteur n’est revendiqué. La vérification ultérieure du site publié est décrite ci-dessous.

Publication vérifiée le 18 novembre 2026 : les mêmes commandes ont donné **8 réussites et 0 échec**, cette fois avec `CODE_SECRET_URL=https://guzel686.github.io/code-secret/`. Les sept tests du moteur restent locaux ; le scénario navigateur ouvre la vraie URL publique et joue plusieurs coups, vérifie une saisie refusée, l’historique, l’API, une victoire au dixième essai, le redémarrage et le clavier. Jeu publié correspondant au commit `c41e6fd` ; les fichiers du jeu n’ont pas changé pour la préparation du tag. La seule adaptation du test est le choix de l’URL par la variable `CODE_SECRET_URL`.

Contrôle final du 19 novembre 2026 : même commande, **8 tests réussis, 0 échec**, dont le scénario navigateur sur le site publié. Les cinq fichiers du jeu (`index.html`, `style.css`, `game.js`, `app.js`, `package.json`) sont inchangés depuis la version testée par l’auteur et son binôme.

Préparation J1 (20 novembre au soir) :

- [x] Jeu local, README et AGENTS dans le même projet ; étapes enregistrées en commits.
- [x] Trois scénarios, résultats attendus puis obtenus ; tests automatisés réutilisés et exécutés.
- [x] Choix de conception et ajout de la première version expliqués ci-dessous.
- [x] Relire les documents et réaliser les cinq essais personnels (confirmations de l’auteur).
- [x] Publier le dépôt et GitHub Pages, puis ouvrir le lien publié et jouer un coup (contrôle automatisé).
- [x] Recueillir le retour du binôme sur ce jeu : conforme, partie gagnée en 6 essais.
- [x] Documents relus par l’auteur ; version de remise repérée par le tag `jalon-1` sur GitHub.
- [ ] Remplacer `nomdefamille` dans le nom du Word final puis le déposer sur Cyberlearn ; le fichier reste hors du dépôt public.

Pas de vidéo demandée à J1. La copie privée des conversations pour l’étude reste facultative et à effectuer personnellement selon les consentements ; elle ne va pas dans le dépôt public.

Résultats attendus définis avant la réalisation :

| Cas | Manipulation | Attendu | Observé |
| --- | --- | --- | --- |
| Proposition incomplète | Nouvelle partie, sélectionner trois couleurs, valider | Refus expliqué, zéro essai consommé, historique vide | Conforme, moteur et interface testés automatiquement |
| Proposition valide avec répétitions | Secret de test rouge–rouge–bleu–vert, proposer quatre rouges | Deux bien placées, zéro mal placée, un essai et une entrée d’historique | Conforme, moteur et interface testés automatiquement |

Vérifications exécutées le 11 novembre 2026 sur la version locale 0.1.0 :

- `node --test tests/game.test.cjs` (ou `npm test`) : **7 tests réussis**. Ils couvrent aussi les neuf exemples du contrat, les priorités d’erreur, un démarrage invalide sans mutation, la victoire au dixième essai, la défaite, le refus après la fin, le redémarrage et l’indépendance des données retournées.
- `node --test tests/browser.test.cjs` : **1 scénario navigateur réussi**, dans Chrome sans fenêtre avec Playwright. Il contrôle les deux cas du tableau, une action de l’interface relue par l’API, une victoire commandée par l’API visible à l’écran, le redémarrage et une sélection au clavier. Il vérifie aussi l’absence de l’API sans `?test=1`, l’état initial `not-started` avec ce paramètre et l’absence de débordement horizontal à 390 × 844 pixels. Ce test nécessite Playwright et Chromium ; la variable `CODE_SECRET_BROWSER` permet de choisir le chemin d’un navigateur Chrome installé.

Correction du test navigateur : le premier contrôle utilisait `isDisabled()` sur le groupe `fieldset` et obtenait `false`, bien que les commandes enfants soient désactivées. Le contrôle porte maintenant sur le vrai bouton « Valider la proposition » : attendu `true`, obtenu `true`. Il s’agit d’une correction de la vérification, pas d’un défaut de comptage du jeu.

Le cadrage de l’exercice 4.1 est enregistré dans le commit `a179812`. La première version jouable est enregistrée dans le commit suivant, intitulé « Créer et vérifier la première version — exercice 4.2 ».

Ajout expliqué pour J1 : le cadrage seul ne permettait pas de jouer. Ajout d’une page avec quatre sélecteurs et d’un moteur commun au jeu et à l’API. Avant validation, les choix restent modifiables. Avec seulement trois couleurs, le moteur refuse la saisie et l’interface affiche l’explication sans ajouter d’essai. Les deux premiers scénarios du tableau vérifient cet ajout. Codex a proposé et réalisé la structure ; l’auteur a confirmé les cinq essais manuels et a relu les documents ; le retour du binôme est consigné ci-dessus.

## API commune

Ouvrir `index.html?test=1` expose `window.codeSecretTest`. Sans ce paramètre, l’API n’est pas exposée et une partie aléatoire démarre directement. En mode test, cliquer sur « Nouvelle partie » ou utiliser `startGame()` pour démarrer.

Exemple dans la console du navigateur :

```js
const api = window.codeSecretTest;
await api.startGame({ secret: ["rouge", "rouge", "bleu", "vert"] });
await api.submitGuess(["rouge", "rouge", "rouge", "rouge"]);
api.getState(); // 1 essai, 2 bien placées, 0 mal placée
```

Le secret imposé est réservé aux vérifications prévues par le contrat 0.2. Aucun formulaire supplémentaire ni robot des exercices bonus n’est ajouté.

## Limites

Jeu et API vérifiés sur les cas indiqués, localement et via le scénario navigateur publié ; les tests ne prouvent pas tous les comportements possibles ni la conformité complète de l’API. Reste à faire : les cases ouvertes de J1 ci-dessus, puis pour J2 le contrôle complet de conformité de l’API, un essai sur un vrai smartphone, le retour sur le jeu d’un camarade et la capsule. Aucune correction d’un défaut réel du jeu avec preuves avant/après n’est encore documentée ; l’atelier 5 permet un ajout expliqué pour J1, décrit ci-dessus.
