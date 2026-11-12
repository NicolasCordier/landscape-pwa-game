# Design

## Context

Voir `proposal.md` pour la motivation et les specs `tour-de-jeu`, `fin-de-partie` et `ecran-de-jeu` pour le comportement attendu.

État actuel du code qui conditionne l'approche :

- Le moteur repose sur des **classes mutables** : `Cell` (`stack`, `hasCube`) et `BaseCard` (`cubeIndex`). `BaseCard.canPlace` / `getValidPlacements` et toutes les fonctions de `scoring.ts` travaillent sur ces objets reliés entre eux (`cell.neighbors`).
- `storage.ts` définit déjà une forme sérialisable (`SavedGame`, `SerializedCell`, `SerializedCard`), ainsi que `deserializeGame`, qui reconstruit la grille et les cartes. Il définit aussi `createTurnSnapshot` / `applyTurnSnapshot`.
- `Cell.id` est un `crypto.randomUUID()` : il change à chaque reconstruction de la grille, alors que `HexColumn` s'en sert comme clé React et `App` comme identifiant de surbrillance.
- `HexBoard` calcule `hexW` à partir de la **largeur** seule (`ResizeObserver`).
- `Card` a une taille fixe de 80×200 px.
- `BaseCard.canPlace`, pour `cubeAt: '0'`, prend `center.neighbors[rot]`. Or la boucle compare le voisin `i` à `pattern[(i + rot) % 6]`, donc `pattern[0]` se trouve au voisin `(6 - rot) % 6`. Le résultat n'est correct que pour `rot` = 0 ou 3.
- Pas de framework de test dans le projet.

## Goals / Non-Goals

**Goals :**
- Un état de partie unique, sérialisable et immuable, qui pilote tout l'affichage.
- Réutiliser le moteur existant (motifs, empilement, scoring) sans le réécrire.
- Préparer les étapes suivantes (persistance, options, historique) sans les implémenter.

**Non-Goals :**
- Persistance dans `localStorage` et reprise de partie.
- Écran d'accueil, choix de la face, cartes esprits.
- Finition graphique et animations : on vise une mise en page fonctionnelle à juger sur téléphone.

## Decisions

### 1. Un état immuable `GameState` piloté par `useReducer`

`GameState` est un objet JSON pur, proche de `SavedGame` :

```
GameState
  board          SerializedCell[]      ordre colonne par colonne, comme generateBoard
  tokenOffer     (Token[] | null)[3]   null = emplacement pris ce tour
  tokenBag       Token[]
  tokensToPlace  Token[]               jetons du groupe choisi, pas encore posés
  cardDeck       string[]              ids des cartes dans la pioche
  cardOffer      string[]              jusqu'à 3 ids
  hand           SerializedCard[]      cartes non terminées (max 4)
  completed      SerializedCard[]      cartes terminées
  cardActionThisTurn  boolean
  turn           number
  turnStart      TurnSnapshot          état du début du tour
  status         'playing' | 'over'
```

Le reducer traite des actions métier : `TAKE_GROUP`, `PLACE_TOKEN {tokenIdx, cellIdx}`, `TAKE_CARD {cardId}`, `DISCARD_CARD {cardId}`, `PLACE_CUBE {cardId, cellIdx}`, `END_TURN`, `RESTART_TURN`, `NEW_GAME {seed?}`. La sélection en cours (jeton ou carte sélectionnés) est un état d'interface, gardé hors du reducer dans un `useState`.

Pour valider une action ou calculer des surbrillances, le reducer et l'UI reconstruisent la vue objet (grille de `Cell` reliées, cartes) à partir du `GameState`, puis appellent le moteur existant. L'UI le fait dans un `useMemo` sur `state.board`.

*Alternative écartée :* garder les objets mutables et forcer le rendu. Le code serait plus court au départ, mais l'annulation du tour et la future persistance deviendraient fragiles, et React ne voit pas les mutations.

*Alternative écartée :* réécrire le moteur en fonctions pures sur `GameState`. C'est trop de travail pour cette étape, et le moteur actuel fonctionne.

### 2. Identifiants de case stables, basés sur la position

`Cell.id` devient `"col-row"`, fixé par `generateBoard`. Les clés React, les surbrillances et les actions (`cellIdx` ou id) restent alors stables d'une reconstruction à l'autre. Le reste du moteur utilise `id` seulement comme clé de `Set`/`Map`, il n'est donc pas affecté.

### 3. Annulation du tour par instantané

À chaque début de tour (et à `NEW_GAME`), le reducer enregistre une copie de l'état dans `turnStart`. `RESTART_TURN` restaure cette copie telle quelle. Le sac étant déjà mélangé, l'annulation ne re-tire pas de jetons différents. `TurnSnapshot` dans `storage.ts` sera étendu ou remplacé par le type `GameState` sans son propre `turnStart`.

### 4. Aléatoire injectable

Le mélange du sac et de la pioche passe par une fonction `shuffle(array, rng)`, avec `Math.random` par défaut. Les tests fournissent un générateur déterministe à graine.

### 5. Règles retenues pour le solo

Ces choix proviennent de l'exploration et sont décrits dans les specs. Les constantes vivent dans un module de configuration pour pouvoir être ajustées :

- Sac de 120 jetons. Composition initiale : bleu 23, gris 23, marron 21, vert 19, jaune 19, rouge 15. À rééquilibrer plus tard pour le jeu propre à Landscape.
- Offre de 3 groupes ; en fin de tour, les groupes non choisis sont défaussés et les 3 groupes sont retirés du sac.
- Offre de 3 cartes ; une seule action de carte par tour : prendre une carte (4 cartes non terminées au maximum en main) ou défausser une carte de l'offre. L'emplacement libéré reste vide pendant le tour : l'offre n'est complétée depuis la pioche qu'en fin de tour, dans `END_TURN`.
- Fin de partie : 2 cases vides ou moins, ou moins de 9 jetons dans le sac (pas assez pour une offre complète), vérifié en fin de tour.
- Une case avec cube refuse les jetons : vérifié dans `Cell.canStack`.
- Pas d'ordre imposé entre jetons, carte et cubes dans un tour : seule la pose des 3 jetons est obligatoire avant de terminer.

### 6. Correction de la rotation

Dans `canPlace`, la case du cube pour `cubeAt: '0'` devient `center.neighbors[(6 - rot) % 6]`, et le commentaire est corrigé. Des tests couvrent les 6 rotations d'une carte à cube voisin.

### 7. Score détaillé

On ajoute `computeScoreBreakdown(cells, cards, face, spiritBonusFn?)`, qui renvoie la forme de `GameRecord.scoreBreakdown` plus le total. `computeFinalScore` devient la somme de ce détail, pour qu'il n'y ait qu'une seule source de vérité. Les cartes de la main et les cartes terminées comptent toutes les deux.

### 8. Mise en page en zones avec CSS Grid

L'écran de jeu est une grille CSS à trois zones : `offre`, `plateau`, `main`. Une media query `(orientation: landscape)` change seulement `grid-template-areas` :

```
  vertical               horizontal
  +--------+             +-----------+-------+
  | offre  |             |           | offre |
  +--------+             |  plateau  +-------+
  |plateau |             |           | main  |
  +--------+             +-----------+-------+
  | main   |
  +--------+
```

Les styles en ligne actuels restent pour les composants ; la grille est placée dans `App.css` pour pouvoir utiliser les media queries.

`HexBoard` calcule `hexW = min(largeur possible, hauteur possible)`, à partir de la taille de son conteneur. La hauteur d'une grille vaut environ `hexH × (max rangées + 0,5)`, avec `hexH = hexW × √3 / 2`.

Les cartes reçoivent une variante compacte (motif, couleur du terrain, points). Un appui long, ou un bouton loupe, ouvre la carte en grand dans une fenêtre superposée. Le choix du geste se fera au test sur téléphone.

## Risks / Trade-offs

- [Reconstruire la grille de `Cell` à chaque action] → Le plateau ne dépasse pas 28 cases : le coût est négligeable. On mémorise par `state.board`.
- [Deux formes de l'état (JSON et objets) qui peuvent diverger] → Une seule fonction de conversion dans chaque sens, couverte par un test d'aller-retour.
- [Composition du sac et règles solo encore provisoires] → Elles sont isolées dans un module de configuration, et l'équilibrage est prévu pour une étape suivante.
- [Le geste d'agrandissement des cartes est difficile à juger sans test réel] → On commence simple (bouton), puis on ajuste après essai sur téléphone.
- [Les media queries d'orientation ne suffisent pas sur certains écrans (tablette, téléphone pliant)] → La taille du plateau est calculée sur le conteneur et non sur l'écran, donc elle reste correcte dans tous les cas.

## Open Questions

- Geste exact pour agrandir une carte (appui long ou bouton) : à trancher après test sur téléphone. Les specs et les tâches restent les mêmes.
