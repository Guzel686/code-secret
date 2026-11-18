# Code secret en couleurs

Jeu solo inspiré du Mastermind, réalisé avec Codex dans le cadre de l’atelier de technologie émergente. L’objectif est une application simple, compréhensible et utilisable sur ordinateur et smartphone.

Version : **0.1.0**, première version locale du 11 novembre 2026. Pour jouer, ouvrir `index.html` dans un navigateur. Choisir quatre couleurs et valider. Au clavier : Tab pour changer de commande, flèches pour choisir une couleur et Entrée pour valider.

Les fichiers `index.html` et `style.css` décrivent la page et son apparence. `game.js` contient les règles ; `app.js` relie les commandes visibles au même moteur que l’API. Aucune installation ni connexion n’est nécessaire pour jouer localement.

## Règles et sources

Références : énoncé du projet édition 2.1, annexe `code-couleurs-1.0`, contrat API commune 0.2 et atelier 4 du 11 novembre 2026 (exercices 4.1 et 4.2). Documents fournis dans la conversation ; supports de cours conservés dans le dossier voisin `jeu`.

- Code secret aléatoire de quatre couleurs parmi rouge, bleu, vert, jaune, orange, violet. Répétitions autorisées.
- Dix essais maximum ; une proposition complète contient quatre couleurs ordonnées.
- Une proposition invalide est expliquée et ne consomme aucun essai.
- Compter les couleurs bien placées, puis les mal placées parmi les occurrences restantes. Chaque occurrence compte une seule fois.
- Quatre bien placées donnent la victoire, même au dixième essai. Sinon, dix essais donnent la défaite.
- L’historique reste visible. Après la fin, seul un redémarrage permet de rejouer.
- L’API 0.2 utilise la même partie que l’interface ; aucun secret n’est exposé dans son état.

## Choix

Proposition de conception de Codex : une seule page, quatre listes de couleurs avec leurs noms et un aperçu coloré, deux boutons et un historique. Les noms permettent de jouer sans devoir distinguer les nuances. HTML, CSS et JavaScript sans framework pour faciliter la compréhension et la reprise.

Périmètre de la séance : exercices 4.1 et 4.2. Les exercices bonus 4.3 et 4.4 ne sont pas réalisés.

Question ouverte : l’affichage et les commandes seront-ils assez pratiques sur mon smartphone ? À vérifier sur un appareil réel, en notant son modèle et le résultat.

## Vérifications

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

Ajout expliqué pour J1 : le cadrage seul ne permettait pas de jouer. Ajout d’une page avec quatre sélecteurs et d’un moteur commun au jeu et à l’API. Avant validation, les choix restent modifiables. Avec seulement trois couleurs, le moteur refuse la saisie et l’interface affiche l’explication sans ajouter d’essai. Les deux premiers scénarios du tableau vérifient cet ajout. Codex a proposé et réalisé la structure ; l’auteur doit encore relire et essayer personnellement la page.

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

Jeu et API vérifiés localement sur les cas indiqués ; les tests ne prouvent pas tous les comportements possibles. Reste à faire : relecture et essai personnel par l’auteur, commits, publication GitHub Pages et contrôle de l’API sur l’URL publiée, essai sur un vrai smartphone, retour sur le jeu d’un camarade et capsule J2. Aucune correction d’un défaut réel du jeu avec preuves avant/après n’est encore documentée. Aucun lien public ni tag de jalon n’est encore créé.
