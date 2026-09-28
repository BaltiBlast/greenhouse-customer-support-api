import { z } from "zod";

export const loginValidationSchema = z.strictObject({
  email: z
    .string({ error: "L'adresse email est obligatoire." })
    .trim()
    .toLowerCase()
    .email("L'adresse email est invalide."),
  password: z
    .string({ error: "Le mot de passe est obligatoire." })
    .min(1, "Le mot de passe est obligatoire."),
});
