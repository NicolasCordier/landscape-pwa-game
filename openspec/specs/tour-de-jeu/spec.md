# tour-de-jeu Specification

## Purpose
Décrit le déroulement d'un tour de partie solo : l'offre de jetons, la pose des jetons, l'offre et la main de cartes animaux, la pose des cubes, la fin et l'annulation du tour.

## Requirements

### Requirement: Mise en place d'une partie
Au début d'une partie, le système SHALL préparer un plateau vide sur la face choisie à l'accueil, un sac de jetons mélangé, une offre centrale de 3 groupes de 3 jetons tirés du sac, une pioche de cartes animaux mélangée, une offre de 3 cartes visibles tirées de cette pioche, une main vide et 2 esprits proposés. La partie commence par le choix de l'esprit, avant le tour 1.

#### Scenario: Nouvelle partie
- **WHEN** le joueur lance une nouvelle partie
- **THEN** le plateau de la face choisie ne contient aucun jeton ni cube
- **AND** l'offre centrale affiche 3 groupes de 3 jetons
- **AND** 3 cartes animaux sont proposées et la main est vide
- **AND** 2 esprits sont proposés et le joueur doit choisir l'un d'eux ou « Aucun »
- **AND** le compteur de tours vaut 1

### Requirement: Choix d'un groupe de jetons
À chaque tour, le joueur MUST choisir exactement un groupe de l'offre centrale. Une fois le choix fait, il ne peut plus en changer, sauf en recommençant le tour.

#### Scenario: Choisir un groupe
- **WHEN** le joueur choisit un groupe alors qu'il n'en a pas encore pris ce tour
- **THEN** les 3 jetons du groupe deviennent les jetons à poser
- **AND** les autres groupes de l'offre ne peuvent plus être choisis pendant ce tour

### Requirement: Pose des jetons
Le joueur SHALL poser les 3 jetons du groupe choisi, un par un et dans l'ordre de son choix, chacun sur une case où il est autorisé par les règles d'empilement. Un jeton posé ne peut plus être déplacé.

#### Scenario: Poser un jeton sur une case autorisée
- **WHEN** le joueur sélectionne un jeton restant puis une case autorisée pour ce jeton
- **THEN** le jeton est ajouté en haut de la pile de cette case
- **AND** il est retiré des jetons à poser

#### Scenario: Case refusée
- **WHEN** le joueur sélectionne un jeton puis une case où ce jeton n'est pas autorisé
- **THEN** le plateau n'est pas modifié et le jeton reste à poser

### Requirement: Case occupée par un cube
Une case portant un cube MUST refuser tout nouveau jeton.

#### Scenario: Jeton sur une case avec cube
- **WHEN** le joueur tente de poser un jeton sur une case portant un cube
- **THEN** la pose est refusée

### Requirement: Prise d'une carte animal
Le système SHALL permettre au joueur de prendre au plus une carte de l'offre par tour, à condition qu'il ait moins de 4 cartes non terminées en main, son esprit compris. L'emplacement libéré dans l'offre MUST rester vide jusqu'à la fin du tour.

#### Scenario: Prendre une carte
- **WHEN** le joueur a moins de 4 cartes non terminées et n'a pas encore pris de carte ce tour
- **THEN** la carte choisie passe dans sa main
- **AND** l'offre ne montre plus que les cartes restantes jusqu'à la fin du tour

#### Scenario: Main pleine
- **WHEN** le joueur a déjà 4 cartes non terminées en main, son esprit compris
- **THEN** il ne peut pas prendre de carte

#### Scenario: Deuxième carte dans le même tour
- **WHEN** le joueur a déjà pris une carte ce tour
- **THEN** il ne peut pas en prendre une autre avant le tour suivant

### Requirement: Défausse d'une carte de l'offre
Au lieu de prendre une carte, le joueur SHALL pouvoir défausser une carte de l'offre. Prendre et défausser forment une seule action de carte : une seule des deux est possible par tour. La carte défaussée quitte la partie et son emplacement dans l'offre MUST rester vide jusqu'à la fin du tour. La défausse reste possible quand la main est pleine.

#### Scenario: Défausser une carte
- **WHEN** le joueur n'a ni pris ni défaussé de carte ce tour et défausse une carte de l'offre
- **THEN** la carte disparaît de l'offre sans entrer dans sa main
- **AND** aucune nouvelle carte n'apparaît avant la fin du tour

#### Scenario: Défausse avec la main pleine
- **WHEN** le joueur a 4 cartes non terminées en main et n'a pas encore fait d'action de carte ce tour
- **THEN** il peut défausser une carte de l'offre

#### Scenario: Une seule action de carte par tour
- **WHEN** le joueur a déjà pris ou défaussé une carte ce tour
- **THEN** il ne peut ni prendre ni défausser de carte avant le tour suivant

### Requirement: Pose d'un cube
Pendant son tour, le joueur MAY poser autant de cubes qu'il le peut. Pour poser un cube d'une carte de sa main, le motif de la carte MUST être présent sur le plateau, dans l'une des 6 rotations, et la case désignée pour le cube MUST ne pas déjà porter de cube.

#### Scenario: Poser un cube sur une case valide
- **WHEN** le joueur sélectionne une carte de sa main puis une case où un cube de cette carte peut être posé
- **THEN** la case reçoit un cube
- **AND** la carte compte un cube restant de moins

#### Scenario: Motif tourné avec cube sur un voisin
- **WHEN** le motif d'une carte dont le cube va sur la case voisine est présent sur le plateau dans n'importe laquelle des 6 rotations
- **THEN** la case proposée pour le cube est la case du plateau qui correspond à la position du cube sur la carte, pour cette rotation

#### Scenario: Carte terminée
- **WHEN** le joueur pose le dernier cube d'une carte
- **THEN** la carte quitte la main et rejoint les cartes terminées
- **AND** elle ne compte plus dans la limite de 4 cartes en main

### Requirement: Fin du tour
Le joueur SHALL pouvoir terminer son tour uniquement après avoir posé les 3 jetons du groupe choisi. À la fin du tour, les deux groupes non choisis sont défaussés (ils sortent du jeu) et l'offre centrale est entièrement renouvelée avec 3 groupes de 3 jetons tirés du sac, l'offre de cartes est complétée jusqu'à 3 cartes depuis la pioche, et le compteur de tours augmente de 1.

#### Scenario: Terminer le tour
- **WHEN** le joueur a posé ses 3 jetons et termine son tour
- **THEN** les deux groupes non choisis sont défaussés
- **AND** l'offre centrale reçoit 3 nouveaux groupes de 3 jetons tirés du sac
- **AND** le tour suivant commence

#### Scenario: Recharge de l'offre de cartes
- **WHEN** le joueur a pris ou défaussé une carte puis termine son tour
- **THEN** l'offre est complétée par la première carte de la pioche au début du tour suivant
- **AND** si la pioche est vide, l'offre reste avec moins de 3 cartes

#### Scenario: Jetons encore à poser
- **WHEN** il reste au moins un jeton à poser
- **THEN** le joueur ne peut pas terminer son tour

### Requirement: Recommencer le tour
Le joueur SHALL pouvoir annuler toutes les actions du tour en cours et revenir à l'état exact du début de ce tour.

#### Scenario: Annuler le tour
- **WHEN** le joueur a pris un groupe, posé des jetons, pris une carte ou posé des cubes, puis recommence le tour
- **THEN** le plateau, l'offre centrale, le sac, les cartes et la main reviennent à leur état du début du tour
