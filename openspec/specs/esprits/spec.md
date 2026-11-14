# esprits Specification

## Purpose
Encadre les cartes esprit en partie solo : le tirage et le choix en début de partie, la place de l'esprit dans la main, la pose de son cube et le bonus qu'il rapporte en fin de partie.

## Requirements

### Requirement: Tirage de deux esprits
Au début de chaque partie, le système SHALL tirer au hasard 2 esprits différents parmi toutes les cartes esprit. Les esprits non tirés ne servent pas pendant la partie.

#### Scenario: Esprits proposés
- **WHEN** une nouvelle partie commence
- **THEN** 2 esprits différents sont proposés au joueur

### Requirement: Choix de l'esprit avant le tour 1
Avant le tour 1, le joueur MUST soit prendre l'un des 2 esprits proposés, soit choisir « Aucun ». L'esprit qui n'est pas pris quitte la partie. Tant que ce choix n'est pas fait, aucune action de tour n'est possible : prendre un groupe de jetons, prendre ou défausser une carte, poser un jeton ou un cube, terminer le tour.

#### Scenario: Prendre un esprit
- **WHEN** le joueur prend l'un des 2 esprits proposés
- **THEN** l'esprit entre dans sa main
- **AND** l'autre esprit quitte la partie et le tour 1 commence

#### Scenario: Aucun esprit
- **WHEN** le joueur choisit « Aucun »
- **THEN** sa main reste vide, les 2 esprits quittent la partie et le tour 1 commence

#### Scenario: Action de tour avant le choix
- **WHEN** le joueur tente de prendre un groupe de jetons ou une carte animal avant d'avoir choisi son esprit
- **THEN** l'action est refusée

### Requirement: Informations visibles pendant le choix
Pendant le choix de l'esprit, l'écran de jeu SHALL montrer le plateau vide, l'offre de jetons et l'offre de cartes animaux du tour 1. Le joueur SHALL pouvoir agrandir les cartes animaux et les esprits proposés pour les lire. Les esprits proposés et l'option « Aucun » sont présentés dans la zone de la main.

#### Scenario: Étudier l'offre avant de choisir
- **WHEN** le joueur agrandit une carte animal de l'offre pendant le choix de l'esprit
- **THEN** la carte s'affiche en grand, sans commande pour la prendre ou la défausser

#### Scenario: Lire un esprit
- **WHEN** le joueur agrandit un esprit proposé
- **THEN** l'esprit s'affiche en grand avec son motif et la description de son bonus
- **AND** une commande permet de prendre cet esprit

### Requirement: Choix définitif
Le choix de l'esprit MUST être définitif. Recommencer le tour ramène au début du tour 1, après le choix, sans le remettre en question.

#### Scenario: Recommencer le premier tour
- **WHEN** le joueur a pris un esprit, joue une partie du tour 1 puis recommence le tour
- **THEN** l'esprit est toujours dans sa main
- **AND** le choix de l'esprit n'est pas proposé à nouveau

### Requirement: L'esprit occupe une place en main
Tant que son cube n'est pas posé, l'esprit SHALL compter dans la limite de 4 cartes non terminées en main, comme une carte animal.

#### Scenario: Main pleine avec un esprit
- **WHEN** le joueur a son esprit et 3 cartes animaux non terminées en main
- **THEN** il ne peut pas prendre de carte animal

### Requirement: Pose du cube de l'esprit
Un esprit SHALL porter un seul cube, posé selon les mêmes règles que les cubes des cartes animaux : son motif doit être présent sur le plateau, dans l'une des 6 rotations, et la case du cube ne doit pas déjà porter de cube. Une fois son cube posé, l'esprit est terminé : il quitte la main et libère sa place.

#### Scenario: Poser le cube de l'esprit
- **WHEN** le joueur sélectionne son esprit puis une case où son cube peut être posé
- **THEN** la case reçoit un cube
- **AND** l'esprit quitte la main et rejoint les cartes terminées

### Requirement: Bonus de l'esprit
En fin de partie, la catégorie « Esprit » du score SHALL valoir le bonus de l'esprit calculé sur le plateau final, si son cube a été posé. Elle MUST valoir 0 si le joueur n'a pas pris d'esprit ou si le cube de son esprit n'a pas été posé.

#### Scenario: Esprit terminé
- **WHEN** la partie se termine et que le cube de l'esprit a été posé
- **THEN** la catégorie « Esprit » vaut le bonus de cet esprit calculé sur le plateau final

#### Scenario: Esprit non terminé
- **WHEN** la partie se termine et que l'esprit est encore en main, sans cube posé
- **THEN** la catégorie « Esprit » vaut 0

#### Scenario: Partie sans esprit
- **WHEN** la partie se termine et que le joueur a choisi « Aucun »
- **THEN** la catégorie « Esprit » vaut 0
