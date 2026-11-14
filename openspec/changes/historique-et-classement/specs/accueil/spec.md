# Spec Delta

## ADDED Requirements

### Requirement: Accès aux scores
L'écran d'accueil SHALL proposer une commande « Scores » qui ouvre l'écran du classement et de l'historique, qu'une partie soit en cours ou non. Depuis cet écran, le joueur revient à l'accueil sans perdre la partie en cours ni la face présélectionnée.

#### Scenario: Ouvrir les scores
- **WHEN** le joueur choisit « Scores » sur l'accueil
- **THEN** l'écran « Scores » s'affiche, sur le classement de la face présélectionnée

#### Scenario: Revenir à l'accueil
- **WHEN** une partie est en cours, le joueur ouvre « Scores » puis revient à l'accueil
- **THEN** l'accueil propose toujours « Reprendre la partie »
- **AND** la face présélectionnée n'a pas changé
