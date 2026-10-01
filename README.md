# Greenhouse Customer Support API

API Express de Greenhouse Customer Support.

## Documentation frontend

Le contrat HTTP complet destiné à l'intégration frontend est disponible dans
[`docs/API_FRONTEND.md`](docs/API_FRONTEND.md).

## Installation

```bash
npm install
```

Copier `.env.example` vers `.env`, puis renseigner les variables nécessaires.

## Commandes

```bash
npm run dev
npm start
```

## Déploiement

Le fichier `render.yaml` décrit le service web Render. `MONGODB_URI` et `FRONTEND_URL` doivent être renseignées dans Render. `SESSION_SECRET` est généré par le Blueprint.
