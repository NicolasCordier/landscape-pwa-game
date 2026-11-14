# Proposal

## Why

Une partie terminée disparaît dès qu'on quitte l'écran de score : on ne peut ni revoir ses scores passés, ni savoir si on a battu son record. C'est la quatrième étape de la feuille de route. Elle donne au jeu solo un objectif d'une partie à l'autre.

## What Changes

- **Chaque partie terminée est enregistrée sur l'appareil**, une seule fois, avec la date, la face, le nombre de tours, le détail du score et le total, et aussi :
  - le **plateau final** ;
  - les **cartes animaux prises**, terminées ou non, avec pour chacune le nombre de cubes posés sur le nombre de cubes de la carte, et les points rapportés ;
  - l'**esprit pris**, si son cube a été posé, et les points de son bonus.
  
  Une partie abandonnée (remplacée par une nouvelle) n'est pas enregistrée. Ces données préparent un écran de statistiques : on les garde dès maintenant pour que les parties jouées d'ici là y comptent.
- **Un écran « Scores » est accessible depuis l'accueil.** Il a deux vues :
  - **Classement** : les 10 meilleures parties d'une face, de la meilleure à la moins bonne. On passe de la face A à la face B. La face présélectionnée sur l'accueil est affichée en premier.
  - **Historique** : toutes les parties terminées, des deux faces, de la plus récente à la plus ancienne.
  - Toucher une partie affiche son plateau final, le détail de son score par catégorie, ses cartes avec leur complétion et son esprit.
- **L'écran de score situe la partie** : « Nouveau record » quand elle bat le meilleur score de la face, sinon son rang dans le classement de la face quand elle y entre (top 10).
- **Les classements sont séparés par face**, car la rivière ne se compte pas de la même façon en face A et en face B.
- **Nettoyage de `storage.ts`** : les fonctions d'historique, jamais branchées, sont réécrites pour tolérer un stockage indisponible ou illisible, comme la partie en cours.

Hors périmètre :
- effacer l'historique ou une partie ;
- exporter l'historique ou le synchroniser entre appareils ;
- l'écran de statistiques lui-même (points moyens par environnement, cartes les plus prises, complétion moyenne par carte, points moyens par esprit, score moyen) : prochain change, qui s'appuiera sur les données enregistrées ici ;
- les cartes vues dans l'offre mais pas prises, qui permettraient un taux de prise : il faudrait les suivre pendant la partie.

## Capabilities

### New Capabilities
- `historique-des-parties`: enregistrement des parties terminées (score, plateau final, cartes et esprit), écran « Scores » avec classement par face et historique, détail d'une partie, tolérance au stockage illisible ou indisponible.

### Modified Capabilities
- `accueil`: l'accueil propose d'ouvrir l'écran « Scores ».
- `fin-de-partie`: l'écran de score indique un nouveau record ou le rang de la partie dans le classement de sa face.

## Impact

- Nouveau module `src/game/history.ts` : format d'une partie enregistrée (`GameRecord` avec esprit, nombre de tours, plateau final, cartes prises), lecture et écriture de l'historique avec une version de format, sans jamais lever d'erreur, fonctions pures de classement et de rang, testées. `src/game/storage.ts` perd l'ancien `GameRecord` et ses fonctions, jamais utilisés.
- `src/game/state.ts` : la partie reçoit un identifiant à sa création, pour qu'elle ne soit enregistrée qu'une fois.
- `src/App.tsx` : enregistrement de la partie quand elle se termine, nouvel écran « Scores ».
- Nouveau composant `src/components/History/HistoryScreen.tsx`.
- `src/components/Home/HomeScreen.tsx` : commande « Scores ».
- `src/components/Game/ScoreScreen.tsx` : mention du record ou du rang.
- `README.md` : la section « Données locales » mentionne l'historique.
- La clé `localStorage` de l'historique est déjà réservée (`landscape_history`) et n'a jamais été écrite : il n'y a rien à migrer.
