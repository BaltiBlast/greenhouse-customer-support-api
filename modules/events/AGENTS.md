# AGENTS.md : Module des événements

## Périmètre

Ces instructions s'appliquent au dossier `modules/events` et complètent les
instructions de `modules/AGENTS.md` et du fichier `AGENTS.md` à la racine.

Toutes les routes de ce module utilisent le préfixe `/api/events` et nécessitent
une session authentifiée.

Les corps de requête sont envoyés au format JSON avec l'en-tête
`Content-Type: application/json`.

## Format d'un événement

Un événement utilise les propriétés suivantes :

| Propriété | Type | Format et règles |
| --- | --- | --- |
| `type` | chaîne | `coaching` ou `group-class` |
| `date` | chaîne | Date ISO au format `YYYY-MM-DD` |
| `startTime` | chaîne | Heure au format `HH:mm`, de `00:00` à `23:59` |
| `duration` | nombre entier | Durée strictement positive |
| `location` | chaîne | Texte non vide |
| `description` | chaîne | Texte non vide |
| `clientId` | chaîne | Identifiant MongoDB sur 24 caractères hexadécimaux |
| `className` | chaîne | Texte non vide |

Règles conditionnelles :

- Un `coaching` exige `clientId` et ne doit pas contenir `className`.
- Un `group-class` exige `className` et ne doit pas contenir `clientId`.
- Les propriétés inconnues sont refusées.

## Lire tous les événements

```http
GET /api/events
```

Cette requête ne reçoit ni paramètre ni corps JSON.

Réponse `200` : tableau d'événements.

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "type": "coaching",
    "date": "2026-10-15T00:00:00.000Z",
    "startTime": "09:30",
    "duration": 60,
    "location": "Salle 1",
    "description": "Séance individuelle",
    "clientId": "507f1f77bcf86cd799439012",
    "createdAt": "2026-09-29T10:00:00.000Z",
    "updatedAt": "2026-09-29T10:00:00.000Z"
  }
]
```

## Lire un événement

```http
GET /api/events/:eventId
```

`eventId` doit être un identifiant MongoDB sur 24 caractères hexadécimaux.
Cette requête ne reçoit pas de corps JSON.

- Réponse `200` : événement demandé.
- Réponse `400` : identifiant invalide.
- Réponse `404` : événement introuvable.

## Créer un événement

```http
POST /api/events
```

Tous les champs communs sont obligatoires. Le champ conditionnel dépend du
type de l'événement.

Exemple pour un coaching :

```json
{
  "type": "coaching",
  "date": "2026-10-15",
  "startTime": "09:30",
  "duration": 60,
  "location": "Salle 1",
  "description": "Séance individuelle",
  "clientId": "507f1f77bcf86cd799439012"
}
```

Exemple pour un cours collectif :

```json
{
  "type": "group-class",
  "date": "2026-10-16",
  "startTime": "18:00",
  "duration": 45,
  "location": "Studio principal",
  "description": "Cours collectif du soir",
  "className": "Mobilité"
}
```

- Réponse `201` : `{ "id": "identifiant créé" }`.
- Réponse `400` : données invalides.

## Modifier partiellement un événement

```http
PATCH /api/events/:eventId
```

Le corps contient uniquement les propriétés à modifier. Au moins une propriété
doit être fournie. Les autres propriétés restent inchangées.

```json
{
  "startTime": "10:00",
  "location": "Salle 2"
}
```

Lors d'un changement de type, le champ requis par le nouveau type doit être
fourni. Le champ devenu incompatible est supprimé automatiquement.

```json
{
  "type": "group-class",
  "className": "Renforcement collectif"
}
```

- Réponse `200` : `{ "id": "identifiant modifié" }`.
- Réponse `400` : identifiant, données ou combinaison de champs invalides.
- Réponse `404` : événement introuvable.

## Supprimer un événement

```http
DELETE /api/events/:eventId
```

`eventId` doit être un identifiant MongoDB sur 24 caractères hexadécimaux.
Cette requête ne reçoit pas de corps JSON.

- Réponse `204` : événement supprimé, sans corps de réponse.
- Réponse `400` : identifiant invalide.
- Réponse `404` : événement introuvable.

## Erreurs communes

- `401` : session absente ou expirée.
- `500` : erreur interne non prévue.

Ne jamais exposer un détail technique, une trace d'erreur ou une donnée de
connexion dans une réponse HTTP.
