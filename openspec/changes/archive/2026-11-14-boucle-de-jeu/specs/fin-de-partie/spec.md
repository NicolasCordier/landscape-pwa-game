# Spec Delta

## Purpose

Définit quand une partie solo s'arrête et comment le score final, détaillé par catégorie, est calculé et présenté au joueur.

## ADDED Requirements

### Requirement: Déclenchement de la fin de partie
À la fin d'un tour, la partie MUST s'arrêter si le plateau compte 2 cases vides ou moins, ou si le sac ne contient plus assez de jetons pour recharger l'offre centrale.

#### Scenario: Plateau presque plein
- **WHEN** le joueur termine un tour et qu'il reste 2 cases vides ou moins sur le plateau
- **THEN** la partie est terminée et l'écran de score s'affiche

#### Scenario: Sac épuisé
- **WHEN** le joueur termine un tour et que le sac contient moins de 9 jetons
- **THEN** la partie est terminée et l'écran de score s'affiche

#### Scenario: Partie qui continue
- **WHEN** le joueur termine un tour, qu'il reste plus de 2 cases vides et que le sac contient au moins 9 jetons
- **THEN** un nouveau tour commence

### Requirement: Score détaillé
Le score final SHALL être la somme de sept catégories, chacune affichée séparément : arbres, montagnes, champs, bâtiments, rivière, animaux et esprit. Dans ce change, la catégorie esprit vaut toujours 0.

#### Scenario: Affichage du détail
- **WHEN** la partie est terminée
- **THEN** l'écran affiche la valeur de chaque catégorie et le total
- **AND** le total est égal à la somme des catégories

### Requirement: Score des animaux
Le score d'une carte animal SHALL être la valeur correspondant au nombre de cubes posés : 0 si aucun cube n'est posé, la valeur la plus haute si tous les cubes sont posés. Les cartes terminées et les cartes encore en main comptent toutes les deux.

#### Scenario: Carte partiellement remplie
- **WHEN** une carte à 3 paliers (par exemple 4, 9 et 15 points) a reçu un seul cube
- **THEN** elle rapporte la plus petite valeur, soit 4 points

#### Scenario: Carte sans cube
- **WHEN** une carte en main n'a reçu aucun cube
- **THEN** elle rapporte 0 point

### Requirement: Plateau final visible
L'écran de score SHALL laisser voir le plateau final de la partie.

#### Scenario: Consulter le plateau final
- **WHEN** l'écran de score est affiché
- **THEN** le plateau tel qu'il était au dernier tour est visible

### Requirement: Rejouer
Depuis l'écran de score, le joueur SHALL pouvoir lancer une nouvelle partie.

#### Scenario: Nouvelle partie après la fin
- **WHEN** le joueur choisit de rejouer depuis l'écran de score
- **THEN** une nouvelle partie commence, conforme à la mise en place
