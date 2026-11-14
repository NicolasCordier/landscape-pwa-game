# Design

## Context

Le jeu repose sur un reducer pur (`gameReducer`) qui travaille sur un `GameState` sérialisable. `newGame(seed)` lit la face dans `SOLO_CONFIG.face`, fixée à `'A'`. Plusieurs briques existent déjà dans le moteur :
- le plateau de la face B (`generateBoardType('B')`, 7×4) et le score de rivière de la face B ;
- les 10 `SpiritCard`, chacune avec un seul cube (`points: [0]`) et sa fonction `scoreBonus(cells)` ;
- `computeScoreBreakdown`, qui accepte déjà un paramètre `spiritBonusFn`.

Il manque deux choses : un moyen de choisir la face, et l'intégration des esprits dans l'état et dans l'écran. Point à corriger en passant : `cardTemplate` et le compte des cubes ne cherchent que dans `ALL_ANIMAL_CARDS`.

## Goals / Non-Goals

**Goals:**
- Garder le reducer pur et déterministe pour une graine donnée, le tirage des esprits compris.
- Traiter l'esprit en main comme une carte ordinaire (`CardState`), pour réutiliser la sélection, la surbrillance, `PLACE_CUBE` et le passage en cartes terminées.

**Non-Goals:**
- Sauvegarder la partie en cours : sans reprise de partie (étape 3), il n'y a pas de retour à l'accueil pendant une partie.
- Équilibrer les esprits ou modifier leurs règles de bonus.

## Decisions

### Une phase « choix de l'esprit » dans `status`
`status` passe à `'choosing-spirit' | 'playing' | 'over'`. `NEW_GAME` crée l'état en `'choosing-spirit'`, avec un nouveau champ `spiritOffer: string[]` qui contient les 2 ids d'esprits. Toutes les actions de tour sont refusées hors de `'playing'`.

*Alternative écartée* : un état « avant partie » séparé, géré dans `App`. Il dupliquerait la mise en place, alors que l'offre du tour 1 doit déjà exister pendant le choix pour être affichée.

### Une action `CHOOSE_SPIRIT { cardId: string | null }`
Elle n'est acceptée qu'en `'choosing-spirit'`, avec un id présent dans `spiritOffer` ou `null` pour « Aucun ». Elle ajoute l'esprit à `hand` avec `cubeIndex: 1`, vide `spiritOffer`, passe en `'playing'` et **prend un nouvel instantané `turnStart`**. C'est cet instantané qui rend le choix définitif : `RESTART_TURN` revient à l'état d'après le choix. `spiritOffer` reste hors de `TurnData` pour ne pas réapparaître après un `RESTART_TURN`.

### L'esprit pris est mémorisé dans `spirit: string | null`
On garde l'id de l'esprit pris dans un champ dédié, en plus de sa présence dans `hand` ou `completed`. Ce champ sert à deux choses : nommer l'esprit sur l'écran de score même s'il n'est pas terminé, et éviter de distinguer les esprits des animaux par recherche dans les registres. `scoreOf` passe `spiritBonusFn` seulement si l'esprit est dans `completed`. Comme `SpiritCard.getScore()` vaut 0, la catégorie « Animaux » n'est pas faussée.

### Le tirage des esprits utilise le même générateur que la partie
Dans `newGame(seed, face)`, on mélange les ids de `ALL_SPIRIT_CARDS` avec le même `rng`, *après* les mélanges du sac et de la pioche. On prend les 2 premiers. Les mélanges existants ne changent donc pas pour une graine donnée.

### La face entre dans `NEW_GAME`
`NEW_GAME` devient `{ type: 'NEW_GAME'; seed: number; face: 'A' | 'B' }` et `SOLO_CONFIG.face` disparaît. `GameState.face` existe déjà et alimente `buildGrid` et le score.

### La navigation est gérée dans `App`, sans routeur
`App` garde un état `screen: 'home' | 'game'`. Le reducer n'est initialisé qu'au clic sur « Commencer » : on dispatche `NEW_GAME` avec la face choisie. « Accueil », sur l'écran de score, repasse à `'home'`.

*Alternative écartée* : react-router. Deux écrans ne justifient pas une dépendance, et une PWA installée n'a pas de barre d'adresse.

### Le réglage est stocké dans son propre module, `settings.ts`
On stocke `{ face }` sous une clé dédiée (`landscape.settings`), dans un module séparé de `storage.ts`, qui reste réservé aux parties (étapes 3 et 4). La lecture tolère l'absence de valeur, un JSON invalide ou une valeur inattendue, et renvoie alors `{ face: 'A' }`. Les appels à `localStorage` sont protégés par try/catch. L'écriture se fait au clic sur « Commencer ».

### Le choix de l'esprit s'affiche dans la zone de la main
En phase `'choosing-spirit'`, la zone de la main affiche « Choisis ton esprit », puis 2 cartes compactes d'esprit et une carte vide « Aucun ». Toucher un esprit l'ouvre en grand (`CardZoom`) avec l'action « Prendre cet esprit ». Toucher « Aucun » choisit directement, car c'est sans ambiguïté et un esprit reste visible pour comparer. Pendant cette phase :
- `TokenPicker` est désactivé ;
- les cartes de l'offre s'ouvrent en grand, sans action, avec la note « Choisis d'abord ton esprit ».

Les commandes du tour (« Terminer », « Recommencer ») sont masquées.

### L'affichage d'une carte esprit
`CompactCard` et `Card` détectent un esprit (`instanceof SpiritCard`). Ils affichent une mention « Esprit » à la place des paliers de points, et la vue agrandie affiche la description du bonus. Ces descriptions sont des textes en français, rassemblés dans un module de l'interface (`spiritText.ts`, indexé par id) et rédigés à partir de chaque `scoreBonus`.

## Risks / Trade-offs

- [Le plateau B (7 colonnes) est petit en vertical] → `HexBoard` se dimensionne déjà sur la largeur et la hauteur. On vérifie à 375×812 ; si les cases sont trop petites, on note le problème pour l'étape UX plutôt que de changer la mise en page dans ce change.
- [Les tests existants dispatchent `NEW_GAME` sans face et attendent `'playing'`] → on ajoute un helper de test qui crée une partie puis choisit « Aucun », et on adapte les appels existants.
- [Textes de bonus mal transcrits] → un test vérifie que chaque esprit de `ALL_SPIRIT_CARDS` a une description. Le contenu se relit à la main.
- [L'ancien `SavedGame` de `storage.ts` ne correspond plus à l'état] → c'est déjà le cas, et ce sera traité à l'étape 3. Ce change n'y touche pas.
