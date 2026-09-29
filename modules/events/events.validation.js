import { z } from "zod";

const eventValidationSchema = z.strictObject({
  type: z.enum(["coaching", "group-class"], {
    error: "Le type d'événement est invalide.",
  }),
  date: z.iso.date({ error: "La date est invalide." }),
  startTime: z
    .string({ error: "L'heure de début est obligatoire." })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "L'heure de début est invalide."),
  duration: z
    .number({ error: "La durée doit être un nombre." })
    .int("La durée doit être un nombre entier.")
    .positive("La durée doit être supérieure à zéro."),
  location: z.string({ error: "Le lieu est obligatoire." }).trim().min(1, "Le lieu est obligatoire."),
  description: z
    .string({ error: "La description est obligatoire." })
    .trim()
    .min(1, "La description est obligatoire."),
  clientId: z.string().regex(/^[a-f\d]{24}$/i, "L'identifiant du client est invalide.").optional(),
  className: z.string().trim().min(1, "Le nom du cours est obligatoire.").optional(),
});

function validateEventConsistency(event, context) {
  if (event.type === "coaching" && !event.clientId) {
    context.addIssue({
      code: "custom",
      path: ["clientId"],
      message: "Le client est obligatoire pour un coaching.",
    });
  }

  if (event.type === "group-class" && !event.className) {
    context.addIssue({
      code: "custom",
      path: ["className"],
      message: "Le nom du cours est obligatoire pour un cours collectif.",
    });
  }

  if (event.type === "coaching" && event.className) {
    context.addIssue({
      code: "custom",
      path: ["className"],
      message: "Le nom du cours ne s'applique pas à un coaching.",
    });
  }

  if (event.type === "group-class" && event.clientId) {
    context.addIssue({
      code: "custom",
      path: ["clientId"],
      message: "Le client ne s'applique pas à un cours collectif.",
    });
  }
}

export const eventIdValidationSchema = z.string().regex(
  /^[a-f\d]{24}$/i,
  "L'identifiant de l'événement est invalide.",
);

export const createEventValidationSchema = eventValidationSchema.superRefine(
  validateEventConsistency,
);
export const updateEventValidationSchema = eventValidationSchema
  .partial()
  .refine((event) => Object.keys(event).length > 0, {
    message: "Au moins un champ doit être renseigné.",
  });
