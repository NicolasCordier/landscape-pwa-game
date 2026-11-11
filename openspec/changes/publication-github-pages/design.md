# Design

## Context

Le projet est une app Vite + React déjà configurée en PWA avec `vite-plugin-pwa` :
- service worker généré par Workbox ;
- `registerType: 'prompt'`, avec l'invite `PWABadge` ;
- icônes générées depuis `public/favicon.svg`.

Le build (`tsc -b && vite build`) produit `dist/`. Les images du jeu sont importées depuis `src/assets`, donc Vite réécrit leurs chemins selon la base. Il n'y a ni routeur ni chemin d'URL au-delà de la racine. Le dépôt n'a pas encore de dossier `.github/`.

GitHub Pages sert un dépôt de projet sous un sous-chemin : `/landscape-pwa-game/`.

## Goals / Non-Goals

**Goals:**
- Un seul workflow, avec les actions officielles de GitHub Pages et sans branche `gh-pages` à entretenir.
- Aucune différence pour le développement local : `npm run dev` reste servi à la racine.

**Non-Goals:**
- Vérifier la qualité du code au-delà de ce que font déjà `npm test` et `npm run lint` (pas de couverture, pas de tests de bout en bout).
- Mettre en cache les dépendances npm de manière avancée, au-delà du cache intégré à `setup-node`.

## Decisions

### Base `/landscape-pwa-game/` seulement pour le build et la prévisualisation
`vite.config.ts` passe à la forme fonction, `defineConfig(({ command, isPreview }) => ...)`. Le chemin de base vaut `/landscape-pwa-game/` quand on construit ou prévisualise le site, et `/` en développement. `vite-plugin-pwa` dérive de cette base le `scope` et le `start_url` du manifest ainsi que l'enregistrement du service worker. Il n'y a donc rien à régler à part.

*Alternatives écartées* :
- une base fixe, qui ferait passer l'adresse locale à `http://192.168.1.10:5173/landscape-pwa-game/` ;
- une variable d'environnement, une pièce de plus pour un seul site.

### Le workflow `.github/workflows/deploy.yml`, en deux jobs
- **Déclencheurs** : `push` sur `main` et `workflow_dispatch` (lancement manuel).
- **Job `build`** :
  - `actions/checkout` puis `actions/setup-node` (Node 24, avec le cache npm) ;
  - `npm ci`, `npm test`, `npm run lint` et `npm run build` ;
  - `actions/upload-pages-artifact`, qui envoie `dist/`.
- **Job `deploy`** : il dépend de `build`, utilise l'environnement `github-pages` et lance `actions/deploy-pages`.
- **Permissions** : seulement le minimum, `contents: read`, `pages: write` et `id-token: write`.
- **Concurrence** : `group: pages` et `cancel-in-progress: false`, pour qu'un déploiement en cours ne soit jamais coupé.

Comme le déploiement dépend du build, et donc des vérifications, un échec ne touche pas la version en ligne.

*Alternative écartée* : publier `dist/` sur une branche `gh-pages`. Elle ajoute une branche générée dans le dépôt et une action tierce.

### Pas de `404.html`
L'app n'a qu'une page et aucune route. Une adresse inconnue sous le site peut afficher la page 404 de GitHub sans gêner le jeu.

### Identité de l'app
- La description du manifest devient « Jeu solo de pose de jetons sur un plateau hexagonal ».
- Dans `index.html`, `lang="fr"` et `<title>Landscape</title>`.
- Les messages de `PWABadge` passent en français :
  - « Le jeu est prêt à fonctionner hors ligne » ;
  - « Une nouvelle version est disponible » ;
  - les boutons « Recharger » et « Fermer ».

### Vérification avant la mise en ligne
Le service worker fonctionne aussi sur `localhost` en HTTP. On vérifie donc le résultat réel du build avec `npm run build && npm run preview` dans le navigateur intégré, à `http://localhost:4173/landscape-pwa-game/`. On y contrôle :
- le chargement des ressources ;
- le manifest (nom, `start_url`, `scope`) ;
- l'enregistrement du service worker ;
- le rechargement hors ligne.

La mise en ligne elle-même ne se vérifie qu'après un push sur `main`.

## Risks / Trade-offs

- [Pages pas activé, ou source réglée sur « Deploy from a branch »] → le job `deploy` échoue avec un message explicite. Une tâche demande de régler la source sur « GitHub Actions » avant le premier push.
- [Une app installée garde l'ancienne version] → avec `registerType: 'prompt'` et sans vérification périodique, la nouvelle version est détectée au prochain lancement ou rechargement de la page. C'est suffisant pour un usage perso, et la vérification périodique de `PWABadge` peut s'activer plus tard.
- [Les données locales sont séparées par adresse] → la face mémorisée sur le site publié est indépendante de celle du serveur local. C'est voulu et noté dans le README.
- [`main` local a des commits non poussés] → le premier push publie tout ce qui a été mergé jusque-là. C'est l'effet attendu.
