import { z } from "zod";

const optionalBodyFatSchema = z
  .number({ error: "La masse grasse doit être un nombre." })
  .min(0, "La masse grasse ne peut pas être négative.")
  .max(100, "La masse grasse ne peut pas dépasser 100 %.")
  .nullable()
  .transform((value) => value ?? undefined)
  .optional();

const optionalMuscleMassSchema = z
  .number({ error: "La masse musculaire doit être un nombre." })
  .nonnegative("La masse musculaire ne peut pas être négative.")
  .nullable()
  .transform((value) => value ?? undefined)
  .optional();

const measurementValidationSchema = z.strictObject({
  measuredAt: z.iso.datetime({
    offset: true,
    error: "La date de la mesure est invalide.",
  }),
  weight: z
    .number({ error: "Le poids doit être un nombre." })
    .min(1, "Le poids doit être supérieur ou égal à 1 kg."),
  bodyFat: optionalBodyFatSchema,
  muscleMass: optionalMuscleMassSchema,
});

const mongoIdValidationSchema = z.string().regex(
  /^[a-f\d]{24}$/i,
  "L'identifiant est invalide.",
);

export const clientIdValidationSchema = mongoIdValidationSchema;
export const measurementIdValidationSchema = mongoIdValidationSchema;
export const createMeasurementValidationSchema = measurementValidationSchema;
export const updateMeasurementValidationSchema = measurementValidationSchema
  .partial()
  .refine((measurement) => Object.keys(measurement).length > 0, {
    message: "Au moins un champ doit être renseigné.",
  });
