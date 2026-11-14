# Spec Delta

## ADDED Requirements

### Requirement: Retour à l'accueil pendant la partie
L'écran de jeu SHALL proposer une commande « Accueil », accessible à tout moment de la partie, choix de l'esprit compris. Elle ramène à l'écran d'accueil sans demande de confirmation et sans rien changer à la partie, qui reste en cours et peut être reprise.

#### Scenario: Quitter en plein tour
- **WHEN** le joueur a pris un groupe et posé un jeton, puis choisit « Accueil »
- **THEN** l'écran d'accueil s'affiche et propose « Reprendre la partie »
- **AND** reprendre la partie la ramène au même point, avec les deux jetons restant à poser

#### Scenario: Orientations
- **WHEN** l'écran de jeu est affiché en vertical ou en horizontal
- **THEN** la commande « Accueil » est visible sans défilement et n'empiète pas sur le plateau
