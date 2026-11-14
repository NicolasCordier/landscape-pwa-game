# Design

## Context

Voir `proposal.md` pour la motivation et `specs/` pour les comportements attendus. Points du code actuel qui orientent l'approche :

- `App.tsx` garde la partie dans un `useReducer`. Un effet sauvegarde chaque nouvel état, ou efface la sauvegarde quand `status` passe à `'over'`. L'écran affiché est un `useState` (`'home' | 'game' | 'cards'`).
- `scoreOf(state)` (`state.ts`) calcule déjà le détail du score d'une partie, esprit compris. L'écran de score l'utilise.
- `storage.ts` contient `GameRecord`, `saveGameRecord` et `loadHistory`, écrits avant le reducer et jamais appelés. Ils accèdent à `localStorage` sans protection et lèveraient une erreur en navigation privée.
- La partie en cours et les réglages suivent déjà le même modèle : store injectable pour les tests, accès protégés par try/catch, lectures qui ne lèvent jamais d'exception.
- `main.tsx` monte l'application en `StrictMode` : en développement, les effets s'exécutent deux fois.
- `GameState` n'a pas d'identifiant. La graine n'est pas conservée après `newGame`.
- La face sélectionnée sur l'accueil est un état local de `HomeScreen`, initialisé depuis `App`. Elle n'est remontée à `App` qu'au lancement d'une partie.

## Goals / Non-Goals

**Goals:**
- Garder `gameReducer` pur : l'enregistrement est un effet de bord de l'application.
- Que l'enregistrement soit idempotent, pour résister au double effet de `StrictMode` et à un écran de score réaffiché.
- Que le classement et le rang affiché en fin de partie marchent aussi quand le stockage est indisponible, tant que l'application reste ouverte.
- Tester le format de l'historique, le classement et le rang sans navigateur (Vitest, store en mémoire).

**Non-Goals:**
- Limiter la taille de l'historique : une partie enregistrée pèse environ 1,5 Ko avec son plateau, mille parties restent sous les 5 Mo de `localStorage`.
- Calculer des statistiques : ce change enregistre les données (cartes, complétion, points de l'esprit) sous une forme directement exploitable, l'écran de statistiques viendra ensuite.
- Suivre les cartes vues dans l'offre sans être prises.

## Decisions

### Un identifiant de partie donné à la création
`GameState` gagne un champ `id: string`. L'action `NEW_GAME` le reçoit, comme la graine : `App` le fabrique à partir de l'heure et de la graine (`Date.now().toString(36)` + `seed.toString(36)`). `newGame` reste une fonction pure.

*Alternative écartée :* `crypto.randomUUID()`. Il n'existe que dans un contexte sécurisé, or le jeu se teste sur téléphone en HTTP sur le réseau local.

*Alternative écartée :* un indicateur « déjà enregistrée » dans le `GameState`. Il faudrait un effet qui modifie l'état qu'il observe, et l'information se perdrait si l'enregistrement échoue.

Les sauvegardes en cours écrites avant ce change n'ont pas d'`id`. `parseSavedGame` leur en donne un à la lecture au lieu de les rejeter : `SAVE_VERSION` reste à 2 et une partie en cours n'est pas perdue à la mise à jour.

### Un enregistrement par partie, dédoublonné par identifiant
L'effet d'`App` qui efface la sauvegarde en fin de partie construit aussi l'enregistrement à partir de l'état final, avec une fonction pure `recordOf(state, endedAt)` :
- `id`, date de fin (ISO), face, nombre de tours, et le résultat de `scoreOf` (sept catégories et total) ;
- `board` : le `board` du `GameState` tel quel (`CellState[]`, piles et cubes), réaffichable avec `buildGrid(face, board)` comme pendant la partie ;
- `cards` : une entrée par carte animal de `hand` et de `completed`, `{ cardId, cubesPlaced, cubesTotal, points }`. `cubesTotal` vient du modèle de la carte (`cardTemplate`), `cubesPlaced` vaut `cubesTotal - cubeIndex`, `points` est le `getScore()` de la carte ;
- `spirit` : `null`, ou `{ cardId, cubePlaced, points }`, où `points` est la catégorie `spirit` du score.

Les cartes sont rangées dans l'enregistrement plutôt que recalculées à partir du plateau : les statistiques n'auront ni à rejouer la partie ni à dépendre des règles de score du moment. Les points sont stockés pour la même raison, même s'ils pourraient se déduire des cubes posés. Une fonction pure `addRecord(history, record)` renvoie l'historique inchangé si l'`id` y figure déjà. Le second passage de `StrictMode`, ou un retour sur l'écran de score, n'ajoute donc rien.

Une partie abandonnée n'atteint jamais `'over'` : elle n'est pas enregistrée, sans traitement particulier.

### L'historique vit dans l'état d'`App`, écrit à chaque ajout
`App` charge l'historique au lancement dans un `useState` et le passe aux écrans qui en ont besoin. À chaque ajout, il met à jour cet état puis l'écrit sur l'appareil. Si l'écriture échoue, l'historique de la session reste juste : le rang en fin de partie et l'écran « Scores » fonctionnent jusqu'à la fermeture.

*Alternative écartée :* relire `localStorage` à chaque affichage. Plus simple, mais le rang en fin de partie serait faux quand le stockage est indisponible, et chaque écran ferait sa propre lecture.

### Format stocké : une version et une liste, validée partie par partie
Sous la clé déjà réservée `landscape_history` : `{ version: 1, records: GameRecord[] }`. À la lecture :
- JSON illisible, version inconnue ou `records` absent : historique vide ;
- chaque partie est validée seule (types des champs, face A ou B, total égal à la somme des catégories, plateau du bon nombre de cases pour la face, jetons connus, cartes avec `0 ≤ cubesPlaced ≤ cubesTotal`) ; une partie invalide est écartée sans faire perdre les autres.

Les identifiants de cartes et d'esprits ne sont pas vérifiés contre la liste des cartes : une carte renommée plus tard ne doit pas faire disparaître une partie. L'écran affiche alors l'identifiant brut via `formatCardName`. C'est aussi pour ça que `cubesTotal` est stocké plutôt que relu sur le modèle de la carte.

`saveHistory` et `loadHistory` prennent un store injectable et ne lèvent jamais d'exception, comme `saveCurrentGame` et `loadCurrentGame`. Le `GameRecord` actuel est remplacé : il lui manque l'esprit et le nombre de tours, et rien ne l'utilise.

### Classement et rang : deux fonctions pures
- `leaderboard(history, face, limit = 10)` : les parties de la face, triées par total décroissant, puis par date croissante à égalité.
- `placement(history, id)` : `{ rank, isRecord }` pour la partie donnée dans le classement de sa face, ou `null` si elle n'est pas dans les 10 premières. `isRecord` vaut vrai si son total dépasse strictement celui de toutes les autres parties de la face (donc toujours pour la première partie sur une face).

`App` calcule `placement` après l'ajout et le passe à `ScoreScreen`. Comme l'égalité classe la plus ancienne devant, une partie qui égale le record est 2e, sans « Nouveau record ».

### Écran « Scores »
Nouveau composant `HistoryScreen` (`src/components/History/`), affiché par `App` quand l'écran vaut `'scores'`. Il reçoit l'historique, la face à montrer d'abord et `onBack`.
- Deux onglets : « Classement » et « Historique ». Le classement a son propre choix de face A/B, réutilisant le style des boutons de face de l'accueil.
- Chaque ligne est un bouton. Le toucher ouvre une vue de détail qui remplace la liste, avec un retour vers elle. Elle reprend la mise en page de `ScoreScreen` : le plateau final (`HexBoard` sur `buildGrid(face, board)`) d'un côté, le tableau des catégories de l'autre, puis la liste des cartes (nom, cubes posés « 2/3 », points) et l'esprit avec ses points. Le tableau des catégories est extrait de `ScoreScreen` dans un composant partagé, pour garder les mêmes libellés.

*Alternative écartée :* une boîte de dialogue. Elle suffisait pour le score seul, mais le plateau a besoin de toute la place de l'écran, en vertical comme en horizontal.
- Les dates sont affichées avec `toLocaleDateString('fr-FR')` et l'heure, pour distinguer deux parties du même jour.
- Le contenu défile verticalement si la liste dépasse l'écran. Le titre et les onglets restent visibles.

### La face présélectionnée remonte à `App`
Pour que l'écran « Scores » s'ouvre sur la face présélectionnée et qu'on la retrouve en revenant à l'accueil, la sélection de face passe dans `App` : `HomeScreen` reçoit `face` et `onFaceChange` au lieu de `initialFace`. Le réglage n'est toujours mémorisé sur l'appareil qu'au lancement d'une partie, comme le demande la spec `accueil`.

## Risks / Trade-offs

- [Deux onglets ouverts terminent une partie chacun] → Chaque onglet réécrit l'historique qu'il a chargé au lancement : la partie de l'un peut écraser celle de l'autre. Accepté : sur téléphone, la PWA tourne dans une seule fenêtre. Relire l'historique juste avant l'écriture limite ce cas à peu de frais, et c'est ce que fait `App`.
- [Le calcul du score change dans une future version] → Les parties déjà enregistrées gardent leur score d'origine. C'est voulu : le classement reflète les parties telles qu'elles ont été jouées.
- [Le format du plateau change dans une future version] → Le plateau enregistré ne serait plus réaffichable. Le format de l'historique a sa propre version : un tel changement l'incrémentera, avec une conversion des anciennes parties plutôt qu'un abandon, puisque l'historique a plus de valeur qu'une partie en cours.
- [Historique effacé avec les données du site] → Accepté et documenté dans le README, comme pour la partie en cours.

## Migration Plan

Rien à migrer : la clé `landscape_history` n'a jamais été écrite. Les parties en cours au moment de la mise à jour reçoivent un identifiant à leur lecture et seront enregistrées normalement à leur fin.
