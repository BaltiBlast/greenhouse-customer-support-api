# AGENTS.md : Modules métier

## Périmètre

Ces instructions s'appliquent à tous les modules situés dans
`modules` et complètent celles de `AGENTS.md`.

## Structure d'un module

Chaque fonctionnalité métier possède son propre dossier :

```text
modules/
└── nom-fonctionnalite/
    ├── nom-fonctionnalite.routes.*
    ├── nom-fonctionnalite.controller.*
    ├── nom-fonctionnalite.service.*
    ├── nom-fonctionnalite.validation.*  # si nécessaire
    └── nom-fonctionnalite.test.*        # si les tests sont colocalisés
```

Ne créer que les fichiers utiles au module. Ne pas ajouter une couche vide pour
respecter artificiellement le schéma ci-dessus.

## Responsabilités

### Routes

- Déclarer les routes Express du module.
- Appliquer les middlewares nécessaires.
- Appeler les controllers.
- Ne contenir ni logique métier ni accès direct aux données.

### Controllers

- Lire les paramètres, le corps et le contexte de la requête.
- Appeler les services avec des arguments explicites.
- Construire la réponse HTTP et transmettre les erreurs au gestionnaire prévu.
- Ne pas contenir la logique métier principale.

### Services

- Porter les règles métier et les transformations de données.
- Ne pas dépendre directement de `req`, `res` ou d'un router Express.
- Utiliser la couche d'accès aux données prévue par l'application.
- Rester testables indépendamment du transport HTTP.

### Validation

- Valider les entrées à la frontière du module.
- Utiliser Zod pour valider les données externes avant l'appel au service.
- Placer les schémas Zod du module dans un fichier `*.validation.js`.
- Exporter des schémas nommés et explicites selon l'opération validée, par
  exemple `createClientValidationSchema`.
- Utiliser des objets stricts afin de refuser les champs inconnus.
- Les schémas Zod peuvent nettoyer et normaliser les données d'entrée lorsque
  cette transformation ne constitue pas une règle métier.
- Conserver les règles métier et les transformations vers le format de
  persistance dans le service.
- Transformer les erreurs Zod en réponses HTTP structurées sans exposer de
  détail technique interne.
- Ne pas dupliquer un schéma ou une règle déjà disponible.
- Ne pas utiliser un schéma Zod comme remplacement d'un schema Mongoose : Zod
  protège l'entrée du module et Mongoose protège les données persistées.

## Relations entre modules

- Ne pas importer les fichiers internes d'un autre module sans nécessité.
- Exposer explicitement les fonctions destinées aux autres modules.
- Extraire dans un package partagé uniquement le code réellement commun à
  plusieurs applications.
- Éviter les dépendances circulaires et les modules génériques sans domaine
  clairement défini.

## Modification d'un module

- Examiner le module et ses tests avant de le modifier.
- Conserver son vocabulaire métier et ses conventions de nommage.
- Réutiliser les services existants lorsqu'ils répondent déjà au besoin.
- Tester en priorité le comportement modifié, y compris les cas d'erreur.
- Ne pas refactoriser les autres modules sans lien avec la demande.
