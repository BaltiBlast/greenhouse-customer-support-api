# AGENTS.md

## Projet

Ce dépôt contient uniquement l'API Express de Greenhouse Customer Support.

## Règles

- Utiliser npm.
- Utiliser exclusivement les ES Modules.
- Respecter le flux `routes -> controllers -> services -> accès aux données`.
- Conserver les fonctionnalités métier dans `modules` et la persistance dans `data`.
- Charger les secrets depuis l'environnement.
- Ne jamais versionner de secret ou de fichier `.env`.
- Exécuter les validations pertinentes après chaque modification.
- Consulter les fichiers `AGENTS.md` plus proches avant de modifier leur périmètre.
- Ne jamais utiliser le tiret cadratin Unicode dans les contenus du projet.

## Commits

Utiliser le format `type(api): description courte à l'infinitif`.