# Tasks

## 1. Outillage de test

- [x] 1.1 Ajouter Vitest en dépendance de développement et un script `npm test` ; vérifier qu'un test trivial passe avec `npm test`

## 2. Corrections du moteur

- [x] 2.1 Rendre `Cell.id` stable (`"col-row"`, fixé dans `generateBoard`) et vérifier par un test que deux grilles générées ont les mêmes ids
- [x] 2.2 Corriger la case du cube pour `cubeAt: '0'` dans `BaseCard.canPlace` (voisin `(6 - rot) % 6`) et son commentaire ; vérifier par un test, pour chacune des 6 rotations, que le cube est proposé sur la bonne case
- [x] 2.3 Faire refuser par `Cell.canStack` tout jeton sur une case avec cube ; vérifier par un test
- [x] 2.4 Ajouter `computeScoreBreakdown` dans `scoring.ts` et faire de `computeFinalScore` la somme de ce détail ; vérifier par des tests que le total est égal à la somme des catégories et que la catégorie esprit vaut 0 sans esprit

## 3. État de partie et reducer

- [x] 3.1 Créer le module de configuration solo (composition du sac, taille des offres, main max, seuil de fin) et `shuffle(array, rng)` ; vérifier par un test qu'un même générateur à graine donne le même mélange
- [x] 3.2 Définir `GameState` et les conversions état ↔ vue objet (grille de `Cell`, cartes) ; vérifier par un test d'aller-retour que l'état est inchangé
- [x] 3.3 Implémenter `NEW_GAME` (mise en place, `turnStart`) ; vérifier par un test le plateau vide, 3 groupes de 3 jetons, 3 cartes proposées, la main vide et un sac de 111 jetons
- [x] 3.4 Implémenter `TAKE_GROUP` et `PLACE_TOKEN` avec refus des actions invalides ; vérifier par des tests un seul groupe par tour, une pose autorisée, une pose refusée et une case avec cube refusée
- [x] 3.5 Implémenter `TAKE_CARD` (une par tour, 4 cartes non terminées max, recharge de l'offre depuis la pioche) ; vérifier par des tests les scénarios « Prendre une carte », « Main pleine » et « Deuxième carte »
- [x] 3.6 Implémenter `PLACE_CUBE` (validité via le moteur, carte terminée déplacée vers `completed`) ; vérifier par des tests une pose valide, une pose refusée et une carte terminée qui libère une place
- [x] 3.7 Implémenter `END_TURN` (refus s'il reste des jetons, recharge de l'emplacement pris, tour + 1, nouvel instantané, détection de fin) ; vérifier par des tests une fin refusée, la recharge d'un seul emplacement, la fin par plateau presque plein et la fin par sac épuisé
- [x] 3.8 Implémenter `RESTART_TURN` ; vérifier par un test qu'après plusieurs actions l'état est identique à celui du début du tour

## 4. Écran de jeu

- [x] 4.1 Faire calculer à `HexBoard` sa taille sur la largeur et la hauteur de son conteneur ; vérifier dans le navigateur, en 375×812 et en 812×375, que le plateau tient sans défilement
- [x] 4.2 Créer la mise en page en grille à trois zones (offre, plateau, main) avec une variante horizontale dans `App.css` ; vérifier dans le navigateur aux deux orientations que les trois zones sont visibles sans défilement de page
- [x] 4.3 Ajouter la variante compacte de `Card` et l'affichage en grand d'une carte ; vérifier dans le navigateur qu'une carte s'ouvre en grand puis se referme
- [x] 4.4 Brancher `TokenPicker` sur `tokenOffer` et `tokensToPlace` (choix d'un groupe, sélection du jeton à poser) ; vérifier dans le navigateur qu'un groupe pris ne peut plus être changé
- [x] 4.5 Brancher `SelectableCards` et `PlayerHand` sur `cardOffer` et `hand` (prise d'une carte, sélection d'une carte de la main) ; vérifier dans le navigateur qu'une carte prise passe en main et que l'offre se recharge
- [x] 4.6 Mettre en surbrillance les cases valides selon la sélection (jeton ou carte), avec un message quand aucune case ne convient ; vérifier dans le navigateur les trois scénarios de surbrillance
- [x] 4.7 Ajouter l'indication d'étape (jetons restants) et les commandes « Terminer le tour » et « Recommencer le tour » ; vérifier dans le navigateur que « Terminer » ne s'active qu'une fois les 3 jetons posés
- [x] 4.8 Remplacer la démo figée de `App.tsx` par l'écran de jeu alimenté par le reducer ; vérifier que `npm run build` et `npm run lint` passent

## 5. Écran de fin de partie

- [x] 5.1 Afficher l'écran de score (détail par catégorie, total, plateau final) quand `status` vaut `'over'`, avec un bouton « Rejouer » ; vérifier dans le navigateur, sur une partie de test proche de la fin, l'affichage puis le redémarrage

## 6. Défausse d'une carte de l'offre

- [x] 6.1 Implémenter `DISCARD_CARD` (action de carte partagée avec `TAKE_CARD`, une par tour, possible main pleine, recharge de l'offre) ; vérifier par des tests les scénarios « Défausser une carte », « Défausse avec la main pleine » et « Une seule action de carte par tour »
- [x] 6.2 Ajouter le bouton « Défausser cette carte » dans la vue agrandie d'une carte de l'offre ; vérifier dans le navigateur qu'une carte défaussée quitte l'offre sans entrer en main, puis que prendre une carte n'est plus possible ce tour
- [x] 6.3 Ne compléter l'offre de cartes qu'en fin de tour (`END_TURN`), pour la prise comme pour la défausse ; vérifier par des tests que l'emplacement reste vide pendant le tour puis est rechargé au tour suivant, et dans le navigateur que la nouvelle carte n'apparaît qu'après « Terminer le tour »

## 7. Vérification d'ensemble

- [ ] 7.1 Jouer une partie complète sur un téléphone Android (`npm run dev -- --host`, même Wi-Fi), en tournant l'écran pendant la partie ; noter les problèmes d'UX constatés pour les prochaines étapes

## Workflow follow-up

- Archiver le change après validation de la partie complète sur téléphone.
