# accueil Specification

## Purpose
Point d'entrée de l'application : le joueur y règle sa partie (face du plateau) puis la lance. Il accueillera plus tard la reprise d'une partie et l'historique.

## Requirements

### Requirement: Écran d'accueil au lancement
Au lancement de l'application, le système SHALL afficher l'écran d'accueil, avec le nom du jeu, le choix de la face du plateau et une commande « Commencer ». Aucune nouvelle partie n'est lancée tant que le joueur n'a pas choisi « Commencer », et une partie sauvegardée n'est reprise que si le joueur choisit « Reprendre la partie ».

#### Scenario: Ouverture de l'application
- **WHEN** le joueur ouvre l'application sans partie sauvegardée
- **THEN** l'écran d'accueil s'affiche
- **AND** aucune partie n'est en cours

#### Scenario: Ouverture avec une partie sauvegardée
- **WHEN** le joueur ouvre l'application alors qu'une partie est sauvegardée
- **THEN** l'écran d'accueil s'affiche, et non la partie

### Requirement: Choix de la face du plateau
Sur l'écran d'accueil, le joueur SHALL pouvoir choisir entre la face A et la face B du plateau. Exactement une face est sélectionnée à tout moment.

#### Scenario: Choisir la face B
- **WHEN** le joueur choisit la face B puis « Commencer »
- **THEN** la partie se joue sur le plateau de la face B (7 colonnes, 25 cases)
- **AND** la rivière est comptée selon les règles de la face B en fin de partie

#### Scenario: Choisir la face A
- **WHEN** le joueur choisit la face A puis « Commencer »
- **THEN** la partie se joue sur le plateau de la face A (5 colonnes, 23 cases)

### Requirement: Mémorisation du dernier réglage
Le système SHALL retenir sur l'appareil la dernière face choisie au lancement d'une partie et la présélectionner sur l'écran d'accueil. Sans réglage retenu, ou si le réglage retenu est illisible, la face A est présélectionnée.

#### Scenario: Retour sur l'application
- **WHEN** le joueur a lancé une partie en face B puis rouvre l'application
- **THEN** la face B est présélectionnée sur l'écran d'accueil

#### Scenario: Premier lancement
- **WHEN** le joueur ouvre l'application pour la première fois
- **THEN** la face A est présélectionnée

### Requirement: Lisibilité du plateau B
Le plateau de la face B SHALL respecter les mêmes règles d'affichage que celui de la face A : entièrement visible, sans défilement, en vertical comme en horizontal.

#### Scenario: Face B en vertical
- **WHEN** une partie en face B est affichée en vertical sur un téléphone d'environ 400 px de large
- **THEN** les 7 colonnes du plateau sont visibles sans défilement de la page

### Requirement: Reprendre la partie en cours
Quand une partie est en cours, l'écran d'accueil SHALL proposer « Reprendre la partie » comme action principale, en indiquant la face et le numéro du tour de cette partie. Sans partie en cours, cette commande n'apparaît pas.

#### Scenario: Reprendre depuis l'accueil
- **WHEN** une partie en face B est en cours au tour 7 et le joueur ouvre l'accueil
- **THEN** l'accueil propose « Reprendre la partie » avec la mention de la face B et du tour 7
- **AND** choisir cette commande affiche la partie au tour 7

#### Scenario: Face présélectionnée différente
- **WHEN** la face A est présélectionnée et le joueur reprend une partie en face B
- **THEN** la partie reprise se joue en face B

#### Scenario: Pas de partie en cours
- **WHEN** aucune partie n'est en cours
- **THEN** l'accueil ne propose pas « Reprendre la partie »

### Requirement: Confirmation avant de remplacer une partie
Quand une partie est en cours, choisir « Commencer » SHALL demander au joueur de confirmer qu'il abandonne la partie en cours. Sans confirmation, la partie en cours est conservée et l'accueil reste affiché. Sans partie en cours, « Commencer » lance la partie directement.

#### Scenario: Abandon confirmé
- **WHEN** une partie est en cours, le joueur choisit « Commencer » puis confirme
- **THEN** une nouvelle partie démarre avec la face choisie
- **AND** l'ancienne partie n'est plus proposée à la reprise

#### Scenario: Abandon annulé
- **WHEN** une partie est en cours, le joueur choisit « Commencer » puis annule
- **THEN** l'accueil reste affiché et « Reprendre la partie » reprend l'ancienne partie

#### Scenario: Aucune partie en cours
- **WHEN** aucune partie n'est en cours et le joueur choisit « Commencer »
- **THEN** la partie démarre sans demande de confirmation
