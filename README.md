# Landscape

Jeu solo de pose de jetons sur un plateau hexagonal, pensé pour le téléphone (PWA, en vertical comme en horizontal).

**Jouer :** https://nicolascordier.github.io/landscape-pwa-game/

Sur Android, ouvrir l'adresse dans Chrome puis « Installer l'application » : le jeu se lance depuis l'écran d'accueil et fonctionne hors ligne après une première visite. Quand une nouvelle version est publiée, une invite propose de recharger.

## Développement

```bash
npm install
npm run dev
```

Le jeu est servi sur http://localhost:5173/.

Pour tester sur un téléphone du même Wi-Fi :

```bash
npm run dev -- --host
```

puis ouvrir l'adresse « Network » affichée (par exemple `http://192.168.1.10:5173/`). En HTTP sur le réseau local, le navigateur désactive le service worker : l'installation et le mode hors ligne ne se testent que sur le site publié, ou en local avec la prévisualisation ci-dessous.

## Vérifications

```bash
npm test         # tests du moteur de jeu (Vitest)
npm run lint     # ESLint
npm run build    # vérification des types et build de production dans dist/
npm run preview  # sert dist/ sur http://localhost:4173/landscape-pwa-game/
```

## Publication

Chaque push sur `main` lance le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) : tests, lint, build, puis publication sur GitHub Pages. Si une étape échoue, rien n'est publié et la version en ligne reste inchangée. Le workflow peut aussi être lancé à la main depuis l'onglet *Actions*.

Réglage à faire une fois dans le dépôt GitHub : *Settings > Pages > Source* : **GitHub Actions**.

Le site est servi sous `/landscape-pwa-game/` : ce chemin est appliqué au build et à la prévisualisation seulement (voir `vite.config.ts`), le serveur de développement reste à la racine.

## Données locales

Le dernier réglage (et, plus tard, la partie en cours et le classement) est enregistré dans le navigateur de l'appareil. Chaque adresse a ses propres données : le site publié et le serveur de développement ne les partagent pas.

## Organisation du travail

Les évolutions sont décrites avec [OpenSpec](https://github.com/Fission-AI/OpenSpec) dans `openspec/changes/`, développées sur une branche par change, puis mergées dans `main`.
