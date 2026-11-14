# Proposal

## Why

Aujourd'hui, une partie en cours est perdue dès que l'application est fermée, rechargée ou mise à jour, ce qui arrive souvent sur un téléphone. Il n'y a pas non plus de moyen de revenir à l'accueil pendant une partie. C'est la troisième étape de la feuille de route : pouvoir interrompre une partie et la reprendre plus tard.

## What Changes

- **La partie en cours est sauvegardée sur l'appareil** après chaque action du joueur, choix de l'esprit compris. Rien n'est à faire pour sauvegarder.
- **La reprise est exacte** : on retrouve le plateau, l'offre, la main, les jetons encore à poser et le tour en cours. « Recommencer le tour » ramène toujours au début du tour, même après une reprise.
- **L'écran d'accueil propose « Reprendre la partie »** quand une partie est en cours, avec la face et le numéro du tour.
- **Lancer une nouvelle partie demande confirmation** quand une partie est en cours, car elle remplace la partie sauvegardée.
- **Un bouton « Accueil » sur l'écran de jeu** ramène à l'accueil. La partie reste sauvegardée.
- **La sauvegarde est effacée quand la partie se termine.** L'écran de score n'est donc pas repris au relancement.
- **Une sauvegarde illisible ou d'une version incompatible est ignorée** : l'accueil s'affiche sans « Reprendre », sans erreur. Si le stockage est indisponible (navigation privée, données bloquées), on joue normalement, sans sauvegarde.
- **Nettoyage de `storage.ts`** : l'ancien format de sauvegarde, jamais branché, est remplacé par l'état de jeu actuel.

Hors périmètre :
- l'historique des parties et le classement (étape 4) ;
- plusieurs parties sauvegardées en parallèle, ou la synchronisation entre appareils ;
- la reprise de la sélection en cours à l'écran (jeton ou carte sélectionnés, carte agrandie).

## Capabilities

### New Capabilities
- `sauvegarde-de-partie`: sauvegarde automatique de la partie en cours, reprise exacte, effacement en fin de partie, tolérance aux sauvegardes illisibles et au stockage indisponible.

### Modified Capabilities
- `accueil`: l'écran d'accueil propose de reprendre la partie en cours, et demande confirmation avant d'en lancer une nouvelle qui la remplacerait.
- `ecran-de-jeu`: une commande permet de revenir à l'accueil pendant la partie.

`accueil` est créé par le change `accueil-et-esprits` et `ecran-de-jeu` par `boucle-de-jeu`. Aucun des deux n'est encore archivé : il faut les archiver avant celui-ci.

## Impact

- `src/game/storage.ts` : nouvelles fonctions pour sauvegarder, lire et effacer la partie en cours à partir du `GameState`, avec une version de format. Les types `SavedGame`, `TurnSnapshot` et leurs fonctions, inutilisés, sont supprimés. Les types d'historique restent pour l'étape 4.
- `src/App.tsx` : la partie sauvegardée est chargée au lancement ; chaque nouvel état est sauvegardé, ou effacé en fin de partie.
- `src/components/Home/HomeScreen.tsx` : bouton « Reprendre la partie » et confirmation avant « Commencer ».
- `src/components/Game/GameScreen.tsx` : bouton « Accueil ».
- `README.md` : la section « Données locales » mentionne la partie en cours.
- La clé `localStorage` de la partie en cours est déjà réservée (`landscape_current_game`). Aucune sauvegarde n'a été écrite jusqu'ici : il n'y a rien à migrer.
