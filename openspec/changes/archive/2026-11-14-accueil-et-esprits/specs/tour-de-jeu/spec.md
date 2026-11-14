# Spec Delta

## MODIFIED Requirements

### Requirement: Mise en place d'une partie
Au début d'une partie, le système SHALL préparer un plateau vide sur la face choisie à l'accueil, un sac de jetons mélangé, une offre centrale de 3 groupes de 3 jetons tirés du sac, une pioche de cartes animaux mélangée, une offre de 3 cartes visibles tirées de cette pioche, une main vide et 2 esprits proposés. La partie commence par le choix de l'esprit, avant le tour 1.

#### Scenario: Nouvelle partie
- **WHEN** le joueur lance une nouvelle partie
- **THEN** le plateau de la face choisie ne contient aucun jeton ni cube
- **AND** l'offre centrale affiche 3 groupes de 3 jetons
- **AND** 3 cartes animaux sont proposées et la main est vide
- **AND** 2 esprits sont proposés et le joueur doit choisir l'un d'eux ou « Aucun »
- **AND** le compteur de tours vaut 1

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
