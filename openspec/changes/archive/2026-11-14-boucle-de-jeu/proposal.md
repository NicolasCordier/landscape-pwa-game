# Proposal

## Why

Le moteur de règles (plateau, empilement, motifs des cartes, scoring) existe, mais `App.tsx` n'affiche qu'une démo figée : on ne peut pas jouer. Rendre une partie solo jouable de bout en bout est la première étape de la feuille de route, et c'est elle qui permettra de juger l'UX sur téléphone, à l'usage, en vertical comme en horizontal.

## What Changes

- Une partie solo jouable du premier au dernier tour : choisir un groupe de 3 jetons, les poser, prendre éventuellement une carte animal, poser des cubes, terminer le tour.
- Un sac de jetons et une offre centrale de 3 groupes de 3 jetons, rechargée depuis le sac.
- Une pioche de cartes animaux avec une offre de 3 cartes visibles, et une main limitée à 4 cartes non terminées.
- La mise en surbrillance des cases valides à chaque étape : poser un jeton, poser un cube.
- La possibilité de recommencer le tour en cours.
- La détection de la fin de partie et un écran de score détaillé, avec un bouton pour rejouer.
- Un écran de jeu découpé en zones (offre, plateau, main) qui s'adapte au mode vertical et au mode horizontal. Le plateau se dimensionne sur la largeur **et** la hauteur disponibles.
- Correction : pour les cartes dont le cube se pose sur un voisin (`cubeAt: '0'`), la case du cube est mal calculée pour 4 des 6 rotations.
- Une case portant un cube n'accepte plus de jetons.

Hors périmètre, prévu dans les étapes suivantes : écran d'accueil et options (face A/B, esprits), reprise d'une partie sauvegardée, historique et leaderboard, options avancées et cartes propres au jeu. Dans ce change, la partie se joue en face A, sans carte esprit.

## Capabilities

### New Capabilities
- `tour-de-jeu`: déroulement d'un tour solo (offre de jetons, pose des jetons, offre et main de cartes, pose des cubes, fin et annulation du tour) et règles de validité associées.
- `fin-de-partie`: conditions de fin de partie et calcul du score détaillé présenté au joueur.
- `ecran-de-jeu`: organisation de l'écran de jeu sur téléphone, en vertical et en horizontal, et retours visuels (cases valides, phase en cours).

### Modified Capabilities
<!-- Aucune spec n'existe encore dans le projet. -->

## Impact

- `src/App.tsx` : la démo figée est remplacée par l'écran de jeu.
- `src/game/` : nouvel état de partie sérialisable et nouveau reducer ; correction de `BaseCard.canPlace` dans `cards.ts` ; `Cell.canStack` refuse une case avec cube ; fonction de score détaillé dans `scoring.ts`.
- `src/components/` : `HexBoard` se dimensionne aussi sur la hauteur ; `TokenPicker`, `SelectableCards` et `PlayerHand` sont alimentés par l'état réel ; cartes en version compacte.
- Dépendance de développement : ajout de Vitest pour tester le moteur de règles.
- Pas d'impact sur la sauvegarde existante (`storage.ts`) : la persistance arrive dans une étape suivante.
