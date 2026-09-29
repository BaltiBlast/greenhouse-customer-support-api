import { z } from "zod";

const optionalTextSchema = z
  .string({ error: "La valeur doit être un texte." })
  .trim()
  .transform((value) => value || undefined)
  .optional();

const clientValidationSchema = z.strictObject({
  firstName: z.string({ error: "Le prénom est obligatoire." }).trim().min(1, "Le prénom est obligatoire."),
  lastName: z.string({ error: "Le nom est obligatoire." }).trim().min(1, "Le nom est obligatoire."),
  birthDate: z.iso.date({ error: "La date de naissance est invalide." }),
  height: z
    .number({ error: "La taille doit être un nombre." })
    .int("La taille doit être un nombre entier.")
    .positive("La taille doit être supérieure à zéro."),
  weight: z
    .number({ error: "Le poids doit être un nombre." })
    .min(1, "Le poids doit être supérieur ou égal à 1 kg."),
  bodyFat: z
    .number({ error: "La masse grasse doit être un nombre." })
    .min(0, "La masse grasse ne peut pas être négative.")
    .max(100, "La masse grasse ne peut pas dépasser 100 %.")
    .optional(),
  muscleMass: z
    .number({ error: "La masse musculaire doit être un nombre." })
    .nonnegative("La masse musculaire ne peut pas être négative.")
    .optional(),
  objectives: optionalTextSchema,
  pathologies: z
    .array(z.string({ error: "Chaque pathologie doit être un texte." }).trim(), {
      error: "Les pathologies doivent être une liste.",
    })
    .transform((pathologies) => pathologies.filter(Boolean)),
  limitations: optionalTextSchema,
  hasEatingDisorder: z.boolean({ error: "La mention du trouble alimentaire doit être un booléen." }),
  emergencyContactName: optionalTextSchema,
  emergencyContactRelationship: optionalTextSchema,
  emergencyContactPhone: optionalTextSchema,
});

export const clientIdValidationSchema = z.string().regex(
  /^[a-f\d]{24}$/i,
  "L'identifiant du client est invalide.",
);

export const createClientValidationSchema = clientValidationSchema.extend({
  pathologies: clientValidationSchema.shape.pathologies.default([]),
  hasEatingDisorder: clientValidationSchema.shape.hasEatingDisorder.default(false),
});
export const updateClientValidationSchema = clientValidationSchema
  .partial()
  .refine((client) => Object.keys(client).length > 0, {
    message: "Au moins un champ doit être renseigné.",
  });
