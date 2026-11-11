# Proposal

## Why

Une partie se lance aujourd'hui directement, toujours en face A et sans carte esprit. C'est la deuxième étape de la feuille de route : pouvoir choisir sa face de plateau et jouer avec les esprits. Pour ça, il faut un écran d'accueil, qui servira aussi de point d'entrée pour la reprise d'une partie (étape 3) et l'historique (étape 4).

## What Changes

- **Un écran d'accueil** s'affiche au lancement. Il contient le titre, le choix de la face (A ou B) et un bouton « Commencer ». Il retient la dernière face choisie.
- **La face B devient jouable** : plateau de 7×4 cases et score de la rivière propre à cette face (le moteur sait déjà les calculer).
- **Les esprits sont toujours proposés**, sans option pour les activer. Au début de chaque partie, 2 esprits sont tirés au hasard. Avant le tour 1, le joueur en prend un ou choisit « Aucun ».
- **Le choix de l'esprit se fait sur l'écran de jeu**, dans la zone de la main. L'offre de jetons et l'offre de cartes animaux restent visibles, et les cartes peuvent être agrandies, pour décider en connaissance de cause. Le choix est définitif : « Recommencer le tour » ne l'annule pas.
- **L'esprit pris occupe une des 4 places de la main.** Il se pose comme un animal, avec un seul cube. Une fois ce cube posé, il quitte la main et libère sa place.
- **Le bonus de l'esprit s'ajoute au score**, dans la catégorie « Esprit », seulement si son cube est posé.
- **L'écran de score propose deux boutons** : « Rejouer » relance une partie avec la même face, « Accueil » ramène à l'écran d'accueil.

Hors périmètre, prévu dans les étapes suivantes :
- la reprise d'une partie en cours, donc pas de retour à l'accueil pendant une partie (étape 3) ;
- l'historique et le classement (étape 4) ;
- l'activation ou non de certaines cartes (étape 5).

## Capabilities

### New Capabilities
- `accueil`: écran d'accueil, choix de la face du plateau, mémorisation du dernier réglage.
- `esprits`: tirage et choix de l'esprit en début de partie, place de l'esprit en main, pose de son cube et calcul de son bonus.

### Modified Capabilities
- `tour-de-jeu`: la mise en place utilise la face choisie et commence par le choix de l'esprit ; la limite de 4 cartes en main compte aussi l'esprit.
- `fin-de-partie`: la catégorie « Esprit » n'est plus toujours nulle ; l'écran de score propose « Rejouer » avec la même face et « Accueil ».

Ces deux capabilities sont créées par le change `boucle-de-jeu`, pas encore archivé. Il faut l'archiver avant celui-ci.

## Impact

- `src/game/state.ts` :
  - nouvelle phase « choix de l'esprit » avant le tour 1, avec les 2 esprits proposés dans l'état ;
  - `NEW_GAME` reçoit la face, et une nouvelle action sert à choisir l'esprit ou « Aucun » ;
  - le score tient compte de l'esprit ;
  - `cardTemplate` doit aussi connaître les cartes esprit.
- `src/game/config.ts` : la face n'est plus fixée dans `SOLO_CONFIG`.
- `src/App.tsx` : navigation entre l'accueil et la partie ; zone de la main en mode « choix de l'esprit ».
- `src/components/` :
  - nouvel écran d'accueil ;
  - affichage des cartes esprit (texte du bonus à la place des paliers de points) ;
  - boutons de l'écran de score.
- Nouveau petit stockage local du dernier réglage. Il est distinct de la sauvegarde de partie de l'étape 3.
