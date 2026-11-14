# Spec Delta

## ADDED Requirements

### Requirement: Place de la partie dans le classement
L'écran de score SHALL situer la partie dans le classement de sa face : « Nouveau record » quand son total dépasse strictement toutes les parties précédentes de cette face, sinon son rang quand elle entre dans les 10 meilleures. Hors des 10 meilleures, rien n'est indiqué. La première partie sur une face est un nouveau record.

#### Scenario: Nouveau record
- **WHEN** le meilleur total en face A était 68 et la partie en face A se termine sur 71
- **THEN** l'écran de score indique « Nouveau record »

#### Scenario: Entrée dans le classement
- **WHEN** la partie se termine avec le 3e meilleur total de sa face
- **THEN** l'écran de score indique qu'elle est 3e du classement de la face

#### Scenario: Égalité avec le record
- **WHEN** la partie égale le meilleur total de sa face sans le dépasser
- **THEN** l'écran de score indique qu'elle est 2e, sans « Nouveau record »

#### Scenario: Hors classement
- **WHEN** 10 parties de la face ont un total plus haut que celle qui se termine
- **THEN** l'écran de score n'indique ni record ni rang

#### Scenario: Première partie sur la face
- **WHEN** la première partie en face B se termine
- **THEN** l'écran de score indique « Nouveau record »
