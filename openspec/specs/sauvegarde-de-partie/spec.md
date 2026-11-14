# sauvegarde-de-partie Specification

## Purpose
Conserve la partie en cours sur l'appareil pour que le joueur puisse l'interrompre (fermeture, rechargement, mise à jour de l'application, retour à l'accueil) puis la reprendre exactement où il l'avait laissée.

## Requirements

### Requirement: Sauvegarde automatique
Le système SHALL sauvegarder la partie en cours sur l'appareil après chaque action du joueur qui modifie la partie, y compris le choix de l'esprit, sans action particulière du joueur. Une seule partie est sauvegardée à la fois.

#### Scenario: Fermeture en plein tour
- **WHEN** le joueur a pris un groupe de jetons et posé un seul jeton, puis ferme l'application
- **THEN** la partie sauvegardée contient le jeton posé, les deux jetons restant à poser et le groupe retiré de l'offre

#### Scenario: Fermeture pendant le choix de l'esprit
- **WHEN** le joueur lance une partie puis ferme l'application sans avoir choisi d'esprit
- **THEN** la partie sauvegardée est au choix de l'esprit, avec les mêmes esprits proposés

### Requirement: Reprise exacte
Reprendre une partie SHALL restituer l'état de jeu tel qu'il était sauvegardé : face, plateau, offre de jetons et de cartes, contenu du sac et de la pioche, main, cartes terminées, esprit, jetons à poser, actions déjà faites dans le tour et numéro du tour. La sélection affichée à l'écran (jeton, carte, carte agrandie) n'est pas restituée.

#### Scenario: Reprise après relancement
- **WHEN** le joueur relance l'application et reprend la partie
- **THEN** il retrouve la partie exactement où il l'avait laissée et peut continuer le tour en cours

#### Scenario: Suite de la partie identique
- **WHEN** le joueur termine un tour après une reprise
- **THEN** les groupes de jetons et les cartes qui arrivent dans l'offre sont les mêmes que s'il n'avait pas interrompu la partie

### Requirement: Recommencer le tour après une reprise
« Recommencer le tour » SHALL ramener au début du tour en cours, même si la partie a été interrompue et reprise pendant ce tour.

#### Scenario: Recommencer un tour repris
- **WHEN** le joueur pose des jetons, ferme l'application, reprend la partie puis choisit « Recommencer le tour »
- **THEN** la partie revient à l'état du début du tour, jetons posés avant l'interruption compris

### Requirement: Effacement en fin de partie
Quand la partie se termine, le système SHALL effacer la partie sauvegardée. Une partie terminée n'est jamais proposée à la reprise.

#### Scenario: Relancement après l'écran de score
- **WHEN** la partie s'est terminée et le joueur relance l'application
- **THEN** l'écran d'accueil s'affiche sans proposer de reprendre une partie

### Requirement: Sauvegarde illisible
Si la partie sauvegardée est illisible, incomplète ou d'un format incompatible avec la version de l'application, le système SHALL l'ignorer et la supprimer, sans message d'erreur ni blocage.

#### Scenario: Sauvegarde d'une version incompatible
- **WHEN** l'application est mise à jour vers une version dont le format de sauvegarde a changé, puis relancée
- **THEN** l'écran d'accueil s'affiche sans proposer de reprendre une partie
- **AND** le joueur peut lancer une nouvelle partie normalement

### Requirement: Stockage indisponible
Si le stockage de l'appareil est indisponible ou plein, le système SHALL laisser jouer normalement, sans message d'erreur. La partie n'est alors pas conservée après la fermeture de l'application.

#### Scenario: Navigation privée
- **WHEN** le joueur joue dans un navigateur qui refuse le stockage local
- **THEN** la partie se joue normalement
- **AND** le retour à l'accueil puis « Reprendre la partie » fonctionnent tant que l'application reste ouverte
