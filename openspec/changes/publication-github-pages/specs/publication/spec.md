# Spec Delta

## Purpose

Rend le jeu accessible en ligne, en HTTPS, depuis n'importe quel appareil, et encadre sa mise à jour : quand une version est publiée, et comment le joueur la reçoit sur une app installée.

## ADDED Requirements

### Requirement: Adresse publique en HTTPS
Le jeu SHALL être accessible à l'adresse `https://nicolascordier.github.io/landscape-pwa-game/`, sans serveur local ni réseau particulier. Toutes les ressources du jeu (scripts, styles, images, icônes, manifest) MUST se charger depuis cette adresse.

#### Scenario: Ouverture depuis le téléphone
- **WHEN** le joueur ouvre l'adresse publique sur son téléphone, en 4G ou sur n'importe quel Wi-Fi
- **THEN** l'écran d'accueil du jeu s'affiche
- **AND** les jetons, les cartes et les icônes s'affichent sans ressource manquante

### Requirement: Publication à chaque push sur main
Chaque push sur la branche `main` SHALL déclencher la publication de cette version. La publication SHALL aussi pouvoir être lancée à la main depuis GitHub. Les pushs sur les autres branches ne publient rien.

#### Scenario: Push sur main
- **WHEN** un commit est poussé sur `main`
- **THEN** cette version est publiée à l'adresse publique

#### Scenario: Push sur une branche de travail
- **WHEN** un commit est poussé sur une autre branche que `main`
- **THEN** la version publiée ne change pas

### Requirement: Publication protégée par les vérifications
Une version MUST être publiée seulement si les tests, le lint et le build réussissent. En cas d'échec, la version déjà publiée reste en ligne, inchangée.

#### Scenario: Tests en échec
- **WHEN** un commit poussé sur `main` fait échouer un test
- **THEN** rien n'est publié et la version précédente reste accessible

### Requirement: Application installable et jouable hors ligne
La version publiée SHALL pouvoir être installée sur l'écran d'accueil d'Android, sous le nom « Landscape ». Après une première visite, elle SHALL se lancer et permettre de jouer sans connexion.

#### Scenario: Installation
- **WHEN** le joueur ouvre l'adresse publique dans Chrome sur Android
- **THEN** le navigateur propose d'installer l'application « Landscape »

#### Scenario: Partie hors ligne
- **WHEN** le joueur a déjà ouvert le jeu une fois puis le relance sans connexion
- **THEN** l'écran d'accueil s'affiche et une partie peut être jouée jusqu'au bout

### Requirement: Mise à jour vers une nouvelle version
Lorsqu'une nouvelle version est publiée, le jeu ouvert ou installé SHALL proposer au joueur de recharger, sans recharger de lui-même. Le joueur peut ignorer l'invite et continuer sa partie. Les messages de l'invite sont en français.

#### Scenario: Nouvelle version disponible
- **WHEN** une nouvelle version est publiée pendant que le joueur a le jeu ouvert ou le rouvre
- **THEN** une invite en français propose de recharger pour obtenir la nouvelle version
- **AND** la partie en cours n'est pas interrompue tant que le joueur n'a pas choisi de recharger

### Requirement: Identité de l'application
Le titre de la page et le nom de l'application installée SHALL être « Landscape », la page SHALL être déclarée en français, et la description de l'application MUST ne pas mentionner d'autre jeu.

#### Scenario: Nom affiché
- **WHEN** le joueur ouvre le jeu ou l'installe
- **THEN** l'onglet et l'icône installée portent le nom « Landscape »
