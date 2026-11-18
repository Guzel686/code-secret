# Code secret en couleurs

Jeu solo inspiré du Mastermind, réalisé avec Codex dans le cadre de l’atelier de technologie émergente. L’objectif est une application simple, compréhensible et utilisable sur ordinateur et smartphone.

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
| Proposition incomplète | Nouvelle partie, sélectionner trois couleurs, valider | Refus expliqué, zéro essai consommé, historique vide | Non exécuté |
| Proposition valide avec répétitions | Secret de test rouge–rouge–bleu–vert, proposer quatre rouges | Deux bien placées, zéro mal placée, un essai et une entrée d’historique | Non exécuté |

Version de cadrage : commit « Cadrer le Code secret — exercice 4.1 ».

## Limites

À ce stade, seul le cadrage est créé. Jeu, API, tests exécutés, publication et essai smartphone restent à réaliser. Aucun résultat de test ni correction avant/après n’est encore revendiqué.
