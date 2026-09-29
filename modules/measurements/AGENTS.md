# AGENTS.md : Module des mesures

## Périmètre

Ces instructions s'appliquent au dossier `modules/measurements` et complètent
les instructions de `modules/AGENTS.md` et du fichier `AGENTS.md` à la racine.

Les routes utilisent le préfixe `/api/clients/:clientId/measurements` et
nécessitent une session authentifiée.

Une mesure appartient à un client. Avant toute opération, le service vérifie que
ce client appartient à l'utilisateur connecté. Le `clientId` provient de l'URL
et ne doit jamais être accepté dans le corps JSON.

Les corps de requête utilisent le format JSON avec l'en-tête
`Content-Type: application/json`.

## Format d'une mesure

| Propriété | Type | Format et règles |
| --- | --- | --- |
| `measuredAt` | chaîne | Date et heure ISO 8601 avec fuseau horaire |
| `weight` | nombre | Obligatoire à la création, supérieur ou égal à 1 |
| `bodyFat` | nombre ou `null` | Facultatif, entre 0 et 100, `null` supprime la valeur |
| `muscleMass` | nombre ou `null` | Facultatif, positif ou nul, `null` supprime la valeur |

Les propriétés inconnues sont refusées. Les champs `id`, `clientId`, `createdAt`
et `updatedAt` sont gérés par l'API et ne doivent pas être envoyés.

Plusieurs mesures peuvent être enregistrées le même jour. L'heure permet de
conserver leur ordre.

## Lire les mesures d'un client

```http
GET /api/clients/:clientId/measurements
```

La réponse `200` contient les mesures de la plus récente à la plus ancienne.

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "measuredAt": "2026-09-29T08:15:00.000Z",
    "weight": 72.5,
    "bodyFat": 20,
    "muscleMass": 30,
    "createdAt": "2026-09-29T08:20:00.000Z",
    "updatedAt": "2026-09-29T08:20:00.000Z"
  }
]
```

- Réponse `404` : client introuvable ou appartenant à un autre utilisateur.

## Lire une mesure

```http
GET /api/clients/:clientId/measurements/:measurementId
```

- Réponse `200` : mesure demandée.
- Réponse `400` : identifiant invalide.
- Réponse `404` : client ou mesure introuvable.

## Créer une mesure

```http
POST /api/clients/:clientId/measurements
```

```json
{
  "measuredAt": "2026-09-29T10:15:00+02:00",
  "weight": 72.5,
  "bodyFat": 20,
  "muscleMass": 30
}
```

- Réponse `201` : `{ "id": "identifiant créé" }`.
- Réponse `400` : identifiant ou données invalides.
- Réponse `404` : client introuvable.

## Modifier partiellement une mesure

```http
PATCH /api/clients/:clientId/measurements/:measurementId
```

Le corps contient uniquement les propriétés à modifier. Au moins une propriété
doit être fournie. Les autres propriétés restent inchangées.

```json
{
  "weight": 71.8,
  "bodyFat": null
}
```

Dans cet exemple, le poids est modifié et la masse grasse est supprimée.

- Réponse `200` : `{ "id": "identifiant modifié" }`.
- Réponse `400` : identifiant ou données invalides.
- Réponse `404` : client ou mesure introuvable.

## Supprimer une mesure

```http
DELETE /api/clients/:clientId/measurements/:measurementId
```

- Réponse `204` : mesure supprimée, sans corps de réponse.
- Réponse `400` : identifiant invalide.
- Réponse `404` : client ou mesure introuvable.

## Erreurs communes

- `401` : session absente ou expirée.
- `403` : origine de la requête non autorisée.
- `500` : erreur interne non prévue.

Ne jamais exposer un détail technique, une trace d'erreur ou une donnée de
connexion dans une réponse HTTP.
