# Spec Delta

## MODIFIED Requirements

### Requirement: Score détaillé
Le score final SHALL être la somme de sept catégories, chacune affichée séparément : arbres, montagnes, champs, bâtiments, rivière, animaux et esprit. La rivière est comptée selon les règles de la face jouée. La catégorie esprit suit les règles du bonus de l'esprit, et l'écran nomme l'esprit pris s'il y en a un.

#### Scenario: Affichage du détail
- **WHEN** la partie est terminée
- **THEN** l'écran affiche la valeur de chaque catégorie et le total
- **AND** le total est égal à la somme des catégories

#### Scenario: Esprit nommé
- **WHEN** la partie est terminée et que le joueur avait pris un esprit
- **THEN** la ligne « Esprit » indique le nom de cet esprit, que son cube ait été posé ou non

### Requirement: Rejouer
Depuis l'écran de score, le joueur SHALL pouvoir lancer une nouvelle partie avec la même face, ou revenir à l'écran d'accueil.

#### Scenario: Nouvelle partie après la fin
- **WHEN** le joueur choisit « Rejouer » depuis l'écran de score
- **THEN** une nouvelle partie commence sur la même face, conforme à la mise en place

#### Scenario: Retour à l'accueil
- **WHEN** le joueur choisit « Accueil » depuis l'écran de score
- **THEN** l'écran d'accueil s'affiche, avec la face de la partie terminée présélectionnée
