# Tasks

## 1. Stockage de la partie en cours

- [x] 1.1 Retirer de `storage.ts` l'ancien format (`SavedGame`, `TurnSnapshot`, `createTurnSnapshot`, `applyTurnSnapshot`, `DeserializedGame`, `deserializeGame`, `buildInitialSavedGame` et les anciens `save/load/clearCurrentGame`), en gardant `serializeBoard`, `restoreBoard`, `deserializeCard` et l'historique ; vérifier que `npm run build` et `npm test` passent sans autre changement
- [x] 1.2 Ajouter `parseSavedGame(raw)` (version 2, face, statut `'choosing-spirit'`/`'playing'`, taille du plateau selon la face, ids de cartes connus dans l'état et dans `turnStart`), avec un commentaire sur la règle d'incrément de version ; vérifier par des tests l'acceptation d'une partie en cours et d'une partie au choix de l'esprit, et le refus d'un JSON invalide, d'une autre version, d'une partie terminée, d'un plateau de la mauvaise taille et d'un id de carte inconnu
- [x] 1.3 Ajouter `saveCurrentGame(state, store)`, `loadCurrentGame(store)` et `clearCurrentGame(store)` sur le modèle de `settings.ts` (store injectable, try/catch, lecture qui ne lève jamais d'exception, suppression de la clé si la sauvegarde est refusée) ; vérifier par des tests avec un store en mémoire l'aller-retour, l'absence de sauvegarde, la suppression d'une sauvegarde invalide et un store qui lève à chaque appel
- [x] 1.4 Vérifier par un test que la reprise est exacte : partir d'une partie, appliquer quelques actions (groupe pris, un jeton posé), faire un aller-retour sauvegarde/lecture, puis constater que `RESTART_TURN` et `END_TURN` donnent le même résultat sur l'état relu que sur l'original (scénarios « Suite de la partie identique » et « Recommencer un tour repris »)

## 2. Sauvegarde et reprise dans l'application

- [x] 2.1 Dans `App`, initialiser la partie depuis `loadCurrentGame()` et sauvegarder ou effacer à chaque changement d'état (effacer quand `status === 'over'`) ; vérifier dans le navigateur qu'après avoir pris un groupe et posé un jeton, un rechargement suivi de la reprise retrouve le même état, et qu'après la fin d'une partie la clé `landscape_current_game` n'existe plus
- [x] 2.2 Ajouter « Reprendre la partie » sur l'accueil (action principale, avec la face et le tour) quand une partie non terminée est en mémoire ; vérifier dans le navigateur les scénarios « Reprendre depuis l'accueil », « Face présélectionnée différente » et « Pas de partie en cours »
- [x] 2.3 Ajouter la boîte de confirmation (style `.overlay`) avant « Commencer » quand une partie est en cours ; vérifier dans le navigateur les scénarios « Abandon confirmé », « Abandon annulé » et « Aucune partie en cours »
- [x] 2.4 Ajouter le bouton « Accueil » dans la ligne d'état du tour, y compris pendant le choix de l'esprit ; vérifier dans le navigateur le scénario « Quitter en plein tour », puis en 375×812 et en 812×375 que le bouton est visible sans défilement et hors du plateau
- [x] 2.5 Vérifier dans le navigateur les cas dégradés : une valeur illisible écrite à la main dans `landscape_current_game` donne un accueil sans « Reprendre » et la clé est supprimée ; avec `localStorage` qui lève une exception, la partie se joue et le retour à l'accueil suivi de la reprise fonctionne
- [x] 2.6 Mettre à jour la section « Données locales » du `README.md` (la partie en cours est enregistrée sur l'appareil et effacée en fin de partie) ; vérifier à la relecture que le texte correspond au comportement

## 3. Vérification d'ensemble

- [x] 3.1 Vérifier que `npm test`, `npm run lint` et `npm run build` passent, puis, avec `npm run build` et `npm run preview`, jouer quelques tours, fermer l'onglet, le rouvrir et reprendre la partie jusqu'à sa fin

## Workflow follow-up

- Archiver `boucle-de-jeu` puis `accueil-et-esprits` avant ce change : les deltas MODIFIED de `accueil` et ADDED de `ecran-de-jeu` ont besoin des specs que ces archivages créent.
