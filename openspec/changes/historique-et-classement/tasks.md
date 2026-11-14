# Tasks

## 1. Identifiant de partie

- [x] 1.1 Ajouter `id: string` à `GameState` et à l'action `NEW_GAME`, et le recopier dans `newGame` ; adapter les tests existants qui créent une partie ; vérifier que `npm test` et `npm run build` passent
- [x] 1.2 Dans `parseSavedGame`, accepter une sauvegarde sans `id` en lui en donnant un, et refuser un `id` qui n'est pas une chaîne ; vérifier par des tests qu'une sauvegarde version 2 sans `id` est reprise avec un identifiant, et qu'un `id` numérique est refusé
- [x] 1.3 Dans `App`, fabriquer l'identifiant au lancement d'une partie (heure et graine en base 36) ; vérifier dans le navigateur que deux parties lancées à la suite ont des identifiants différents dans `landscape_current_game`

## 2. Stockage de l'historique

- [x] 2.1 Remplacer `GameRecord` par le nouveau format (id, date de fin ISO, face, nombre de tours, détail du score avec total, plateau final, cartes prises `{ cardId, cubesPlaced, cubesTotal, points }`, esprit `{ cardId, cubePlaced, points }` ou `null`) et ajouter `parseHistory(raw)` (version 1, validation partie par partie : total égal à la somme des catégories, plateau du bon nombre de cases, jetons connus, cubes posés entre 0 et le total) ; vérifier par des tests l'acceptation d'un historique valide, l'historique vide pour un JSON invalide ou une autre version, l'exclusion d'une seule partie invalide parmi d'autres, et l'acceptation d'un id de carte inconnu
- [x] 2.2 Remplacer `saveGameRecord` et `loadHistory` par `loadHistory(store)` et `saveHistory(history, store)` sur le modèle de `loadCurrentGame` (store injectable, try/catch, jamais d'exception) ; vérifier par des tests avec un store en mémoire l'aller-retour, l'absence d'historique et un store qui lève à chaque appel
- [x] 2.3 Ajouter `recordOf(state, endedAt)` qui construit l'enregistrement à partir d'une partie terminée (score via `scoreOf`, plateau, cartes animaux de la main et des cartes terminées, esprit), et `addRecord(history, record)` qui ignore un `id` déjà présent ; vérifier par des tests que l'enregistrement reprend la face, les tours, le score et le plateau, les scénarios « Carte terminée et carte en cours », « Carte défaussée », « Esprit dont le cube est posé », « Esprit dont le cube n'est pas posé » et « Sans esprit », et qu'un double ajout ne crée pas de doublon

## 3. Classement et rang

- [x] 3.1 Ajouter `leaderboard(history, face, limit = 10)` ; vérifier par des tests le tri par total décroissant, l'égalité départagée par la date la plus ancienne, le filtre par face et la limite à 10 (scénarios « Classement de la face A » et « Égalité »)
- [x] 3.2 Ajouter `placement(history, id)` qui renvoie `{ rank, isRecord }` ou `null` ; vérifier par des tests les scénarios « Nouveau record », « Entrée dans le classement », « Égalité avec le record », « Hors classement » et « Première partie sur la face »

## 4. Enregistrement en fin de partie

- [x] 4.1 Dans `App`, charger l'historique au lancement dans un état, et dans l'effet de fin de partie relire l'historique, ajouter l'enregistrement, mettre l'état à jour puis écrire ; vérifier dans le navigateur (en développement, donc avec `StrictMode`) qu'une partie terminée apparaît une seule fois dans `landscape_history`, et qu'une partie abandonnée n'y apparaît pas
- [x] 4.2 Extraire le tableau des catégories de `ScoreScreen` dans un composant partagé, puis afficher sur l'écran de score « Nouveau record » ou le rang dans la face à partir de `placement` ; vérifier dans le navigateur une première partie (record), puis une partie moins bonne (2e), et qu'en 375×812 et 812×375 la mention reste visible sans défilement
- [x] 4.3 Vérifier dans le navigateur qu'avec `localStorage` qui lève une exception, une partie se termine sans erreur et l'écran de score indique quand même « Nouveau record »

## 5. Écran « Scores »

- [x] 5.1 Remonter la face sélectionnée dans `App` (`HomeScreen` reçoit `face` et `onFaceChange`), sans mémoriser le réglage avant le lancement d'une partie ; vérifier dans le navigateur que la face choisie est conservée après un passage par « Voir les cartes », et que le scénario « Retour sur l'application » de la spec `accueil` reste vrai
- [x] 5.2 Créer `HistoryScreen` avec les onglets « Classement » (choix de face A/B, rangs numérotés) et « Historique » (date et heure, face, esprit, total), avec un message quand la liste est vide ; vérifier dans le navigateur les scénarios « Classement de la face A », « Face sans partie », « Consulter l'historique » et « Aucune partie terminée », à partir d'un historique écrit à la main dans `landscape_history`
- [x] 5.3 Ouvrir la vue de détail d'une partie au toucher d'une ligne, dans les deux onglets : plateau final, catégories, total, tours, cartes avec cubes posés et points, esprit avec ses points ; vérifier dans le navigateur les scénarios « Ouvrir le détail » et « Cartes de la partie », le retour à la liste sur le même onglet, et en 375×812 et 812×375 que le plateau est entièrement visible
- [x] 5.4 Ajouter la commande « Scores » sur l'accueil et l'écran `'scores'` dans `App`, ouvert sur la face présélectionnée ; vérifier dans le navigateur les scénarios « Ouvrir les scores » et « Revenir à l'accueil »
- [x] 5.5 Vérifier en 375×812 et en 812×375 qu'avec 25 parties dans l'historique la liste défile alors que le titre, les onglets et le retour restent visibles, et que l'écran ne défile pas horizontalement
- [x] 5.6 Vérifier dans le navigateur les cas dégradés de l'écran : une valeur illisible dans `landscape_history` donne un écran vide sans erreur, et une partie invalide parmi quatre laisse les trois autres affichées
- [x] 5.7 Mettre à jour la section « Données locales » du `README.md` (les parties terminées sont enregistrées sur l'appareil, propres à chaque adresse, perdues si on efface les données du site) ; vérifier à la relecture que le texte correspond au comportement

## 6. Vérification d'ensemble

- [x] 6.1 Vérifier que `npm test`, `npm run lint` et `npm run build` passent, puis, avec `npm run build` et `npm run preview`, terminer deux parties, fermer l'onglet, le rouvrir et retrouver les deux parties dans le classement et l'historique

## Workflow follow-up

- Archiver le change une fois mergé dans `main`.
