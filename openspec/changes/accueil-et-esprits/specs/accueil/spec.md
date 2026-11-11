# Spec Delta

## Purpose

Point d'entrée de l'application : le joueur y règle sa partie (face du plateau) puis la lance. Il accueillera plus tard la reprise d'une partie et l'historique.

## ADDED Requirements

### Requirement: Écran d'accueil au lancement
Au lancement de l'application, le système SHALL afficher l'écran d'accueil, avec le nom du jeu, le choix de la face du plateau et une commande « Commencer ». Aucune partie n'est lancée tant que le joueur n'a pas choisi « Commencer ».

#### Scenario: Ouverture de l'application
- **WHEN** le joueur ouvre l'application
- **THEN** l'écran d'accueil s'affiche
- **AND** aucune partie n'est en cours

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
