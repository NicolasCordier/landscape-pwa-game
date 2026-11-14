# fin-de-partie Specification

## Purpose
Définit quand une partie solo s'arrête et comment le score final, détaillé par catégorie, est calculé et présenté au joueur.

## Requirements

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
Le score final SHALL être la somme de sept catégories, chacune affichée séparément : arbres, montagnes, champs, bâtiments, rivière, animaux et esprit. La rivière est comptée selon les règles de la face jouée. La catégorie esprit suit les règles du bonus de l'esprit, et l'écran nomme l'esprit pris s'il y en a un.

#### Scenario: Affichage du détail
- **WHEN** la partie est terminée
- **THEN** l'écran affiche la valeur de chaque catégorie et le total
- **AND** le total est égal à la somme des catégories

#### Scenario: Esprit nommé
- **WHEN** la partie est terminée et que le joueur avait pris un esprit
- **THEN** la ligne « Esprit » indique le nom de cet esprit, que son cube ait été posé ou non

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
Depuis l'écran de score, le joueur SHALL pouvoir lancer une nouvelle partie avec la même face, ou revenir à l'écran d'accueil.

#### Scenario: Nouvelle partie après la fin
- **WHEN** le joueur choisit « Rejouer » depuis l'écran de score
- **THEN** une nouvelle partie commence sur la même face, conforme à la mise en place

#### Scenario: Retour à l'accueil
- **WHEN** le joueur choisit « Accueil » depuis l'écran de score
- **THEN** l'écran d'accueil s'affiche, avec la face de la partie terminée présélectionnée
