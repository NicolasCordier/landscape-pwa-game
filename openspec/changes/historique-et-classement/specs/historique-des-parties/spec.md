# Spec Delta

## Purpose

Garde sur l'appareil la trace des parties terminées, pour que le joueur puisse revoir ses scores et se mesurer à ses meilleures parties sur chaque face du plateau.

## ADDED Requirements

### Requirement: Enregistrement des parties terminées
Quand une partie se termine, le système SHALL l'enregistrer sur l'appareil avec sa date de fin, sa face, le nombre de tours, le score de chaque catégorie et le total. Une partie n'est enregistrée qu'une fois, même si l'écran de score est réaffiché.

#### Scenario: Partie terminée
- **WHEN** une partie en face B se termine sur un total de 74 points
- **THEN** l'historique contient une partie de plus, en face B, avec son nombre de tours, le détail de son score et le total de 74

### Requirement: Plateau final enregistré
L'enregistrement d'une partie SHALL contenir son plateau final : la pile de jetons de chaque case et les cases occupées par un cube.

#### Scenario: Plateau conservé
- **WHEN** une partie se termine
- **THEN** son enregistrement permet de réafficher le plateau tel qu'il était au dernier tour, cubes compris

### Requirement: Cartes prises enregistrées
L'enregistrement d'une partie SHALL contenir chaque carte animal prise pendant la partie, terminée ou encore en main, avec le nombre de cubes posés, le nombre de cubes de la carte et les points rapportés. Les cartes défaussées ou jamais prises n'y figurent pas.

#### Scenario: Carte terminée et carte en cours
- **WHEN** une partie se termine avec une carte à 3 cubes terminée et une carte à 3 cubes en main avec un seul cube posé
- **THEN** l'enregistrement contient la première avec 3 cubes posés sur 3 et sa valeur la plus haute
- **AND** la seconde avec 1 cube posé sur 3 et sa valeur la plus basse

#### Scenario: Carte défaussée
- **WHEN** le joueur a défaussé une carte de l'offre pendant la partie
- **THEN** cette carte ne figure pas parmi les cartes prises

### Requirement: Esprit enregistré
L'enregistrement d'une partie SHALL indiquer l'esprit pris, ou aucun, si son cube a été posé, et les points de son bonus. Ces points sont ceux de la catégorie « Esprit » du score.

#### Scenario: Esprit dont le cube est posé
- **WHEN** une partie se termine avec un esprit dont le cube est posé et dont le bonus vaut 8 points
- **THEN** l'enregistrement indique cet esprit, son cube posé et 8 points

#### Scenario: Esprit dont le cube n'est pas posé
- **WHEN** une partie se termine avec un esprit encore en main
- **THEN** l'enregistrement indique cet esprit, son cube non posé et 0 point

#### Scenario: Sans esprit
- **WHEN** le joueur a choisi « Aucun » au début de la partie
- **THEN** l'enregistrement indique qu'aucun esprit n'a été pris

#### Scenario: Retour à l'écran de score
- **WHEN** le joueur revient sur l'écran de score d'une partie déjà enregistrée
- **THEN** l'historique ne contient pas cette partie en double

### Requirement: Parties non terminées
Une partie abandonnée, remplacée par une nouvelle ou encore en cours SHALL NOT apparaître dans l'historique ni dans le classement.

#### Scenario: Partie abandonnée
- **WHEN** le joueur confirme le lancement d'une nouvelle partie alors qu'une partie est en cours
- **THEN** la partie abandonnée n'est pas enregistrée

#### Scenario: Partie en cours
- **WHEN** une partie est en cours au tour 5
- **THEN** elle n'apparaît pas dans l'historique

### Requirement: Classement par face
L'écran « Scores » SHALL afficher le classement d'une face : ses 10 meilleures parties, du total le plus haut au plus bas. Le joueur peut passer d'une face à l'autre. La face affichée en premier est celle présélectionnée sur l'accueil. À total égal, la partie la plus ancienne est classée devant.

#### Scenario: Classement de la face A
- **WHEN** l'historique contient 12 parties en face A et 3 en face B, et le joueur affiche le classement de la face A
- **THEN** les 10 meilleures parties de la face A s'affichent, numérotées de 1 à 10
- **AND** aucune partie de la face B n'y figure

#### Scenario: Égalité
- **WHEN** deux parties de la même face ont le même total
- **THEN** la plus ancienne est classée devant la plus récente

#### Scenario: Face sans partie
- **WHEN** le joueur affiche le classement d'une face sur laquelle aucune partie n'est terminée
- **THEN** l'écran indique qu'aucune partie n'a encore été jouée sur cette face

### Requirement: Historique des parties
L'écran « Scores » SHALL afficher l'historique de toutes les parties terminées, des deux faces, de la plus récente à la plus ancienne. Chaque ligne indique la date, la face, l'esprit pris et le total.

#### Scenario: Consulter l'historique
- **WHEN** le joueur a terminé une partie en face A hier puis une en face B aujourd'hui, et affiche l'historique
- **THEN** la partie en face B apparaît en premier, puis celle en face A
- **AND** chaque ligne montre la date, la face, l'esprit et le total

#### Scenario: Aucune partie terminée
- **WHEN** aucune partie n'a été terminée sur l'appareil
- **THEN** l'historique indique qu'aucune partie n'a encore été jouée

### Requirement: Détail d'une partie
Dans le classement comme dans l'historique, le joueur SHALL pouvoir afficher le détail d'une partie : son plateau final, le score de chacune des sept catégories, le total, le nombre de tours, les cartes prises avec leurs cubes posés et leurs points, et l'esprit avec ses points.

#### Scenario: Ouvrir le détail
- **WHEN** le joueur touche une partie du classement
- **THEN** le plateau final, le score de chaque catégorie, le total et le nombre de tours de cette partie s'affichent
- **AND** le total est égal à la somme des catégories

#### Scenario: Cartes de la partie
- **WHEN** le détail d'une partie avec 3 cartes prises est affiché
- **THEN** chaque carte apparaît avec ses cubes posés sur son nombre de cubes et ses points
- **AND** l'esprit pris apparaît avec ses points, ou l'absence d'esprit est indiquée

### Requirement: Historique conservé
L'historique SHALL être conservé sur l'appareil entre deux lancements de l'application et après une mise à jour du jeu.

#### Scenario: Relancer l'application
- **WHEN** le joueur a terminé 3 parties, ferme l'application puis la rouvre
- **THEN** l'historique contient toujours ces 3 parties

### Requirement: Historique illisible ou stockage indisponible
Si l'historique enregistré est illisible, le système SHALL l'ignorer sans erreur et afficher un historique vide. Une partie illisible au milieu des autres est ignorée seule. Si le stockage est indisponible, on joue normalement et les parties terminées ne sont pas conservées.

#### Scenario: Historique illisible
- **WHEN** les données de l'historique sur l'appareil sont corrompues
- **THEN** l'écran « Scores » s'affiche sans erreur, avec un historique vide

#### Scenario: Une partie illisible
- **WHEN** l'historique contient 4 parties dont une illisible
- **THEN** l'écran « Scores » affiche les 3 parties lisibles

#### Scenario: Stockage indisponible
- **WHEN** le stockage est bloqué et le joueur termine une partie
- **THEN** l'écran de score s'affiche normalement, sans erreur
