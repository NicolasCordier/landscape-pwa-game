# Design

## Context

Voir `proposal.md` pour la motivation. Points du code actuel qui orientent l'approche :

- `GameState` est déjà un objet JSON pur, jamais muté. Il contient tout ce qu'il faut pour continuer la partie : le sac et la pioche dans leur ordre, les offres, la main, les jetons à poser, et l'instantané `turnStart` utilisé par « Recommencer le tour ». La graine n'est plus nécessaire après `newGame`.
- `App.tsx` garde la partie dans un `useReducer` (`appReducer`) qui vaut `null` tant qu'aucune partie n'est lancée. L'écran affiché est un `useState` à part (`'home' | 'game' | 'cards'`). `onHome` existe déjà pour l'écran de score.
- `storage.ts` contient un ancien format (`SavedGame`, `TurnSnapshot`, `deserializeGame`…) écrit avant le reducer et jamais branché. Il lui manque l'offre, la pioche, les cartes terminées et l'esprit. `state.ts` n'en utilise que `serializeBoard`, `restoreBoard` et `deserializeCard`.
- `settings.ts` a posé le modèle à suivre pour le stockage : un store injectable pour les tests, des accès à `localStorage` protégés par try/catch, des lectures qui ne lèvent jamais d'exception.

## Goals / Non-Goals

**Goals:**
- Garder `gameReducer` pur : la sauvegarde est un effet de bord de l'application, pas du moteur.
- Rendre la lecture de la sauvegarde testable sans navigateur (Vitest, store en mémoire).
- Que le retour à l'accueil et la reprise marchent aussi quand le stockage est indisponible, tant que l'application reste ouverte.

**Non-Goals:**
- Migrer une sauvegarde d'une version de format à une autre : une sauvegarde incompatible est abandonnée.
- Gérer plusieurs onglets ouverts sur la même partie : la dernière écriture gagne.
- Toucher à l'historique (`GameRecord`, `saveGameRecord`, `loadHistory`), qui sera repris à l'étape 4.

## Decisions

### On sauvegarde le `GameState` tel quel, avec une version
La sauvegarde est `{ version: 2, state: GameState }` sous la clé `landscape_current_game`. La reprise est exacte par construction, `turnStart` compris : « Recommencer le tour » fonctionne après une reprise sans traitement particulier.

La version démarre à 2 pour la distinguer de l'ancien format (version 1), même si celui-ci n'a jamais été écrit. Règle à noter dans le code : on incrémente la version dès qu'un changement de `GameState` rend une ancienne sauvegarde inutilisable (champ ajouté sans valeur par défaut, sens d'un champ modifié, ids de cartes renommés).

*Alternative écartée :* compléter l'ancien format `SavedGame` et reconstruire l'état à la lecture. Il faudrait tenir deux modèles en phase pour un gain de taille négligeable (quelques Ko).

### Lecture validée, sauvegarde invalide supprimée
`loadCurrentGame(store)` renvoie un `GameState` ou `null`, et ne lève jamais d'exception. Elle refuse :
- un JSON invalide ou une version différente ;
- une face autre que `'A'`/`'B'`, ou un statut autre que `'choosing-spirit'`/`'playing'` ;
- un plateau dont le nombre de cases ne correspond pas à la face ;
- un id de carte inconnu dans l'offre, la pioche, la main, les cartes terminées ou l'esprit, et la même vérification sur `turnStart`.

En cas de refus, la clé est supprimée, pour ne pas revérifier à chaque lancement. La validation est une fonction pure (`parseSavedGame(raw: string)`), testée sur des cas construits à la main. Elle reste structurelle : on ne rejoue pas les règles pour vérifier que l'état est atteignable.

*Alternative écartée :* faire confiance au JSON lu. Un id de carte renommé entre deux versions ferait planter `cardTemplate` au premier rendu, et l'application ne s'ouvrirait plus du tout.

### La sauvegarde vit dans `App`, à chaque changement d'état
Un `useEffect` sur `state` dans `App` :
- `state === null` : rien ;
- `state.status === 'over'` : `clearCurrentGame()` ;
- sinon : `saveCurrentGame(state)`.

Comme le reducer renvoie le même objet pour une action refusée, l'effet ne s'exécute que lorsque la partie change vraiment. Les écritures sont protégées par try/catch : quota dépassé ou stockage bloqué, la partie continue sans sauvegarde.

*Alternative écartée :* sauvegarder seulement à la fin de chaque tour. On perdrait le tour en cours et le choix de l'esprit, alors qu'écrire quelques Ko par action ne coûte rien.

### L'état en mémoire décide de « Reprendre »
`useReducer(appReducer, null, () => loadCurrentGame())` : la partie sauvegardée est chargée au lancement, mais l'écran reste `'home'`. L'accueil propose « Reprendre la partie » si `state !== null && state.status !== 'over'`, et la commande se contente de passer à l'écran `'game'`. Il n'y a pas de nouvelle action dans le reducer.

C'est l'état en mémoire, et non une relecture du stockage, qui fait foi. Le retour à l'accueil puis la reprise marchent donc même sans stockage, et il n'y a pas d'écart possible entre ce que l'accueil annonce et ce qui est repris.

Le bouton « Accueil » de l'écran de jeu appelle simplement `setScreen('home')`. La partie est déjà sauvegardée par l'effet.

### Confirmation dans l'application, pas avec `window.confirm`
`HomeScreen` reçoit la partie en cours (face et tour, ou `null`). Si une partie est en cours, « Commencer » ouvre une petite boîte de dialogue : « Abandonner la partie en cours ? » avec « Annuler » et « Nouvelle partie ». Elle réutilise le style `.overlay` de `CardZoom`. Le flux de démarrage existant (`startGame`) n'est appelé qu'après confirmation. Le nouvel état remplace l'ancien, puis l'effet écrase la sauvegarde.

*Alternative écartée :* `window.confirm`, qui a un rendu système peu lisible dans la PWA installée et bloque le fil d'exécution.

### Bouton « Accueil » dans la ligne d'état du tour
Le bouton se place dans `.turn-status`, à côté de « Tour N ». Cette ligne est visible pendant le choix de l'esprit comme pendant le tour, dans les deux orientations, et elle est hors du plateau. Le bouton est en style secondaire, petit, pour ne pas concurrencer « Terminer le tour ».

### Nettoyage de `storage.ts`
On supprime `SavedGame`, `TurnSnapshot`, `createTurnSnapshot`, `applyTurnSnapshot`, `DeserializedGame`, `deserializeGame`, `buildInitialSavedGame`, ainsi que les anciens `saveCurrentGame`, `loadCurrentGame` et `clearCurrentGame`. On les remplace par les nouvelles fonctions, sur le modèle de `settings.ts`. On garde `serializeBoard`, `restoreBoard` et `deserializeCard`, utilisés par `state.ts`, ainsi que la partie historique.

## Risks / Trade-offs

- [Une mise à jour qui incrémente la version fait perdre la partie en cours] → On n'incrémente qu'en cas de vraie incompatibilité. Le cas est rare et sans gravité pour un jeu solo.
- [Un `GameState` sauvegardé structurellement valide mais incohérent, par exemple une main de 5 cartes] → Il ne peut venir que d'un bug ou d'une modification à la main. Le reducer refuse déjà les actions invalides, donc la partie reste jouable ou s'abandonne avec « Commencer ».
- [Deux onglets ouverts sur la même partie s'écrasent mutuellement] → Accepté (voir Non-Goals). Sur téléphone, la PWA tourne dans une seule fenêtre.
- [Le stockage plein empêche silencieusement la sauvegarde] → Accepté par la spec : le jeu reste jouable. La sauvegarde ne fait que quelques Ko.

## Migration Plan

Aucune donnée à migrer : la clé `landscape_current_game` n'a jamais été écrite. Le déploiement suit le flux habituel (merge dans `main`, puis publication par GitHub Pages). Pour revenir en arrière, il suffit de revenir au commit précédent : les versions antérieures ne lisent pas cette clé.
