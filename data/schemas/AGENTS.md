# AGENTS.md — Schemas

## Périmètre

Ces instructions s'appliquent à tous les fichiers de `data/schemas` et
complètent celles de `AGENTS.md` et `data/AGENTS.md`.

## Structure

Un fichier correspond à un schema Mongoose et utilise le suffixe
`*.schema.js`.

Chaque fichier suit une structure simple :

```js
import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

export default exampleSchema;
```

Le flux doit rester :

```text
import → création du schema → export par défaut
```

## Responsabilités

- Définir les champs, types, valeurs par défaut, contraintes et index Mongoose.
- Utiliser un nom de fichier cohérent avec le domaine concerné.
- Exporter le schema, sans créer le model Mongoose dans ce dossier.
- Ne contenir ni logique HTTP ni règle métier applicative.
- Ne pas importer de route, controller, service ou mapper.
- Analyser la compatibilité avec les données existantes avant toute modification.
