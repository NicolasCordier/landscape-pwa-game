# ecran-de-jeu Specification

## Purpose
Organise l'écran de jeu pour qu'une partie se joue confortablement sur téléphone, en vertical comme en horizontal, avec des retours visuels clairs sur ce que le joueur peut faire.

## Requirements

### Requirement: Plateau entièrement visible
Le plateau SHALL toujours être affiché en entier, sans défilement, quelle que soit l'orientation de l'écran. Sa taille s'adapte à la place disponible en largeur comme en hauteur.

#### Scenario: Téléphone en vertical
- **WHEN** l'écran est en vertical sur un téléphone d'environ 400 px de large
- **THEN** le plateau, l'offre et la main sont visibles sans défilement de la page

#### Scenario: Téléphone en horizontal
- **WHEN** le joueur tourne le téléphone en horizontal
- **THEN** l'écran se réorganise et le plateau reste entièrement visible, sans défilement de la page

### Requirement: Zones de l'écran
L'écran de jeu SHALL comporter trois zones : l'offre (groupes de jetons et cartes proposées), le plateau, et la main du joueur avec les commandes du tour. Leur disposition change selon l'orientation ; leur contenu reste le même.

#### Scenario: Changement d'orientation en cours de tour
- **WHEN** le joueur tourne l'écran au milieu d'un tour
- **THEN** l'état du tour est conservé (jetons à poser, sélection, cartes)
- **AND** les trois zones restent accessibles

### Requirement: Cartes compactes
Les cartes de l'offre et de la main SHALL s'afficher en format compact, montrant au moins leur motif, leur terrain central et leurs points. Le joueur SHALL pouvoir afficher une carte en grand pour la lire.

#### Scenario: Agrandir une carte
- **WHEN** le joueur demande à voir une carte en grand
- **THEN** la carte s'affiche agrandie avec son nom, son motif et ses paliers de points
- **AND** le joueur peut la refermer pour revenir au jeu

### Requirement: Cases valides en surbrillance
Lorsqu'un jeton à poser ou une carte de la main est sélectionné, le plateau SHALL mettre en surbrillance exactement les cases où l'action est possible.

#### Scenario: Jeton sélectionné
- **WHEN** le joueur sélectionne un jeton à poser
- **THEN** seules les cases où ce jeton peut être posé sont en surbrillance

#### Scenario: Carte sélectionnée
- **WHEN** le joueur sélectionne une carte de sa main
- **THEN** seules les cases où un cube de cette carte peut être posé sont en surbrillance

#### Scenario: Aucune case possible
- **WHEN** l'élément sélectionné ne peut être posé nulle part
- **THEN** aucune case n'est en surbrillance et le joueur en est informé

### Requirement: Indication de l'étape du tour
L'écran SHALL indiquer au joueur ce qu'il doit ou peut faire : choisir un groupe, poser ses jetons (avec le nombre restant), ou terminer son tour. Les commandes « Terminer le tour » et « Recommencer le tour » SHALL rester accessibles, la première n'étant active que lorsque les 3 jetons sont posés.

#### Scenario: Jetons restants
- **WHEN** le joueur a choisi un groupe et posé un jeton
- **THEN** l'écran indique qu'il reste 2 jetons à poser
- **AND** la commande « Terminer le tour » est inactive

#### Scenario: Tour prêt à être terminé
- **WHEN** les 3 jetons sont posés
- **THEN** la commande « Terminer le tour » est active

### Requirement: Retour à l'accueil pendant la partie
L'écran de jeu SHALL proposer une commande « Accueil », accessible à tout moment de la partie, choix de l'esprit compris. Elle ramène à l'écran d'accueil sans demande de confirmation et sans rien changer à la partie, qui reste en cours et peut être reprise.

#### Scenario: Quitter en plein tour
- **WHEN** le joueur a pris un groupe et posé un jeton, puis choisit « Accueil »
- **THEN** l'écran d'accueil s'affiche et propose « Reprendre la partie »
- **AND** reprendre la partie la ramène au même point, avec les deux jetons restant à poser

#### Scenario: Orientations
- **WHEN** l'écran de jeu est affiché en vertical ou en horizontal
- **THEN** la commande « Accueil » est visible sans défilement et n'empiète pas sur le plateau
