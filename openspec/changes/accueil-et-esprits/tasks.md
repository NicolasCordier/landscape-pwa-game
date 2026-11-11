# Tasks

## 1. Face choisie et cartes esprit dans le moteur

- [x] 1.1 Faire passer la face par `NEW_GAME` / `newGame(seed, face)`, retirer `SOLO_CONFIG.face` et adapter les tests existants ; vérifier par un test qu'une partie en face B a un plateau de 25 cases vides et qu'une partie en face A en a 23
- [x] 1.2 Faire connaître les cartes esprit à `cardTemplate` (compte des cubes) ; vérifier par un test que le modèle de chaque esprit de `ALL_SPIRIT_CARDS` a 1 cube à poser

## 2. Choix de l'esprit dans le reducer

- [x] 2.1 Ajouter le statut `'choosing-spirit'`, `spiritOffer` (2 esprits tirés après les autres mélanges) et `spirit` ; refuser toutes les actions de tour hors de `'playing'` ; vérifier par des tests qu'une nouvelle partie propose 2 esprits différents, est en `'choosing-spirit'`, et refuse `TAKE_GROUP` et `TAKE_CARD`
- [x] 2.2 Implémenter `CHOOSE_SPIRIT` (un esprit proposé ou `null`, nouvel instantané `turnStart`) et ajouter un helper de test « partie lancée sans esprit » ; vérifier par des tests les scénarios « Prendre un esprit », « Aucun esprit », un id non proposé refusé et « Recommencer le premier tour »
- [x] 2.3 Vérifier par des tests le scénario « Main pleine avec un esprit » (esprit + 3 animaux = prise refusée), puis qu'un esprit dont le cube est posé passe dans les cartes terminées et libère sa place

## 3. Score de l'esprit

- [x] 3.1 Faire passer à `scoreOf` le bonus de l'esprit seulement s'il est terminé ; vérifier par des tests les scénarios « Esprit terminé » (catégorie égale au `scoreBonus` du plateau), « Esprit non terminé » et « Partie sans esprit » (catégorie à 0), et que la catégorie « Animaux » n'est pas modifiée par l'esprit

## 4. Réglage mémorisé

- [x] 4.1 Créer `settings.ts` (lecture et écriture de `{ face }` sous une clé dédiée, avec try/catch et une valeur par défaut `'A'`) ; vérifier par des tests l'aller-retour, l'absence de valeur, un JSON invalide et une face inconnue

## 5. Écran d'accueil et navigation

- [x] 5.1 Créer l'écran d'accueil (titre, choix A/B avec une seule face sélectionnée, « Commencer ») et la navigation `home` / `game` dans `App` ; vérifier dans le navigateur qu'au lancement l'accueil s'affiche, que « Commencer » lance une partie sur la face choisie et que la face est présélectionnée après rechargement de la page
- [x] 5.2 Ajouter « Accueil » à côté de « Rejouer » sur l'écran de score, et faire relancer la même face à « Rejouer » ; vérifier dans le navigateur, sur une partie en face B menée jusqu'à la fin, les deux boutons
- [x] 5.3 Vérifier dans le navigateur, en 375×812 et en 812×375, que le plateau de la face B tient sans défilement ; noter les problèmes de lisibilité éventuels pour l'étape UX

## 6. Choix de l'esprit à l'écran

- [x] 6.1 Afficher les cartes esprit (mention « Esprit » à la place des paliers en format compact, description du bonus en grand) avec les textes de `spiritText.ts` ; vérifier par un test que chaque esprit a une description, et dans le navigateur qu'un esprit agrandi montre son bonus
- [x] 6.2 En phase de choix, afficher dans la zone de la main les 2 esprits et la carte « Aucun », désactiver les jetons, ouvrir les cartes de l'offre sans action avec une note, masquer les commandes du tour ; vérifier dans le navigateur les scénarios « Étudier l'offre avant de choisir », « Lire un esprit », « Prendre un esprit » et « Aucun esprit »
- [x] 6.3 Nommer l'esprit pris sur la ligne « Esprit » de l'écran de score ; vérifier dans le navigateur, sur une partie de test, le nom affiché avec cube posé et sans cube posé

## 7. Vérification d'ensemble

- [x] 7.1 Vérifier que `npm test`, `npm run lint` et `npm run build` passent, puis jouer une partie complète dans le navigateur en face B avec un esprit dont le cube est posé, et contrôler le bonus affiché

## Workflow follow-up

- Archiver `boucle-de-jeu` avant ce change : les deltas MODIFIED de `tour-de-jeu` et `fin-de-partie` ont besoin des specs que cet archivage crée.
- Archiver ce change une fois la partie validée.
