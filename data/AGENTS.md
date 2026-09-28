# AGENTS.md — Accès aux données

## Périmètre

Ces instructions s'appliquent à `data` et complètent celles de
`AGENTS.md`.

## Organisation

Ce dossier regroupe la couche de persistance :

```text
data/
├── mappers/      # Mappers et requêtes MongoDB
├── schemas/      # Schemas Mongoose
└── database.js   # Connexion à MongoDB
```

- Pour modifier un mapper, consulter `mappers/AGENTS.md`.
- Pour modifier un schema, consulter `schemas/AGENTS.md`.
- `database.js` gère uniquement la connexion et la déconnexion à la base.

## Frontières

La couche d'accès aux données ne doit pas :

- connaître Express, `req`, `res`, les routes ou les controllers ;
- construire une réponse HTTP ;
- contenir des règles métier ;
- décider des autorisations fonctionnelles ;
- déclencher une notification ou un autre effet externe sans orchestration par
  un service métier.

Les services des modules appellent les mappers avec des arguments métier
explicites. Les résultats techniques sont transformés par les services lorsqu'une
représentation métier différente est nécessaire.

## Règles de modification

- Vérifier qu'une opération existante ne répond pas déjà au besoin.
- Employer des noms décrivant clairement l'opération réalisée.
- Limiter chaque composant de persistance à un domaine cohérent.
- Préserver les opérations atomiques et les contraintes d'intégrité.
- Ne pas modifier un schéma ou une migration sans analyser la compatibilité des
  données existantes.
- Ne jamais placer de secret ou d'identifiant de connexion dans le code.
- Tester les cas nominaux, l'absence de résultat et les erreurs de persistance.
