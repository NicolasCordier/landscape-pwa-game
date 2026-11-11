# Tasks

## 1. Build pour un sous-chemin

- [x] 1.1 Passer `vite.config.ts` en forme fonction avec la base `/landscape-pwa-game/` pour le build et la prévisualisation, `/` en développement ; vérifier que `npm run build` passe, que les chemins de `dist/index.html` et de `dist/manifest.webmanifest` commencent par `/landscape-pwa-game/`, et que `npm run dev` répond toujours à la racine

## 2. Identité de l'app

- [x] 2.1 Remplacer la description du manifest, passer `index.html` en `lang="fr"` avec le titre « Landscape », et traduire les messages de `PWABadge` ; vérifier dans `dist/manifest.webmanifest` le nom et la description, et que `npm run lint` passe

## 3. Workflow de publication

- [x] 3.1 Créer `.github/workflows/deploy.yml` (push sur `main` et lancement manuel ; job `build` avec `npm ci`, tests, lint, build et envoi de `dist/` ; job `deploy` avec `actions/deploy-pages` ; permissions minimales ; concurrence `pages` sans annulation) ; vérifier que le YAML est valide et que les commandes du job `build` passent en local dans le même ordre

## 4. Documentation

- [x] 4.1 Réécrire `README.md` pour le projet (adresse du jeu, `npm run dev -- --host` pour le téléphone, tests, publication sur `main`, réglage Pages, données locales propres à chaque adresse) ; vérifier que les commandes indiquées fonctionnent telles qu'écrites

## 5. Vérification d'ensemble

- [x] 5.1 Lancer `npm run build && npm run preview` et vérifier dans le navigateur intégré, sur `http://localhost:4173/landscape-pwa-game/` : aucune ressource manquante, manifest « Landscape » avec `start_url` et `scope` sous `/landscape-pwa-game/`, service worker actif, et page qui se recharge et permet de lancer une partie une fois le serveur de prévisualisation coupé

## Workflow follow-up

- Avant le premier push : dans le dépôt GitHub, *Settings > Pages > Source* : « GitHub Actions » (à faire par le propriétaire du dépôt).
- Merger `feat/github-pages` dans `main` puis pousser `main` (seulement sur demande) ; suivre le workflow dans l'onglet *Actions*.
- Sur le téléphone : ouvrir `https://nicolascordier.github.io/landscape-pwa-game/`, installer l'app, la relancer en mode avion.
- Archiver le change une fois la version en ligne validée sur le téléphone.
