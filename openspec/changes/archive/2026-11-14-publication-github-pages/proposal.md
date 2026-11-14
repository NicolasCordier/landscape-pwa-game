# Proposal

## Why

Pour jouer sur téléphone, il faut aujourd'hui que le PC fasse tourner le serveur de développement et que le téléphone soit sur le même Wi-Fi, avec une adresse en `http`. Sur une telle adresse, le navigateur désactive le service worker : l'app ne peut ni s'installer sur l'écran d'accueil ni fonctionner hors ligne, alors que le projet est déjà configuré en PWA. Le dépôt GitHub est public : GitHub Pages peut servir le jeu en HTTPS, accessible partout, PC éteint.

## What Changes

- **Le jeu est publié sur GitHub Pages**, à l'adresse `https://nicolascordier.github.io/landscape-pwa-game/`.
- **La publication est automatique à chaque push sur `main`.** Elle peut aussi se lancer à la main depuis GitHub. Elle ne se fait que si les tests et le lint passent.
- **L'app publiée est une vraie PWA** : installable sur l'écran d'accueil d'Android, jouable hors ligne après une première visite. Quand une nouvelle version est publiée, une invite propose de recharger.
- **Le nom et la description de l'app sont nettoyés** :
  - la description du manifest ne mentionne plus le jeu dont Landscape s'inspire ;
  - le titre de la page devient « Landscape » au lieu de « Landscape + TS » ;
  - la langue de la page passe en français ;
  - les messages de l'invite de mise à jour sont traduits en français.
- **Le README décrit le projet** (adresse du jeu, commandes, publication) à la place du texte du modèle Vite.
- **Le serveur de développement reste servi à la racine** : l'adresse locale ne change pas.

Hors périmètre :
- un nom de domaine personnalisé ;
- des environnements de prévisualisation par branche ;
- le déploiement ailleurs que sur GitHub Pages.

## Capabilities

### New Capabilities
- `publication`: mise en ligne du jeu (adresse publique en HTTPS, déclenchement et garde-fous de la publication), installation et fonctionnement hors ligne de la PWA publiée, mise à jour vers une nouvelle version.

### Modified Capabilities
<!-- Aucune : le comportement du jeu ne change pas. -->

## Impact

- `vite.config.ts` : chemin de base `/landscape-pwa-game/` pour le build, nouvelle description du manifest.
- `.github/workflows/` : nouveau workflow de publication (tests, lint, build, déploiement Pages).
- `index.html` : titre et langue.
- `src/PWABadge.tsx` : messages en français.
- `README.md` : réécrit pour le projet.
- Réglage du dépôt GitHub, à faire à la main : source de Pages sur « GitHub Actions ».
- Les données enregistrées sur l'appareil (face mémorisée, et plus tard parties et classement) sont propres à chaque adresse : le site publié et le serveur local ne les partagent pas.
