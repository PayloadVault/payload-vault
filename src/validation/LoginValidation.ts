import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "E-Mail-Adresse ist erforderlich")
    .max(254, "E-Mail-Adresse ist zu lang")
    .email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),

  password: z
    .string()
    .min(1, "Passwort ist erforderlich")
    .max(72, "Passwort darf höchstens 72 Zeichen lang sein"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
